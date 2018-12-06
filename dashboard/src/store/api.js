// @ts-check
import PouchDB from 'pouchdb';
const db = new PouchDB('https://couchdb.hellomouse.net/gns');

/** Returns list of repositories for a given user
 * @async
 * @param {String} user
 * @return {Promise<Array<String>>}
 */
export async function apiGetRepos(user) {
  let { rows: docs } = await db.allDocs({ include_docs: true });

  /** @type {Array<string>*/
  let repos = [];

  // @ts-ignore
  for await (let { doc: { repos: orgRepos, members } } of docs) {
    if (members.includes(user)) repos.push(...Object.keys(orgRepos));
  }

  return repos;
}

/**
 * @typedef {Object<string, boolean | string | string[] | Object<string, boolean>>} RepoSettings
 */

/** Returns settings for the given repository
 * @async
 * @param {String} repo
 * @return {Promise<RepoSettings>}
 */
export const apiGetRepoSettings = async repo => {
  /** @type {import('./config').Config} */
  let orgSettings;

  try {
    orgSettings = await db.get(repo.split('/')[0]);
  } catch (e) {
    orgSettings = { config: { irc: {} } };
  }

  const repoSettings = orgSettings.repos[repo] || {};

  if (repoSettings.irc === undefined) repoSettings.irc = {};

  // @ts-ignore
  return {
    enabled: repoSettings.enabled,
    ircHost: orgSettings.config.irc.server || 'irc.freenode.net',
    ircPort: orgSettings.config.irc.port || '6667',
    ircNick: orgSettings.config.irc.nickname || 'GNS',
    ircUser: 'TotallyNotGNS',
    ircPass: 'APassword',
    ircRnam: 'GitHub Notification System by Hellomouse',
    ircChannel: '##helloworlders',
    events: { // event names could be sent by the api server so you don't need to update dashboard code to add them
      eventA: true,
      eventB: false,
      eventC: true
    }
  };
};
