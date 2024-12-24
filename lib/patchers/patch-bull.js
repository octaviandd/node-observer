const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const { watchers } = require("../logger");
/**
 * The Bull methods to patch and a helpful name for each.
 * Adjust this list for your use case and Bull version.
 */
const METHODS_TO_PATCH = {
  process: "process",
  add: "add",
  retryJob: "retryJob",
  start: "start",
  pause: "pause",
  resume: "resume",
  processJob: "processJob",
};

/**
 * Hook "bull" so we can patch the prototype of the Queue class.
 */
Hook(["bull"], function (exports, name, basedir) {
  // By default, `exports` is the main function from "bull" used as `new Bull(...)`.
  // That function returns an instance of the Bull Queue class, whose prototype we want to patch.
  // Let's access `exports.prototype` directly:
  const BullQueueProto = exports.prototype;

  Object.entries(METHODS_TO_PATCH).forEach(([methodName, displayName]) => {
    if (typeof BullQueueProto[methodName] === "function") {
      shimmer.wrap(BullQueueProto, methodName, function (originalFn) {
        return function patchedBullMethod(...args) {
          // This queue instance is `this`, if the method is called on the instance.

          // For demonstration: We log the method call with some info
          watchers.jobs.addContent({
            method: displayName,
            queueName: this?.name, // The queue name (Bull v3 sets it on `this.name` or `this.keyPrefix`)
            args,
            time: new Date(),
            package: "bull",
          });

          // Call the original method
          return originalFn.apply(this, args);
        };
      });
      console.log(`[Patch bull] Patched method: ${methodName}`);
    }
  });

  // Return the patched bull module so the rest of your code sees it
  return exports;
});
