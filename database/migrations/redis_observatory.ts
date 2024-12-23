/** @format */

import { RedisClientType } from "redis";

export async function up(client: RedisClientType): Promise<void> {
  // Ensure the client is connected
  if (!client.isOpen) await client.connect();

  // Create observatory_monitoring set with at least one placeholder value
  await client.sAdd("observatory_monitoring", "placeholder_value");

  // Create observatory_entries hash with at least one field-value pair
  await client.hSet("observatory_entries", "field", "value");

  // Create observatory_entries_tags set with at least one placeholder value
  await client.sAdd("observatory_entries_tags", "placeholder_tag");

  // Disconnect if you are managing connections here
  if (client.isOpen) await client.disconnect();
}

export async function down(client: RedisClientType): Promise<void> {
  // Ensure the client is connected
  if (!client.isOpen) await client.connect();

  // Delete the keys
  await client.del("observatory_entries_tags");
  await client.del("observatory_entries");
  await client.del("observatory_monitoring");

  // Disconnect if you are managing connections here
  if (client.isOpen) await client.disconnect();
}
