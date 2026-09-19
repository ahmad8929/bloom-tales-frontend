import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Frame the existing high-resolution brand mark, preserving the original artwork.
export async function brandIcon(size: number) {
  const logo = await readFile(path.join(process.cwd(), 'public/logo.png'));
  const scale = size / 560;
  return new ImageResponse(
    <div style={{ display: 'flex', width: size, height: size, overflow: 'hidden', position: 'relative', background: '#efd4c7' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" src={`data:image/png;base64,${logo.toString('base64')}`} width={900 * scale} height={1600 * scale}
        style={{ position: 'absolute', left: -170 * scale, top: -390 * scale, maxWidth: 900 * scale }} />
    </div>,
    { width: size, height: size },
  );
}
