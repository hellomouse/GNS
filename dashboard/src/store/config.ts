import { RepoSettings } from './api';

export interface Config {
  members: string[];
  config: {
    irc: {
      server: string;
      port: number;
      nickname: string;
      ident: string;
      realname: string;
      NickServPass?: string;
      channel: string;
      sasl?: {
        cert: Buffer | string;
        key: Buffer | string;
        key_passphrase?: string;
      };
      bindhost: string | null;
      requireAuth: boolean;
      notice: boolean;
    };
    attentionString: string;
    multipleCommitsMaxLen: number;
    detailedDeletesAndCreates: boolean;
  };
  repos: {
    [key: string]: RepoSettings;
  };
}

export const ConfigDefault: Config = {
  members: [],
  config: {
    irc: {
      server: '',
      port: 0,
      nickname: 'GNS',
      ident: 'git',
      realname: 'moo',
      channel: '##undefined',
      sasl: {
        cert: '',
        key: ''
      },
      bindhost: '',
      requireAuth: true,
      notice: true
    },
    attentionString: '!att',
    multipleCommitsMaxLen: 4,
    detailedDeletesAndCreates: true
  },
  repos: {}
};
