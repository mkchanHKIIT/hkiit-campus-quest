/** Hong Kong stylised map bounds (metres in game world). +Z = North, +X = East. */
export const MAP = {
  minX: -95,
  maxX: 95,
  minZ: -55,
  maxZ: 75,
  harbourY: 0.15,
} as const;

export const PLAYER_START = { x: 8, z: 2 };
