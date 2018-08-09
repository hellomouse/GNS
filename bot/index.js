const request = require('request');
const config = require('./config');

let pendingStatus = []; // contains all pending checks from travis as multiple are sent


module.exports = app => {
  /**
   * @function
   * @param {string} user
   * @return {string} user with normal character
   */
  let antiHighlight = user => {
    return `${user.slice(0, 1)}\u200B${user.slice(1)}`;
  };

  /**
   * @function
   * @param {string} url - Url of the string to shorten
   * @param {function} cb - Function to callback shortened url with
  */
  let shortenUrl = (url, cb) => {
    // Posts to the api to create shorter url
    request.post('https://git.io/create', { form: { url } }, (err, res, body) => {
      if (err) app.error(`Shorten url failed for ${url}`);
      cb(`https://git.io/${body}`); // Callback function with url
    });
  };

  /**
   *
   * @function
   * @param {string} fullname - The full repository name
   * @param {string} event - Event being received from webhook
   * @return {string} Attention string
  */
  let attFormat = (fullname, event) => {
    // [user|org]/[name]
    let [org, name] = fullname.split('/'); // or user

    return config.attentionString.replace('{org}', org).replace('{name}', name || org).replace('{event}', event);
  };

  app.irc = new (require('./irc'))(app);

  // App events

  app.on(['issues.opened', 'issues.closed', 'issues.reopened'], async context => {
      let payload = context.payload,
        att = attFormat(payload.repository.full_name, 'issue'),
        issueNumber = payload.issue.number,
        action = payload.action,
        color = ({ opened: '\x0303', reopened: '\x0307', closed: '\x0304' })[action], // opened: Green, reopened: Orange, closed: Red
        user = antiHighlight(payload.sender.login),
        fullname = payload.repository.full_name;

      shortenUrl(payload.issue.html_url, url => {
        app.irc.privmsg(`${att} \x0F| Issue #${issueNumber} \x0F${color}${action}\x0F by ${user} on ${fullname} - ${url}`);
      });
  });

  app.on(['issue_comment.created', 'issue_comment.edited', 'issue_comment.deleted'], async context => {
    let payload = context.payload,
        att = attFormat(payload.repository.full_name, 'issue.comment'),
        action = payload.action,
        color = ({ created: '\x0303', edited: '\x0307', deleted: '\x0304' })[action], // Created: Green, Edited: Orange, Deleted: Red
        user = antiHighlight(payload.sender.login),
        issueNumber = payload.issue.number,
        issueText = `${payload.issue.title.substring(0, 150)}${payload.issue.title.length > 150 ? '...' : ''}`;

    shortenUrl(payload.comment.html_url, url => {
      app.irc.privmsg(`${att} \x0F| ${user} ${color}${action}\x0F a comment on `
        + `issue #${issueNumber} (${issueText}) - ${url}`);
    });
  });

  app.on('issues.labeled', async context => {
      let payload = context.payload,
        att = attFormat(payload.repository.full_name, 'issue.labeled'),
        user = antiHighlight(payload.sender.login),
        action = payload.action,
        color = '\x02' + ({ labeled: '\x0303', unlabeled: '\x0304' })[action],
        issueNumber = payload.issue.number,
        issueText = `${payload.issue.title.substring(0, 150)}${payload.issue.title.length > 150 ? '...' : ''}`;

      shortenUrl(payload.issue.html_url, url => {
        app.irc.privmsg(`${att} \x0F| ${user} ${action}\x0F `
          + `issue #${issueNumber} with label ${color}${payload.label.name}\x0F (${issueText}) - ${url}`);
      });
  });

  app.on(['issues.assigned', 'issues.unassigned', 'pull_request.assigned', 'pull_request.unassigned'],
      async context => {
    let payload = context.payload,
      att = attFormat(payload.repository.full_name, `${context.event}.${payload.action}`),
      issueNumber = payload.number,
      action = payload.action,
      user = antiHighlight(payload.assignee.login),
      sender = antiHighlight(payload.sender.login),
      fullname = payload.repository.full_name,
      color = action === 'assigned' ? '\x0303' : '\x0304', // Color for assigned message
      event = context.event.replace('_', ' '),
      assignedText;

      if (user === sender) {
        assignedText = `${user} ${color}${action}\x0F themselves `;
        assignedText += action === 'assigned' ? `to` : `from`;
      } else {
        assignedText = `${user} was ${color}${action}\x0F by ${sender} to`;
      }

      shortenUrl(context.event === 'pull_request' ? payload.pull_request.html_url : payload.issue.html_url, url => {
        app.irc.privmsg(`${att} \x0F| ${assignedText} ${event} #${issueNumber} on ${fullname} - ${url}`);
      });
  });

  app.on(['pull_request.opened', 'pull_request.closed', 'pull_request.reopened'], async context => {
      let payload = context.payload,
        att = attFormat(payload.repository.full_name, 'pull_request'),
        issueNumber = payload.pull_request.number,
        action = payload.action,
        user = antiHighlight(payload.sender.login),
        fullname = payload.repository.full_name,
        merge;

      if (action === 'opened' || action === 'reopened') {
          if (payload.pull_request.base.repo.full_name !== payload.pull_request.head.repo.full_name) {
              merge = `(\x0306${payload.pull_request.base.ref}...${payload.pull_request.head.label}\x0F) `;
          } else {
            merge = `(\x0306${payload.pull_request.base.ref}...${payload.pull_request.head.ref}\x0F) `;
          }
      }
      shortenUrl(payload.pull_request.html_url, url => {
        app.irc.privmsg(`${att}\x0F | Pull Request #${issueNumber} ${action} by ${user} on ${fullname} ${merge || ''}`
            + `\x02\x0303+${payload.pull_request.additions} \x0304-${payload.pull_request.deletions}\x0F - ${url}`);
      });
  });

  app.on('pull_request_review', async context => {
      let payload = context.payload,
        att = attFormat(payload.repository.full_name, 'pull_request_review'),
        issueNumber = payload.pull_request.number,
        user = antiHighlight(payload.sender.login),
        fullname = payload.repository.full_name;

        shortenUrl(payload.pull_request.html_url, url => {
          app.irc.privmsg(`${att}\x0F | Pull Request #${issueNumber} ${payload.review.state} by ${user} on ${fullname}`
              + ` - ${url}`);
        });
  });

  app.on('pull_request.review_requested', async context => {
      let payload = context.payload,
        att = attFormat(payload.repository.full_name, 'pull_request_review'),
        issueNumber = payload.pull_request.number,
        user = antiHighlight(payload.sender.login),
        fullname = payload.repository.full_name,
        reviewer = antiHighlight(payload.requested_reviewer.login);

        shortenUrl(payload.pull_request.html_url, url => {
          app.irc.privmsg(`${att}\x0F | ${user} has requested a review from ${reviewer} on Pull Request #${issueNumber}`
              + ` in ${fullname} - ${url}`);
        });
  });

  app.on('status', async context => {
    let payload = context.payload,
        att = attFormat(payload.repository.full_name, 'status'),
        colors = { success: '\x0303', pending: '\x0311', failure: '\x0304', error: '\x02\x0301' }, // Success: Green, Pending: Cyan, Failure: Red, Error: Bold + Black
        { state, description, target_url } = payload,
        webhookUrl = target_url ? target_url.split('?')[0] : '',
        color = colors[state];

    if (payload.state === 'pending') {
      if (pendingStatus.includes(payload.target_url)) return; // We don't want to send multiple pending messages to a channel - Potential spam
      pendingStatus.push(payload.target_url); // We'll use target_url as identifier
    } else if (pendingStatus.includes(payload.target_url)) pendingStatus.pop(payload);


    shortenUrl(payload.commit.html_url, url => {
      app.irc.privmsg(`${att} \x0F| [${color}${state.toUpperCase()}\x0F] | ${description} - ${url} | ${webhookUrl}`);
    });
  });

  app.on('push', async context => {
    let payload = context.payload,
        att = attFormat(payload.repository.full_name, 'push'),
        user = antiHighlight(payload.sender.login),
        numC = payload.commits.length,
        ref = payload.ref.split('/')[2];

    if (!payload.commits.length) return; // We're not interested in branches

    let isM = payload.commits.length === 1 ? 'commit' : 'commits'; // Correct grammar for number of commits

    shortenUrl(payload.compare, url => {
        let pushType = payload.forced ? 'force-pushed' : 'pushed';

      app.irc.privmsg(`${att} \x0F| \x0315${user}\x0F ${pushType} \x02${numC}\x0F ${isM} to \x0306${ref}\x0F: ${url}`);
      let count = 1,
        msg_base = `\x0313${payload.repository.name}\x0F/\x0306${ref}\x0F`;

      for (let c of payload.commits) {
          if (count <= config.multipleCommitsMaxLen) {
              c.message = c.message.split('\n')[0];
              let message = `${c.message.substring(0, 150)}${(c.message.length > 150 ? '...' : '')}`,
                author = c.author.name || '\x02\x0304(No author name)\x0F';

              app.irc.privmsg(`${msg_base} \x0314${c.id.substring(0, 7)}\x0F ${author}: ${message}`);
              count++;
          } else {
              count -= 1;
              isM = payload.commits.length - count === 1 ? 'commit' : 'commits'; // Correct grammar for number of commits remaining
              app.irc.privmsg(`... and ${payload.commits.length - count} more ${isM}.`);
              break;
          }
      }
    });
  });

  app.on('create', async context => {
    let payload = context.payload,
        user = antiHighlight(payload.sender.login),
        ref = payload.ref,
        html_url = payload.repository.html_url;

    if (payload.ref_type === 'tag') return; // We're not handling tags yet
    let att = attFormat(payload.repository.full_name, 'branch-create');

    app.irc.privmsg(`${att} \x0F| ${user} \x0303created\x0F branch ${ref} - ${html_url}`);
  });

  app.on('repository.created', async context => {
      let payload = context.payload,
          user = antiHighlight(payload.sender.login),
          name = payload.repository.full_name,
          html_url = payload.repository.html_url,
          createText = payload.repository.forked ? 'forked' : 'created',
          att = attFormat(payload.repository.owner.login, 'repository-create');

      app.irc.privmsg(`${att} \x0F| ${user} \x0303${createText}\x0F repository ${name} - ${html_url}`);
  });

  app.on('delete', async context => {
    let payload = context.payload,
        user = antiHighlight(payload.sender.login),
        ref = payload.ref,
        html_url = payload.repository.html_url;

    if (payload.ref_type === 'tag') return; // We're not handling tags yet
    let att = attFormat(payload.repository.full_name, 'branch-delete');

    app.irc.privmsg(`${att} \x0F| ${user} \x0304deleted\x0F branch ${ref} - ${html_url}`);
  });
};
