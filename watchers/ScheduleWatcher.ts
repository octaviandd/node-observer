import Watcher from '../core/Watcher';

class ScheduleWatcher extends Watcher {
  type: string;
  content: any[];

  constructor() {
    super();
    this.type = 'schedule';
    this.content = [];
  }
}

export default ScheduleWatcher;