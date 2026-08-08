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

import type { SVGProps } from 'react';
import { ICON_TOKENS, type IconName } from '@/lib/icon-tokens';

export interface SpriteIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** Accessible label. Omit for decorative icons (defaults to aria-hidden). */
  label?: string;
}

export function SpriteIcon({
  name,
  label,
  className = 'w-6 h-6',
  ...props
}: SpriteIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...props}
    >
      {label ? <title>{label}</title> : null}
      <use href={`#${name}`} />
    </svg>
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
