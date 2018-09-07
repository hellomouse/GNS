import React from 'react';

import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

// import store, { storeGetRepoSettings } from '../store/store';

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
        </Typography>
      </Paper>
    );
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
