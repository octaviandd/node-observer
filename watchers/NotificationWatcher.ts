import Watcher from '../core/Watcher';

class NotificationWatcher extends Watcher {
  type: string;
  content: any[];

  constructor() {
    super();
    this.type = 'notification';
    this.content = [];
  }
}

export default NotificationWatcher;