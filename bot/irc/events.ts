import IRC from '../irc'; // eslint-disable-line no-unused-vars

/**
 * constructor - description
 * @extends IRC
 */
function Events(this: IRC): void {
  this.stringcaps = [];
  this.caps = ['sasl'];
  this.availablecaps = [];

  this.on_ping = () => {
    this.write('PONG');
    this.app.log('Received ping');
  };

  this.join = () => {
    this.app.log(`${this.org}: ${this.config.notice}`);
    if (this.config.notice === undefined) this.config.notice = false;
    if (!this.config.notice) {
      this.write(`JOIN ${this.config.channel}`);
      this.app.log('Joining channels');
    }
  };

  /* this.RPL_WELCOME = (app, event) => {
      if (!config.irc.sasl.cert) {
        this.write(`PRIVMSG NickServ :identify ${config.NickServPass}`);
      }
      if (!config.irc.requireAuth) {
        // Joining channels after being authenticated if config option is set, if not, join after the MOTD
        this.join();
      }
    };*/

  this.on_396 = () => {
    if (this.config.requireAuth) {
      // Joining channels after being authenticated if config option is set, if not, join after the MOTD
      this.join();
    }
  };

  this.ERR_NICKNAMEINUSE = () => {
    this.write(`NICK ${this.config.nickname}_`);
  };

  this.on_cap = (app, event) => {
    if (event.args[1] === 'LS') {
      // Don't blindly assume server supports our requested caps, even though server sends a CAP NACK response
      const servcaps = event.args[2].split(' ');

      for (const cap of servcaps) {
        if (this.stringcaps.includes(cap)) {
          this.availablecaps.push(cap);
        }
      }

      if (!this.availablecaps.length) {
        this.write('CAP END');
      } else {
        this.write(`CAP REQ :${this.availablecaps.join(' ')}`);
      }
    } else if (event.args[1] === 'ACK') {
      for (const cap of this.caps) { // Iterate over this.caps so we have access to classes
        if (typeof cap !== 'string' && this.availablecaps.includes(cap.name)) { // Check that the cap is in this.availablecaps
          if (typeof cap.run === 'function') { // Check if the cap has the `run` property
            cap.run(this); // Run the cap with the args collected during CAP LS
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

export default Events;
