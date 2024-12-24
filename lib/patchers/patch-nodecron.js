const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const {watchers} = require("../logger");

// We will patch these three functions: schedule, validate, getTasks.
const METHODS = ["schedule", "validate", "getTasks"];

Hook(["node-cron"], function (exports, name, basedir) {
  // `exports` is the top-level object of `node-cron`.
  // By default, node-cron exports something like: { schedule, validate, getTasks, ... }.

  // For each method, we wrap it using shimmer.
  METHODS.forEach((method) => {
    // Ensure the method exists before wrapping
    if (typeof exports[method] === "function") {
      shimmer.wrap(exports, method, function (originalFn) {
        return function patchedMethod(...args) {
          // Log or instrument before calling the original method
          watchers.scheduler.addContent({
            type: method,
            package: "node-cron",
            data: args,
            time: new Date(),
          });

          // Call the original function with the original arguments
          return originalFn.apply(this, args);
        };
      });
      console.log(`node-cron '${method}' method patched.`);
    }
  });

  // Return the patched exports
  return exports;
});
