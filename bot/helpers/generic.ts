import request = require('request-promise-native');

import { Application } from 'probot';
import { Config } from '../config';

/**
 * @function
 * @async
 * @param {string} user
 * @return {Promise<string>} user with normal character
 */
async function antiHighlight(user: string): Promise<string> {
  return `${user.slice(0, 1)}\u200B${user.slice(1)}`;
}

/**
 * @function
 * @async
 * @param {string} url - Url of the string to shorten
 * @param {Application} app The Probot Application class
 * @return {Promise<string>}
*/
async function shortenUrl(url: string, app: Application): Promise<string> {
  // Posts to the api to create shorter url
  try {
    const req = await request.post({ uri: 'https://git.io/create', form: { url } });

    return `https://git.io/${req}`;
  } catch (e) {
    const err: Error = e;

    app.log.error(`Shorten url failed for ${url}: ${err.message}`);
    return '';
  }
}

/**
 * @function
 * @async
 * @param {string} fullname - The full repository name
 * @param {string} event - Name of the event being received from webhook
 * @param {Pouchdb.Database<Config>} db
 * @return {Promise<string>} Attention string
 * @return {Promise<string>} Attention string
 */
async function attFormat(fullname: string, event: string, db: PouchDB.Database<Config>): Promise<string> {
  // [user|org]/[name]
  let [org, name] = fullname.split('/'); // or user
  const { config } = await db.get(org);

  return config.attentionString.replace('{org}', org).replace('{name}', name || org).replace('{event}', event);
}

export = {
  antiHighlight,
  attFormat,
  shortenUrl
};
