const Parser = require('irc-stream-parser');
const tls = require('tls');
const { readFileSync } = require('fs');

// Config
const config = require('./config')

class IRC {

    constructor (app) {

        this.app = app;
        this.socket = tls.connect(config.irc.port, config.irc.server, {
                localaddress: config.irc.bindhost,
                cert: config.irc.sasl.cert ? readFileSync(config.irc.sasl.cert) : null,
                key: config.irc.sasl.key ? readFileSync(config.irc.sasl.key): null,
                passphrase: config.irc.sasl.key_passphrase
            });
        this.parser = new Parser();
        
        this.socket.pipe(this.parser).on('data', data => {
          this.app.log(`>>> ${data.raw}`);
          
          // Ping
          if (data.command === 'PING') this.write('PONG');

          // Joining channels after being authenticated
          if (data.numeric === 396) this.write(`JOIN ${config.irc.channel}`);

        });

        this.write(`NICK ${config.irc.nickname}`);
        this.write(`USER ${config.irc.ident} 0 * :${config.irc.realname}`);
        this.write(`PRIVMSG NickServ :identify ${config.irc.NickServPass}`);

    }

    /**
    * @param {String} message
    */
    write(message) {
        this.socket.write(`${message}\r\n`)
        this.app.log(`<<< ${message}`);
    }
    
    /**
    * @param {String} text
    */
    privmsg(text) {
        this.write(`PRIVMSG ${config.irc.channel} :${text}`)
    }

}

module.exports = IRC;