'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Matches the manufacturer's photo naming convention seen in every SKU
// folder (e.g. "M-165-Model-Yellow.jpg", "M-165-Yellow 1.jpg",
// "M-165-White 4.jpg", or — the Earrings batch, 22 Sep 2026 — "ST-251 Rose
// 1.jpg" with a SPACE before the color word instead of a hyphen).
// Deliberately does NOT match the bare SKU render ("M-165.png"), the CAD
// files (.3dm/.stl), or plain detail shots like "ST-251-Detail.jpg" /
// "ST-251-Rounds-Detail.jpg" — those have no Yellow/White/Rose color word
// in the name, so they're silently skipped. The character right before the
// color word (or "Model-") is a space OR a hyphen ([\s-]) since both
// conventions have shown up across manufacturer batches; the separator
// before the trailing number is the same, or absent entirely for the hero
// shot, which has no number at all. The dot before the extension is `\.+`
// (one or more), not `\.` — Taka Tak Studs Vol.3's Round folders (25 Sep
// 2026) had one manufacturer typo, "ST-91-Rounds-Rose 4..jpg" (double
// period), which a single `\.` silently failed to match, dropping a real
// photo with no error shown anywhere. `\.+` still requires the extension
// text itself to match exactly, so this doesn't loosen anything else.
const IMAGE_NAME_RE = /[\s-](Model-)?(Yellow|White|Rose)[\s-]*(\d+)?\.+(jpe?g|png)$/i;

// The Excel-derived `sku` column has inconsistent spacing across rows
// ("M-165" vs "M -165" vs "M - 166") — see ADMIN_PANEL_PROGRESS.md — while
// the photo folders on disk are consistently "M-165" with no spaces.
// Stripping all whitespace before comparing makes both sides match
// regardless of which style either one happens to use.
function normalizeSku(s: string): string {
  return s.replace(/\s+/g, '').toUpperCase();
}

function parseFileName(name: string) {
  const m = name.match(IMAGE_NAME_RE);
  if (!m) return null;
  return {
    isHero: Boolean(m[1]),
    color: m[2].toLowerCase() as 'yellow' | 'white' | 'rose',
    index: m[3] ? parseInt(m[3], 10) : 0,
  };
}

function storageFileName(originalName: string): string {
  return originalName.toLowerCase().replace(/\s+/g, '-');
}

type FileRole = { isHero: boolean; color: 'yellow' | 'white' | 'rose'; index: number };
type GroupStatus = 'matched' | 'unmatched' | 'uploading' | 'done' | 'error';

type PhotoGroup = {
  folderName: string;
  productId?: string;
  productName?: string;
  norvikSku?: string;
  files: { file: File; role: FileRole }[];
  status: GroupStatus;
  error?: string;
};

type ProductRow = { id: string; name: string; sku: string | null; norvik_sku: string | null };

