import connection from '../database/connection';
import Watcher from '../core/Watcher';
import { v4 as uuidv4 } from 'uuid';

const ViewWatcher = Object.create(Watcher);

ViewWatcher.type = 'view';
ViewWatcher.should_display_on_index = true;
ViewWatcher.content = {};

ViewWatcher.addContent = async function(content: any) {
  const newEntry = {
    uuid: uuidv4(),
    batch_id: uuidv4(),
    family_hash: uuidv4(),
    type: 'view',
    should_display_on_index: true,
    content: JSON.stringify(content),
  };

  try {
    const result = await connection('observatory_entries').insert(newEntry);
    return result;
  } catch (error) {
    console.error('Error adding content to ViewWatcher', error);
  }
}

ViewWatcher.getIndex = async () => (await connection('observatory_entries').where({ type: 'view' }));

export default ViewWatcher;