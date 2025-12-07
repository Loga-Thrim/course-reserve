const pool = require('../config/db');
const axios = require('axios');
const https = require('https');

const LIBRARY_API_URL = 'https://library.psru.ac.th/portal/lib_api/bookKeyword';
const LIBRARY_API_TOKEN = '12b5381c97af8dfce39652300b81db5e';

// Create axios instance that ignores SSL certificate errors
const libraryApi = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

// Helper function to extract keywords from description
const extractKeywords = (descriptionTh, descriptionEn) => {
  const keywords = [];

  // Thai stopwords - common words that don't help in searching
  const thaiStopwords = ['และ', 'หรือ', 'ที่', 'ใน', 'ของ', 'เพื่อ', 'ให้', 'ได้', 'จะ', 'กับ', 'มี', 'เป็น', 'โดย', 'จาก', 'ไป', 'มา', 'นี้', 'นั้น', 'ซึ่ง', 'แต่', 'ก็', 'ว่า', 'อย่าง', 'ถ้า', 'เมื่อ', 'แล้ว', 'ยัง', 'คือ', 'รวม', 'ทั้ง', 'เช่น', 'ต่าง', 'ๆ', 'ด้วย', 'เข้าใจ', 'ความ', 'การ', 'ทำ', 'ใช้', 'เรียน', 'รู้', 'ศึกษา'];

  const englishStopwords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'this', 'that', 'these', 'those', 'it', 'its', 'such', 'so', 'than', 'too', 'very', 'just', 'also', 'only', 'own', 'same', 'into', 'over', 'after', 'before', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'any', 'no', 'not', 'about', 'which', 'who', 'whom', 'what', 'their', 'them', 'they', 'your', 'you', 'our', 'we', 'he', 'she', 'him', 'her', 'his', 'my', 'me', 'i', 'using', 'use', 'understand', 'understanding', 'course', 'student', 'students', 'learn', 'learning', 'study', 'knowledge', 'skills', 'ability', 'program', 'covers', 'various', 'areas', 'aims', 'equip', 'effectively', 'apply', 'prepare', 'web', 'development'];

  // 1. Extract English terms from Thai description (mixed language like React.js, Laravel)
  if (descriptionTh) {
    const englishInThai = descriptionTh.match(/[A-Za-z][A-Za-z0-9.]*[A-Za-z0-9]/g) || [];
    const filteredEnglish = englishInThai.filter(word => {
      const lower = word.toLowerCase();
      return word.length >= 2 && !englishStopwords.includes(lower);
    });
    keywords.push(...filteredEnglish);

    // 2. Extract Thai text segments (split by English words, commas, spaces)
    const thaiSegments = descriptionTh
      .split(/[A-Za-z0-9.,\s]+/)
      .filter(seg => seg.length >= 4);
    
    // For each segment, try to extract meaningful keywords
    thaiSegments.forEach(segment => {
      // Remove stopwords from beginning and end
      let cleaned = segment;
      thaiStopwords.forEach(sw => {
        cleaned = cleaned.replace(new RegExp(`^${sw}`, 'g'), '');
        cleaned = cleaned.replace(new RegExp(`${sw}$`, 'g'), '');
      });
      if (cleaned.length >= 4) {
        keywords.push(cleaned);
      }
    });
  }

  // 3. Extract English words from English description
  if (descriptionEn) {
    const englishTerms = descriptionEn
      .split(/[\s,]+/)
      .map(w => w.replace(/[^\w.]/g, ''))
      .filter(word => {
        const lower = word.toLowerCase();
        return word.length >= 3 && !englishStopwords.includes(lower);
      });
    keywords.push(...englishTerms);
  }

  // Remove duplicates (case-insensitive for English) and empty strings
  const seen = new Set();
  const uniqueKeywords = keywords.filter(kw => {
    if (!kw || kw.length < 2) return false;
    const key = /^[a-zA-Z]/.test(kw) ? kw.toLowerCase() : kw;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log('Extracted keywords:', uniqueKeywords);
  return uniqueKeywords;
};

// Search books from library API
const searchLibraryBooks = async (keyword) => {
  try {
    const response = await libraryApi.get(`${LIBRARY_API_URL}/${encodeURIComponent(keyword)}`, {
      headers: {
        'token': LIBRARY_API_TOKEN
      },
      timeout: 10000
    });

    if (response.data?.status === '200' && response.data?.message?.Display) {
      return response.data.message.Display;
    }
    return [];
  } catch (error) {
    console.error(`Error searching for keyword "${keyword}":`, error.message);
    return [];
  }
};

// Fetch and store recommended books for a course
const fetchAndStoreRecommendedBooks = async (courseId, descriptionTh, descriptionEn) => {
  const client = await pool.connect();
  
  try {
    console.log(`Fetching recommended books for course ${courseId}...`);
    
    // Extract keywords
    const keywords = extractKeywords(descriptionTh, descriptionEn);
    console.log('All extracted keywords:', keywords);

    if (keywords.length === 0) {
      console.log('No keywords found, skipping book fetch');
      return { keywords: [], booksAdded: 0 };
    }

    // Delete existing recommended books for this course (to refresh)
    await client.query('DELETE FROM course_recommended_books WHERE course_id = $1', [courseId]);

    // Search and store books - search up to 15 keywords to get more results
    const seenBookIds = new Set();
    let booksAdded = 0;
    const keywordsWithResults = [];

    for (const keyword of keywords.slice(0, 15)) {
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
    return { keywords, keywordsWithResults, booksAdded };

  } catch (error) {
    console.error('Error fetching recommended books:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  fetchAndStoreRecommendedBooks,
  extractKeywords
};
