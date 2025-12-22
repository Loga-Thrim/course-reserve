const pool = require('../config/db');
const { psruAxios, PSRU_ENDPOINTS } = require('../config/psruApi');

const searchLibraryBooks = async (keyword) => {
  try {
    const response = await psruAxios.get(`${PSRU_ENDPOINTS.BOOK_KEYWORD}/${encodeURIComponent(keyword)}`);

    if (response.data?.status === '200' && response.data?.message?.Display) {
      return response.data.message.Display;
    }
    return [];
  } catch (error) {
    console.error(`Error searching for keyword "${keyword}":`, error.message);
    return [];
  }
};

const fetchAndStoreRecommendedBooks = async (courseId, keywords = []) => {
  const client = await pool.connect();
  
  try {
    const validKeywords = keywords.filter(k => k && k.trim().length > 0).map(k => k.trim());

    if (validKeywords.length === 0) {
      return { keywords: [], booksAdded: 0 };
    }

    await client.query('DELETE FROM course_recommended_books WHERE course_id = $1', [courseId]);

    const seenBookIds = new Set();
    let booksAdded = 0;
    const keywordsWithResults = [];

    for (const keyword of validKeywords.slice(0, 15)) {
      const books = await searchLibraryBooks(keyword);
      
      if (books.length > 0) {
        keywordsWithResults.push(keyword);
      }

      for (const book of books) {
        if (!seenBookIds.has(book.Id)) {
          seenBookIds.add(book.Id);
          
          try {
            await client.query(
              `INSERT INTO course_recommended_books 
               (course_id, book_id, title, author, publisher, callnumber, isbn, bookcover, mattype_name, lang, keyword_source)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
               ON CONFLICT (course_id, book_id) DO NOTHING`,
              [
                courseId,
                book.Id,
                book.Title,
                book.Author,
                book.Publisher,
                book.Callnumber,
                book.ISBNISSN,
                book.Bookcover,
                book.MattypeName,
                book.Lang,
                keyword
              ]
            );
            booksAdded++;
          } catch (insertError) {
            if (insertError.code !== '23505') {
              console.error('Error inserting book:', insertError.message);
            }
          }
        }
      }
    }

    return { keywords: validKeywords, keywordsWithResults, booksAdded };

  } catch (error) {
    console.error('Error fetching recommended books:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  fetchAndStoreRecommendedBooks
};
