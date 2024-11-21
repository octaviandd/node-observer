import connection from '../database/connection';
import Watcher from '../core/Watcher';
import { v4 as uuidv4 } from 'uuid';

const RedisWatcher = Object.create(Watcher);

RedisWatcher.type = 'redis';
RedisWatcher.should_display_on_index = true;
RedisWatcher.content = {};

RedisWatcher.addContent = async function(content: any) {
  const newEntry = {
    uuid: uuidv4(),
    batch_id: uuidv4(),
    family_hash: uuidv4(),
    type: this.type,
    should_display_on_index: true,
    content: JSON.stringify(content),
  };

  try {
    const result = await connection('telescope_entries').insert(newEntry);
    return result;
  } catch (error) {
    console.error('Error adding content to RedisWatcher', error);
  }
}

RedisWatcher.getIndex = async () => (await connection('telescope_entries').where({ type: 'redis' }));

export default RedisWatcher;