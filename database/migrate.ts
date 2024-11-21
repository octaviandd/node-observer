import connection from './connection';
import fs from 'fs/promises';
import path from 'path';

const migrationsDir = path.resolve(process.cwd(), 'src', 'database', 'migrations');

async function runMigration(){
  // Connect to the database
  const files = await fs.readdir(migrationsDir);

  // Create the migrations table if it doesn't exist
  await connection.schema.createTableIfNotExists('migrations', (table) => {
    table.increments('id');
    table.string('name').unique();
    table.timestamp('created_at').defaultTo(connection.fn.now());
  });

  // Get the list of applied migrations
  const appliedMigrations = await connection('migrations').select('name');

  // Run each migration
  for (const file of files){
    if(appliedMigrations.some((row) => row.name === file)){
      console.log('Skipped already applied migration');
      continue;
    }

    const {default: up} = await import(path.resolve(migrationsDir, file));
    await up(connection);

    // Record the migration
    await connection('migrations').insert({name: file});
  }

  // Close the connection
  await connection.destroy();
}

async function rollbackMigration(){
  // Connect to the database
  const files = await fs.readdir(migrationsDir);

  // Get the list of applied migrations
  const appliedMigrations = await connection('migrations').select('name');

  // Run each migration
  for (const file of files){
    if(!appliedMigrations.some((row) => row.name === file)){
      console.log('Skipped migration not applied');
      continue;
    }

    const {default: down} = await import(path.resolve(migrationsDir, file));
    await down(connection);

    // Record the migration
    await connection('migrations').where({name: file}).delete();
  }

  // Close the connection
  await connection.destroy();
}

export { runMigration, rollbackMigration };