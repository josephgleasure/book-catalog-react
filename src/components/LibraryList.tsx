import React, { useMemo, useState } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON without explicit types
import booksData from '../data/books.json';

type LibraryBook = {
  id: number;
  title: string;
  author: string;
  isbn: string | number;
  publicationYear: number;
  // In the data this can be a string pattern or an array when generated elsewhere
  images?: string | string[];
  // Optional future fields
  pages?: number;
  dateAdded?: string;
};

// Match the grid's thumbnail source
function getGridThumbnailUrl(id: number): string {
  try {
    return new URL(`../assets/thumbnails/${id}.jpg`, import.meta.url).href;
  } catch {
    return new URL(`../assets/thumbnails/fallback.jpg`, import.meta.url).href;
  }
}

const LibraryList: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [query, setQuery] = useState<string>('');

  const books: LibraryBook[] = (booksData as LibraryBook[])
    .filter(b => String(b.title).toLowerCase() !== 'coming soon');

  const sortedBooks = useMemo(
    () => [...books].sort((a, b) => a.title.localeCompare(b.title)),
    [books]
  );

  const tokens = useMemo(
    () => query.toLowerCase().trim().split(/\s+/).filter(Boolean),
    [query]
  );

  const filteredBooks = useMemo(() => {
    if (tokens.length === 0) return sortedBooks;
    return sortedBooks.filter(b => {
      const haystack = [
        b.title,
        b.author,
        (b as any).description ?? '',
        b.isbn ?? '',
        String(b.publicationYear),
      ].join(' ').toLowerCase();
      return tokens.every(t => haystack.includes(t));
    });
  }, [sortedBooks, tokens]);

  const hoveredCover = useMemo(() => {
    if (!hoveredId) return null;
    return getGridThumbnailUrl(hoveredId);
  }, [hoveredId]);

  return (
    <div className="library-container">
      <aside className="library-preview">
        {/** Resolve the paper texture at build time for reliability */}
        {(() => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - allow URL construction for static asset
          const paperTextureUrl = new URL('../assets/textures/library texture.jpg', import.meta.url).href;
          return (
        <div
          className="library-preview-frame"
          style={
            {
              '--paper-url': `url('${paperTextureUrl}')`,
              '--paper-rotation': '0deg'
            } as React.CSSProperties
          }
        >
          <div className="library-preview-inner">
            {hoveredCover && (
              <img
                src={hoveredCover}
                alt="Preview"
                className="library-preview-image"
                loading="eager"
              />
            )}
          </div>
        </div>
          );
        })()}
      </aside>
      <main className="library-list" onMouseLeave={() => setHoveredId(null)}>
        <div className="library-search">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, author, year, ISBN, description…"
            aria-label="Search library"
          />
          {query && (
            <button
              type="button"
              className="library-search-clear"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              title="Clear"
            >
              ×
            </button>
          )}
        </div>
        {filteredBooks.map((b, idx) => {
          const isbn = b.isbn ? String(b.isbn) : 'n/a';
          const displayIndex = `#${idx + 1}`;
          const rawFirst = (b.author || '').split('&')[0].split(',')[0].trim();
          // Handle \"Last, First\" -> \"First Last\"
          let firstAuthor = rawFirst;
          if (/^[^\\s,]+,\\s*[^\\s].*$/.test((b.author || ''))) {
            const parts = (b.author || '').split('&')[0].split(',').map(s => s.trim());
            if (parts.length >= 2 && parts[0] && parts[1]) {
              firstAuthor = `${parts[1]} ${parts[0]}`;
            }
          }
          // Text line format per prototype idea
          const line = `${b.title}    <YEAR> ${b.publicationYear}    <AUTHOR> ${firstAuthor}`;
          return (
            <div
              key={b.id}
              className="library-row"
              onMouseEnter={() => setHoveredId(b.id)}
              role="listitem"
            >
              <div className="library-row-inner">
                <span className="library-col library-col-num">{displayIndex}</span>
                <span className="library-col library-col-title">{b.title}</span>
                <span className="library-col library-col-year">{b.publicationYear}</span>
                <span className="library-col library-col-author">{firstAuthor}</span>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default LibraryList;


