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

/** The root application component */
class App extends React.Component {
  /** Renders the component
   * @return {React.ReactElement}
   */
  render() {
    return (
      <React.Fragment>
        <SimpleAppBar classes={{ grow: 'grow' }}>
          <GitHubLogin />
        </SimpleAppBar>
        <Provider store={store}>
          <BrowserRouter>
            <React.Fragment>
              <Route exact path="/" component={IndexPage} />
              <Route exact path="/repo/:rUser/:rName" component={RepoSettingsPage} />
              <Route exact path="/login" component={LoginPage} />
            </React.Fragment>
          </BrowserRouter>
        </Provider>
      </React.Fragment>
    );
  }
}

export default App;
