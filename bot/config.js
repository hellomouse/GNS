module.exports = {
  orgs: {
    hellomouse: {
      irc: {
        server: 'irc.freenode.net',
        port: 6697,
        nickname: 'GNS',
        ident: 'GNS',
        realname: 'GitHub Notification Service',
        NickServPass: '',
        channel: '#YourGitChannel',
        sasl: {
          cert: null, // Path to cert for NickServ account for CertFP and sasl
          key: null, // Path to private key that goes with certificate
          key_passphrase: null
        },
        bindhost: null,
        requireAuth: true
      },
      attentionString: '!att-{name}-{event}', // '!att-{org}-{name}-{event}'
      multipleCommitsMaxLen: 4
    }
  },
  irc: {
    requireAuth: true
  },
  attentionString: '!att-{name}-{event}', // '!att-{org}-{name}-{event}'
  multipleCommitsMaxLen: 4
};
