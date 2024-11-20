import BaseCollector from '../core/BaseCollector.js';


class ScheduleController extends BaseCollector {
  constructor(){
    this.content = [];
    this.type = 'schedule';
  }

  index(req, res){
    // Return index view for CacheCollector
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  }

  addSchedule(schedule){
    this.schedules.push(schedule);
  }

  removeSchedule(schedule){
    this.schedules = this.schedules.filter(s => s !== schedule);
  }
}

export default ScheduleController;