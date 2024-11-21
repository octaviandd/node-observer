import WatcherOptions from '../core/Watcher';

class LogWatcher extends WatcherOptions {
  type: string;
  content: any[];
  should_display_on_index: boolean;

  constructor() {
    super();
    this.type = 'log';
    this.content = [];
    this.should_display_on_index = true;
  }
}

export default LogWatcher;