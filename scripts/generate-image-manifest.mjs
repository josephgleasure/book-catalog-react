// Generate image-manifest.json for the gallery.
// Primary path: uses Cloudinary Admin API if CLOUDINARY_API_KEY/SECRET provided.
// Fallback path: scans local "src/assets/book images" to build the manifest.
import fs from 'fs/promises';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const assetsBase = path.join(srcDir, 'assets', 'book images');
const booksJsonPath = path.join(srcDir, 'data', 'books.json');
const outPath = path.join(srcDir, 'data', 'image-manifest.json');

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || 'dz3wtbik1';
const HAS_CLOUDINARY_CREDS = !!(process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

function sortByNumericSuffix(arr) {
  return [...arr].sort((a, b) => {
    const getNum = (s) => {
      // Match " (123)" or "_123" or "-123" style suffixes
      const paren = s.match(/\((\d+)\)(?:\.[^.]+)?$/);
      if (paren) return parseInt(paren[1], 10);
      const tail = s.match(/[_-](\d+)(?:\.[^.]+)?$/);
      if (tail) return parseInt(tail[1], 10);
      return 0;
    };
    return getNum(a) - getNum(b);
  });
}

async function readBooks() {
  const raw = await fs.readFile(booksJsonPath, 'utf-8');
  return JSON.parse(raw);
}

async function ensureDir(p) {
  await fs.mkdir(path.dirname(p), { recursive: true });
}

async function writeJson(p, data) {
  await ensureDir(p);
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf-8');
}

function toPublicIdFromLocal(localFileAbs) {
  // Convert absolute path under assetsBase to Cloudinary-like public id:
  // "book images/<subfolders>/<filename-without-ext>"
  const rel = path.relative(path.join(srcDir, 'assets'), localFileAbs).replace(/\\/g, '/'); // normalize to forward slashes
  const noExt = rel.replace(/\.[^.]+$/, '');
  return noExt;
}

async function walkDirs(startDir) {
  const entries = await fs.readdir(startDir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(startDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkDirs(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function buildFromLocal(books) {
  const allFiles = await walkDirs(assetsBase);
  const imageFiles = allFiles.filter(f => /\.(jpe?g|png|webp)$/i.test(f));

  const manifest = {};
  for (const book of books) {
    const title = book.title;
    // Find files in any folder whose path contains "/<title>/" segment
    const matching = imageFiles.filter(p => p.replace(/\\/g, '/').includes(`/${title}/`));
    const publicIds = sortByNumericSuffix(
      matching.map(toPublicIdFromLocal)
    );
    if (publicIds.length) {
      manifest[title] = { publicIds };
    }
  }
  return manifest;
}

async function buildFromCloudinary(books) {
  const { v2: cloudinary } = await import('cloudinary');
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  // Allow the caller to control the top-level folder prefix in Cloudinary.
  // Defaults to "book images/". If your Cloudinary has "book-images/book images/",
  // set CLOUDINARY_BASE_PREFIX="book-images/book images/"
  const BASE_PREFIX = (process.env.CLOUDINARY_BASE_PREFIX || 'book images').replace(/\/+$/, '');

  async function listByPrefix(prefix) {
    // Reliable listing by public_id prefix, which matches Cloudinary folder path for clean uploads
    const publicIds = [];
    let nextCursor = undefined;
    do {
      const res = await cloudinary.api.resources({
        type: 'upload',
        prefix,
        max_results: 500,
        next_cursor: nextCursor,
      });
      for (const r of (res.resources || [])) {
        publicIds.push(r.public_id);
      }
      nextCursor = res.next_cursor;
    } while (nextCursor);
    return publicIds;
  }

  async function searchByPublicIdSeed(seed) {
    // Fallback using Search API when folder path and public_id diacritics differ
    const publicIds = [];
    let nextCursor = undefined;
    do {
      const res = await cloudinary.search
        .expression(`public_id:${seed}*`)
        .max_results(500)
        .next_cursor(nextCursor)
        .execute();
      for (const r of (res.resources || [])) {
        publicIds.push(r.public_id);
      }
      nextCursor = res.next_cursor;
    } while (nextCursor);
    return publicIds;
  }

  // Build folder name matcher tolerant of punctuation/diacritics differences
  function normalizeName(name) {
    return name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '') // strip diacritics
      .replace(/&/g, 'and')
      .replace(/[^a-zA-Z0-9]+/g, ' ') // collapse punctuation to space
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  async function getFolderNameMap() {
    const nameToFullPath = new Map();

    // Try both possible base prefixes
    const baseCandidates = [BASE_PREFIX, `book-images/${BASE_PREFIX}`];

    // BFS traversal of subfolder tree
    async function listSubfolders(prefix) {
      const results = [];
      let nextCursor;
      do {
        const res = await cloudinary.api.sub_folders(prefix, { next_cursor: nextCursor });
        for (const f of (res.folders || [])) {
          results.push(`${prefix}/${f.name}`);
        }
        nextCursor = res.next_cursor;
      } while (nextCursor);
      return results;
    }

    for (const candidate of baseCandidates) {
      try {
        const queue = [candidate];
        const discovered = new Set([candidate]);
        // Set resolved candidate if this base exists
        resolvedBasePrefix = candidate;

        while (queue.length) {
          const current = queue.shift();
          const children = await listSubfolders(current);
          for (const child of children) {
            if (!discovered.has(child)) {
              discovered.add(child);
              queue.push(child);
              // Map leaf folder name (last segment) to full path
              const leaf = child.split('/').pop();
              nameToFullPath.set(normalizeName(leaf), child);
            }
          }
        }

        if (nameToFullPath.size > 0) break;
      } catch {
        // try next candidate
      }
    }

    return nameToFullPath;
  }

  // resolved base prefix to use in listByFolder calls; default to BASE_PREFIX
  let resolvedBasePrefix = BASE_PREFIX;

  const manifest = {};
  const folderNameMap = await getFolderNameMap();
  for (const book of books) {
    const title = book.title;
    // Find the best matching folder under BASE_PREFIX by normalized name
    const normalizedTitle = normalizeName(title);
    const matchedFolder = folderNameMap.get(normalizeName(title));
    if (!matchedFolder) {
      continue;
    }
    const folderPath = matchedFolder; // matchedFolder already includes full path, e.g. "books/<Title>"
    const prefix = `${folderPath}/`;  // ensure we only pull assets under this folder
    let ids = await listByPrefix(prefix);
    if (!ids.length) {
      // Fallback: search by a stable ASCII seed from the title to handle diacritic mismatches in folder vs public_id
      const asciiTitle = title
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim();
      const seed = asciiTitle.split(' ')[0]; // e.g., "NAKAGAWA"
      if (seed) {
        ids = await searchByPublicIdSeed(`${resolvedBasePrefix}/${seed}`);
      }
    }
    if (ids.length) {
      manifest[title] = { publicIds: sortByNumericSuffix(ids) };
      continue;
    }

    // If nothing found, leave the title absent in the manifest.
  }
  return manifest;
}

async function main() {
  const books = await readBooks();
  console.log(`[manifest] Building image manifest (${HAS_CLOUDINARY_CREDS ? 'cloudinary' : 'local'})...`);
  const manifest = HAS_CLOUDINARY_CREDS
    ? await buildFromCloudinary(books)
    : await buildFromLocal(books);

  await writeJson(outPath, manifest);
  console.log(`[manifest] Wrote ${Object.keys(manifest).length} titles to ${path.relative(projectRoot, outPath)}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});


