import Watcher from '../core/Watcher';

class NotificationWatcher extends Watcher {
  type: string;
  content: any[];
  should_display_on_index: boolean;

  constructor() {
    super();
    this.type = 'notification';
    this.content = [];
    this.should_display_on_index = true
  }
}

export default NotificationWatcher;