import connection from '../database/connection';
import Watcher from '../core/Watcher';
import { v4 as uuidv4 } from 'uuid';

const RequestWatcher = Object.create(Watcher);

RequestWatcher.type = 'request';
RequestWatcher.should_display_on_index = true;
RequestWatcher.content = {};

RequestWatcher.addContent = async function(content: any) {
  const newEntry = {
    uuid: uuidv4(),
    batch_id: uuidv4(),
    family_hash: uuidv4(),
    type: 'request',
    should_display_on_index: true,
    content: JSON.stringify(content),
  };

  try {
    const result = await connection('observatory_entries').insert(newEntry);
    return result;
  } catch (error) {
    console.error('Error adding content to RequestWatcher', error);
  }
}

RequestWatcher.getIndex = async () => (await connection('observatory_entries').where({ type: 'request' }));

export default RequestWatcher;