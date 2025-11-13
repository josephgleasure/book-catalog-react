import React, { useEffect, useState, useRef } from 'react';
import getCloudinaryUrl from '../utils/cloudinary';
// Import the generated manifest (title -> { publicIds: string[] })
// Each publicId is a Cloudinary public_id like "book images/<Title>/<fileBase>"
// with no extension.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - allow JSON import without explicit types
import imageManifest from '../data/image-manifest.json';

interface BookGalleryProps {
  bookTitle: string;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const BookGallery: React.FC<BookGalleryProps> = ({ bookTitle, currentIndex, onIndexChange, onClose }) => {
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [isSinglePage, setIsSinglePage] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Load images - prefer Cloudinary manifest; fallback to local scan during migration
  useEffect(() => {
    const manifestEntry = (imageManifest as Record<string, { publicIds: string[] }>)[bookTitle];
    if (manifestEntry && Array.isArray(manifestEntry.publicIds) && manifestEntry.publicIds.length > 0) {
      const pageWidth = typeof window !== 'undefined' && window.innerWidth <= 768
        ? 600  // mobile transform width
        : 800; // desktop transform width
      const urls = manifestEntry.publicIds.map(id =>
        getCloudinaryUrl(id, { width: pageWidth })
      );
      setImagePaths(urls);
      return;
    }

    // Fallback: local glob (dev/migration only)
    const allImages = import.meta.glob(
      '/src/assets/book images/**/*.{jpg,png,webp}',
      { eager: true, as: 'url' }
    );
    const filteredPaths = Object.entries(allImages)
      .filter(([path]) => path.includes(`/${bookTitle}/`))
      .map(([, url]) => url as string)
      .sort((a, b) => {
        const numA = parseInt(a.match(/\((\d+)\)/)?.[1] || '0');
        const numB = parseInt(b.match(/\((\d+)\)/)?.[1] || '0');
        return numA - numB;
      });
    setImagePaths(filteredPaths);
  }, [bookTitle]);

  // Handle responsive single-page mode
  useEffect(() => {
    const onResize = () => setIsSinglePage(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, imagePaths.length]);

  const handleNext = () => {
    const step = isSinglePage ? 1 : 2;
    if (currentIndex >= imagePaths.length - step) return;
    onIndexChange(currentIndex + step);
  };

  const handlePrevious = () => {
    const step = isSinglePage ? 1 : 2;
    if (currentIndex === 0) return;
    onIndexChange(Math.max(0, currentIndex - step));
  };

  if (imagePaths.length === 0) {
    return <div>No images found for "{bookTitle}".</div>;
  }

  return (
    <div className={`book-gallery`} ref={galleryRef}>
      <div className="spread-container-wrapper">
        <button 
          className="nav-button prev-button"
          onClick={handlePrevious} 
          disabled={currentIndex === 0}
        >
          ←
        </button>
        
        <div className={`spread-container`}>
          <img
            src={imagePaths[currentIndex]}
            className="gallery-page left-page"
            alt={`${bookTitle} - Page ${currentIndex + 1}`}
            loading="lazy"
            width={600}
            height={800}
          />
          {!isSinglePage && currentIndex + 1 < imagePaths.length && (
            <img
              src={imagePaths[currentIndex + 1]}
              className="gallery-page right-page"
              alt={`${bookTitle} - Page ${currentIndex + 2}`}
              loading="lazy"
              width={600}
              height={800}
            />
          )}
        </div>

        <button
          className="nav-button next-button"
          onClick={handleNext}
          disabled={currentIndex >= imagePaths.length - (isSinglePage ? 1 : 2)}
        >
          →
        </button>
      </div>
      {!isSinglePage && (
        <div className="thumb-toggle">
          <button
            onClick={() => setShowThumbnails(v => !v)}
            style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6, background: showThumbnails ? '#f0f0f0' : '#fff', cursor: 'pointer' }}
          >{showThumbnails ? 'Close Gallery' : 'Browse Thumbnail Gallery'}</button>
        </div>
      )}
      {!isSinglePage && showThumbnails && (
        <div className="thumbnail-strip">
          {imagePaths.map((src, idx) => (
            <img
              key={src}
              src={src}
              className={`thumbnail ${(idx === currentIndex || idx === currentIndex + 1) ? 'active' : ''}`}
              onClick={() => onIndexChange(idx)}
              alt={`${bookTitle} - Thumbnail ${idx + 1}`}
              loading="lazy"
              width={120}
              height={160}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookGallery;
