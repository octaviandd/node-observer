const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const { watchers } = require("../logger");


Hook(["node-schedule"], function (exports, name, basedir) {
  // The `exports` object is the node-schedule module.
  // By default, it looks like { scheduleJob, cancelJob, rescheduleJob, ... }

  // Helper for logging instrumentation data
  function logAction(name, info, mode) {
    watchers.scheduler.addContent({
      name: name || "",
      info: info || "",
      time: new Date(),
      mode,
      package: "node-schedule",
    });
  }

  // 1. Patch scheduleJob
  shimmer.wrap(exports, "scheduleJob", function (originalScheduleJob) {
    return function patchedScheduleJob(...args) {
      const hasName = args.length > 2;
      const name = hasName ? args[0] : "";
      const info = hasName ? args[1] : args[0];
      const funcIndex = args.findIndex((arg) => typeof arg === "function");
      const originalFn = args[funcIndex];

      logAction(name, info, "set"); // A job is being scheduled

      // Wrap the job callback
      if (typeof originalFn === "function") {
        args[funcIndex] = function patchedJobCallback(...innerArgs) {
          logAction(name, info, "run"); // The job's callback is running
          return originalFn.apply(this, innerArgs);
        };
      }

      console.log("[Patch node-schedule] scheduleJob patched");
      return originalScheduleJob.apply(this, args);
    };
  });

  // 2. Patch cancelJob and rescheduleJob
  ["cancelJob", "rescheduleJob"].forEach((method) => {
    if (typeof exports[method] === "function") {
      shimmer.wrap(exports, method, function (originalMethod) {
        return function patchedMethod(...args) {
          // For cancel, args[0] is the job or job name
          // For reschedule, args[0] is the job or name, args[1] is the new schedule
          logAction(args[0], args[1], method.replace("Job", "").toLowerCase());
          console.log(`[Patch node-schedule] ${method} patched`);
          return originalMethod.apply(this, args);
        };
      });
    }
  });

  // Return the patched module
  return exports;
});
