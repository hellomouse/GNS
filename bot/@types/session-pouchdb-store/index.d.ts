declare module "session-pouchdb-store" {
  import session = require("express-session");
  import express = require("express");

  interface PouchSessionOptions extends session.SessionOptions {
    maxIdle?: number
    scavenge?: number
    purge?: number
  }


  class SessionStore extends session.Store {
    constructor(pouchdb?: PouchDB.Database | string, options?: PouchSessionOptions,)
    regenerate: (req: express.Request, fn: (err?: any) => any) => void;
    load: (sid: string, fn: (err: any, session?: Express.SessionData | null) => any) => void;
    createSession: (req: express.Request, sess: Express.SessionData) => void;

    get: (sid: string, callback: (err: any, session?: Express.SessionData | null) => void) => void;
    set: (sid: string, session: Express.SessionData, callback?: (err?: any) => void) => void;
    destroy: (sid: string, callback?: (err?: any) => void) => void;
    all: (callback: (err: any, obj?: { [sid: string]: Express.SessionData; } | null) => void) => void;
    length: (callback: (err: any, length?: number | null) => void) => void;
    clear: (callback?: (err?: any) => void) => void;
    touch: (sid: string, session: Express.SessionData, callback?: (err?: any) => void) => void;
  }

  export = SessionStore;
}
