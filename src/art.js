// Illustrations live in public/art/. Placeholders are SVG; to use real art, drop e.g.
// public/art/scene-haldi.webp and add `'scene-haldi': 'scene-haldi.webp'` below.
const overrides = {};

export const artFile = (name) => overrides[name] ?? `${name}.svg`;
export const art = (name) => `${import.meta.env.BASE_URL}art/${artFile(name)}`;
export const publicUrl = (path) => `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, '')}`;
