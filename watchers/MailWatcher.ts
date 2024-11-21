import Watcher from '../core/Watcher';

class MailWatcher extends Watcher {
  type: string;
  content: any[];
  should_display_on_index: boolean;

  constructor() {
    super();
    this.type = 'mail';
    this.content = [];
    this.should_display_on_index = true;
  }
}

export default MailWatcher;