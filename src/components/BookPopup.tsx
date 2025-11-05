import React, { useState, useEffect } from 'react';
import BookGallery from './BookGallery';
import BookMetadata from './BookMetadata';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publicationYear: number;
  description: string;
  images: string[]; // Array of image paths
}

interface BookPopupProps {
  book: Book;
  onClose: () => void;
}

const BookPopup: React.FC<BookPopupProps> = ({ book, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  console.log("Book title:", book.title); // Check in browser console

  return (
    <div className="book-popup">
      <div className="popup-content">
        <button
          className="close-btn"
          onClick={onClose}
          aria-label="Close popup"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '4px',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 32 32"
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ pointerEvents: 'none' }}
          >
            <path 
              d="M8 8L24 24M24 8L8 24"
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
          </svg>
        </button>
        <BookGallery 
          bookTitle={book.title}
          currentIndex={currentImageIndex}
          onIndexChange={setCurrentImageIndex}
          onClose={onClose}
        />
        <BookMetadata 
          title={book.title}
          author={book.author}
          isbn={book.isbn}
          publicationYear={book.publicationYear}
          description={book.description}
        />
      </div>
    </div>
  );
};

export default BookPopup;
