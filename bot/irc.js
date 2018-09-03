const events = require('events');
const Events = require('./irc/events');
const Parser = require('irc-stream-parser');
const tls = require('tls');
const { readFileSync } = require('fs');

// Config
const config = require('./config');

/**
* Strips formatting from IRC messages
* @param {string} msg
* @return {string}
*/
function strip_formatting(msg) {
  /* eslint-disable no-control-regex */
  let ccodes = ['\\x0f', '\\x16', '\\x1d', '\\x1f', '\\x02', '\\x03([0-9][0-6]?)?,?([0-9][0-6]?)?'];
  /* eslint-enable no-control-regex */

  for (let cc of ccodes)
    msg = msg.replace(new RegExp(cc, 'g'), '');

  return msg;
}

/**
 * IRC connection wrapper
 */
class IRC extends Events {

  /**
     *
     * @param {object} app
     */
  constructor(app) {
    super();
    this.app = app;
    this.socket = tls.connect(config.irc.port, config.irc.server, {
      localaddress: config.irc.bindhost,
      cert: config.irc.sasl.cert ? readFileSync(config.irc.sasl.cert) : null,
      key: config.irc.sasl.key ? readFileSync(config.irc.sasl.key): null,
      passphrase: config.irc.sasl.key_passphrase
    });
    this.parser = new Parser();

    this.socket.on('connect', () => {
      this.irc_events = new events.EventEmitter();
      super.init(this);
      this.app.log.info('Connected to IRC');
      this.write('CAP LS');
      this.write(`NICK ${config.irc.nickname}`);
      this.write(`USER ${config.irc.ident} 0 * :${config.irc.realname}`);
    }).pipe(this.parser).on('data', data => {
      this.app.log.debug(`>>> ${strip_formatting(data.raw)}`);
      this.irc_events.emit(data.command, this, data);
      this.irc_events.emit(data.numeric, this, data);
    });
  }

  /**
    * @param {String} message
    */
  write(message) {
    this.socket.write(`${message}\r\n`);
    this.app.log.debug(`<<< ${strip_formatting(message)}`);
  }

  /**
    * @param {String} org The organization (or user) name
    * @param {String} text
    */
  privmsg(org, text) {
    this.write(`PRIVMSG ${config.orgs[org].irc.channel} :${text}`);
  }

}

module.exports = IRC;
