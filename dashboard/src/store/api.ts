// @ts-check
import PouchDB from 'pouchdb';
import { Config, ConfigDefault } from '../config';
const db = new PouchDB<Config>('https://couchdb.hellomouse.net/gns');

/** Returns list of repositories for a given user
 * @async
 * @param {String} user
 * @return {Promise<Array<String>>}
 */
export async function apiGetRepos(user: string): Promise<string[]> {
  let docs;

  try {
    docs = (await db.allDocs({ include_docs: true })).rows;
  } catch (e) {
    console.error(e.message);
  }
  /** @type {Array<string>} */
  const repos: string[] = [];

  // @ts-ignore
  for await (const { doc: { repos: orgRepos, members } } of docs) {
    if (members.includes(user)) repos.push(...Object.keys(orgRepos));
  }

  return repos;
}

/**
 * @typedef {Object<string, boolean | string | string[] | Object<string, boolean>>} RepoSettings
 */
interface RepoSettings {
  enabled: boolean;
  ircHost: string;
  ircPort: string;
  ircNick: string;
  ircUser: string;
  ircPass: string;
  ircRnam: string;
  ircChannel: string;
  events: {
    [key: string]: boolean;
  };
}
/** Returns settings for the given repository
 * @async
 * @param {String} repo
 * @return {Promise<RepoSettings>}
 */
export const apiGetRepoSettings = async (repo: string): Promise<RepoSettings> => {
  /** @type {import('../config').Config} */
  let orgSettings: Config;

  try {
    orgSettings = await db.get(repo.split('/')[0]);
  } catch (e) {
    orgSettings = { ...ConfigDefault };
  }

  const repoSettings = orgSettings.repos[repo] || {};

  if (repoSettings.irc === undefined) repoSettings.irc = {};

  // @ts-ignore
  return {
    enabled: repoSettings.enabled === undefined ? false : repoSettings.enabled,
    ircHost: orgSettings.config.irc.server || 'irc.libera.chat',
    ircPort: orgSettings.config.irc.port.toString() || '6667',
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
