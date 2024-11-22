import connection from '../database/connection';
import Watcher from '../core/Watcher';
import { v4 as uuidv4 } from 'uuid';

const EventsWatcher = Object.create(Watcher);

EventsWatcher.type = 'event';
EventsWatcher.should_display_on_index = true;
EventsWatcher.content = {};

EventsWatcher.addContent = async function(content: any) {
  const newEntry = {
    uuid: uuidv4(),
    batch_id: uuidv4(),
    family_hash: uuidv4(),
    type: this.type,
    should_display_on_index: true,
    content
  };

  try {
    const result = await connection('telescope_entries').insert(newEntry);
    return result;
  } catch (error) {
    console.error('Error adding content to EventsWatcher', error);
  }
}

EventsWatcher.getIndex = async () => (await connection('telescope_entries').where({ type: 'cache' }));

export default EventsWatcher;