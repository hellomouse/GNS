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

    this.join = () => {
      for (let i of Object.keys(config.orgs)) {
        if (!config.orgs[i].irc) {
          this.write(`JOIN ${config.orgs[i].irc.channel}`);
          this.app.log('Joining channels');
        }
      }
    };

    this.RPL_WELCOME = (app, event) => {
      if (!config.irc.sasl.cert) {
        this.write(`PRIVMSG NickServ :identify ${config.irc.NickServPass}`);
      }
      if (!config.irc.requireAuth) {
        // Joining channels after being authenticated if config option is set, if not, join after the MOTD
        this.join();
      }
    };

    this.on_396 = (app, event) => {
      if (config.irc.requireAuth) {
        // Joining channels after being authenticated if config option is set, if not, join after the MOTD
        this.join();
      }
    };

    this.ERR_NICKNAMEINUSE = (app, event) => {
      this.write(`NICK ${config.irc.nickname}_`);
    };

    this.on_cap = (app, event) => {
      if (event.args[0] === 'LS') {
        // Don't blindly assume server supports our requested caps, even though server sends a CAP NACK response
        const servcaps = event.args[1] !== '*' ? event.args[1].split(' ') : event.args[2].split(' ');

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

        if (event.args[1] !== '*') {
          if (!this.availablecaps.length) {
            this.write('CAP END');
          } else {
            this.write(`CAP REQ :${this.availablecaps.join(' ')}`);
          }
        }
      } else if (event.args[0] === 'ACK') {
        for (const cap of this.caps) { // Iterate over this.caps so we have access to classes
          if (typeof cap !== 'string' && this.availablecaps.indexOf(cap.name) > -1) { // Check that the cap is in this.availablecaps
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
      let name = '';

      if (i.startsWith('on_')) {
        name = i.split('on_')[1];
      } else if (i.startsWith('RPL_') || i.startsWith('ERROR_')) {
        name = i;
      }

      this.events.on(name.toUpperCase(), this[i]);
    }
  }

}

module.exports = Events;
