const pool = require('../../src/config/db');

async function dropCourseBookUniqueConstraint() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration: Drop unique constraint on course_books...');
    
    await client.query('BEGIN');

    // Drop the unique constraint on (course_id, book_id)
    await client.query(`
      ALTER TABLE course_books 
      DROP CONSTRAINT IF EXISTS course_books_course_id_book_id_key
    `);
    console.log('Dropped unique constraint course_books_course_id_book_id_key');

    // Add a new unique constraint on (course_id, barcode) instead
    // First, update existing rows that have NULL barcode to use book_id as barcode
    await client.query(`
      UPDATE course_books 
      SET barcode = book_id::text 
      WHERE barcode IS NULL
    `);
    console.log('Updated NULL barcodes with book_id');

    // Create unique constraint on (course_id, barcode)
    await client.query(`
      ALTER TABLE course_books 
      ADD CONSTRAINT course_books_course_id_barcode_key UNIQUE (course_id, barcode)
    `);
    console.log('Added unique constraint on (course_id, barcode)');

    await client.query('COMMIT');
    console.log('Migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration
dropCourseBookUniqueConstraint()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  });
