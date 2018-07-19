/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = app => {
  app.irc = new (require('./irc'))(app);

  app.on('issues.opened', async context => {
      const payload = context.payload;

    app.irc.privmsg(`Issue ${payload.issue.number} opened by ${payload.user.login} on ${payload.repository.full_name}`);
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
