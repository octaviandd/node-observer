import Watcher from '../core/Watcher';

class JobWatcher extends Watcher {
  type: string;
  content: any[];

  constructor() {
    super();
    this.type = 'log';
    this.content = [];
  }
}

export default JobWatcher;