import React from 'react';

import PropTypes from 'prop-types';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import store, { storeGetRepos } from '../store/store';

import Loading from '../components/Loading';

/** Provides list of available repositories */
class RepoList extends React.Component {
  static propTypes = {
    repos: PropTypes.array.isRequired,
    gotRepos: PropTypes.bool.isRequired,
    history: PropTypes.object.isRequired
  };

  /** Renders the component
   * @return {React.ReactElement}
   */
  render() {
    if (this.props.gotRepos) {
      return (
        <List>
          {this.props.repos.map(repo =>
            <ListItem key={`repo-list-repo-${repo}`} button
              onClick={() => { this.props.history.push(`/repo/${repo}`); }}>
              <ListItemText primary={repo} />
            </ListItem>
          )}
        </List>
      );
    }

    return (
      <Loading/>
    );
  }

  /** Gets executed when the component is mounted */
  async componentDidMount() {
    await storeGetRepos(store);
  }
}

/** Maps redux state to RepoList props
 * @param {Object} state
 * @return {Object}
 */
const mapStateToProps = state => {
  return {
    repos: state.repos,
    gotRepos: state.gotRepos
  };
};

export default withRouter(connect(mapStateToProps, null)(RepoList));
