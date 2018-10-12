import React from 'react';

import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import green from '@material-ui/core/colors/green';
import Button from '@material-ui/core/Button';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import EventPicker from '../components/EventPicker';
import BackButton from '../components/BackButton';
import IRCSettings from '../components/IRCSettings';
import SwitchLabel from '../components/SwitchLabel';


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
    repoSettings: PropTypes.object.isRequired
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
            <IRCSettings />
            <Divider style={{ margin: '20px 0 20px' }}/>
            <br /><br />
            <EventPicker/>
            <Divider style={{ margin: '20px 0 20px' }}/>
            <MuiThemeProvider theme={theme}>
              <Button type="submit" color="primary" variant="contained" style={{ display: 'block' }}>Submit</Button>
            </MuiThemeProvider>
          </form>
        </Paper>
      </React.Fragment>
    );
  }

  /** Gets executed when the component is mounted */
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
    repoSettings: state.repoSettings
  };
};

export default withRouter(connect(mapStateToProps, null)(RepoSettingsPage));
