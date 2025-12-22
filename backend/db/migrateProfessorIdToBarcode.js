const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const migrateProfessorIdToBarcode = async () => {
  const client = await pool.connect();

  try {
    console.log('Migrating professor_id columns from INTEGER to VARCHAR for PSRU barcode...\n');

    await client.query('BEGIN');

    console.log('1. Dropping foreign key constraint on professor_courses.professor_id...');
    try {
      await client.query(`
        ALTER TABLE professor_courses 
        DROP CONSTRAINT IF EXISTS professor_courses_professor_id_fkey
      `);
      console.log('✓ Dropped foreign key constraint on professor_courses.professor_id');
    } catch (e) {
      console.log('  (No foreign key constraint to drop)');
    }

    console.log('\n2. Altering professor_courses.professor_id to VARCHAR...');
    await client.query(`
      ALTER TABLE professor_courses 
      ALTER COLUMN professor_id TYPE VARCHAR(50) USING professor_id::VARCHAR
    `);
    console.log('✓ professor_courses.professor_id changed to VARCHAR(50)');

    console.log('\n3. Altering course_files.uploaded_by...');
    try {
      await client.query(`
        ALTER TABLE course_files 
        DROP CONSTRAINT IF EXISTS course_files_uploaded_by_fkey
      `);
      console.log('✓ Dropped foreign key constraint on course_files.uploaded_by');
    } catch (e) {
      console.log('  (No foreign key constraint to drop)');
    }

    await client.query(`
      ALTER TABLE course_files 
      ALTER COLUMN uploaded_by TYPE VARCHAR(50) USING uploaded_by::VARCHAR
    `);
    console.log('✓ course_files.uploaded_by changed to VARCHAR(50)');

    console.log('\n4. Altering course_recommended_books.added_by...');
    try {
      await client.query(`
        ALTER TABLE course_recommended_books 
        DROP CONSTRAINT IF EXISTS course_recommended_books_added_by_fkey
      `);
      console.log('✓ Dropped foreign key constraint on course_recommended_books.added_by');
    } catch (e) {
      console.log('  (No foreign key constraint to drop)');
    }

    await client.query(`
      ALTER TABLE course_recommended_books 
      ALTER COLUMN added_by TYPE VARCHAR(50) USING added_by::VARCHAR
    `);
    console.log('✓ course_recommended_books.added_by changed to VARCHAR(50)');

    console.log('\n5. Checking course_books.added_by...');
    const courseBookExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'course_books'
      )
    `);

    if (courseBookExists.rows[0].exists) {
      try {
        await client.query(`
          ALTER TABLE course_books 
          DROP CONSTRAINT IF EXISTS course_books_added_by_fkey
        `);
        console.log('✓ Dropped foreign key constraint on course_books.added_by');
      } catch (e) {
        console.log('  (No foreign key constraint to drop)');
      }

      await client.query(`
        ALTER TABLE course_books 
        ALTER COLUMN added_by TYPE VARCHAR(50) USING added_by::VARCHAR
      `);
      console.log('✓ course_books.added_by changed to VARCHAR(50)');
    } else {
      console.log('  (course_books table does not exist, skipping)');
    }

    await client.query('COMMIT');

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNote: The professor_id now stores PSRU barcode (e.g., "256800001") instead of database user ID.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
};

migrateProfessorIdToBarcode();
