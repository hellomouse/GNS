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
class IRC {

  /**
     *
     * @param {object} app
     */
  constructor(app) {
    this.app = app;
    this.socket = tls.connect(config.irc.port, config.irc.server, {
      localaddress: config.irc.bindhost,
      cert: config.irc.sasl.cert ? readFileSync(config.irc.sasl.cert) : null,
      key: config.irc.sasl.key ? readFileSync(config.irc.sasl.key): null,
      passphrase: config.irc.sasl.key_passphrase
    });
    this.parser = new Parser();

    this.socket.on('connect', () => {
      this.write(`NICK ${config.irc.nickname}`);
      this.write(`USER ${config.irc.ident} 0 * :${config.irc.realname}`);
    }).pipe(this.parser).on('data', data => {
      this.app.log.debug(`>>> ${strip_formatting(data.raw)}`);

      // Ping
      if (data.command === 'PING') {
        this.write('PONG');
        this.app.log('Received ping');
      }

      if (data.numeric === 396 && config.irc.requireAuth || data.numeric === 1 && !config.irc.requireAuth) {
        // Joining channels after being authenticated if config option is set, if not, join after the MOTD
        this.write(`JOIN ${config.irc.channel}`);
        this.app.log('Joining channels');
      }

      if (data.numeric === 433) this.write(`NICK ${config.irc.nickname}_`);
    });

    if (!config.irc.sasl.cert) this.write(`PRIVMSG NickServ :identify ${config.irc.NickServPass}`);
  }

  /**
    * @param {String} message
    */
  write(message) {
    this.socket.write(`${message}\r\n`);
    this.app.log.debug(`<<< ${strip_formatting(message)}`);
  }

  /**
    * @param {String} text
    */
  privmsg(text) {
    this.write(`PRIVMSG ${config.irc.channel} :${text}`);
  }

}

module.exports = IRC;
