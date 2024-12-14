/** @format */

import * as mysql from "mysql2/promise";

export async function up(connection: mysql.Connection): Promise<void> {
  // Create observatory_monitoring table
  await connection.execute(`
    CREATE TABLE observatory_monitoring (
      tag VARCHAR(255) PRIMARY KEY
    );
  `);

  // Create observatory_entries table
  await connection.execute(`
    CREATE TABLE observatory_entries (
      sequence BIGINT AUTO_INCREMENT PRIMARY KEY,
      uuid CHAR(36) NOT NULL UNIQUE,
      batch_id CHAR(36) NOT NULL,
      family_hash VARCHAR(255) NOT NULL,
      should_display_on_index BOOLEAN DEFAULT TRUE,
      type VARCHAR(20) NOT NULL,
      content JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_uuid (uuid),
      INDEX idx_batch_id (batch_id),
      INDEX idx_family_hash (family_hash),
      INDEX idx_type_display (type, should_display_on_index)
    );
  `);

  // Create observatory_entries_tags table
  await connection.execute(`
    CREATE TABLE observatory_entries_tags (
      entry_uuid CHAR(36) NOT NULL,
      tag VARCHAR(255) NOT NULL,
      PRIMARY KEY (entry_uuid, tag),
      INDEX idx_tag (tag),
      FOREIGN KEY (entry_uuid) REFERENCES observatory_entries(uuid) ON DELETE CASCADE
    );
  `);
}

export async function down(connection: mysql.Connection): Promise<void> {
  await connection.execute("DROP TABLE IF EXISTS observatory_entries_tags;");
  await connection.execute("DROP TABLE IF EXISTS observatory_entries;");
  await connection.execute("DROP TABLE IF EXISTS observatory_monitoring;");
}
