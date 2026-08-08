/**
 * IconSprite — inlines public/icons/sprite.svg into the DOM once.
 *
 * Required because Safari will not resolve <use href="/icons/sprite.svg#id">
 * across files. Render this once, high in the tree:
 *
 *   // app/layout.tsx
 *   import { IconSprite } from '@/components/IconSprite';
 *
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html lang="fr">
 *         <body>
 *           <IconSprite />
 *           {children}
 *         </body>
 *       </html>
 *     );
 *   }
 *
 * Server Component — the file is read at build time, never shipped as a
 * separate request. Cost is ~4 KB of inline markup.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const sprite = readFileSync(
  join(process.cwd(), 'public', 'icons', 'sprite.svg'),
  'utf-8'
);

export function IconSprite() {
  return <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: sprite }} />;
}
