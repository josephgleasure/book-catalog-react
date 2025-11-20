import React, { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import LibraryList from './LibraryList';
import BookPopup from './BookPopup';
import { findBookById } from '../data/books';
import { slugifyTitle } from '../utils/slug';

const LibraryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [lastFocusedEl, setLastFocusedEl] = useState<HTMLElement | null>(null);

  // Support either /library/:slug (preferred) or ?book=ID (back-compat)
  const slugId = slug ? parseInt(slug.match(/-(\d+)$/)?.[1] || '', 10) : NaN;
  const bookParam = searchParams.get('book');
  const queryId = bookParam ? parseInt(bookParam, 10) : NaN;
  const bookId = Number.isFinite(slugId) ? slugId : queryId;

  const book = useMemo(() => {
    if (!Number.isFinite(bookId)) return null;
    const found = findBookById(bookId);
    if (!found) return null;
    return {
      ...found,
      isbn: String(found.isbn),
      images: typeof (found as any).images === 'string' ? [(found as any).images] : (found as any).images
    } as any;
  }, [bookId]);

  const handleOpenBook = (id: number) => {
    const active = document.activeElement as HTMLElement | null;
    if (active && typeof active.focus === 'function') {
      setLastFocusedEl(active);
    } else {
      setLastFocusedEl(null);
    }
    const found = findBookById(id);
    const s = found ? slugifyTitle(found.title) : 'book';
    const nextQs = new URLSearchParams(searchParams);
    // remove legacy query param to avoid duplication
    nextQs.delete('book');
    // strip default params
    if (!nextQs.get('q')) nextQs.delete('q');
    if (nextQs.get('page') === '1') nextQs.delete('page');
    const qsString = nextQs.toString();
    const nextUrl = qsString ? `/library/${s}-${id}?${qsString}` : `/library/${s}-${id}`;
    navigate(nextUrl);
  };

  const handleClose = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('book'); // strip legacy param if present
    // strip default params
    if (!next.get('q')) next.delete('q');
    if (next.get('page') === '1') next.delete('page');
    const qsString = next.toString();
    const dest = qsString ? `/library?${qsString}` : '/library';
    navigate(dest);
    // restore focus after URL updates
    setTimeout(() => {
      if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
        lastFocusedEl.focus();
      }
    }, 0);
  };

  return (
    <>
      <LibraryList onOpenBook={handleOpenBook} />
      {book && (
        <BookPopup
          book={book}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default LibraryPage;


