import connection from '../database/connection';
import Watcher from '../core/Watcher';
import { v4 as uuidv4 } from 'uuid';

const CacheWatcher = Object.create(Watcher);

CacheWatcher.type = 'cache';
CacheWatcher.should_display_on_index = true;
CacheWatcher.content = {};

CacheWatcher.addContent = async function(content: any) {
  const newEntry = {
    uuid: uuidv4(),
    batch_id: uuidv4(),
    family_hash: uuidv4(),
    type: this.type,
    should_display_on_index: true,
    content: JSON.stringify(content),
  };

  try {
    const result = await connection('observatory_entries').insert(newEntry);
    return result;
  } catch (error) {
    console.error('Error adding content to CacheWatcher', error);
  }
}

CacheWatcher.getIndex = async () => (await connection('observatory_entries').where({ type: 'cache' }));

export default CacheWatcher;