import events = require('events');
import Events = require('./irc/events');
import Parser = require('irc-stream-parser');
import tls = require('tls');
import fs = require('fs');
import probot = require('probot'); // eslint-disable-line no-unused-vars
import PouchDB = require('pouchdb');
import config = require('./config');

interface Event {
  command: any;
  numeric: any;
  raw: string;
  host: string;
  args: string[];
}
type EventFunction = (app: probot.Application, event: Event) => void;

// config DB
const db: PouchDB.Database<config.Config> = new PouchDB(process.env.POUCH_REMOTE);

/**
 * Strips formatting from IRC messages
 * @param {string} msg
 * @return {string}
 */
function strip_formatting(msg: string): string {
  /* eslint-disable no-control-regex */
  const ccodes: string[] = ['\\x0f', '\\x16', '\\x1d', '\\x1f', '\\x02', '\\x03([0-9][0-6]?)?,?([0-9][0-6]?)?'];
  /* eslint-enable no-control-regex */

  for (const cc of ccodes) {
    msg = msg.replace(new RegExp(cc, 'g'), '');
  }

  return msg;
}

declare class CapFunction {
  name: string;
  constructor(bot: IRC)
  run(): void;
}

/**
 * IRC connection wrapper
 */
class IRC {
  [key: string]: any;
  parser!: Parser;
  irc_events!: events.EventEmitter;
  app: probot.Application;
  org: string;
  config!: config.Config['config'];
  socket!: tls.TLSSocket;
  availablecaps!: string[];
  stringcaps!: string[];
  caps!: Array<string | CapFunction>;
  on_ping!: () => void;
  join!: () => void;
  on_396!: EventFunction;
  ERR_NICKNAMEINUSE!: EventFunction;
  on_cap!: EventFunction;
  args: any;
  events: any;

  /**
   * @param {probot.Application} app
   * @param {String} org
   */
  constructor(app: probot.Application, org: string) {
    this.app = app;
    this.org = org;
    this.app.log(org);
  }

  /**
   * @async
   * Initialiser function, since the constructor cannot be async
   */
  async init(): Promise<void> {
    this.config = (await db.get(this.org)).config;

    const { server, port, sasl } = this.config!.irc;

    this.socket = tls.connect(port, server, {
      cert: sasl!.cert ? fs.readFileSync(sasl!.cert) : undefined,
      key: sasl!.key ? fs.readFileSync(sasl!.key) : undefined,
      passphrase: sasl!.key_passphrase
    });

    this.parser = new Parser();
    this.irc_events = new events.EventEmitter();
    // eslint-disable-next-line new-cap
    Events(this);

    this.socket.on('connect', () => {
      const { nickname, ident, realname } = this.config.irc;

      this.app.log.info('Connected to IRC');
      this.write('CAP LS');
      this.write(`NICK ${nickname}`);
      this.write(`USER ${ident} 0 * :${realname}`);
    }).pipe(this.parser).on('data', (data: Event) => {
      this.app.log.debug(`>>> ${strip_formatting(data.raw)}`);
      this.irc_events.emit(data.command, this, data);
      this.irc_events.emit(data.numeric, this, data);
    });
  }

  /**
   * @param {string} message
   */
  write(message: string): void {
    this.socket.write(`${message}\r\n`);
    this.app.log.debug(`<<< ${strip_formatting(message)}`);
  }

  /**
   * @param {string} text The text to send to the server
   */
  privmsg(text: string): void {
    const method: string = this.config!.irc.notice ? 'NOTICE' : 'PRIVMSG';

    this.write(`${method} ${this.config!.irc.channel} :${text}`);
  }

}

export = IRC;
