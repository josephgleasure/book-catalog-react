import React, { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LibraryList from './LibraryList';
import BookPopup from './BookPopup';
import { findBookById } from '../data/books';

const LibraryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [lastFocusedEl, setLastFocusedEl] = useState<HTMLElement | null>(null);
  const bookParam = searchParams.get('book');
  const bookId = bookParam ? parseInt(bookParam, 10) : NaN;

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
    const next = new URLSearchParams(searchParams);
    next.set('book', String(id));
    setSearchParams(next);
  };

  const handleClose = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('book');
    setSearchParams(next);
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


