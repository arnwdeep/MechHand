/** Shown instead of a stack trace when the FastAPI backend isn't running. */
export default function BackendDown() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-20">
      <div className="border border-line rounded-xl p-8 bg-warn-soft">
        <h1 className="display text-2xl text-warn">The API isn&apos;t running</h1>
        <p className="mt-3 text-sm text-ink/80 leading-relaxed">
          This storefront shows no prices of its own — every figure comes from the
          pricing engine on the backend. Start it and refresh:
        </p>
        <pre className="mt-4 text-xs bg-white border border-line rounded-lg p-4 overflow-x-auto">
{`cd backend
./scripts/dev_db.sh start          # one-time: local Postgres + demo data
DATABASE_URL="$(./scripts/dev_db.sh url)" ADMIN_API_KEY=local-dev-key \\
  .venv/bin/uvicorn main:app --reload --port 8000`}
        </pre>
      </div>
    </div>
  );
}
