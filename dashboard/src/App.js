import React from 'react';

import { BrowserRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import IndexPage from './pages/IndexPage';
import RepoSettingsPage from './pages/RepoSettingsPage';

import store from './store/store';

import './App.css';

/** The root application component */
class App extends React.Component {
  /** Renders the component
   * @return {React.ReactElement}
   */
  render() {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <div>
            <Route exact path="/" component={IndexPage} />
            <Route exact path="/repo/:rUser/:rName" component={RepoSettingsPage} />
          </div>
        </BrowserRouter>
      </Provider>
    );
  }
}

export default App;
