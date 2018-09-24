import React from 'react';

import PropTypes from 'prop-types';

import { BrowserRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import IndexPage from './pages/IndexPage';
import RepoSettingsPage from './pages/RepoSettingsPage';

import store from './store/store';

import './App.css';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const styles = {
  root: {
    flexGrow: 1
  }
};

/**
 * App bar component
 */
class SimpleAppBar extends React.Component {
  /** Renders the component
   * @return {React.ReactElement}
   */
  render() {
    return (
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="title" color="inherit">
              GNS
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

withStyles(styles)(SimpleAppBar);

/** The root application component */
class App extends React.Component {
  /** Renders the component
   * @return {React.ReactElement}
   */
  render() {
    return (
      <React.Fragment>
        <SimpleAppBar/>
        <Provider store={store}>
          <BrowserRouter>
            <React.Fragment>
              <Route exact path="/" component={IndexPage} />
              <Route exact path="/repo/:rUser/:rName" component={RepoSettingsPage} />
            </React.Fragment>
          </BrowserRouter>
        </Provider>
      </React.Fragment>
    );
  }
}

export default App;
