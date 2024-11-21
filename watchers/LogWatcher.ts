import WatcherOptions from '../core/Watcher';

class LogWatcher extends WatcherOptions {
  type: string;
  content: any[];

  constructor() {
    super();
    this.type = 'log';
    this.content = [];
  }
}

export default LogWatcher;