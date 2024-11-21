import connection from '../database/connection';
import Watcher from '../core/Watcher';
import { v4 as uuidv4 } from 'uuid';

const NotificationWatcher = Object.create(Watcher);

NotificationWatcher.type = 'notification';
NotificationWatcher.should_display_on_index = true;
NotificationWatcher.content = {};

NotificationWatcher.addContent = async function(content: any) {
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
    console.error('Error adding content to NotificationWatcher', error);
  }
}

NotificationWatcher.getIndex = async () => (await connection('telescope_entries').where({ type: 'notification' }));

export default NotificationWatcher;