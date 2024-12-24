const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const { watchers } = require("../logger");

// If you have a mapping of commands to argument names:
const nodeCacheCommandsArgs = {
  set: ["key", "value", "ttl"],
  get: ["key"],
  del: ["key"],
  has: ["key"],
  // Add other node-cache methods if needed
};

Hook(["node-cache"], function (exports, name, basedir) {
  // `exports` is the NodeCache constructor (class).
  // e.g., const NodeCache = require("node-cache");
  // We will patch the prototype methods so that new NodeCache() instances are patched.

  Object.keys(nodeCacheCommandsArgs).forEach((method) => {
    if (typeof exports.prototype[method] === "function") {
      shimmer.wrap(exports.prototype, method, function (originalFn) {
        return function patchedMethod(...args) {
          // Build a log object
          const logContent = {
            time: new Date(),
            type: method,
            package: "node-cache",
            // capture node-cache options if needed
            stdTTL: this.options.stdTTL,
            deleteOnExpire: this.options.deleteOnExpire,
            checkPeriod: this.options.checkperiod,
            stats: this.stats,
          };

          // Match arguments to their names for logging
          const argMap = nodeCacheCommandsArgs[method];
          argMap.forEach((argName, index) => {
            logContent[argName] = args[index];
          });

          // If it's a method whose result we want, like `get`, intercept the return value
          if (method === "get") {
            const result = originalFn.apply(this, args);
            logContent["result"] = result;
            watchers.cache.addContent(logContent);
            return result;
          } else {
            // For other methods, just log the call (you could also log return values if needed)
            watchers.cache.addContent(logContent);
            return originalFn.apply(this, args);
          }
        };
      });
      console.log(`node-cache '${method}' method patched`);
    }
  });

  // Return the patched NodeCache constructor
  return exports;
});
