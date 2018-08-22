// Discord library
const discord = require('discord.js');

// Config
const config = require('./config')['discord'];

module.exports = class Discord extends discord.Client {

  constructor(app) {
    super(); // Initalise the discord client
    this.app = app; // Just borrowing it

    // Authenticate with discord
    this.login(config.token);

    // Need to de-for loop
    this.on('ready', () => {
      let guilds = this.guilds.array(); // we can stop getting it then

      this.app.log('Logged into Discord!');
      for (let guild of guilds) {
        this.app.log(`Guild: ${ guild.name } with id: ${ guild.id}`);
        for (let channel of guild.channels.array()) {
          this.app.log(`--- #${ channel.name } with id: ${ channel.id}`);
          if (guild.id == config.channel.split('#')[0] && channel.id == config.channel.split('#')[1]) {
            this.channel = channel; // We'll have reference to this
          }
        }
      }
    });
  }

};
