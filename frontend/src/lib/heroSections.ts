/**
 * The hero film is a single continuous pull-back from the crown to the feet,
 * so the scroll narrative reads footage that already exists — nothing is
 * cropped or zoomed, which a 720p master could not survive.
 *
 * `from`/`to` are frame indices into the 96-frame desktop set.
 *
 * `hotspot` marks where that piece sits in the frame, in normalised frame
 * coordinates (0-1, origin top-left of the *source frame*, not the viewport).
 * Because the camera pulls back through each section the piece drifts, so two
 * points are given and the marker interpolates between them.
 *
 * These were read off the frames by eye and are approximate by nature. To
 * retune: open the hero, and nudge `start`/`end` until the ring sits on the
 * piece. If the master is ever re-rendered, all of this needs re-checking.
 */
export type Hotspot = {
  start: { x: number; y: number };
  end: { x: number; y: number };
};

export type HeroSection = {
  from: number;
  to: number;
  eyebrow: string;
  title: string;
  body: string;
  hotspot: Hotspot;
  /** Catalogue category to shop, when one exists for this kind of piece. */
  category?: string;
};

export const HERO_FRAME_COUNT = 96;

export const HERO_SECTIONS: HeroSection[] = [
  {
    from: 0,
    to: 16,
    eyebrow: "Worn at the crown",
    title: "Maang tikka & mathapatti",
    body: "The piece that sets the parting. Weighted to sit still, hinged so it follows the head.",
    hotspot: { start: { x: 0.46, y: 0.28 }, end: { x: 0.51, y: 0.22 } },
    category: "maang-tikka",
  },
  {
    from: 16,
    to: 30,
    eyebrow: "Nose & ears",
    title: "Nath and jhumkas",
    body: "A nath carries its weight on a chain to the ear. Jhumkas are balanced to swing, never to drag.",
    hotspot: { start: { x: 0.5, y: 0.53 }, end: { x: 0.485, y: 0.51 } },
    category: "jhumkas",
  },
  {
    from: 30,
    to: 48,
    eyebrow: "At the neck",
    title: "Layered haars",
    body: "Three lengths, each strung separately so they fall clear of one another rather than tangling.",
    hotspot: { start: { x: 0.5, y: 0.88 }, end: { x: 0.495, y: 0.58 } },
    category: "necklaces",
  },
  {
    from: 48,
    to: 64,
    eyebrow: "Arms & wrists",
    title: "Baajubandh and bangles",
    body: "The armlet grips above the elbow; the bangles are sized in pairs so the stack sits even.",
    hotspot: { start: { x: 0.19, y: 0.73 }, end: { x: 0.8, y: 0.6 } },
    category: "bangles",
  },
  {
    from: 64,
    to: 76,
    eyebrow: "At the waist",
    title: "Kamarbandh",
    body: "The heaviest piece on the body, and the one that has to hold a drape without pulling it.",
    hotspot: { start: { x: 0.465, y: 0.49 }, end: { x: 0.45, y: 0.12 } },
    category: "kamarbandh",
  },
  {
    from: 76,
    to: HERO_FRAME_COUNT - 1,
    eyebrow: "At the feet",
    title: "Payal and bichhiya",
    body: "Silver, by tradition, and the only jewellery meant to be heard before it is seen.",
    hotspot: { start: { x: 0.5, y: 0.97 }, end: { x: 0.52, y: 0.87 } },
    category: "anklets",
  },
];

/** Which section a frame index falls in. */
export function sectionForFrame(frame: number): number {
  for (let i = HERO_SECTIONS.length - 1; i >= 0; i--) {
    if (frame >= HERO_SECTIONS[i].from) return i;
  }
  return 0;
}

/** Hotspot position for a frame, interpolated across its section. */
export function hotspotAt(frame: number): { x: number; y: number } {
  const section = HERO_SECTIONS[sectionForFrame(frame)];
  const span = section.to - section.from || 1;
  const t = Math.min(1, Math.max(0, (frame - section.from) / span));
  return {
    x: section.hotspot.start.x + (section.hotspot.end.x - section.hotspot.start.x) * t,
    y: section.hotspot.start.y + (section.hotspot.end.y - section.hotspot.start.y) * t,
  };
}

/**
 * Where a normalised frame point lands inside a container that renders the
 * frame with `cover`. Pure geometry from the 16:9 frame aspect — no canvas
 * needed, so markers can be positioned in CSS.
 */
export function coverPoint(
  point: { x: number; y: number },
  containerWidth: number,
  containerHeight: number,
  frameAspect = 16 / 9,
): { left: number; top: number } {
  const coverWidth = Math.max(containerWidth, containerHeight * frameAspect);
  const coverHeight = coverWidth / frameAspect;
  return {
    left: (containerWidth - coverWidth) / 2 + point.x * coverWidth,
    top: (containerHeight - coverHeight) / 2 + point.y * coverHeight,
  };
}
