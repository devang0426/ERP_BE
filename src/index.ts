import { eq } from 'drizzle-orm';
// The 'pool' export will only exist for WebSocket and node-postgres drivers
import * as dbClient from './db';
import { departments } from './db/schema';

const db = dbClient.db;
const pool = (dbClient as any).pool;

async function main() {
  try {
    console.log('Performing CRUD operations...');

    // CREATE: Insert a new department
    const [newDepartment] = await db
      .insert(departments)
      .values({ code: 'CS', name: 'Computer Science', description: 'Computing Department' })
      .returning();

    if (!newDepartment) {
      throw new Error('Failed to create department');
    }
    
    console.log('✅ CREATE: New department created:', newDepartment);

    // READ: Select the department
    const foundDepartment = await db.select().from(departments).where(eq(departments.id, newDepartment.id));
    console.log('✅ READ: Found department:', foundDepartment[0]);

    // UPDATE: Change the department's name
    const [updatedDepartment] = await db
      .update(departments)
      .set({ name: 'Computer Science & Engineering' })
      .where(eq(departments.id, newDepartment.id))
      .returning();
    
    if (!updatedDepartment) {
      throw new Error('Failed to update department');
    }
    
    console.log('✅ UPDATE: Department updated:', updatedDepartment);

    // DELETE: Remove the department
    await db.delete(departments).where(eq(departments.id, newDepartment.id));
    console.log('✅ DELETE: Department deleted.');

    console.log('\nCRUD operations completed successfully.');
  } catch (error) {
    console.error('❌ Error performing CRUD operations:', error);
    process.exit(1);
  } finally {
    // If the pool exists, end it to close the connection
    if (pool) {
      await pool.end();
      console.log('Database pool closed.');
    }
  }
}

main();
