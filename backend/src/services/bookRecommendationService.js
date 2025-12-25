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
            // Parse CatDate from API response (format: YYMMDD)
            // Pattern: 19-25 = CE year 2019-2025, 62-68 = BE year 2562-2568 (CE 2019-2025)
            let catDate = null;
            if (book.CatDate && book.CatDate.length === 6) {
              const yearShort = parseInt(book.CatDate.substring(0, 2), 10);
              const month = parseInt(book.CatDate.substring(2, 4), 10);
              const day = parseInt(book.CatDate.substring(4, 6), 10);
              
              let yearCE;
              if (yearShort >= 50) {
                // Buddhist Era: 62 = 2562 BE = 2019 CE
                yearCE = 2500 + yearShort - 543;
              } else {
                // Christian Era: 19 = 2019, 24 = 2024, 25 = 2025
                yearCE = 2000 + yearShort;
              }
              
              catDate = new Date(yearCE, month - 1, day);
              if (isNaN(catDate.getTime())) {
                catDate = null;
              }
            }
            
            await client.query(
              `INSERT INTO course_recommended_books 
               (course_id, book_id, title, author, publisher, callnumber, isbn, bookcover, mattype_name, lang, keyword_source, cat_date)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
               ON CONFLICT (course_id, book_id) DO UPDATE SET cat_date = EXCLUDED.cat_date`,
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
                keyword,
                catDate
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
