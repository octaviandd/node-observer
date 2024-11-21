import Watcher from '../core/Watcher';

class MailWatcher extends Watcher {
  type: string;
  content: any[];

  constructor() {
    super();
    this.type = 'mail';
    this.content = [];
  }
}

export default MailWatcher;