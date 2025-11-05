import booksData from './books.json';

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: number | string; // Allow both types
  publicationYear: number;
  description: string;
  images: string;
}

export const books: Book[] = booksData;

export const findBookById = (id: number): Book | undefined => {
  return (books as Book[]).find((book: Book) => book.id === id);
};

const formatISBN = (isbn: number | string): string => {
  return isbn === "N/A" || isbn === "" ? "N/A" : String(isbn);
};
