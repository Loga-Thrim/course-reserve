const pool = require('../../src/config/db');

async function addBookItemColumns() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration: Add book item columns to course_books table...');
    
    await client.query('BEGIN');

    // Add barcode column
    await client.query(`
      ALTER TABLE course_books 
      ADD COLUMN IF NOT EXISTS barcode VARCHAR(50)
    `);
    console.log('Added barcode column');

    // Add collection_name column
    await client.query(`
      ALTER TABLE course_books 
      ADD COLUMN IF NOT EXISTS collection_name VARCHAR(500)
    `);
    console.log('Added collection_name column');

    // Add item_status column
    await client.query(`
      ALTER TABLE course_books 
      ADD COLUMN IF NOT EXISTS item_status VARCHAR(100)
    `);
    console.log('Added item_status column');

    // Add location column
    await client.query(`
      ALTER TABLE course_books 
      ADD COLUMN IF NOT EXISTS location VARCHAR(100)
    `);
    console.log('Added location column');

    // Add added_by column
    await client.query(`
      ALTER TABLE course_books 
      ADD COLUMN IF NOT EXISTS added_by VARCHAR(100)
    `);
    console.log('Added added_by column');

    // Create index on barcode for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_course_books_barcode ON course_books(barcode)
    `);
    console.log('Created index on barcode');

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
addBookItemColumns()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  });
