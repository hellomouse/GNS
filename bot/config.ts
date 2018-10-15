export interface Config {
  members?: string[];
  config?: {
    irc: {
      server: string
      port: number
      nickname: string
      ident: string
      realname: string
      NickServPass: string
      channel: string
      sasl: {
        cert: Buffer | string
        key: Buffer | string
        key_passphrase: string
      }
      bindhost: string | null
      requireAuth: boolean
      notice: boolean
    }
    attentionString: string
    multipleCommitsMaxLen: number
    detailedDeletesAndCreates: boolean
  };
  repos?: {
    [key: string]: {
      enabled: boolean
    }
  };
}
