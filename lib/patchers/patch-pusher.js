const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const { watchers } = require("../logger");

/**
 * Hook the "pusher" module so we can patch the prototype methods (like trigger/triggerBatch).
 */
Hook(["pusher"], function (exports, name, basedir) {
  // The `exports` is the constructor function (or class) returned by require("pusher").
  // We'll patch its prototype to intercept "trigger" and "triggerBatch".

  if (exports && exports.prototype) {
    // Patch pusher.trigger
    if (typeof exports.prototype.trigger === "function") {
      shimmer.wrap(exports.prototype, "trigger", function (originalTrigger) {
        return function patchedTrigger(channel, event, data, options, callback) {
          watchers.notifications.addContent({
            method: "trigger",
            channel,
            event,
            data,
            options,
            timestamp: new Date(),
            package: "pusher",
          });

          return originalTrigger.apply(this, arguments);
        };
      });
      console.log("[Patch pusher] pusher.prototype.trigger patched");
    }

    // Patch pusher.triggerBatch
    if (typeof exports.prototype.triggerBatch === "function") {
      shimmer.wrap(exports.prototype, "triggerBatch", function (originalTriggerBatch) {
        return function patchedTriggerBatch(batch, callback) {
          // "batch" is an array of events, each containing channel, event, data
          watchers.notifications.addContent({
            method: "triggerBatch",
            batch,
            timestamp: new Date(),
            package: "pusher",
          });

          return originalTriggerBatch.apply(this, arguments);
        };
      });
      console.log("[Patch pusher] pusher.prototype.triggerBatch patched");
    }
  } else {
    console.warn("[Patch pusher] Could not locate pusher.prototype to patch.");
  }

  // Return the patched pusher module
  return exports;
});
