const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const { watchers } = require("../logger");

Hook(["nodemailer"], function (exports, name, basedir) {
  // `exports` is the Nodemailer module.
  // Typically, you call `nodemailer.createTransport(...)` to get a transporter.

  // 1. Save the original createTransport function
  const originalCreateTransport = exports.createTransport;

  // 2. Wrap createTransport so that we patch its returned transporter
  shimmer.wrap(exports, "createTransport", function (originalFn) {
    return function patchedCreateTransport(...args) {
      // Call the original createTransport
      const transporter = originalFn.apply(this, args);

      // 3. Patch the transporter’s sendMail method
      if (transporter && typeof transporter.sendMail === "function") {
        shimmer.wrap(transporter, "sendMail", function (originalSendMail) {
          return function patchedSendMail(mailOptions, callback) {
            // Before sending, log the mail options
            watchers.mailer.addContent({
              to: mailOptions.to,
              from: mailOptions.from,
              subject: mailOptions.subject,
              text: mailOptions.text,
              html: mailOptions.html,
              time: new Date(), // add a timestamp if desired
            });

            // Call the original sendMail
            const result = originalSendMail.call(this, mailOptions, callback);

            // result could be a Promise (if no callback is provided), so handle it
            if (result && typeof result.then === "function") {
              // Async usage: we can log the result or error
              result
                .then((info) => {
                  watchers.mailer.addContent({
                    event: "sendMail success",
                    info,
                    time: new Date(),
                  });
                })
                .catch((err) => {
                  watchers.mailer.addContent({
                    event: "sendMail error",
                    error: err,
                    time: new Date(),
                  });
                });
            }

            return result;
          };
        });
      }

      return transporter;
    };
  });

  // Return the patched Nodemailer module so `require("nodemailer")` uses it
  return exports;
});
