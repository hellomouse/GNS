declare module "session-pouchdb-store" {
  import session = require("express-session");

  class SessionStore extends session.Store {
      constructor(pouchDB: PouchDB.Database<any> | string, config?: any);

      private _timers(): void
      private _subscribe(): void
  }

  export = SessionStore
}
