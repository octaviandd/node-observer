import Watcher from '../core/Watcher';

class ScheduleWatcher extends Watcher {
  type: string;
  content: any[];
  should_display_on_index: boolean;

  constructor() {
    super();
    this.type = 'schedule';
    this.content = [];
    this.should_display_on_index = true
  }
}

export default ScheduleWatcher;