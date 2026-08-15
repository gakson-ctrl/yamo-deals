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

// Icons rendered via CSS mask-image so that `text-*` color classes apply correctly.
// SVG loaded via <img> cannot inherit CSS color; mask-image reads alpha channel
// of the SVG (stroke = opaque) and paints it with backgroundColor: currentColor.
export function SpriteIcon({
  name,
  label,
  className = 'w-6 h-6',
  style,
}: SpriteIconProps) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`inline-block ${className}`}
      style={{
        ...style,
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url(/icons/${name}.svg)`,
        maskImage: `url(/icons/${name}.svg)`,
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
      }}
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
