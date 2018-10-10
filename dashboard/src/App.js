import React from 'react';

import PropTypes from 'prop-types';

import { BrowserRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import IndexPage from './pages/IndexPage';
import RepoSettingsPage from './pages/RepoSettingsPage';

import store from './store/store';
import GitHub from './GitHub';

import './App.css';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import SvgIcon from '@material-ui/core/SvgIcon';

const styles = {
  root: {
    flexGrow: 1
  },
  logo: {
    height: '25px',
    width: 'auto'
  }
};

/* eslint-disable max-len */

/**
 * App bar component
 */
class SimpleAppBar extends React.Component {
  static propTypes = {
    classes: PropTypes.object
  };

  /** Renders the component
   * @return {React.ReactElement}
   */
  render() {
    return (
      <AppBar position="static" color="default">
        <Toolbar>
          <div color="inherit" className={this.props.classes.root}>
            <SvgIcon width="1000" height="500" viewBox="-49.595 -31.5 1000 500" className={this.props.classes.logo}>
              <path d="M275.215 350.175c-12.182 13.535-30.003 24.44-53.464 32.71s-49.178 12.407-77.15 12.407c-43.013 0-77.376-13.158-103.093-39.478C15.791 329.498 2.03 292.876.226 245.954L0 217.53c0-32.333 5.714-60.57 17.145-84.708 11.427-24.138 27.782-42.71 49.065-55.72 21.279-13.006 45.907-19.513 73.879-19.513 40.905 0 72.674 9.362 95.31 28.085 22.633 18.724 35.83 46.661 39.59 83.805h-76.248c-2.707-18.347-8.572-31.431-17.596-39.252-9.023-7.818-21.808-11.73-38.35-11.73-19.852 0-35.191 8.424-46.02 25.266-10.828 16.845-16.32 40.908-16.468 72.188v19.852c0 32.788 5.601 57.411 16.806 73.88 11.202 16.467 28.836 24.701 52.9 24.701 20.603 0 35.942-4.586 46.02-13.761v-50.982H140.99v-54.366h134.224v134.9zm320.332 40.605h-78.73L400.415 186.399V390.78h-79.181V62.327h79.181l116.177 204.381V62.327h78.955V390.78zM736.2 126.958c8.195-6.239 19.363-9.362 33.5-9.362 13.986 0 25.076 3.687 33.273 11.054 8.195 7.37 12.295 17.747 12.295 31.131h78.955c0-9.98-1.306-19.402-3.894-28.277-7.912 2.679-16.337 4.156-25.061 4.156-42.716 0-78.481-34.919-79.931-77.333a186.323 186.323 0 0 0-13.834-.511c-24.215 0-46.02 3.874-65.42 11.618-19.4 7.748-34.402 18.576-45.004 32.484-10.604 13.912-15.904 29.968-15.904 48.163 0 36.545 21.279 65.271 63.842 86.174 13.084 6.468 29.926 13.161 50.531 20.077 20.602 6.919 35 13.613 43.199 20.077 8.195 6.468 12.295 15.491 12.295 27.07 0 10.229-3.801 18.159-11.393 23.8-7.596 5.639-17.934 8.459-31.018 8.459-20.455 0-35.23-4.174-44.328-12.52-9.102-8.348-13.648-21.318-13.648-38.914H635.25c0 21.656 5.449 40.796 16.355 57.412 10.902 16.619 27.145 29.703 48.727 39.252 21.578 9.552 45.682 14.324 72.301 14.324 37.746 0 67.449-8.195 89.105-24.589 21.656-16.391 32.484-38.949 32.484-67.676 0-35.942-17.746-64.141-53.238-84.595-14.588-8.421-33.238-16.277-55.945-23.573-22.709-7.293-38.574-14.36-47.598-21.205-9.023-6.842-13.535-14.473-13.535-22.897.001-9.623 4.096-17.557 12.294-23.799z"/>
              <circle cx="863.823" cy="57.59" r="57.09" fill="#006eed" stroke="#24292e" strokeMiterlimit="10"/>
            </SvgIcon>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

SimpleAppBar = withStyles(styles)(SimpleAppBar); // eslint-disable-line

/** The root application component */
class App extends React.Component {
  /** Renders the component
   * @return {React.ReactElement}
   */
  render() {
    return (
      <React.Fragment>
        <SimpleAppBar/>
        <GitHub />
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
