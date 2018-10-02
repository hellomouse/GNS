const request = require('request-promise-native');
const labels = require('./labels');
const IRC = require('./irc');
const web = require('./web');
const { Application } = require('probot'); // eslint-disable-line no-unused-vars
const PouchDB = require('pouchdb');
const db = new PouchDB('http://91.92.144.105:5984/gns');

let pendingStatus = []; // contains all pending checks from travis as multiple are sent

/**
 * @return {Boolean}
 */
Array.prototype.empty = function empty() { // eslint-disable-line no-extend-native
  return this.length === 0;
};

/**
 * @param  {string} s The commit hash string
 * @return {string}   Returns formatted commit hash string
 */
function fmt_url(s) {
  return `\x0302\x1F${s}\x0F`;
}

/**
 * @param  {string} s The commit hash string
 * @return {string}   Returns formatted commit hash string
 */
function fmt_repo(s) {
  return `\x0313${s}\x0F`;
}

/**
 * @param  {string} s The author name string
 * @return {string}   Returns formatted author name string
 */
function fmt_name(s) {
  return `\x0315${s}\x0F`;
}

/**
 * @param  {string} s The branch name string
 * @return {string}   Returns formatted branch name string
 */
function fmt_branch(s) {
  return `\x0306${s}\x0F`;
}

/**
 * @param  {string} s The tag name string
 * @return {string}   Returns formatted tag name string
 */
function fmt_tag(s) {
  return `\x0306${s}\x0F`;
}

/**
 * @param  {string} s The commit hash string
 * @return {string}   Returns formatted commit hash string
 */
function fmt_hash(s) {
  return `\x0314${s}\x0F`;
}

