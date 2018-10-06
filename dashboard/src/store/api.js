import PouchDB from 'pouchdb';
const db = new PouchDB('http://91.92.144.105:5984/gns');

/** Returns list of repositores
 * @return {Array<String>}
 */
export const apiGetRepos = () => [
  'hellomouse/GNS',
  'hellomouse/wtk',
  'handicraftsman/heliumbot'
];

/**
 * @typedef {Object<string, boolean | string | Object<string, boolean>>} RepoSettings
 */

/** Returns settings for the given repository
 * @async
 * @param {String} repo
 * @return {Promise<RepoSettings>}
 */
export const apiGetRepoSettings = async repo => {
  let orgSettings;

  try {
    orgSettings = await db.get(repo.split('/')[0]);
  } catch (e) {
    orgSettings = { config: { irc: {} } };
  }

  const repoSettings = orgSettings[repo] || {};

  if (repoSettings.irc === undefined) repoSettings.irc = {};

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
