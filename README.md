-- okay so, how will this thing work?

-- So, there is a index.js file from which everything is accessed. All requests need a route, I need requests for both the views of the dashboard but also some kind of middleware that listens to all the call that are incoming. 

-- What will this BaseCollector/Watcher need to have? Each watcher needs to hold a base variable that holds the log content. 

So, how should I have this built?

I need a base Entry model, you have multiple types of entries (request, commands, schedule, jobs, etc). The difference between them is how they get collected and their content and their type. 

okay, so some basic stuff, 

I need some routes to call these things. 