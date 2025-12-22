const pool = require('../config/db');
const { psruAxios, PSRU_ENDPOINTS } = require('../config/psruApi');

// Search books from library API
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

// Fetch and store recommended books for a course using keywords array
const fetchAndStoreRecommendedBooks = async (courseId, keywords = []) => {
  const client = await pool.connect();
  
  try {
    console.log(`Fetching recommended books for course ${courseId}...`);
    
    // Filter out empty keywords
    const validKeywords = keywords.filter(k => k && k.trim().length > 0).map(k => k.trim());
    console.log('Keywords to search:', validKeywords);

    if (validKeywords.length === 0) {
      console.log('No keywords found, skipping book fetch');
      return { keywords: [], booksAdded: 0 };
    }

    // Delete existing recommended books for this course (to refresh)
    await client.query('DELETE FROM course_recommended_books WHERE course_id = $1', [courseId]);

    // Search and store books - search up to 15 keywords to get more results
    const seenBookIds = new Set();
    let booksAdded = 0;
    const keywordsWithResults = [];

    for (const keyword of validKeywords.slice(0, 15)) {
      const books = await searchLibraryBooks(keyword);
      console.log(`Keyword "${keyword}" returned ${books.length} books`);
      
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
            // Ignore duplicate errors
            if (insertError.code !== '23505') {
              console.error('Error inserting book:', insertError.message);
            }
          }
        }
      }
    }

    console.log(`Total books added for course ${courseId}: ${booksAdded}`);
    console.log(`Keywords with results: ${keywordsWithResults.join(', ')}`);
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
