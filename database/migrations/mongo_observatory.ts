/** @format */

import { MongoClient } from "mongodb";

export async function up(client: MongoClient): Promise<void> {
  const db = client.db("observatory");

  // Create observatory_monitoring collection
  await db.createCollection("observatory_monitoring");

  // Create observatory_entries collection
  await db.createCollection("observatory_entries", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["uuid", "batch_id", "family_hash", "type", "content"],
        properties: {
          uuid: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          batch_id: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          family_hash: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          should_display_on_index: {
            bsonType: "bool",
            description: "must be a boolean and is required",
          },
          type: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          content: {
            bsonType: "object",
            description: "must be an object and is required",
          },
          created_at: {
            bsonType: "date",
            description: "must be a date and is required",
          },
        },
      },
    },
  });

  // Create observatory_entries_tags collection
  await db.createCollection("observatory_entries_tags");

  await client.close();
}

export async function down(client: MongoClient): Promise<void> {
  const db = client.db("observatory");

  await db.collection("observatory_entries_tags").drop();
  await db.collection("observatory_entries").drop();
  await db.collection("observatory_monitoring").drop();

  await client.close();
}
