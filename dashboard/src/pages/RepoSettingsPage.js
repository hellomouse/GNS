import React from 'react';

import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import store, { storeGetRepoSettings } from '../store/store';

/** Repo settings page of the app */
class RepoSettingsPage extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    repoSettings: PropTypes.object.isRequired
  };

  /** Renders the component
   * @return {React.ReactElement}
   */
  render() {
    return (
      <Paper className="app-paper">
        <Typography variant="title">
          Settings for {this.props.match.params.rUser}/{this.props.match.params.rName}

          <TextField className="rsp-entry" id="ircHost" label="IRC server host" /><br/>
          <TextField className="rsp-entry" id="ircPort" label="IRC server port" /><br/>
          <TextField className="rsp-entry" id="ircNick" label="IRC nickname" /><br/>
          <TextField className="rsp-entry" id="ircUser" label="IRC username/ident" /><br/>
          <TextField className="rsp-entry" id="ircPass" label="IRC password (leave blank for none)" /><br/>
          <TextField className="rsp-entry" id="ircRnam" label="IRC realname/gecos" /><br/>
          <TextField className="rsp-entry" id="ircChannel" label="IRC channel" /><br/>

        </Typography>
      </Paper>
    );
  }

  /** Gets executed when the component is mounted */
  componentDidMount() {
    storeGetRepoSettings(store, `${this.props.match.params.rUser}/${this.props.match.params.rName}`);
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
