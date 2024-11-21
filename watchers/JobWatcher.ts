import knex from 'knex';
import Watcher from '../core/Watcher';
import { v4 as uuidv4 } from 'uuid';

const JobWatcher = Object.create(Watcher);

JobWatcher.type = 'mail';
JobWatcher.should_display_on_index = true;
JobWatcher.content = {};

JobWatcher.addContent = async function(content: any) {
  const newEntry = {
    uuid: uuidv4(),
    batch_id: uuidv4(),
    family_hash: uuidv4(),
    type: this.type,
    should_display_on_index: true,
    content: JSON.stringify(content),
  };

  try {
    const result = await knex('telescope_entries').insert(newEntry);
    return result;
  } catch (error) {
    console.error('Error adding content to JobWatcher', error);
  }
}

JobWatcher.getIndex = async () => (await knex('telescope_entries').where({ type: 'job' }));

export default JobWatcher;