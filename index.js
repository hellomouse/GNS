const request = require('request')
const config = require('./config')

let pendingStatus = []; // contains all pending checks from travis as multiple are sent


module.exports = app => {

  // Shortens long GH urls using git.io
  let shortenUrl = (url, cb) => {
    // Posts to the api to create shorter url
    request.post('https://git.io/create', {form:{url}}, (err, res, body) => {
      if (err) app.error(`Shorten url failed for ${url}`);
      cb(`git.io/${body}`);
    });
  }

  // Format Repo Name into attention string
  let attFormat = (fullname, event) => {
    // [user|org]/[name]
    let org = fullname.split('/')[0] // or user
    let name = fullname.split('/')[1]
    return config.attentionString.replace('{org}', org).replace('{name}', name).replace('{event}', event)
  }

  app.irc = new (require('./irc'))(app);

  // App events
  app.on(['issues.opened', 'issues.closed', 'issues.reopened'], async context => {
      let payload = context.payload, att = attFormat(payload.repository.full_name, 'issue');

      shortenUrl(payload.issue.html_url, url => {
        app.irc.privmsg(`${att} \x0F| Issue #${payload.issue.number} ${payload.action} by ${payload.sender.login} on ${payload.repository.full_name} - ${url}`);
      });
  });

  app.on(['issue_comment.created', 'issue_comment.edited', 'issue_comment.deleted'], async context => {
    let payload = context.payload, att = attFormat(payload.repository.full_name, 'issue.comment');
    let colors = { created: '\x0303', edited: '\x0307', deleted: '\x0304' }; // Created: Green, Edited: Orange, Deleted: Red

    shortenUrl(payload.comment.html_url, url => {
      app.irc.privmsg(`${att} \x0F| ${payload.sender.login} ${colors[payload.action]}${payload.action}\x0F a comment - ${url}`);
      if (payload.comment.body) app.irc.privmsg(`${colors[payload.action]}${payload.comment.body}`)
    });
  });

  // Travis
  app.on('status', async context => {
    let payload = context.payload;

    shortenUrl(payload.issue.html_url, url => {
      app.irc.privmsg(`!att-${payload.repository.full_name.replace('/', '-')}-status / ${payload.state === 'failure' ? '[\x0304FAILURE\x0F]' : '[\x0303SUCCESS\x0F]'} / ${payload.description} - ${payload.commit.html_url}`);
    });
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
