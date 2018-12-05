import IRC = require('../irc'); // eslint-disable-line no-unused-vars

/**
 * constructor - description
 * @extends IRC
 */
function Events(self: IRC): void {
  self.stringcaps = [];
  self.caps = ['sasl'];
  self.availablecaps = [];

  self.on_ping = () => {
    self.write('PONG');
    self.app.log('Received ping');
  };

  self.join = () => {
    self.app.log(`${self.org}: ${self.config.irc.notice}`);
    if (self.config.irc.notice === undefined) self.config.irc.notice = false;
    if (!self.config.irc.notice) {
      self.write(`JOIN ${self.config.irc.channel}`);
      self.app.log('Joining channels');
    }
  };

  /* self.RPL_WELCOME = (app, event) => {
      if (!config.irc.sasl.cert) {
        self.write(`PRIVMSG NickServ :identify ${config.NickServPass}`);
      }
      if (!config.irc.requireAuth) {
        // Joining channels after being authenticated if config option is set, if not, join after the MOTD
        self.join();
      }
    };*/

  self.on_396 = () => {
    if (self.config.irc.requireAuth) {
      // Joining channels after being authenticated if config option is set, if not, join after the MOTD
      self.join();
    }
  };

  self.ERR_NICKNAMEINUSE = () => {
    self.config.irc.nickname += '_';
    self.write(`NICK ${self.config.irc.nickname}_`);
  };

  self.on_cap = (app, event) => {
    if (event.args[1] === 'LS') {
      // Don't blindly assume server supports our requested caps, even though server sends a CAP NACK response
      const servcaps = event.args[2].split(' ');

      for (const cap of servcaps) {
        if (self.stringcaps.includes(cap)) {
          self.availablecaps.push(cap);
        }
      }

      if (!self.availablecaps.length) {
        self.write('CAP END');
      } else {
        self.write(`CAP REQ :${self.availablecaps.join(' ')}`);
      }
    } else if (event.args[1] === 'ACK') {
      /*for (let cap of self.caps) { // Iterate over self.caps so we have access to classes
        if (typeof cap !== 'string' && self.availablecaps.includes(cap.name)) { // Check that the cap is in self.availablecaps
          cap = new cap(self);
          if (typeof cap.run === 'function') { // Check if the cap has the `run` property
            cap.run(self); // Run the cap with the args collected during CAP LS
          } else {
            continue;
          }
        }
      }*/
    }
  };

  for (let i of Object.keys(self)) {
    if (i.startsWith('on_') || i.startsWith('RPL_') || i.startsWith('ERR_')) {
      let name = i.split('on_')[1] || i;

      self.irc_events.on(name.toUpperCase(), self[i]);
    }
  }
}

export = Events;
