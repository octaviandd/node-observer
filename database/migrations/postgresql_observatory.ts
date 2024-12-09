/** @format */

import { Client } from "pg";

export async function up(client: Client): Promise<void> {
  await client.connect();

  // Create observatory_monitoring table
  await client.query(`
    CREATE TABLE observatory_monitoring (
      tag VARCHAR(255) PRIMARY KEY
    );
  `);

  // Create observatory_entries table
  await client.query(`
    CREATE TABLE observatory_entries (
      sequence BIGSERIAL PRIMARY KEY,
      uuid CHAR(36) NOT NULL UNIQUE,
      batch_id CHAR(36) NOT NULL,
      family_hash VARCHAR(255) NOT NULL,
      should_display_on_index BOOLEAN DEFAULT TRUE,
      type VARCHAR(20) NOT NULL,
      content JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (uuid),
      INDEX (batch_id),
      INDEX (family_hash),
      INDEX (type, should_display_on_index)
    );
  `);

  // Create observatory_entries_tags table
  await client.query(`
    CREATE TABLE observatory_entries_tags (
      entry_uuid CHAR(36) NOT NULL,
      tag VARCHAR(255) NOT NULL,
      PRIMARY KEY (entry_uuid, tag),
      INDEX (tag),
      FOREIGN KEY (entry_uuid) REFERENCES observatory_entries(uuid) ON DELETE CASCADE
    );
  `);

  await client.end();
}

export async function down(client: Client): Promise<void> {
  await client.connect();

  await client.query("DROP TABLE IF EXISTS observatory_entries_tags;");
  await client.query("DROP TABLE IF EXISTS observatory_entries;");
  await client.query("DROP TABLE IF EXISTS observatory_monitoring;");

  await client.end();
}
