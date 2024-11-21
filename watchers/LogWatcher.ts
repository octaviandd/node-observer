import connection from '../database/connection';
import Watcher from '../core/Watcher';
import { v4 as uuidv4 } from 'uuid';

const LogWatcher = Object.create(Watcher);

LogWatcher.type = 'mail';
LogWatcher.should_display_on_index = true;
LogWatcher.content = {};

LogWatcher.addContent = async function(content: any) {
  const newEntry = {
    uuid: uuidv4(),
    batch_id: uuidv4(),
    family_hash: uuidv4(),
    type: 'log',
    should_display_on_index: true,
    content: JSON.stringify(content),
  };

  try {
    const result = await connection('telescope_entries').insert(newEntry);
    return result;
  } catch (error) {
    console.error('Error adding content to LogWatcher', error);
  }
}

LogWatcher.getIndex = async () => (await connection('telescope_entries').where({ type: 'log' }));

export default LogWatcher;