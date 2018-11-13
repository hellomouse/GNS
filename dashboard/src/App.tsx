import React from 'react';

import { BrowserRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import IndexPage from './pages/IndexPage';
import RepoSettingsPage from './pages/RepoSettingsPage';
import LoginPage from './pages/LoginPage';

import store from './store/store';
import GitHubLogin from './components/GitHubLogin';
import SimpleAppBar from './components/SimpleAppBar';

import './App.css';

/**
 * Get a cookie
 * @param {string} cname The cookie name to get
 * @return {string}
 */
export function getCookie(cname: string): string {
  let name = `${cname}=`;
  let cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }

  return '';
}

/** The root application component */
class App extends React.Component {
  /** Renders the component
   * @return {React.ReactNode}
   */
  render(): React.ReactNode {
    return (
      <React.Fragment>
        <SimpleAppBar classes={{ grow: 'grow' }}>
          <GitHubLogin />
        </SimpleAppBar>
        <Provider store={store}>
          <BrowserRouter>
            <React.Fragment>
              <Route exact path='/' component={IndexPage} />
              <Route exact path='/repo/:rUser/:rName' component={RepoSettingsPage} />
              <Route exact path='/login' component={LoginPage} />
            </React.Fragment>
          </BrowserRouter>
        </Provider>
      </React.Fragment>
    );
  }
}

export default App;
