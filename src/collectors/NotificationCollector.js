import BaseCollector from '../core/BaseCollector.js';


class NotificationCollector extends BaseCollector {
  constructor() {
    this.type = 'notification';
    this.content = [];
  }

  index(req, res){
    // Return index view for CacheCollector
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  }

  addNotification(notification) {
    this.notifications.push(notification);
  }

  getNotifications() {
    return this.notifications;
  }
}

export default NotificationCollector;