/**
 * Main application function, ran by Probot
 * @param {Application} app
*/
module.exports = async app => {
  /**
   * @function
   * @async
   * @param {string} user
   * @return {string} user with normal character
   */
  async function antiHighlight(user) {
    return `${user.slice(0, 1)}\u200B${user.slice(1)}`;
  }

  /**
   * @function
   * @async
   * @param {string} url - Url of the string to shorten
   * @return {Promise<string>}
  */
  async function shortenUrl(url) {
    // Posts to the api to create shorter url
    try {
      const req = await request.post({ uri: 'https://git.io/create', form: { url } });

      return `https://git.io/${req}`;
    } catch (e) {
      app.error(`Shorten url failed for ${url}: ${e.message}`);
    }
  }

  /**
   * @function
   * @async
   * @param {string} fullname - The full repository name
   * @param {string} event - Name of the event being received from webhook
   * @return {string} Attention string
  */
  async function attFormat(fullname, event) {
    // [user|org]/[name]
    let [org, name] = fullname.split('/'); // or user
    const config = await db.get(org);

    return config.attentionString.replace('{org}', org).replace('{name}', name || org).replace('{event}', event);
  }

  app.irc = {};
  for await (let { rows: { id: i } } of await db.allDocs()) {
    app.irc[i] = new IRC(app, i);
    await app.irc[i].init();
  }
  web(app);

  // App events

  app.on(['issues.opened', 'issues.closed', 'issues.reopened'], async context => {
    let payload = context.payload,
      att = await attFormat(payload.repository.full_name, 'issue'),
      issueNumber = payload.issue.number,
      action = payload.action,
      color = ({ opened: '\x0303', reopened: '\x0307', closed: '\x0304' })[action], // opened: Green, reopened: Orange, closed: Red
      user = fmt_name(await antiHighlight(payload.sender.login)),
      fullname = payload.repository.full_name,
      org = payload.repository.owner.login,
      url = fmt_url(await shortenUrl(payload.issue.html_url));

    app.irc[org].privmsg(`${att} | Issue #${issueNumber} ${color}${action}\x0F by ${user} on ${fullname} - ${url}`);
  });

  app.on(['issue_comment.created', 'issue_comment.edited', 'issue_comment.deleted'], async context => {
    let payload = context.payload,
      att = await attFormat(payload.repository.full_name, 'issue.comment'),
      action = payload.action,
      color = ({ created: '\x0303', edited: '\x0307', deleted: '\x0304' })[action], // Created: Green, Edited: Orange, Deleted: Red
      user = fmt_name(await antiHighlight(payload.sender.login)),
      issueNumber = payload.issue.number,
      issueText = `${payload.issue.title.substring(0, 150)}${payload.issue.title.length > 150 ? '...' : ''}`,
      org = payload.repository.owner.login,
      url = fmt_url(await shortenUrl(payload.comment.html_url));

    app.irc[org].privmsg(`${att} | ${user} ${color}${action}\x0F a comment on `
          + `issue #${issueNumber} (${issueText}) - ${url}`);
  });

  app.on('issues.labeled', async context => {
    let payload = context.payload,
      att = await attFormat(payload.repository.full_name, 'issue.labeled'),
      user = fmt_name(await antiHighlight(payload.sender.login)),
      action = payload.action,
      color = `\x02${({ labeled: '\x0303', unlabeled: '\x0304' })[action]}`,
      issueNumber = payload.issue.number,
      issueText = `${payload.issue.title.substring(0, 150)}${payload.issue.title.length > 150 ? '...' : ''}`,
      org = payload.repository.owner.login,
      url = fmt_url(await shortenUrl(payload.issue.html_url));
    let label = labels[payload.label.name] || payload.label.name;

    app.irc[org].privmsg(`${att} \x0F| ${user} ${color}${action}\x0F `
          + `issue #${issueNumber} with ${label}\x0F (${issueText}) - ${url}`);
  });

  app.on(['issues.assigned', 'issues.unassigned', 'pull_request.assigned', 'pull_request.unassigned'],
      async context => {
        let payload = context.payload,
          att = await attFormat(payload.repository.full_name, `${context.event}.${payload.action}`),
          issueNumber = payload.number || payload.issue.number,
          action = payload.action,
          user = fmt_name(await antiHighlight(payload.assignee.login)),
          sender = fmt_name(await antiHighlight(payload.sender.login)),
          fullname = payload.repository.full_name,
          color = action === 'assigned' ? '\x0303' : '\x0304', // Color for assigned message
          event = context.event.replace('_', ' '),
          assignedText,
          org = payload.repository.owner.login;

        if (user === sender) {
          assignedText = `${user} ${color}${action}\x0F themselves `;
          assignedText += action === 'assigned' ? `to` : `from`;
        } else {
          assignedText = `${user} was ${color}${action}\x0F by ${sender} to`;
        }
        let html_url = context.event === 'pull_request' ? payload.pull_request.html_url : payload.issue.html_url,
          url = fmt_url(await shortenUrl(html_url));

        app.irc[org].privmsg(`${att} | ${assignedText} ${event} #${issueNumber} on ${fullname} - ${url}`);
      });

  app.on(['pull_request.opened', 'pull_request.closed', 'pull_request.reopened'], async context => {
    let payload = context.payload,
      att = await attFormat(payload.repository.full_name, 'pull_request'),
      issueNumber = payload.pull_request.number,
      action = payload.action === 'closed' && payload.pull_request.merged ? 'merged' : payload.action,
      user = fmt_name(await antiHighlight(payload.sender.login)),
      fullname = payload.repository.full_name,
      merge = '',
      org = payload.repository.owner.login,
      url = await shortenUrl(payload.pull_request.html_url);

    if (action === 'opened' || action === 'reopened') {
      if (payload.pull_request.base.repo.full_name !== payload.pull_request.head.repo.full_name) {
        merge = `(\x0306${payload.pull_request.base.ref}...${payload.pull_request.head.label}\x0F) `;
      } else {
        merge = `(\x0306${payload.pull_request.base.ref}...${payload.pull_request.head.ref}\x0F) `;
      }
    }

    app.irc[org].privmsg(`${att} | Pull Request #${issueNumber} ${action} by ${user} on ${fullname} ${merge}`
            + `\x02\x0303+${payload.pull_request.additions} \x0304-${payload.pull_request.deletions}\x0F - ${url}`);
  });

  app.on('pull_request_review', async context => {
    let payload = context.payload,
      att = await attFormat(payload.repository.full_name, 'pull_request_review'),
      issueNumber = payload.pull_request.number,
      user = fmt_name(await antiHighlight(payload.sender.login)),
      fullname = payload.repository.full_name,
      state = payload.review.state.replace('_', ' '),
      org = payload.repository.owner.login,
      url = fmt_url(await shortenUrl(payload.pull_request.html_url));

    app.irc[org].privmsg(`${att} | Pull Request #${issueNumber} ${state} by ${user} on ${fullname}`
              + ` - ${url}`);
  });

  app.on(['pull_request.review_requested', 'pull_request.review_request_removed'], async context => {
    let payload = context.payload,
      att = await attFormat(payload.repository.full_name, 'pull_request_review'),
      issueNumber = payload.pull_request.number,
      user = fmt_name(await antiHighlight(payload.sender.login)),
      fullname = payload.repository.full_name,
      reviewer = fmt_name(await antiHighlight(payload.requested_reviewer.login)),
      action = payload.action === 'review_request_removed' ? 'removed a review request' : 'requested a review',
      org = payload.repository.owner.login,
      url = fmt_url(await shortenUrl(payload.pull_request.html_url));

    app.irc[org].privmsg(`${att} | ${user} has ${action} from ${reviewer} on Pull Request #${issueNumber}`
              + ` in ${fullname} - ${url}`);
  });

  app.on('status', async context => {
    let payload = context.payload,
      att = await attFormat(payload.repository.full_name, 'status'),
      colors = { success: '\x0303', pending: '\x0311', failure: '\x0304', error: '\x02\x0301' }, // Success: Green, Pending: Cyan, Failure: Red, Error: Bold + Black
      { state, description, target_url } = payload,
      webhookUrl = target_url ? target_url.split('?')[0] : '',
      color = colors[state],
      org = payload.repository.owner.login;

    if (payload.state === 'pending') {
      if (pendingStatus.includes(payload.target_url)) return; // We don't want to send multiple pending messages to a channel - Potential spam
      pendingStatus.push(payload.target_url); // We'll use target_url as identifier
    } else if (pendingStatus.includes(payload.target_url)) pendingStatus.pop(payload);

    let url = await shortenUrl(payload.commit.html_url);

    app.irc[org].privmsg(`${att} | [${color}${state.toUpperCase()}\x0F] | ${description} - ${url} | ${webhookUrl}`);
  });

  app.on('push', async context => {
    let payload = context.payload,
      att = await attFormat(payload.repository.full_name, 'push'),
      user = fmt_name(await antiHighlight(payload.sender.login)),
      numC = payload.commits.length,
      ref = fmt_branch(payload.ref.split('/')[2]),
      org = payload.repository.owner.login,
      distinct_commits = payload.commits.filter(x => x.distinct),
      [, ref_type, ref_name] = payload.ref.split('/'),
      [,, base_ref_name] = payload.base_ref.split('/'),
      msg = [`${att}\x0F | \x0315${user}\x0F`],
      pushType = payload.forced ? 'force-pushed' : 'pushed',
      count = 1,
      repo = `${fmt_repo(payload.repository.name)}/${ref}`,
      config = await db.get(org);

    if (payload.created && config.detailedDeletesAndCreates) {
      if (ref_type === 'tag') {
        msg.push(`tagged ${fmt_tag(ref_name)} at ${
          payload.base_ref ? fmt_branch(base_ref_name) : fmt_hash(payload.after)}`);
      } else {
        msg.push(`created ${fmt_branch(ref_name)}`);

        if (payload.base_ref) {
          msg.push(`from ${fmt_branch(base_ref_name)}`);
        } else if (distinct_commits.empty) {
          msg.push(`at ${fmt_hash(payload.after.substring(0, 7))}`);
        }
        msg.push(`(+\x02${distinct_commits.length}\x0F new commit${distinct_commits.length !== 1 ? 's' : ''})`);
      }
    } else if (payload.deleted && config.detailedDeletesAndCreates) {
      msg.push(`\x0304deleted\x0F ${fmt_branch(ref_name)} at ${fmt_hash(payload.before.substring(0, 7))}`);
    } else if (numC !== 0 && distinct_commits.empty()) {
      if (payload.base_ref) {
        msg.push(`merged ${fmt_branch(base_ref_name)} into ${ref}:`);
      } else {
        let before_sha = fmt_hash(payload.before.substring(0, 7)),
          after_sha = fmt_hash(payload.after.substring(0, 7));

        msg.push(`fast-forwarded ${ref} from ${before_sha} to ${after_sha}:`);
      }
    } else {
      if (payload.delete || payload.create) return; // Handle these in their respective events
      msg.push(`${pushType} \x02${numC}\x0F ${isM} to ${ref}`);
    }

    let isM = (payload.commits.length || 1) === 1 ? 'commit' : 'commits', // Correct grammar for number of commits
      url = await shortenUrl(payload.compare);

    msg.push(fmt_url(url));
    app.irc.privmsg(msg.join(' '));

    for (let c of payload.commits) {
      if (count <= app.irc.config.multipleCommitsMaxLen) { // I know this isn't the best or prettiest solution, but it works
        c.message = c.message.split('\n')[0];
        let message = `${c.message.substring(0, 150)}${(c.message.length > 150 ? '...' : '')}`,
          author = fmt_name(c.author.name) || '\x02\x0304(No author name)\x0F';

        app.irc[org].privmsg(`${repo} ${fmt_hash(c.id.substring(0, 7))} ${author}: ${message}`);
        count++;
      } else {
        count -= 1;
        isM = numC - count === 1 ? 'commit' : 'commits'; // Correct grammar for number of commits remaining
        app.irc[org].privmsg(`... and ${payload.commits.length - count} more ${isM}.`);
        break;
      }
    }
  });

  app.on('create', async context => {
    let payload = context.payload,
      user = fmt_name(await antiHighlight(payload.sender.login)),
      ref = fmt_branch(payload.ref),
      html_url = fmt_url(payload.repository.html_url),
      org = payload.repository.owner.login,
      config = await db.get(org);

    if (payload.ref_type === 'tag' || config.detailedDeletesAndCreates) return; // We're not handling tags yet
    let att = await attFormat(payload.repository.full_name, 'branch-create');

    app.irc[org].privmsg(`${att} | ${user} \x0303created\x0F branch ${ref} - ${html_url}`);
  });

  app.on(['repository.created', 'repository.deleted'], async context => {
    let payload = context.payload,
      user = fmt_name(await antiHighlight(payload.sender.login)),
      name = payload.repository.full_name,
      html_url = fmt_url(payload.repository.html_url),
      createText = payload.repository.forked ? 'forked' : payload.action,
      att = await attFormat(payload.repository.owner.login, 'repository-create'),
      org = payload.repository.owner.login;

    app.irc[org].privmsg(`${att} | ${user} \x0303${createText}\x0F repository ${name} - ${html_url}`);
  });

  app.on('repository.deleted', async context => {
    let payload = context.payload,
      user = fmt_name(await antiHighlight(payload.sender.login)),
      name = payload.repository.full_name,
      att = await attFormat(payload.repository.owner.login, 'repository-delete');

    app.irc.privmsg(`${att} | ${user} \x0304deleted\x0F repository ${name}`);
  });

  app.on('delete', async context => {
    let payload = context.payload,
      config = await db.get(payload.repository.owner.login);

    if (payload.ref_type === 'tag' || config.detailedDeletesAndCreates) return; // We're not handling tags yet
    let user = fmt_name(await antiHighlight(payload.sender.login)),
      ref = fmt_branch(payload.ref),
      html_url = fmt_url(payload.repository.html_url),
      att = await attFormat(payload.repository.full_name, 'branch-delete');

    app.irc.privmsg(`${att} | ${user} \x0304deleted\x0F branch ${ref} - ${html_url}`);
  });

  app.on('repository_vulnerability_alert', async context => {
    let payload = context.payload,
      action = payload.action,
      att = await attFormat('', `repository-vulnerability-${action}`); // We're not given repo or org name

    // Alert specific
    let alert = payload.alert,
      // eslint-disable-next-line no-unused-vars
      { package_name, extReference, affectRange, extID, fixedIn } = alert,
      alertText = '';

    if (payload.action === 'dimiss') {
      let login = alert.dismisser.login;

      alertText = `Vulnerability  ${package_name} (${extReference}) was dismissed by ${login}`;
    } else {
      let fixed = payload.action === 'resolve' ? `Fixed (${fixedIn})` : '';

      alertText = `Vulnerability ${package_name} (${extReference}) was ${action}ed ${fixed}`;
    }

    app.irc.privmsg(`${att} | ${alertText} - ${extReference}`);
  });
};
