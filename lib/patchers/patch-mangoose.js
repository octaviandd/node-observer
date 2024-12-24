const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const { watchers } = require("../logger");

/**
 * Example logging function.
 * Replace this with your own logger or instrumentation logic.
 */
function logMongooseQuery(query) {
  // 'this' refers to the Query instance
  const modelName = this.model && this.model.modelName; // E.g. "User", "Product"
  const op = this.op;          // E.g. "find", "update", "remove"
  const conditions = this.getQuery();    // The query filter
  const updates = this._update;          // If it's an update operation
  const options = this.getOptions && this.getOptions(); // Mongoose 6.x+ typically
  watchers.query.addContent({
    package: "mongoose",
    modelName,
    operation: op,
    conditions,
    updates,
    options,
    timestamp: new Date(),
  })

  console.log("[Patch Mongoose] Query execution:", {
    modelName,
    operation: op,
    conditions,
    updates,
    options,
  });
}

/**
 * Hook the "mongoose" module so we can patch Query.prototype.exec.
 */
Hook(["mongoose"], function (exports, name, basedir) {
  if (!exports || !exports.Query || !exports.Query.prototype) {
    console.warn("[Patch Mongoose] Could not find Query prototype.");
    return exports; // Return unmodified if not found
  }

  // Wrap the 'exec' method on Query's prototype
  shimmer.wrap(exports.Query.prototype, "exec", function (originalExec) {
    return function patchedExec(...args) {
      // Log or instrument the query before calling the real exec
      logMongooseQuery.call(this, this);

      // Call the original exec method
      return originalExec.apply(this, args);
    };
  });

  console.log("[Patch Mongoose] Mongoose Query.prototype.exec patched successfully.");
  return exports; // Return the patched mongoose
});
