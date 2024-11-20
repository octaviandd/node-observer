import BaseCollector from "../core/BaseCollector";

class JobsCollector extends BaseCollector {
  constructor(){
    this.type = 'job';
    this.content = [];
  }

  index(req, res){
    // Return index view for CacheCollector
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  }

  addJob(job){
      this.jobs.push(job);
  }

  removeJob(job){
    this.jobs = this.jobs.filter(j => j !== job);
  }

  getJobs(){
      return this.jobs;
  }
}

export default JobsCollector;