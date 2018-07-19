/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = app => {
  app.irc = new (require('./irc'))(app);

  // App events
  app.on(['issues.opened', 'issues.closed', 'issues.reopened'], async context => {
      let payload = context.payload;
      app.irc.privmsg(`!att-${payload.repository.full_name.replace('/', '-')}-issue | Issue #${payload.issue.number} ${payload.action} by ${payload.sender.login} on ${payload.repository.full_name} - ${payload.issue.html_url}`);
  });

  // Travis
  app.on('status', async context => {
    let payload = context.payload
    app.irc.privmsg(`!att-${payload.repository.full_name.replace('/', '-')}-status / ${payload.state === 'failure' ? '[\x0304FAILURE\x0F]' : '[\x0303SUCCESS\x0F]'} / ${payload.description} - ${payload.commit.html_url}`);
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
