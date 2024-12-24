const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const {watchers} = require("../logger");

// The Agenda methods we want to intercept
const METHODS_TO_PATCH = [
  "schedule",
  "cancel",
  "create",
  "purge",
  "scheduleJob",
  "now",
  "saveJob",
];

/**
 * Hook into "agenda" so that when `require("agenda")` is called,
 * we can patch its prototype methods.
 */
Hook(["agenda"], function (exports, name, basedir) {
  // Agenda typically exports a class, so let's access its prototype
  if (exports && exports.prototype) {
    const AgendaProto = exports.prototype;

    METHODS_TO_PATCH.forEach((method) => {
      if (typeof AgendaProto[method] === "function") {
        shimmer.wrap(AgendaProto, method, function (originalFn) {
          return function patchedAgendaMethod(...args) {
            // For some Agenda methods, the first argument might be a job or job name.
            // You can parse `args` as needed for logging or instrumentation.
            const jobOrData = args[0];

            watchers.logging.addContent({
              methodName: method,
              package: "agenda",
              timestamp: new Date(),
              // If jobOrData looks like a job instance with .attrs.name, etc., handle that:
              jobName:
                jobOrData && jobOrData.attrs ? jobOrData.attrs.name : undefined,
              arguments: args,
            });

            // Call the original Agenda method
            return originalFn.apply(this, args);
          };
        });
        console.log(`[Patch Agenda] Method "${method}" patched.`);
      }
    });
  } else {
    console.warn("[Patch Agenda] exports.prototype not found.");
  }

  // Return the patched module
  return exports;
});
