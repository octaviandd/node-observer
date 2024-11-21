import Watcher from '../core/Watcher';

class RequestWatcher extends Watcher {
  type: string;
  content: any[];
  should_display_on_index: boolean;

  constructor() {
    super();
    this.type = 'request';
    this.content = [];
    this.should_display_on_index = true;
  }
}

export default RequestWatcher;