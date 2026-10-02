#!/usr/bin/env bash
# Throwaway local Postgres for development.
#
#   ./scripts/dev_db.sh start    create (if needed), start, migrate, seed
#   ./scripts/dev_db.sh stop     stop it
#   ./scripts/dev_db.sh reset    delete everything and start clean
#   ./scripts/dev_db.sh demo     fresh catalogue with NO rates set, for
#                                demonstrating the stale-rate rule on camera
#   ./scripts/dev_db.sh url      print the DATABASE_URL to use
#
# Runs on port 55433 with trust auth, in its own data directory under
# backend/.devdb. It does not touch any Postgres you already have installed —
# on this machine port 5432 is held by a password-protected EDB PostgreSQL 18.

set -euo pipefail

cd "$(dirname "$0")/.."

PGPORT=55433
PGDATA="$PWD/.devdb"
DBNAME=shree_rani_gehna_dev
DBUSER=srg
DATABASE_URL="postgresql+psycopg://${DBUSER}@127.0.0.1:${PGPORT}/${DBNAME}"

# Homebrew keeps versioned Postgres off the default PATH.
find_bin() {
  local name=$1
  if command -v "$name" >/dev/null 2>&1 && [ "$name" != "postgres" ]; then
    command -v "$name"; return
  fi
  for dir in /opt/homebrew/opt/postgresql@*/bin /usr/local/opt/postgresql@*/bin /opt/homebrew/bin /usr/local/bin; do
    [ -x "$dir/$name" ] && { echo "$dir/$name"; return; }
  done
  echo "Could not find '$name'. Install Postgres with: brew install postgresql@16" >&2
  exit 1
}

INITDB=$(find_bin initdb)
PG_CTL=$(find_bin pg_ctl)
PSQL=$(find_bin psql)

is_running() { "$PG_CTL" -D "$PGDATA" status >/dev/null 2>&1; }

start() {
  if [ ! -d "$PGDATA" ]; then
    echo "==> Creating cluster in .devdb"
    "$INITDB" -D "$PGDATA" -A trust -U "$DBUSER" >/dev/null
  fi

  if is_running; then
    echo "==> Already running on port $PGPORT"
  else
    echo "==> Starting Postgres on port $PGPORT"
    # Listen on TCP only: a socket path under this directory can exceed the
    # 103-byte limit the OS puts on Unix socket paths.
    "$PG_CTL" -D "$PGDATA" -l "$PGDATA/server.log" \
      -o "-p $PGPORT -c listen_addresses=127.0.0.1 -c unix_socket_directories=''" \
      -w start >/dev/null
  fi

  if ! "$PSQL" -h 127.0.0.1 -p "$PGPORT" -U "$DBUSER" -lqt | cut -d'|' -f1 | grep -qw "$DBNAME"; then
    echo "==> Creating database $DBNAME"
    "$PSQL" -h 127.0.0.1 -p "$PGPORT" -U "$DBUSER" -d postgres -c "CREATE DATABASE $DBNAME" >/dev/null
  fi

  echo "==> Applying migrations"
  DATABASE_URL="$DATABASE_URL" .venv/bin/alembic upgrade head 2>&1 | grep -E "Running upgrade|already at" || true

  echo "==> Seeding demo catalogue and today's rates"
  DATABASE_URL="$DATABASE_URL" .venv/bin/python -m scripts.seed_demo | sed 's/^/    /'

  cat <<EOF

Ready. Start the API with:

    DATABASE_URL="$DATABASE_URL" ADMIN_API_KEY=local-dev-key \\
      .venv/bin/uvicorn main:app --reload --port 8000

Or put those two lines in backend/.env and just run uvicorn.
EOF
}

demo() {
  start >/dev/null
  echo "==> Rebuilding $DBNAME with no rates set"
  # Dropped and recreated rather than emptied: metal_rates refuses DELETE, which
  # is exactly the guarantee we don't want to weaken just to reset a demo.
  "$PSQL" -h 127.0.0.1 -p "$PGPORT" -U "$DBUSER" -d postgres \
    -c "DROP DATABASE IF EXISTS $DBNAME WITH (FORCE)" >/dev/null
  "$PSQL" -h 127.0.0.1 -p "$PGPORT" -U "$DBUSER" -d postgres \
    -c "CREATE DATABASE $DBNAME" >/dev/null
  DATABASE_URL="$DATABASE_URL" .venv/bin/alembic upgrade head >/dev/null 2>&1
  DATABASE_URL="$DATABASE_URL" .venv/bin/python -m scripts.seed_demo --no-rates | sed 's/^/    /'
}

case "${1:-start}" in
  start) start ;;
  demo)  demo ;;
  stop)  is_running && "$PG_CTL" -D "$PGDATA" -m fast stop || echo "Not running." ;;
  reset)
    is_running && "$PG_CTL" -D "$PGDATA" -m fast stop >/dev/null || true
    rm -rf "$PGDATA"; echo "==> Wiped .devdb"; start ;;
  url)   echo "$DATABASE_URL" ;;
  *)     echo "Usage: $0 {start|stop|reset|url}" >&2; exit 1 ;;
esac
