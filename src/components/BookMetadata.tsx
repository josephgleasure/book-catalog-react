import React from 'react';

interface BookMetadataProps {
  title: string;
  author: string;
  isbn: string;
  publicationYear: number;
  description: string;
}

const BookMetadata: React.FC<BookMetadataProps> = ({
  title,
  author,
  isbn,
  publicationYear,
  description
}) => {
  return (
    <div className="book-metadata">
      <h2 className="book-title">{title}</h2>
      <div className="metadata-grid">
        <div className="metadata-item">
          <span className="metadata-label">Author:</span>
          <span className="metadata-value">{author}</span>
        </div>
        <div className="metadata-item">
          <span className="metadata-label">ISBN:</span>
          <span className="metadata-value">{isbn}</span>
        </div>
        <div className="metadata-item publication-year"> {/*this is for publication year*/}
          <span className="metadata-label">Publication Year:</span>
          <div className="tag-container">
            {publicationYear} {/* Just display the number directly */}
          </div>
        </div>
      </div>
      <div className="book-description">
        <h3>Description</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default BookMetadata;
