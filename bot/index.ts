import labels = require('./labels');
import IRC = require('./irc');
import web = require('./web');
import probot = require('probot'); // eslint-disable-line no-unused-vars
import PouchDB = require('pouchdb');
import { Config, ConfigDefault } from './config';
import Webhhooks = require('@octokit/webhooks');
import helpers = require('./helpers');
const { fmt_branch, fmt_hash, fmt_name, fmt_repo, fmt_tag, fmt_url } = helpers.formatters;
const { attFormat, shortenUrl, antiHighlight } = helpers.generic;

const colors: { [key: string]: string } = {
  // Issues and Pull Requests
  opened: '\x0303',
  reopened: '\x0307',
  closed: '\x0304',
  labeled: '\x0303',
  unlabeled: '\x0304',
  // Issues and Pull Requests comments
  created: '\x0303',
  edited: '\x0307',
  deleted: '\x0304',
  // Commit Status
  success: '\x0303',
  pending: '\x0311',
  failure: '\x0304',
  error: '\x02\x0301'
};

// eslint-disable-next-line no-extend-native
Object.defineProperties(Array.prototype, {
  isEmpty: {
    enumerable: true,
    // eslint-disable-next-line require-jsdoc
    get(): boolean { return this.length === 0; }
  }
});

const db = new PouchDB<Config>(process.env.POUCH_REMOTE);
// tslint:disable-next-line:ter-newline-after-var
const pendingStatus: string[] = []; // contains all pending checks from travis as multiple are sent

