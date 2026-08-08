export const ICON_NAMES = [
  "poulet-braise",
  "soya-brochette",
  "beignets",
  "ndole",
  "eru-soupe",
  "riz-complet",
  "pizza",
  "sandwich",
  "boissons",
  "desserts",
  "commande-confirmee",
  "en-preparation",
  "livreur-en-route",
  "livre",
  "temps-estime",
  "adresse-livraison",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export const FOOD_ICONS: readonly IconName[] = [
  "poulet-braise",
  "soya-brochette",
  "beignets",
  "ndole",
  "eru-soupe",
  "riz-complet",
  "pizza",
  "sandwich",
  "boissons",
  "desserts",
];

export const STATUS_ICONS: readonly IconName[] = [
  "commande-confirmee",
  "en-preparation",
  "livreur-en-route",
  "livre",
  "temps-estime",
  "adresse-livraison",
];

/**
 * Brand palette. `fg` drives the glyph (applied via `color`, since every icon
 * strokes with `currentColor`). `bg` is the category chip behind it.
 */
export const YAMO_COLORS = {
  red: "#E63927",
  mango: "#F5A623",
  fern: "#27AE60",
  redTint: "#FDF0EE",
  mangoTint: "#FFF4E6",
  fernTint: "#EBF7EE",
  cream: "#FDF8F2",
} as const;

export interface IconToken {
  bg: string;
  fg: string;
}

export const ICON_TOKENS: Record<IconName, IconToken> = {
  "poulet-braise": { bg: "#FDF0EE", fg: "#E63927" },
  "soya-brochette": { bg: "#FDF0EE", fg: "#E63927" },
  "beignets": { bg: "#FFF4E6", fg: "#F5A623" },
  "ndole": { bg: "#EBF7EE", fg: "#27AE60" },
  "eru-soupe": { bg: "#EBF7EE", fg: "#27AE60" },
  "riz-complet": { bg: "#EBF7EE", fg: "#27AE60" },
  "pizza": { bg: "#FDF0EE", fg: "#E63927" },
  "sandwich": { bg: "#FFF4E6", fg: "#F5A623" },
  "boissons": { bg: "#EBF7EE", fg: "#27AE60" },
  "desserts": { bg: "#FFF4E6", fg: "#F5A623" },
  "commande-confirmee": { bg: "#FDF8F2", fg: "#27AE60" },
  "en-preparation": { bg: "#FDF8F2", fg: "#F5A623" },
  "livreur-en-route": { bg: "#FDF8F2", fg: "#E63927" },
  "livre": { bg: "#FDF8F2", fg: "#27AE60" },
  "temps-estime": { bg: "#FDF8F2", fg: "#F5A623" },
  "adresse-livraison": { bg: "#FDF8F2", fg: "#E63927" },
};
