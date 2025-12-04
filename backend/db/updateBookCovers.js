const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const updateBookCovers = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Starting book cover migration...');

    // Update books with proper cover URLs based on their ISBN
    const booksToUpdate = [
      { isbn: '9780743273565', url: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg' }, // The Great Gatsby
      { isbn: '9780451524935', url: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg' }, // 1984
      { isbn: '9780061120084', url: 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg' }, // To Kill a Mockingbird
      { isbn: '9780547928227', url: 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg' }, // The Hobbit
      { isbn: '9780141439518', url: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg' }, // Pride and Prejudice
      { isbn: '9780307474278', url: 'https://covers.openlibrary.org/b/isbn/9780307474278-L.jpg' }, // The Da Vinci Code
      { isbn: '9780062316110', url: 'https://covers.openlibrary.org/b/isbn/9780062316110-L.jpg' }, // Sapiens
      { isbn: '9780062315007', url: 'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg' }, // The Alchemist
      { isbn: '9781451648539', url: 'https://covers.openlibrary.org/b/isbn/9781451648539-L.jpg' }, // Steve Jobs
      { isbn: '9780441172719', url: 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg' }, // Dune
      { isbn: '9780316769174', url: 'https://covers.openlibrary.org/b/isbn/9780316769174-L.jpg' }, // The Catcher in the Rye
      { isbn: '9780590353427', url: 'https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg' }, // Harry Potter
      { isbn: '9780544003415', url: 'https://covers.openlibrary.org/b/isbn/9780544003415-L.jpg' }, // The Lord of the Rings
      { isbn: '9780735211292', url: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg' }, // Atomic Habits
      { isbn: '9780307887894', url: 'https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg' }, // The Lean Startup
      { isbn: '9780399590504', url: 'https://covers.openlibrary.org/b/isbn/9780399590504-L.jpg' }, // Educated
      { isbn: '9781250301697', url: 'https://covers.openlibrary.org/b/isbn/9781250301697-L.jpg' }, // The Silent Patient
      { isbn: '9781524763138', url: 'https://covers.openlibrary.org/b/isbn/9781524763138-L.jpg' }, // Becoming
      { isbn: '9780316769488', url: 'https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg' }, // The Girl on the Train
      { isbn: '9780525559474', url: 'https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg' }, // Where the Crawdads Sing
    ];

    let updatedCount = 0;

    for (const book of booksToUpdate) {
      const result = await client.query(
        'UPDATE books SET cover_url = $1 WHERE isbn = $2',
        [book.url, book.isbn]
      );
      
      if (result.rowCount > 0) {
        updatedCount++;
        console.log(`✓ Updated cover for ISBN: ${book.isbn}`);
      }
    }

    console.log(`\n✅ Migration completed! Updated ${updatedCount} book covers.`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

updateBookCovers();
