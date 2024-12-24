const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const { watchers } = require("../logger");

Hook(["@sendgrid/mail"], function (exports, name, basedir) {
  // `exports` is the module exported by @sendgrid/mail.
  // By default, it has `send`, `sendMultiple`, `setApiKey`, etc.

  // 1. Patch the `send` function
  if (typeof exports.send === "function") {
    shimmer.wrap(exports, "send", function (originalSend) {
      return async function patchedSend(...args) {
        /*
          The `args[0]` is usually the MailDataRequired object, which can be:
            {
              to: string | string[],
              from: string,
              subject: string,
              text: string,
              html: string,
              // etc...
            }
        */
        const mailData = args[0];
        const isMultiple = args[1]; // Boolean or undefined
        const callback = args[2];   // Optional callback

        // Log or instrument the mail data
        watchers.mailer.addContent({
          package: "@sendgrid/mail",
          method: "send",
          to: Array.isArray(mailData) 
              ? mailData.map((email) => email.to) 
              : mailData.to,
          from: Array.isArray(mailData) 
              ? mailData.map((email) => email.from) 
              : mailData.from,
          subject: Array.isArray(mailData) 
              ? mailData.map((email) => email.subject) 
              : mailData.subject,
          time: new Date(),
          isMultiple,
        });

        // Call the original send method
        const result = await originalSend.apply(this, args).catch((err) => {
          watchers.mailer.addContent({
            package: "@sendgrid/mail",
            method: "send",
            error: err,
            time: new Date(),
          });
          throw err;
        });

        // If successful, log the result or part of it if you like
        watchers.mailer.addContent({
          package: "@sendgrid/mail",
          method: "send",
          status: "success",
          time: new Date(),
          // result might include [ClientResponse, {}]
          // Log as needed, or omit for brevity
        });

        return result;
      };
    });
    console.log("[Patch @sendgrid/mail] 'send' method patched.");
  }

  // 2. Patch the `sendMultiple` function (shortcut for multiple emails)
  if (typeof exports.sendMultiple === "function") {
    shimmer.wrap(exports, "sendMultiple", function (originalSendMultiple) {
      return async function patchedSendMultiple(...args) {
        /*
          `args[0]` is typically a MailDataRequired object for multiple recipients
          The signature is basically a convenience that sets isMultiple = true automatically
        */
        const mailData = args[0];
        const callback = args[1]; // Optional callback

        // Log or instrument the mail data
        watchers.mailer.addContent({
          package: "@sendgrid/mail",
          method: "sendMultiple",
          data: mailData,
          time: new Date(),
        });

        // Call the original sendMultiple method
        const result = await originalSendMultiple.apply(this, args).catch((err) => {
          watchers.mailer.addContent({
            package: "@sendgrid/mail",
            method: "sendMultiple",
            error: err,
            time: new Date(),
          });
          throw err;
        });

        watchers.mailer.addContent({
          package: "@sendgrid/mail",
          method: "sendMultiple",
          status: "success",
          time: new Date(),
        });

        return result;
      };
    });
    console.log("[Patch @sendgrid/mail] 'sendMultiple' method patched.");
  }

  // Return the patched module so the require call returns this modified version
  return exports;
});
