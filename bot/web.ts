import { static as serveStatic } from 'express';
import session from 'express-session';
import { post } from 'request';
import { stringify, parse } from 'querystring';
import { generate } from 'randomstring';
import { Application } from 'probot'; // eslint-disable-line no-unused-vars
import Octokit, { AuthOAuthSecret } from '@octokit/rest';
import PouchDB from 'pouchdb';
import { readFileSync } from 'fs';
import { sign } from 'jsonwebtoken';
import { Config } from './config';

const octokit = new Octokit();
const key = readFileSync('./private-key.pem').toString();

const redirect_uri = `${process.env.HOST}/redirect`;

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:63.0) Gecko/20100101 Firefox/63.0'
};

/**
 * A wrapper function around the web API stuff
 * @param {Application} app The probot application
 */
export default async function web(app: Application) {
  const router = app.route('/');

  router.use(serveStatic('public'));
  router.use(
      session({
        secret: generate(),
        cookie: { maxAge: 60000 },
        resave: false,
        saveUninitialized: false
      })
  );
  router.use((req, res, next) => { // Security headers to avoid and/or limit attacks
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1;mode=block',
      'X-Frame-Options': 'sameorigin',
      'Strict-Transport-Security': 'max-age=31536000;includeSubDomains;preload',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // tslint:disable-next-line:quotemark
      'Content-Security-Policy': `default-src 'self' https:;object-src 'none'` // TODO: Reduce it to only allow used origins
    });
  });
  router.get('/login', (req, res) => {
    req.session!.csrf_string = generate();
    const githubAuthUrl =
      `https://github.com/login/oauth/authorize?${
        stringify({
          client_id: process.env.CLIENT_ID,
          redirect_uri,
          state: req.session!.csrf_string,
          scope: 'user:email read:org'
        })}`;

    res.redirect(githubAuthUrl);
  });

  router.all('/redirect', (req, res) => {
    const code = req.query.code;
    const returnedState = req.query.state;

    if (req.session!.csrf_string === returnedState) {
      post(
          {
            url:
            `https://github.com/login/oauth/access_token?${
              stringify({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code,
                redirect_uri,
                state: req.session!.csrf_string
              })}`,
            headers
          },
          (error, response, body) => {
            if (error) throw error;
            req.session!.access_token = parse(body).access_token;
            res.redirect('/user');
          }
      );
    } else {
      app.log.error(`Expected ${req.session!.csrf_sring}, but got ${returnedState}`);
      res.redirect('/');
    }
  });

  router.get('/user', async (req, res) => {
    const authenticate = (auth: AuthOAuthSecret) => { octokit.authenticate(auth); }; // Needed because stupid linters can't detect type properly
    authenticate({
      type: 'oauth',
      key: process.env.CLIENT_ID || '',
      secret: process.env.CLIENT_SECRET || ''
    });
    octokit.authenticate({ type: 'oauth', token: req.session!.access_token });
    const { data: emails } = await octokit.users.getEmails();
    const { data: orgs } = await octokit.users.getOrgs();

    const db: PouchDB.Database<Config> = new PouchDB(process.env.POUCH_REMOTE || '');
    const defaults = {
      enabled: true
    };
    let orgDB: any;

    for await (const org of orgs) {
      try {
        orgDB = await db.get(org.login);
      } catch (e) {
        if (e.name === 'not_found') {
          db.put({ _id: org.login });
          orgDB = await db.get(org.login);
        }
      }
      const { data: repos } = await octokit.repos.getForOrg({ org: org.login });
      const { data: members } = await octokit.orgs.getMembers({ org: org.login, role: 'admin' });

      for (let { login: member } of members) {
        if (!orgDB.members!.includes(member)) {
          orgDB.members!.push(member);
        }
      }

      for (let repo of repos) {
        if (!orgDB[repo.full_name!])
          orgDB[repo.full_name!] = { ...defaults };
      }
      db.put(orgDB);
    }

    res.send(
        `<p>You're logged in! Here's all your emails on GitHub: </p>${JSON.stringify(emails)}
            <p>Here are all your orgs that I have access to: </p>${JSON.stringify(orgs)}
            <p>Go back to <a href="./">log in page</a>.</p>`
    );
  });

  router.all('/setup', async (req, res) => {
    app.log.debug(`Query strings for /setup: ${JSON.stringify(req.query)}`);
    app.log.debug(`headers: ${JSON.stringify(req.headers)}`);
    const payload = {
      iss: process.env.APP_ID,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (10 * 60)
    };

    octokit.authenticate({
      type: 'app',
      token: sign(payload, key, { algorithm: 'RS256' })
    });
    try {
      const params = { installation_id: req.query.installation_id };
      const { data: installation } = await octokit.apps.createInstallationToken(params);

      req.session!.access_token = installation.token;
      res.redirect('/user');
    } catch (e) {
      res.status(400).end();
    }
  });
};
