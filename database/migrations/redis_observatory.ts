/** @format */

import { RedisClientType } from "redis";

export async function up(client: RedisClientType): Promise<void> {
  await client.connect();

  // Create observatory_monitoring set
  await client.sAdd("observatory_monitoring", []);

  // Create observatory_entries hash
  await client.hSet("observatory_entries", {});

  // Create observatory_entries_tags set
  await client.sAdd("observatory_entries_tags", []);

  await client.disconnect();
}

export async function down(client: RedisClientType): Promise<void> {
  await client.connect();

  await client.del("observatory_entries_tags");
  await client.del("observatory_entries");
  await client.del("observatory_monitoring");

  await client.disconnect();
}
