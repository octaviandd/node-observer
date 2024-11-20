import BaseCollector from '../core/BaseCollector.js';


class QueryCollector extends BaseCollector {
  constructor(){
    this.type = "query";
    this.content = [];
  }

  index(req, res){
    // Return index view for CacheCollector
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  }

  logQuery(query){
    const log = {
      query: query,
      parameters,
      executionTime,
      timestamp: new Date(),
    }
    this.logs.push(log);
  }

  getLogs(){
    return this.logs;
  }

  getSlowQueries(){
    return this.logs.filter(log => log.executionTime > 1000);
  }

  getQuickQueries(){
    return this.logs.filter(log => log.executionTime < 1000);
  }

  getQueryCount(){
    return this.logs.length;
  }

  getQueryCountByType(type){
    return this.logs.filter(log => log.query.includes(type)).length;
  }

  getQueryWithSearchTerm(searchTerm){
    return this.logs.filter(log => log.query.includes(searchTerm));
  }
}

export default QueryCollector;