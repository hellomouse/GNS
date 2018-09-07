/** Returns list of repositores
 * @return {Array<String>}
 */
export const apiGetRepos = () => [
  'hellomouse/GNS',
  'hellomouse/wtk',
  'handicraftsman/heliumbot'
];

/** Returns settings for the given repository
 * @param {String} repo
 * @return {Object}
 */
export const apiGetRepoSettings = repo => {
  return {
    enabled: true,
    ircHost: 'irc.freenode.net',
    ircPort: '6667',
    ircNick: 'GNS',
    ircUser: 'TotallyNotGNS',
    ircPass: 'APassword',
    ircRnam: 'Github Notification System by HelloMouse',
    ircChannel: '##helloworlders',
    events: { // event names could be sent by the api server so you don't need to update dashboard code to add them
      eventA: true,
      eventB: false,
      eventC: true
    }
  };
};
