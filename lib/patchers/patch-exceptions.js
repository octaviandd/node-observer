const {watchers} = require("../logger");

/**
 *  Monkey patch for uncaught exceptions to record errors
 * @param loggerInstance
 * @returns @void
 */
export function uncaughtPatcher() {
  process.on("uncaughtException", (error) => {
    watchers.errors.addContent({
      type: "uncaughtException",
      error,
      time: new Date(),
    });
  });
}

/**
 *  Monkey patch for unhandled rejections to record errors
 * @param loggerInstance
 * @returnS @void
 */
export function unhandledRejectionPatcher() {
  process.on("unhandledRejection", (error) => {
    watchers.errors.addContent({
      type: "unhandledRejection",
      error,
      time: new Date(),
    });
  });
}
