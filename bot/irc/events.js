const config = require('../config');

/**
 * @class
 */
class Events {

  constructor() {}
  /**
   * constructor - description
   * @param  {Object} irc description
   */
  init(irc) {
    this.events = irc.irc_events;
    this.app = irc.app;
    this.write = irc.write;

    this.stringcaps = [];
    this.caps = ['sasl'];
    this.availablecaps = [];

    this.on_ping = (app, event) => {
      this.write('PONG');
      this.app.log('Received ping');
    };

    this.RPL_WELCOME = (app, event) => {
      if (!config.irc.sasl.cert) {
        this.write(`PRIVMSG NickServ :identify ${config.irc.NickServPass}`);
      }
      if (!config.irc.requireAuth) {
        // Joining channels after being authenticated if config option is set, if not, join after the MOTD
        this.write(`JOIN ${config.irc.channel}`);
        this.app.log('Joining channels');
      }
    };

    this.on_396 = (app, event) => {
      if (config.irc.requireAuth) {
        // Joining channels after being authenticated if config option is set, if not, join after the MOTD
        this.write(`JOIN ${config.irc.channel}`);
        this.app.log('Joining channels');
      }
    };

    this.ERR_NICKNAMEINUSE = (app, event) => {
      this.write(`NICK ${config.irc.nickname}_`);
    };

    this.on_cap = (app, event) => {
      if (event.args[1] === 'LS') {
        // Don't blindly assume server supports our requested caps, even though server sends a CAP NACK response
        const servcaps = event.args[2].split(' ');

        for (const c of servcaps) {
          const [cap, args] = c.trim().split('=');

          if (this.stringcaps.includes(cap)) {
            this.availablecaps.push(cap);

            if (typeof args !== 'undefined') {
              this.args[cap] = args.split(',');
            } else {
              this.args[cap] = null;
            }
          }
        }

        if (!this.availablecaps.length) {
          this.write('CAP END');
        } else {
          this.write(`CAP REQ :${this.availablecaps.join(' ')}`);
        }
      } else if (event.args[1] === 'ACK') {
        for (const cap of this.caps) { // Iterate over this.caps so we have access to classes
          if (typeof cap !== 'string' && this.availablecaps.inludes(cap.name)) { // Check that the cap is in this.availablecaps
            if (typeof cap.run === 'function') { // Check if the cap has the `run` property
              cap.run(this.bot, this.args[cap.name]); // Run the cap with the args collected during CAP LS
            } else {
              continue;
            }
          }
        }
      }
    };

    for (let i of Object.keys(this)) {
      if (i.startsWith('on_') || i.startsWith('RPL_') || i.startsWith('ERR_')) {
        let name = i.split('on_')[1] || i;

        this.events.on(name.toUpperCase(), this[i]);
      }
    }
  }

}

module.exports = Events;
