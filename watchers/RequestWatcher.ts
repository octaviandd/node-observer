import Watcher from '../core/Watcher';

class RequestWatcher extends Watcher {
  type: string;
  content: any[];

  constructor() {
    super();
    this.type = 'request';
    this.content = [];
  }
}

export default RequestWatcher;