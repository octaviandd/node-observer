const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const { watchers } = require("../logger");

/**
 * Example mapping of Redis command arguments.
 * Customize it for the commands you want to intercept:
 * e.g. { set: ["key", "value"], get: ["key"], etc. }
 */
const ioRedisCommandsArgs = {
  set: ["key", "value"],
  get: ["key"],
  del: ["key"],
  // ... add other commands as needed
};

/**
 * Hook "ioredis" so we can patch its prototype methods.
 */
Hook(["ioredis"], function (exports, name, basedir) {
  // `exports` is the default class returned by require("ioredis").
  // Typically: class IORedis extends EventEmitter { ... }
  // We want to patch the prototype of that class to intercept commands (e.g., get, set, etc.).

  if (!exports || !exports.prototype) {
    console.warn("[Patch ioredis] Could not locate exports.prototype to patch.");
    return exports;
  }

  // For each command we want to log, wrap the method
  Object.keys(ioRedisCommandsArgs).forEach((command) => {
    if (typeof exports.prototype[command] === "function") {
      shimmer.wrap(exports.prototype, command, function (originalFn) {
        return function patchedCommand(...args) {
          // Build a log object
          const argMap = ioRedisCommandsArgs[command];
          const logContent = {
            time: new Date(),
            type: command,
            package: "ioredis",
            // Attempt to read host/db/etc. from `this.options`, if available
            host: this.options?.host,
            db: this.options?.db,
            family: this.options?.family,
            port: this.options?.port,
          };

          // Map actual arguments to known param names
          argMap.forEach((paramName, index) => {
            logContent[paramName] = args[index];
          });

          // Log or instrument
          watchers.cache.addContent(logContent);

          // Call the original command
          return originalFn.apply(this, args);
        };
      });
      console.log(`[Patch ioredis] Patched command: ${command}`);
    }
  });

  // Return the patched ioredis module
  return exports;
});
