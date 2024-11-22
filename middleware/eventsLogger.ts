import EventsWatcher from '../watchers/EventWatcher';
import EventEmitter from 'events';

const eventsCollector = Object.create(EventsWatcher);
const EventEmitterWithObserver = Object.create(EventEmitter);

EventEmitterWithObserver.withObserver = function(event: string, ...args: []) {
  let time = new Date();

  console.log(this.prototype.emit);
  eventsCollector.addContent({event, ...args, time});
  return this.prototype.emit(event, ...args);
}

export { EventEmitterWithObserver };