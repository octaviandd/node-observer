export async function up(knex) {
  await knex.schema.createTable('telescope_monitoring', (table) => {
    table.string('tag').primary(); // Unique primary key for monitored tags
  });

  await knex.schema.createTable('telescope_entries', function (table) {
    table.bigIncrements('sequence');
    table.uuid('uuid').notNullable().unique();
    table.uuid('batch_id').notNullable();
    table.string('family_hash').notNullable();
    table.boolean('should_display_on_index').defaultTo(true);
    table.string('type', 20).notNullable();
    table.json('content').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('uuid');
    table.index('batch_id');
    table.index('family_hash');
    table.index(['type', 'should_display_on_index']); // For filtering by type and visibility
  });


  await knex.schema.createTable('telescope_entries_tags', function (table) {
    table.uuid('entry_uuid').notNullable();
    table.string('tag').notNullable();

    table.primary(['entry_uuid', 'tag']);
    table.index('tag');

    table.foreign('entry_uuid').references('uuid').inTable('telescope_entries').onDelete('CASCADE');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('telescope_entries');
  await knex.schema.dropTable('telescope_entries_tags');
  await knex.schema.dropTable('telescope_monitoring');
}