import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
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
    // Use a public asset that always exists in both dev and prod
    return '/vite.svg';
  }
}

type LibraryListProps = {
  onOpenBook?: (bookId: number) => void;
};

const LibraryList: React.FC<LibraryListProps> = ({ onOpenBook }) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const query = (searchParams.get('q') ?? '').toString();
  const pageParam = parseInt((searchParams.get('page') ?? '1').toString(), 10);
  const currentPageFromUrl = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = 20;

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

  const total = filteredBooks.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(Math.max(1, currentPageFromUrl), pageCount);
  const start = (clampedPage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageBooks = filteredBooks.slice(start, end);

  // Virtualization (attach to window to avoid inner scrollbar)
  const rowVirtualizer = useWindowVirtualizer({
    count: pageBooks.length,
    estimateSize: () => 32, // tighter spacing to match original list
    overscan: 6,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

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
            onChange={(e) => {
              const nextQ = e.target.value;
              const next = new URLSearchParams(searchParams);
              if (nextQ) {
                next.set('q', nextQ);
              } else {
                next.delete('q');
              }
              // Reset to first page implicitly by removing the page param
              next.delete('page');
              setSearchParams(next);
            }}
            placeholder="Search title, author, year, ISBN, description…"
            aria-label="Search library"
          />
          {query && (
            <button
              type="button"
              className="library-search-clear"
              aria-label="Clear search"
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete('q');
                next.delete('page');
                setSearchParams(next);
              }}
              title="Clear"
            >
              ×
            </button>
          )}
        </div>
        <div className="library-meta" aria-live="polite">
          {total === 0 ? 'No books found' : `Showing ${start + 1}–${end} of ${total}`}
        </div>

        <div className="library-rows">
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualItems.map(virtual => {
              const index = virtual.index;
              const b = pageBooks[index];
              if (!b) return null;
              const isbn = b.isbn ? String(b.isbn) : 'n/a';
              const displayIndex = `#${start + index + 1}`;
              const rawFirst = (b.author || '').split('&')[0].split(',')[0].trim();
              let firstAuthor = rawFirst;
              if (/^[^\s,]+,\s*[^\s].*$/.test((b.author || ''))) {
                const parts = (b.author || '').split('&')[0].split(',').map(s => s.trim());
                if (parts.length >= 2 && parts[0] && parts[1]) {
                  firstAuthor = `${parts[1]} ${parts[0]}`;
                }
              }
              return (
                <div
                  key={b.id}
                  className="library-row"
                  onMouseEnter={() => setHoveredId(b.id)}
                  onClick={() => onOpenBook?.(b.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenBook?.(b.id);
                    }
                  }}
                  role="listitem"
                  tabIndex={0}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtual.start}px)`,
                  }}
                  ref={rowVirtualizer.measureElement}
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
          </div>
        </div>

        {total > pageSize && (
          <nav
            className="library-pagination"
            role="navigation"
            aria-label="Pagination"
          >
            <button
              type="button"
              onClick={() => {
                const newPage = Math.max(1, clampedPage - 1);
                const next = new URLSearchParams(searchParams);
                if (newPage > 1) {
                  next.set('page', String(newPage));
                } else {
                  next.delete('page');
                }
                setSearchParams(next);
              }}
              disabled={clampedPage === 1}
              aria-label="Previous page"
            >
              ← Prev
            </button>
            <span className="library-page-indicator" aria-live="polite">
              Page {clampedPage} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() => {
                const newPage = Math.min(pageCount, clampedPage + 1);
                const next = new URLSearchParams(searchParams);
                if (newPage > 1) {
                  next.set('page', String(newPage));
                } else {
                  next.delete('page');
                }
                setSearchParams(next);
              }}
              disabled={clampedPage === pageCount}
              aria-label="Next page"
            >
              Next →
            </button>
          </nav>
        )}
      </main>
    </div>
  );
};

export default LibraryList;


