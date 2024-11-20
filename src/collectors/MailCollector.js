import BaseCollector from '../core/BaseCollector.js';


class MailController extends BaseCollector {
  constructor() {
    this.type = 'mail';
    this.content = [];
  }

  index(req, res){
    // Return index view for CacheCollector
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  }

  addMail(mail) {
    this.mails.push(mail);
  }

  removeMail(mail) {
    this.mails = this.mails.filter(m => m !== mail);
  }
}

export default MailController;