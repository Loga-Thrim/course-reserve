const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const addMoreBooks = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Adding more books to categories...');

    // Add more Self-Help books (category 9)
    const selfHelpBooks = [
      ['The 7 Habits of Highly Effective People', 'Stephen Covey', 9, 'Personal development and effectiveness principles', 'https://covers.openlibrary.org/b/isbn/9781982137274-L.jpg', '9781982137274', 5, 5, 1989],
      ['How to Win Friends and Influence People', 'Dale Carnegie', 9, 'Social skills and relationship building', 'https://covers.openlibrary.org/b/isbn/9780671027032-L.jpg', '9780671027032', 4, 4, 1936],
      ['The Power of Habit', 'Charles Duhigg', 9, 'Understanding and changing habits', 'https://covers.openlibrary.org/b/isbn/9780812981605-L.jpg', '9780812981605', 5, 5, 2012],
      ['Thinking, Fast and Slow', 'Daniel Kahneman', 9, 'Understanding how we think', 'https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg', '9780374533557', 4, 4, 2011],
      ['The Subtle Art of Not Giving a F*ck', 'Mark Manson', 9, 'Life advice and philosophy', 'https://covers.openlibrary.org/b/isbn/9780062457714-L.jpg', '9780062457714', 6, 6, 2016],
    ];

    let addedCount = 0;

    for (const book of selfHelpBooks) {
      await client.query(
        `INSERT INTO books (title, author, category_id, description, cover_url, isbn, total_copies, available_copies, published_year)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        book
      );
      addedCount++;
      console.log(`✓ Added: ${book[0]}`);
    }

    console.log(`\n✅ Migration completed! Added ${addedCount} new books.`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

addMoreBooks();
