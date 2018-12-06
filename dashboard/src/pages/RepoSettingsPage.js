import React from 'react';

import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import green from '@material-ui/core/colors/green';
import Button from '@material-ui/core/Button';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import EventPicker from '../components/RepoSettings/EventPicker';
import BackButton from '../components/BackButton';
import IRCSettings from '../components/RepoSettings/IRCSettings';
import SwitchLabel from '../components/SwitchLabel';
import Loading from '../components/Loading';


import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import store, { storeGetRepoSettings } from '../store/store';


const theme = createMuiTheme({
  palette: {
    primary: green
  }
});

/** Repo settings page of the app */
class RepoSettingsPage extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    repoSettings: PropTypes.object.isRequired,
    gotRepoSettings: PropTypes.bool.isRequired
  };

  /**
   * @param {Event} event
   */
  onSubmit = event => {
    event.preventDefault();
    // Placeholder funtion
  };

  /** Renders the component
   * @return {React.ReactElement}
   */
  render() {
    if (this.props.gotRepoSettings) {
      return (
        <React.Fragment>
          <BackButton/>
          <Paper className="app-paper">
            <Typography variant="title">
            Settings for {this.props.match.params.rUser}/{this.props.match.params.rName}
            </Typography>

            <br/>

            <form onSubmit={this.onSubmit}>
              <SwitchLabel id="enabled" label="Enable this repository" checked={true} />
              <IRCSettings state={this.props.repoSettings}/>
              <Divider style={{ margin: '20px 0 20px' }}/>
              <br /><br />
              <EventPicker state={this.props.repoSettings}/>
              <Divider style={{ margin: '20px 0 20px' }}/>
              <MuiThemeProvider theme={theme}>
                <Button type="submit" color="primary" variant="contained" style={{ display: 'block' }}>Submit</Button>
              </MuiThemeProvider>
            </form>
          </Paper>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <BackButton/>
        <Paper className="app-paper">
          <Loading/>
        </Paper>
      </React.Fragment>
    );
  }

  async componentDidMount() {
    await storeGetRepoSettings(store, `${this.props.match.params.rUser}/${this.props.match.params.rName}`);
  }
}

/** Maps redux state to RepoSettingsPage props
 * @param {Object} state
 * @return {Object}
 */
const mapStateToProps = state => {
  return {
    repoSettings: state.repoSettings,
    gotRepoSettings: state.gotRepoSettings
  };
};

export default withRouter(connect(mapStateToProps, null)(RepoSettingsPage));
