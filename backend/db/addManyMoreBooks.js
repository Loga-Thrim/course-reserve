const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const addManyMoreBooks = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Adding many more books to all categories...');

    // More books across different categories
    const moreBooks = [
      // Fiction (1)
      ['The Picture of Dorian Gray', 'Oscar Wilde', 1, 'A philosophical novel', 'https://covers.openlibrary.org/b/isbn/9780141439570-L.jpg', '9780141439570', 4, 4, 1890],
      ['Brave New World', 'Aldous Huxley', 1, 'Dystopian novel', 'https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg', '9780060850524', 5, 5, 1932],
      ['Animal Farm', 'George Orwell', 1, 'Political satire', 'https://covers.openlibrary.org/b/isbn/9780451526342-L.jpg', '9780451526342', 6, 6, 1945],
      ['Lord of the Flies', 'William Golding', 1, 'Survival and civilization', 'https://covers.openlibrary.org/b/isbn/9780399501487-L.jpg', '9780399501487', 4, 4, 1954],
      
      // Science Fiction (2)
      ['Foundation', 'Isaac Asimov', 2, 'Galactic empire saga', 'https://covers.openlibrary.org/b/isbn/9780553293357-L.jpg', '9780553293357', 5, 5, 1951],
      ['Neuromancer', 'William Gibson', 2, 'Cyberpunk classic', 'https://covers.openlibrary.org/b/isbn/9780441569595-L.jpg', '9780441569595', 4, 4, 1984],
      ['The Martian', 'Andy Weir', 2, 'Survival on Mars', 'https://covers.openlibrary.org/b/isbn/9780553418026-L.jpg', '9780553418026', 6, 6, 2011],
      ['Ender\'s Game', 'Orson Scott Card', 2, 'Military science fiction', 'https://covers.openlibrary.org/b/isbn/9780812550702-L.jpg', '9780812550702', 5, 5, 1985],
      
      // Mystery (3)
      ['Gone Girl', 'Gillian Flynn', 3, 'Psychological thriller', 'https://covers.openlibrary.org/b/isbn/9780307588371-L.jpg', '9780307588371', 5, 5, 2012],
      ['The Girl with the Dragon Tattoo', 'Stieg Larsson', 3, 'Crime thriller', 'https://covers.openlibrary.org/b/isbn/9780307454546-L.jpg', '9780307454546', 6, 6, 2005],
      ['Big Little Lies', 'Liane Moriarty', 3, 'Mystery drama', 'https://covers.openlibrary.org/b/isbn/9780399167065-L.jpg', '9780399167065', 4, 4, 2014],
      ['The Woman in the Window', 'A.J. Finn', 3, 'Psychological suspense', 'https://covers.openlibrary.org/b/isbn/9780062678416-L.jpg', '9780062678416', 5, 5, 2018],
      
      // Romance (4)
      ['Me Before You', 'Jojo Moyes', 4, 'Contemporary romance', 'https://covers.openlibrary.org/b/isbn/9780143124542-L.jpg', '9780143124542', 5, 5, 2012],
      ['The Notebook', 'Nicholas Sparks', 4, 'Love story', 'https://covers.openlibrary.org/b/isbn/9780446605236-L.jpg', '9780446605236', 4, 4, 1996],
      ['Outlander', 'Diana Gabaldon', 4, 'Historical romance', 'https://covers.openlibrary.org/b/isbn/9780440212560-L.jpg', '9780440212560', 6, 6, 1991],
      
      // Biography (5)
      ['Long Walk to Freedom', 'Nelson Mandela', 5, 'Autobiography', 'https://covers.openlibrary.org/b/isbn/9780316548182-L.jpg', '9780316548182', 4, 4, 1994],
      ['The Diary of a Young Girl', 'Anne Frank', 5, 'Holocaust memoir', 'https://covers.openlibrary.org/b/isbn/9780553577129-L.jpg', '9780553577129', 5, 5, 1947],
      ['Einstein: His Life and Universe', 'Walter Isaacson', 5, 'Biography of Einstein', 'https://covers.openlibrary.org/b/isbn/9780743264747-L.jpg', '9780743264747', 4, 4, 2007],
      
      // History (6)
      ['A Short History of Nearly Everything', 'Bill Bryson', 6, 'Science history', 'https://covers.openlibrary.org/b/isbn/9780767908184-L.jpg', '9780767908184', 5, 5, 2003],
      ['Guns, Germs, and Steel', 'Jared Diamond', 6, 'Human history', 'https://covers.openlibrary.org/b/isbn/9780393317558-L.jpg', '9780393317558', 4, 4, 1997],
      ['The Diary of Anne Frank', 'Anne Frank', 6, 'WWII history', 'https://covers.openlibrary.org/b/isbn/9780385473781-L.jpg', '9780385473781', 6, 6, 1947],
      
      // Science (7)
      ['A Brief History of Time', 'Stephen Hawking', 7, 'Cosmology', 'https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg', '9780553380163', 5, 5, 1988],
      ['The Selfish Gene', 'Richard Dawkins', 7, 'Evolution', 'https://covers.openlibrary.org/b/isbn/9780199291151-L.jpg', '9780199291151', 4, 4, 1976],
      ['Cosmos', 'Carl Sagan', 7, 'Astronomy', 'https://covers.openlibrary.org/b/isbn/9780345539434-L.jpg', '9780345539434', 5, 5, 1980],
      
      // Technology (8)
      ['Clean Code', 'Robert C. Martin', 8, 'Software craftsmanship', 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg', '9780132350884', 6, 6, 2008],
      ['The Pragmatic Programmer', 'Andrew Hunt', 8, 'Programming practices', 'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg', '9780135957059', 5, 5, 1999],
      ['Code Complete', 'Steve McConnell', 8, 'Software construction', 'https://covers.openlibrary.org/b/isbn/9780735619678-L.jpg', '9780735619678', 4, 4, 2004],
      
      // Fantasy (10)
      ['The Name of the Wind', 'Patrick Rothfuss', 10, 'Epic fantasy', 'https://covers.openlibrary.org/b/isbn/9780756404079-L.jpg', '9780756404079', 5, 5, 2007],
      ['A Game of Thrones', 'George R.R. Martin', 10, 'Fantasy epic', 'https://covers.openlibrary.org/b/isbn/9780553103540-L.jpg', '9780553103540', 6, 6, 1996],
      ['The Way of Kings', 'Brandon Sanderson', 10, 'Epic fantasy', 'https://covers.openlibrary.org/b/isbn/9780765326355-L.jpg', '9780765326355', 5, 5, 2010],
      ['The Chronicles of Narnia', 'C.S. Lewis', 10, 'Fantasy adventure', 'https://covers.openlibrary.org/b/isbn/9780066238500-L.jpg', '9780066238500', 7, 7, 1950],
    ];

    let addedCount = 0;

    for (const book of moreBooks) {
      await client.query(
        `INSERT INTO books (title, author, category_id, description, cover_url, isbn, total_copies, available_copies, published_year)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        book
      );
      addedCount++;
      console.log(`✓ Added: ${book[0]}`);
    }

    console.log(`\n✅ Migration completed! Added ${addedCount} new books.`);
    console.log(`📚 Total books now in database: ${23 + addedCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

addManyMoreBooks();
