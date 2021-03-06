import express = require('express');
import session = require('express-session');
import request = require('request');
import querystring = require('querystring');
import randomstring = require('randomstring');
import probot = require('probot'); // eslint-disable-line no-unused-vars
import Octokit = require('@octokit/rest');
import PouchDB = require('pouchdb');
import fs = require('fs');
import jwt = require('jsonwebtoken');
import { Config, ConfigDefault } from './config';
import PouchSesion = require('@hellomouse/session-pouchdb-store');

const octokit = new Octokit();
const key = fs.readFileSync('./private-key.pem').toString();

const redirect_uri = `${process.env.HOST}/redirect`;

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:63.0) Gecko/20100101 Firefox/63.0'
};

const db = new PouchDB<Config>(process.env.POUCH_REMOTE);

/**
 * A wrapper function around the web API stuff
 * @param {probot.Application} app The probot application
 */
export = function web(app: probot.Application) {
  const router = app.route('/');
  const loginDB = new PouchDB<{
    cookie: {
      originalMaxAge: number;
      expires: string;
      httpOnly: boolean;
      path: string;
    };
    $ts: number;
  }>(`${process.env.POUCH_REMOTE}_logins`);

  router.use(
    express.static('public'),
    session({
      secret: randomstring.generate(),
      cookie: { maxAge: 60000 },
      resave: false,
      saveUninitialized: true,
      store: new PouchSesion(loginDB)
    }),
    (req, res, next) => { // Security headers to avoid and/or limit attacks
      res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1;mode=block',
        'X-Frame-Options': 'sameorigin',
        'Strict-Transport-Security': 'max-age=31536000;includeSubDomains;preload',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        // tslint:disable-next-line:quotemark
        'Content-Security-Policy': `default-src 'self' https:;object-src 'none'` // TODO: Reduce it to only allow used origins
      });
      next();
    }
  );

  router.get('/login', (req, res) => {
    req.session!.csrf_string = randomstring.generate();
    const githubAuthUrl =
      `https://github.com/login/oauth/authorize?${
        querystring.stringify({
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
      request.post(
        {
          url:
            `https://github.com/login/oauth/access_token?${
              querystring.stringify({
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
          req.session!.access_token = querystring.parse(body).access_token;
          res.redirect('/user');
        }
      );
    } else {
      app.log.error(`Expected ${req.session!.csrf_sring}, but got ${returnedState}`);
      res.redirect('/');
    }
  });

  router.get('/user', async (req, res) => {
    octokit.authenticate({
      type: 'oauth',
      key: process.env.CLIENT_ID || '',
      secret: process.env.CLIENT_SECRET || ''
    });
    octokit.authenticate({ type: 'oauth', token: req.session!.access_token });
    const { data: emails } = await octokit.users.listEmails({});
    const { data: orgs } = await octokit.orgs.listForAuthenticatedUser({});

    let orgDB: (Config & PouchDB.Core.IdMeta & PouchDB.Core.GetMeta) | undefined;

    for await (const org of orgs) {
      try {
        orgDB = await db.get(org.login);
      } catch (e) {
        const err: Error = e;

        if (err.name === 'not_found') {
          await db.put({ _id: org.login, ...ConfigDefault });
          orgDB = await db.get(org.login);
        }
      }
      const { data: repos } = await octokit.repos.listForOrg({ org: org.login });
      const { data: members } = await octokit.orgs.listMembers({ org: org.login, role: 'admin' });

      for (const { login: member } of members) {
        if (!orgDB!.members.includes(member)) {
          orgDB!.members!.push(member);
        }
      }

      for (const repo of repos) {
        if (!orgDB!.repos[repo.full_name!]) {
          orgDB!.repos[repo.full_name!] = { enabled: true };
        }
      }
      db.put(orgDB!);
    }

    res.send(
      `<p>You're logged in! Here's all your emails on GitHub: </p>${JSON.stringify(emails)}
            <p>Here are all your orgs that I have access to: </p>${JSON.stringify(orgs)}
            <p>Go back to <a href="./">log in page</a>.</p>`
    );
  });

  router.all('/setup', async (req, res) => {
    // Needs to be used in conjunction with the following events:
    // installation, integration_installation, installation_repositories, integration_installation_repositories
    app.log.debug(`Query strings for /setup: ${JSON.stringify(req.query)}`);
    app.log.debug(`headers: ${JSON.stringify(req.headers)}`);
    const payload = {
      iss: process.env.APP_ID,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (10 * 60)
    };

    octokit.authenticate({
      type: 'app',
      token: jwt.sign(payload, key, { algorithm: 'RS256' })
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
