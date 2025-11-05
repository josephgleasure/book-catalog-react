const fs = require('fs');
const path = require('path');

const BOOKS_IMAGES_DIR = path.join(__dirname, 'src', 'assets', 'images', 'books');
const OUTPUT_JSON = path.join(__dirname, 'src', 'data', 'books.json');

function generateBooksJson() {
  const books = [];
  const bookFolders = fs.readdirSync(BOOKS_IMAGES_DIR)
    .filter(folder => fs.statSync(path.join(BOOKS_IMAGES_DIR, folder)).isDirectory());

  for (const folder of bookFolders) {
    const bookId = parseInt(folder.replace('book-', ''), 10);
    const imagesDir = path.join(BOOKS_IMAGES_DIR, folder);
    const images = fs.readdirSync(imagesDir)
      .filter(file => ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(file).toLowerCase()))
      .map(file => `/assets/images/books/${folder}/${file}`);

    books.push({
      id: bookId,
      title: `Book ${bookId}`,
      author: "Unknown",
      description: "Sample description.",
      isbn: "0000000000",
      tags: ["sample"],
      images: images,
    });
  }

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(books, null, 2));
  console.log(`Generated ${OUTPUT_JSON} with ${books.length} books.`);
}

generateBooksJson();