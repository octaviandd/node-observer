const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const {watchers} = require("../logger");

/**
 * Example mapping of Redis commands to their argument names.
 */
const redisCommandArgs = {
  set: ["key", "value"],
  get: ["key"],
  del: ["key"],
  // Add other commands you want to log (e.g. lpush, rpush, hset, etc.)
};

/**
 * Example logger instance for demonstration.
 * Replace or expand this as needed.
 */
const loggerInstance = {
  addContent(log) {
    console.log("[Patch redis]", log);
  },
};

/**
 * Hook the "redis" module to intercept the creation of the client
 * and patch its prototype methods (e.g., get, set, del).
 */
Hook(["redis"], function (exports, name, basedir) {
  // For node-redis v4, the main export is a 'createClient' function, etc.
  // Once you create a client, it has methods like .get, .set, etc.
  // We'll patch the prototype of the 'RedisClient' or 'BaseClient' if available.
  // Because node-redis v4 is quite different from older versions, adapt as needed.

  // We can attempt to patch the prototype after a client is created,
  // or we can patch the client's class if we can locate it in 'exports'.

  // 1) Patch createClient so we can intercept the returned client
  if (typeof exports.createClient === "function") {
    shimmer.wrap(exports, "createClient", function (originalCreate) {
      return function patchedCreateClient(...args) {
        const client = originalCreate.apply(this, args);

        // Patch once the client is connected (v4 often uses async connect())
        // We can do it immediately if we like, or upon "ready" event.
        patchRedisClient(client);

        return client;
      };
    });
    console.log("[Patch redis] createClient patched.");
  } else {
    console.warn("[Patch redis] Could not patch createClient (not found).");
  }

  // Return the patched module
  return exports;
});

/**
 * Patch the methods on a given Redis client instance to log commands.
 */
function patchRedisClient(client) {
  // We iterate over the commands we want to patch
  Object.keys(redisCommandArgs).forEach((command) => {
    if (typeof client[command] === "function") {
      shimmer.wrap(client, command, function (originalFn) {
        // node-redis v4 can return a Promise for commands if no callback is passed in
        return async function patchedCommand(...args) {
          // Build a log object
          const argNames = redisCommandArgs[command];
          const logContent = {
            time: new Date(),
            type: command,
            package: "node-redis",
          };

          // Map arguments to known param names
          argNames.forEach((argName, index) => {
            logContent[argName] = args[index];
          });

          // If it's a GET command, we want to capture the result
          if (command === "get") {
            try {
              const result = await originalFn.apply(this, args);
              logContent["result"] = result;
              watchers.cache.addContent(logContent);
              return result;
            } catch (error) {
              logContent["error"] = error;
              watchers.cache.addContent(logContent);
              throw error;
            }
          } else {
            // For other commands, just log the call (and optionally capture the result if you want)
            try {
              const result = await originalFn.apply(this, args);
              watchers.cache.addContent(logContent);
              return result;
            } catch (error) {
              logContent["error"] = error;
              watchers.cache.addContent(logContent);
              throw error;
            }
          }
        };
      });
      console.log(`[Patch redis] Patched command: ${command}`);
    }
  });
}