export default function ImportPhotosPage() {
  const [groups, setGroups] = useState<PhotoGroup[]>([]);
  const [scanning, setScanning] = useState(false);
  const [running, setRunning] = useState(false);
  const [skippedFiles, setSkippedFiles] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFolderSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setScanning(true);
    setError(null);
    setGroups([]);
    setDoneCount(0);

    try {
      const supabase = createClient();
      const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('id, name, sku, norvik_sku');
      if (fetchError) throw new Error(fetchError.message);

      const bySku = new Map<string, ProductRow>();
      for (const p of (products ?? []) as ProductRow[]) {
        if (p.sku) bySku.set(normalizeSku(p.sku), p);
      }

      const byFolder = new Map<string, { file: File; role: FileRole }[]>();
      let skipped = 0;

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const rel =
          (file as unknown as { webkitRelativePath?: string }).webkitRelativePath || file.name;
        const parts = rel.split('/');
        if (parts.length < 2) {
          skipped++;
          continue;
        }
        const folder = parts[parts.length - 2];
        const filename = parts[parts.length - 1];
        const role = parseFileName(filename);
        if (!role) {
          skipped++;
          continue;
        }
        if (!byFolder.has(folder)) byFolder.set(folder, []);
        byFolder.get(folder)!.push({ file, role });
      }

      const nextGroups: PhotoGroup[] = [];
      for (const [folderName, files] of byFolder.entries()) {
        const product = bySku.get(normalizeSku(folderName));
        nextGroups.push({
          folderName,
          productId: product?.id,
          productName: product?.name,
          norvikSku: product?.norvik_sku ?? undefined,
          files,
          status: product ? 'matched' : 'unmatched',
        });
      }
      nextGroups.sort((a, b) =>
        a.folderName.localeCompare(b.folderName, undefined, { numeric: true })
      );

      setGroups(nextGroups);
      setSkippedFiles(skipped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not scan the selected folder.');
    } finally {
      setScanning(false);
    }
  }

  async function uploadGroup(group: PhotoGroup, supabase: ReturnType<typeof createClient>) {
    if (!group.productId || !group.norvikSku) return;

    const heroFiles = group.files.filter((f) => f.role.isHero);
    const byColor: Record<'yellow' | 'white' | 'rose', { file: File; index: number }[]> = {
      yellow: [],
      white: [],
      rose: [],
    };
    for (const f of group.files) {
      if (f.role.isHero) continue;
      byColor[f.role.color].push({ file: f.file, index: f.role.index });
    }
    for (const color of ['yellow', 'white', 'rose'] as const) {
      byColor[color].sort((a, b) => a.index - b.index);
    }

    async function uploadOne(file: File, filename: string): Promise<string> {
      const path = `products/${group.norvikSku}/${storageFileName(filename)}`;
      const { error: upErr } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' });
      if (upErr) throw new Error(`${filename}: ${upErr.message}`);
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      return data.publicUrl;
    }

    // Ring-only product shots go first in the gallery, one color at a time —
    // this is what shows as the cover/thumbnail everywhere (shop grid, New
    // Arrivals, the metal-color swatch), so it must never be the hand-worn
    // "Model" shot. The Model hero shot is still uploaded (client may still
    // want it on the product page somewhere) but is pushed to the very end
    // of the gallery and is no longer used for metal_images (22 Sep 2026 —
    // client asked for "sirf ring" as the cover, no hand).
    const orderedImages: string[] = [];
    const metalImages: Record<string, string> = {};

    for (const color of ['yellow', 'white', 'rose'] as const) {
      const urls: string[] = [];
      for (const item of byColor[color]) {
        urls.push(await uploadOne(item.file, item.file.name));
      }
      orderedImages.push(...urls);
      if (!metalImages[color] && urls[0]) metalImages[color] = urls[0];
    }

    if (heroFiles[0]) {
      const heroUrl = await uploadOne(heroFiles[0].file, heroFiles[0].file.name);
      orderedImages.push(heroUrl);
    }

    const { error: updateErr } = await supabase
      .from('products')
      .update({ images: orderedImages, metal_images: metalImages })
      .eq('id', group.productId);
    if (updateErr) throw new Error(updateErr.message);
  }

  async function handleUploadAll() {
    setRunning(true);
    setError(null);
    const supabase = createClient();
    // Re-running only retries folders that are still pending or previously
    // failed — anything already 'done' is left alone, so it's safe to click
    // this again after fixing an error instead of re-uploading everything.
    const toProcess = groups.filter((g) => g.status === 'matched' || g.status === 'error');

    for (const group of toProcess) {
      setGroups((prev) =>
        prev.map((g) =>
          g.folderName === group.folderName ? { ...g, status: 'uploading', error: undefined } : g
        )
      );
      try {
        await uploadGroup(group, supabase);
        setGroups((prev) =>
          prev.map((g) => (g.folderName === group.folderName ? { ...g, status: 'done' } : g))
        );
        setDoneCount((c) => c + 1);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed.';
        setGroups((prev) =>
          prev.map((g) =>
            g.folderName === group.folderName ? { ...g, status: 'error', error: message } : g
          )
        );
      }
    }

    setRunning(false);
  }

  const unmatchedGroups = groups.filter((g) => g.status === 'unmatched');
  const matchedTotal = groups.length - unmatchedGroups.length;
  const pendingCount = groups.filter((g) => g.status === 'matched' || g.status === 'error').length;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink">Import product photos</h1>
      <p className="mt-2 text-sm text-charcoal">
        Select the manufacturer&apos;s photo folder — the one containing one sub-folder per SKU
        (e.g. <code className="font-mono text-[12px]">M-165</code>). Each folder is matched to a
        product by its <strong>Manufacturer SKU</strong>, its Yellow/White/Rose photos are uploaded
        to storage, and that product&apos;s Image URLs and per-metal photo are set automatically.
        CAD files (.3dm/.stl) and the render (.png) are ignored — only import this after those SKUs
        already exist as products (Excel import).
      </p>

      <div className="mt-6 border border-dashed border-line px-6 py-8 text-center">
        <input
          type="file"
          multiple
          onChange={handleFolderSelect}
          ref={(el) => {
            if (el) {
              el.setAttribute('webkitdirectory', 'true');
              el.setAttribute('directory', 'true');
            }
          }}
        />
        {scanning && <p className="mt-2 text-[13px] text-charcoal">Scanning folder…</p>}
      </div>

      {error && (
        <p className="mt-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {groups.length > 0 && (
        <div className="mt-8">
          <p className="text-[13px] text-charcoal">
            Found <strong>{groups.length}</strong> SKU folders — <strong>{matchedTotal}</strong>{' '}
            matched to an existing product.
            {unmatchedGroups.length > 0 && (
              <>
                {' '}
                <strong>{unmatchedGroups.length}</strong> folder(s) had no matching product (import
                that SKU via Excel first, then re-select this folder).
              </>
            )}
            {skippedFiles > 0 && <> Ignored {skippedFiles} non-photo file(s) (CAD/render/other).</>}
          </p>

          <div className="mt-4 max-h-[28rem] overflow-auto border border-line">
            <table className="w-full text-left text-[13px]">
              <thead className="sticky top-0 bg-softwhite text-[11px] uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Folder</th>
                  <th className="px-3 py-2 font-medium">Matched product</th>
                  <th className="px-3 py-2 font-medium">Photos found</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {groups.map((g) => (
                  <tr key={g.folderName}>
                    <td className="px-3 py-1.5 font-mono text-[12px]">{g.folderName}</td>
                    <td className={'px-3 py-1.5' + (g.productName ? '' : ' italic text-muted')}>
                      {g.productName ?? 'No match'}
                    </td>
                    <td className="px-3 py-1.5">{g.files.length}</td>
                    <td className="px-3 py-1.5">
                      {g.status === 'matched' && <span className="text-charcoal">Ready</span>}
                      {g.status === 'unmatched' && <span className="text-amber-700">Unmatched</span>}
                      {g.status === 'uploading' && <span className="text-antiquegold">Uploading…</span>}
                      {g.status === 'done' && <span className="text-green-700">Done ✓</span>}
                      {g.status === 'error' && <span className="text-red-700">{g.error ?? 'Error'}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleUploadAll}
            disabled={running || pendingCount === 0}
            className="mt-6 bg-antiquegold px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] text-softwhite disabled:opacity-50"
          >
            {running
              ? `Uploading… (${doneCount}/${matchedTotal} done)`
              : `Upload photos for ${pendingCount} product${pendingCount === 1 ? '' : 's'}`}
          </button>

          {!running && doneCount > 0 && (
            <p className="mt-4 border border-green-300 bg-green-50 px-4 py-3 text-[13px] text-green-800">
              Uploaded photos for {doneCount} product{doneCount === 1 ? '' : 's'}. Open any of them in
              Edit to confirm — the Image URLs field will now be pre-filled.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
