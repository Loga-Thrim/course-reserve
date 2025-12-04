const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initializeDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Starting database initialization...');

    // Drop existing tables
    await client.query(`
      DROP TABLE IF EXISTS search_history CASCADE;
      DROP TABLE IF EXISTS borrows CASCADE;
      DROP TABLE IF EXISTS books CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Create users table
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table created');

    // Create categories table
    await client.query(`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT
      );
    `);
    console.log('✓ Categories table created');

    // Create books table
    await client.query(`
      CREATE TABLE books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        description TEXT,
        cover_url TEXT,
        isbn VARCHAR(20),
        total_copies INTEGER DEFAULT 1,
        available_copies INTEGER DEFAULT 1,
        published_year INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Books table created');

    // Create borrows table
    await client.query(`
      CREATE TABLE borrows (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        due_date TIMESTAMP,
        returned_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'borrowed'
      );
    `);
    console.log('✓ Borrows table created');

    // Create search_history table
    await client.query(`
      CREATE TABLE search_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        search_query VARCHAR(255),
        category_id INTEGER REFERENCES categories(id),
        searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Search history table created');

    // Insert sample categories
    const categories = [
      ['Fiction', 'Fictional stories and novels'],
      ['Science Fiction', 'Science fiction and futuristic stories'],
      ['Mystery', 'Mystery and thriller novels'],
      ['Romance', 'Romantic novels and stories'],
      ['Biography', 'Biographies and autobiographies'],
      ['History', 'Historical books and documentaries'],
      ['Science', 'Scientific books and research'],
      ['Technology', 'Technology and computer science books'],
      ['Self-Help', 'Self-improvement and motivational books'],
      ['Fantasy', 'Fantasy and magical stories']
    ];

    for (const [name, description] of categories) {
      await client.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2)',
        [name, description]
      );
    }
    console.log('✓ Sample categories inserted');

    // Insert sample books
    const books = [
      ['The Great Gatsby', 'F. Scott Fitzgerald', 1, 'A classic American novel set in the Jazz Age', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9780743273565', 5, 5, 1925],
      ['1984', 'George Orwell', 2, 'A dystopian social science fiction novel', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9780451524935', 4, 4, 1949],
      ['To Kill a Mockingbird', 'Harper Lee', 1, 'A novel about racial injustice in the Deep South', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9780061120084', 6, 6, 1960],
      ['The Hobbit', 'J.R.R. Tolkien', 10, 'A fantasy novel about Bilbo Baggins', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9780547928227', 5, 5, 1937],
      ['Pride and Prejudice', 'Jane Austen', 4, 'A romantic novel of manners', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9780141439518', 4, 4, 1813],
      ['The Da Vinci Code', 'Dan Brown', 3, 'A mystery thriller novel', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9780307474278', 3, 3, 2003],
      ['Sapiens', 'Yuval Noah Harari', 6, 'A brief history of humankind', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9780062316110', 5, 5, 2011],
      ['The Alchemist', 'Paulo Coelho', 1, 'A philosophical novel about following dreams', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9780062315007', 6, 6, 1988],
      ['Steve Jobs', 'Walter Isaacson', 5, 'Biography of Apple co-founder', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9781451648539', 3, 3, 2011],
      ['Dune', 'Frank Herbert', 2, 'Science fiction novel set in the distant future', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9780441172719', 4, 4, 1965],
      ['The Catcher in the Rye', 'J.D. Salinger', 1, 'A story about teenage rebellion', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9780316769174', 5, 5, 1951],
      ['Harry Potter and the Sorcerer\'s Stone', 'J.K. Rowling', 10, 'First book in the Harry Potter series', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9780590353427', 8, 8, 1997],
      ['The Lord of the Rings', 'J.R.R. Tolkien', 10, 'Epic high-fantasy novel', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9780544003415', 5, 5, 1954],
      ['Atomic Habits', 'James Clear', 9, 'Guide to building good habits', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9780735211292', 7, 7, 2018],
      ['The Lean Startup', 'Eric Ries', 8, 'How to build a successful startup', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9780307887894', 4, 4, 2011],
      ['Educated', 'Tara Westover', 5, 'Memoir about education and family', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9780399590504', 5, 5, 2018],
      ['The Silent Patient', 'Alex Michaelides', 3, 'Psychological thriller novel', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9781250301697', 4, 4, 2019],
      ['Becoming', 'Michelle Obama', 5, 'Autobiography of former First Lady', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9781524763138', 6, 6, 2018],
      ['The Martian', 'Andy Weir', 2, 'Science fiction novel about survival on Mars', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9780553418026', 5, 5, 2011],
      ['Gone Girl', 'Gillian Flynn', 3, 'Psychological thriller about a missing woman', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '9780307588371', 4, 4, 2012]
    ];

    for (const book of books) {
      await client.query(
        `INSERT INTO books (title, author, category_id, description, cover_url, isbn, total_copies, available_copies, published_year)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        book
      );
    }
    console.log('✓ Sample books inserted');

    console.log('✅ Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

initializeDatabase().catch(console.error);