/**
 * Main application function, ran by Probot
 * @param {probot.Application} app
*/
export = async (app: probot.Application) => {
  const irc: {
    [key: string]: IRC;
  } = {};
  const docs = await db.allDocs();

  if (process.env.DEV) {
    irc.hellomouse = new IRC(app, 'hellomouse');
    for await (const { id: i } of docs.rows) {
      irc[i] = irc.hellomouse;
    }
    await irc.hellomouse.init();
  } else {
    for await (const { id: i } of docs.rows) {
      irc[i] = new IRC(app, i);
      await irc[i].init();
    }
  }
  web(app);

  // App events

  app.on(['issues.opened', 'issues.closed', 'issues.reopened'], async context => {
    const payload = context.payload as Webhhooks.WebhookPayloadIssues,
      issue = payload.issue!,
      repository = payload.repository!,
      att = await attFormat(payload.repository!.full_name!, 'issue', db),
      { action } = payload,
      issueNumber = issue.number,
      color = colors[action!], // opened: Green, reopened: Orange, closed: Red
      user = fmt_name(await antiHighlight(payload.sender!.login)),
      fullname = repository.full_name,
      org = repository.owner.login,
      url = fmt_url(await shortenUrl(issue.html_url!, app));

    irc[org].privmsg(`${att} | Issue #${issueNumber} ${color}${action}\x0F by ${user} on ${fullname} - ${url}`);
  });

  app.on(['issue_comment.created', 'issue_comment.edited', 'issue_comment.deleted'], async context => {
    const payload = context.payload as Webhhooks.WebhookPayloadIssueComment,
      repository = payload.repository,
      { title, number } = payload.issue,
      att = await attFormat(repository.full_name, 'issue.comment', db),
      action: string = payload.action!,
      color: string = colors[action], // Created: Green, Edited: Orange, Deleted: Red
      user = fmt_name(await antiHighlight(payload.sender!.login)),
      issueNumber: number = number,
      issueText = `${title.substring(0, 150)}${title.length > 150 ? '...' : ''}`,
      org: string = repository.owner.login,
      url = fmt_url(await shortenUrl(payload.comment.html_url, app));

    irc[org].privmsg(`${att} | ${user} ${color}${action}\x0F a comment on ` +
          `issue #${issueNumber} (${issueText}) - ${url}`);
  });

  app.on(['issues.labeled', 'issues.unlabeled', 'pull_request.labeled', 'pull_request.unlabeled'], async context => {
    const name = context.name === 'issues' ? 'issue' : 'pull_request';
    const { action, repository, label: Label, sender,
        // @ts-ignore
        // eslint-disable-next-line max-len
        [name]: { number, title, html_url } } = context.payload as (Webhhooks.WebhookPayloadIssues | Webhhooks.WebhookPayloadPullRequest),
      att = await attFormat(repository.full_name, `${name}.${action}`, db),
      user = fmt_name(await antiHighlight(sender.login)),
      color = `\x02${colors[action!]}`,
      issueNumber: number = number,
      issueText = `${title.substring(0, 150)}${title.length > 150 ? '...' : ''}`,
      org: string = repository!.owner.login,
      url = fmt_url(await shortenUrl(html_url, app)),
      label = labels[Label.name] || Label.name;

    irc[org].privmsg(`${att} \x0F| ${user} ${color}${action}\x0F ` +
          `${name.replace('_', ' ')} #${issueNumber} with ${label}\x0F (${issueText}) - ${url}`);
  });

  app.on(['issues.assigned', 'issues.unassigned', 'pull_request.assigned', 'pull_request.unassigned'],
    async context => {
      const name = context.name === 'issues' ? 'issue' : 'pull_request';
      // @ts-ignore
      const { [name]: { number: issueNumber, html_url },
          // eslint-disable-next-line max-len
          action, repository, assignee, sender } = context.payload as (Webhhooks.WebhookPayloadIssues | Webhhooks.WebhookPayloadPullRequest),
        assigneeLogin = sender.login,
        att = await attFormat(repository.full_name, `${name}.${action}`, db),
        user = fmt_name(await antiHighlight(assignee.login)),
        sender_fmt = fmt_name(await antiHighlight(assigneeLogin as string)),
        fullname = repository!.full_name,
        color = action === 'assigned' ? '\x0303' : '\x0304', // Color for assigned message
        event = name.replace('_', ' '),
        org = repository.owner.login;
      let assignedText;

      if (user === sender_fmt) {
        assignedText = `${user} ${color}${action}\x0F themselves `;
        assignedText += action === 'assigned' ? 'to' : 'from';
      } else {
        assignedText = `${user} was ${color}${action}\x0F by ${sender_fmt} to`;
      }
      const url = fmt_url(await shortenUrl(html_url, app));

      irc[org].privmsg(`${att} | ${assignedText} ${event} #${issueNumber} on ${fullname} - ${url}`);
    });

  app.on(['pull_request.opened', 'pull_request.closed', 'pull_request.reopened'], async context => {
    const payload = context.payload as Webhhooks.WebhookPayloadPullRequest,
      pull_request = payload.pull_request,
      att = await attFormat(payload.repository.full_name, 'pull_request', db),
      issueNumber = payload.pull_request.number,
      action = payload.action === 'closed' && pull_request.merged ? 'merged' : payload.action,
      user = fmt_name(await antiHighlight(payload.sender.login)),
      fullname = payload.repository.full_name,
      org = payload.repository!.owner.login,
      url = await shortenUrl(payload.pull_request!.html_url!, app),
      pullRequestType = pull_request.draft ? 'Draft Pull Request' : 'Pull Request';
    let merge = '';

    if (action === 'opened' || action === 'reopened') {
      if (pull_request.base.repo.full_name !== pull_request.head.repo.full_name) {
        merge = `(\x0306${pull_request.base.ref}...${payload.pull_request!.head.label}\x0F) `;
      } else {
        merge = `(\x0306${pull_request.base.ref}...${pull_request.head.ref}\x0F) `;
      }
    }

    irc[org].privmsg(`${att} | ${pullRequestType} #${issueNumber} ${action} by ${user} on ${fullname} ${merge}` +
            `\x02\x0303+${pull_request.additions} \x0304-${pull_request.deletions}\x0F - ${url}`);
  });

  app.on('pull_request_review', async context => {
    const payload = context.payload as Webhhooks.WebhookPayloadPullRequestReview,
      repository = payload.repository,
      att = await attFormat(repository.full_name, 'pull_request_review', db),
      issueNumber = payload.pull_request.number,
      user = fmt_name(await antiHighlight(payload.sender.login)),
      fullname = repository.full_name,
      state = payload.review.state.replace('_', ' '),
      org = payload.repository.owner.login,
      url = fmt_url(await shortenUrl(payload.pull_request.html_url, app));

    irc[org].privmsg(`${att} | Pull Request #${issueNumber} ${state} by ${user} on ${fullname}` +
              ` - ${url}`);
  });

  app.on(['pull_request.review_requested', 'pull_request.review_request_removed'], async context => {
    const payload = context.payload as Webhhooks.WebhookPayloadPullRequest,
      att = await attFormat(payload.repository.full_name, 'pull_request_review', db),
      issueNumber = payload.pull_request.number,
      user = fmt_name(await antiHighlight(payload.sender.login)),
      fullname = payload.repository.full_name,
      reviewer = fmt_name(await antiHighlight(payload.requested_reviewer !== undefined ?
        payload.requested_reviewer.login : payload.requested_team.name)),
      action = payload.action === 'review_request_removed' ? 'removed a review request' : 'requested a review',
      org = payload.repository.owner.login,
      url = fmt_url(await shortenUrl(payload.pull_request.html_url!, app));

    irc[org].privmsg(`${att} | ${user} has ${action} from ${reviewer} on Pull Request #${issueNumber}` +
              ` in ${fullname} - ${url}`);
  });

  app.on('status', async context => {
    const payload = context.payload as Webhhooks.WebhookPayloadStatus,
      att = await attFormat(payload.repository.full_name, 'status', db),
      { state, description, target_url } = payload,
      webhookUrl = target_url ? target_url.split('?')[0] : '',
      color = colors[state], // Success: Green, Pending: Cyan, Failure: Red, Error: Bold + Black
      org = payload.repository.owner.login;

    if (payload.state === 'pending') {
      if (pendingStatus.includes(target_url!)) return; // We don't want to send multiple pending messages to a channel - Potential spam
      pendingStatus.push(target_url!); // We'll use target_url as identifier
    } else if (pendingStatus.includes(target_url!)) pendingStatus.pop();

    const url = await shortenUrl(payload.commit.html_url, app);

    irc[org].privmsg(`${att} | [${color}${state.toUpperCase()}\x0F] | ${description} - ${url} | ${webhookUrl}`);
  });

  app.on('push', async context => {
    const payload = context.payload,
      att = await attFormat(payload.repository.full_name, 'push', db),
      user = fmt_name(await antiHighlight(payload.sender.login)),
      numC = payload.commits.length,
      [, ref_type, ...rest] = payload.ref.split('/'),
      ref_name = rest.join('/'),
      ref = fmt_branch(ref_name),
      org = payload.repository.owner.login,
      distinct_commits = payload.commits.filter(x => x.distinct),
      msg = [`${att}\x0F | \x0315${user}\x0F`],
      pushType = payload.forced ? 'force-pushed' : 'pushed',
      repo = `${fmt_repo(payload.repository!.name)}/${ref}`,
      { config } = await db.get<void>(org),
      isM = (payload.commits.length || 1) === 1 ? 'commit' : 'commits', // Correct grammar for number of commits
      url = await shortenUrl(payload.compare, app);
    let base_ref_name = '',
      count = 1;

    if (typeof payload.base_ref === 'string') base_ref_name = payload.base_ref.split('/').slice(2).join('/');

    if (payload.created && config.detailedDeletesAndCreates) {
      if (ref_type === 'tags') {
        msg.push(`tagged ${fmt_tag(ref_name)} at ${
          payload.base_ref ? fmt_branch(base_ref_name) : fmt_hash(payload.after)}`);
      } else {
        msg.push(`created ${ref}`);

        if (payload.base_ref) {
          msg.push(`from ${ref}`);
        } else if (distinct_commits.isEmpty) {
          msg.push(`at ${fmt_hash(payload.after.substring(0, 7))}`);
        }
        msg.push(`(+\x02${distinct_commits.length}\x0F new commit${distinct_commits.length !== 1 ? 's' : ''})`);
      }
    } else if (payload.deleted && config!.detailedDeletesAndCreates) {
      msg.push(`\x0304deleted\x0F ${ref} at ${fmt_hash(payload.before.substring(0, 7))}`);
    } else if (numC !== 0 && distinct_commits.isEmpty) {
      if (payload.base_ref) {
        msg.push(`merged ${fmt_branch(base_ref_name)} into ${ref}:`);
      } else {
        const before_sha = fmt_hash(payload.before.substring(0, 7)),
          after_sha = fmt_hash(payload.after.substring(0, 7));

        msg.push(`fast-forwarded ${ref} from ${before_sha} to ${after_sha}:`);
      }
    } else {
      if (payload.deleted || payload.created) return; // Handle these in their respective events
      if (numC === 0 && payload.forced) {
        const before_sha = fmt_hash(payload.before.substring(0, 7)),
          after_sha = fmt_hash(payload.after.substring(0, 7));

        msg.push(`force-pushed ${ref} from ${before_sha} to ${after_sha}:`);
      } else {
        msg.push(`${pushType} \x02${numC}\x0F ${isM} to ${ref}`);
      }
    }

    msg.push(fmt_url(url));
    irc[org].privmsg(msg.join(' '));

    for (const c of payload.commits!) {
      if (count <= config!.multipleCommitsMaxLen) { // I know this isn't the best or prettiest solution, but it works
        c.message = c.message.split('\n')[0];
        const message = `${c.message.substring(0, 150)}${(c.message.length > 150 ? '...' : '')}`,
          author = fmt_name(c.author.name) || '\x02\x0304(No author name)\x0F';

        irc[org].privmsg(`${repo} ${fmt_hash(c.id.substring(0, 7))} ${author}: ${message}`);
        count++;
      } else {
        count -= 1;
        irc[org].privmsg(`... and ${payload.commits!.length - count} more ${isM}.`);
        break;
      }
    }
  });

  app.on('create', async context => {
    const payload = context.payload as Webhhooks.WebhookPayloadCreate,
      user = fmt_name(await antiHighlight(payload.sender!.login)),
      ref = fmt_branch(payload.ref),
      html_url = fmt_url(payload.repository!.html_url!),
      org = payload.repository!.owner.login,
      { config } = await db.get<void>(org);

    if (payload.ref_type === 'tag' || config.detailedDeletesAndCreates) return; // We're not handling tags yet
    const att = await attFormat(payload.repository!.full_name!, 'branch-create', db);

    irc[org].privmsg(`${att} | ${user} \x0303created\x0F branch ${ref} - ${html_url}`);
  });

  app.on(['repository.created', 'repository.deleted'], async context => {
    const payload = context.payload as Webhhooks.WebhookPayloadRepository,
      user = fmt_name(await antiHighlight(payload.sender!.login)),
      name = payload.repository.full_name,
      html_url = fmt_url(payload.repository.html_url!),
      createText = payload.action !== 'deleted' && payload.repository.fork ? 'forked' : payload.action,
      att = await attFormat(payload.repository.owner.login, `repository-${payload.action.slice(0, -1)}`, db),
      org = payload.repository.owner.login;

    // eslint-disable-next-line max-len
    irc[org].privmsg(`${att} | ${user} ${colors[payload.action!]}${createText}\x0F repository ${name}${payload.action !== 'deleted' ? ` - ${html_url}` : ''}`);
  });

  app.on('delete', async context => {
    const payload = context.payload,
      owner = payload.repository.owner.login,
      { config } = await db.get<void>(owner);

    if (payload.ref_type === 'tag' || config.detailedDeletesAndCreates) return; // We're not handling tags yet

    const user = fmt_name(await antiHighlight(payload.sender.login)),
      ref = fmt_branch(payload.ref),
      att = await attFormat(payload.repository.full_name, 'branch-delete', db);

    irc[owner].privmsg(`${att} | ${user} \x0304deleted\x0F branch ${ref}`);
  });

  app.on('repository_vulnerability_alert', async context => {
    const payload = context.payload,
      action = payload.action,
      att = await attFormat('', `repository-vulnerability-${action}`, db); // We're not given repo or org name

    // Alert specific
    const alert = payload.alert,
      // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars,max-len
      { affected_package_name: package_name, external_reference: extReference, affected_range: affectRange, external_identifier: extID, fixed_in: fixedIn } = alert;
    let alertText = '';

    if (payload.action === 'dimiss') {
      const login = alert.dismisser.login;

      alertText = `Vulnerability  ${package_name} (${extReference}) was dismissed by ${login}`;
    } else {
      const fixed = payload.action === 'resolve' ? `Fixed (${fixedIn})` : '';

      alertText = `Vulnerability ${package_name} (${extReference}) was ${action}ed ${fixed}`;
    }

    Object.keys(irc).forEach(org => {
      irc[org].privmsg(`${att} | ${alertText} - ${extReference}`);
    });
  });

  app.on('installation', async context => {
    const payload = context.payload,
      action = payload.action,
      sender = payload.sender.login,
      id = payload.installation.id,
      org = payload.installation.account.login,
      att = await attFormat(org, `installation-${action}`, db);

    if (action === 'created') {
      irc[org] = new IRC(app, org);
      irc.hellomouse.privmsg(`${att} | ${sender} ${action} a new instance on account ${org}`);
      const repos: {[key: string]: {enabled: boolean}} = {};

      for (const repo of payload.repositories) {
        repos[repo.full_name] = {
          enabled: true
        };
      }
      await db.put({ _id: org, installation_id: id, repos, installee: sender, ...ConfigDefault });
    } else {
      await db.remove(await db.get(org));
    }
  });

  app.on('installation_repositories', async context => {
    const payload = context.payload,
      action = payload.action,
      sender = payload.sender.login,
      // id = payload.installation.id,
      org = payload.installation.account.login,
      att = await attFormat(org, `installation-repositories-${action}`, db);

    irc.hellomouse.privmsg(`${att} | ${sender} ${action} a new instance on {...}`);
    const orgDB = await db.get(org);

    if (action === 'added') {
      for (const repo of payload.repositories_added) {
        orgDB.repos[repo.full_name] = { enabled: true };
      }
      db.put(orgDB);
    } else {
      for (const repo of payload.repositories_removed!) {
        delete orgDB.repos[repo.full_name];
      }
      db.put(orgDB);
    }
  });
};
