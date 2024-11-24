import connection from '../database/connection';
import Watcher from '../core/Watcher';
import { v4 as uuidv4 } from 'uuid';

const EventWatcher = Object.create(Watcher);

EventWatcher.type = 'event';
EventWatcher.should_display_on_index = true;
EventWatcher.content = {};

EventWatcher.addContent = async function(content: any) {
  const newEntry = {
    uuid: uuidv4(),
    batch_id: uuidv4(),
    family_hash: uuidv4(),
    type: this.type,
    should_display_on_index: true,
    content
  };

  try {
    const result = await connection('observatory_entries').insert(newEntry);
    return result;
  } catch (error) {
    console.error('Error adding content to EventWatcher', error);
  }
}

EventWatcher.getIndex = async () => (await connection('observatory_entries').where({ type: 'event' }));

export default EventWatcher;