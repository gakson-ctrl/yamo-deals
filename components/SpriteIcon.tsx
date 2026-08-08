/**
 * SpriteIcon — YaMo Deals icon system
 *
 * Usage:
 *   import { SpriteIcon } from '@/components/SpriteIcon';
 *   <SpriteIcon name="poulet-braise" className="w-6 h-6 text-yamo-red" />
 *
 * Every glyph strokes with `currentColor`, so colour is controlled purely by
 * CSS `color` (Tailwind `text-*`). Nothing is hard-coded in the SVG files.
 *
 * IMPORTANT — the sprite must be inlined into the DOM once.
 * Safari does not resolve <use href="/icons/sprite.svg#id"> across files.
 * Render <IconSprite /> once in app/layout.tsx:
 *
 *   import { IconSprite } from '@/components/IconSprite';
 *   ...
 *   <body>
 *     <IconSprite />
 *     {children}
 *   </body>
 */

import { ICON_TOKENS, type IconName } from '@/lib/icon-tokens';

export interface SpriteIconProps {
  name: IconName;
  /** Accessible label. Omit for decorative icons (defaults to aria-hidden). */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

// Sprite injection removed — using direct /icons/*.svg static files.
// <use href="#id"> required an inline sprite which broke on Vercel (readFileSync).
export function SpriteIcon({
  name,
  label,
  className = 'w-6 h-6',
  style,
}: SpriteIconProps) {
  return (
    <img
      src={`/icons/${name}.svg`}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      className={className}
      style={style}
    />
  );
}

/**
 * IconChip — glyph on its brand-tinted category background.
 *
 *   <IconChip name="ndole" />
 *   <IconChip name="livreur-en-route" size={40} />
 *
 * Colours come from lib/icon-tokens.ts, applied inline so the same component
 * works whether or not the Tailwind theme is extended.
 */
export function IconChip({
  name,
  size = 40,
  label,
  className = '',
}: {
  name: IconName;
  size?: number;
  label?: string;
  className?: string;
}) {
  const { bg, fg } = ICON_TOKENS[name];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl ${className}`}
      style={{ width: size, height: size, backgroundColor: bg, color: fg }}
    >
      <SpriteIcon name={name} label={label} className="w-6 h-6" />
    </span>
  );
}
