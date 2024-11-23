import connection from '../database/connection';
import Watcher from '../core/Watcher';
import { v4 as uuidv4 } from 'uuid';

const ModelWatcher = Object.create(Watcher);

ModelWatcher.type = 'model';
ModelWatcher.should_display_on_index = true;
ModelWatcher.content = {};

ModelWatcher.addContent = async function(content: any) {
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
    console.error('Error adding content to ModelWatcher', error);
  }
}

ModelWatcher.getIndex = async () => (await connection('observatory_entries').where({ type: 'model' }));

export default ModelWatcher;