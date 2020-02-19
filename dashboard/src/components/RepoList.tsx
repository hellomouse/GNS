import React from 'react';

import PropTypes from 'prop-types';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import redux from 'redux';

import store, { storeGetRepos, DefaultState } from '../store/store';

import Loading from './Loading';

interface RepoListProps extends RouteComponentProps {
  repos?: string[];
  gotRepos?: boolean;
}

/** Provides list of available repositories */
class RepoList extends React.Component<RepoListProps> {
  /** Renders the component
   * @return {React.ReactNode}
   */
  public render(): React.ReactNode {
    if (this.props.gotRepos) {
      return (
        <List>
          {this.props.repos!.map(repo =>
            <ListItem key={`repo-list-repo-${repo}`} button
              onClick={() => { this.props.history.push(`/repo/${repo}`); }}>
              <ListItemText primary={repo} />
            </ListItem>
          )}
        </List>
      );
    }

    return (
      <Loading />
    );
  }

  /** Gets executed when the component is mounted */
  public async componentDidMount() {
    await storeGetRepos(store);
  }
}

/**
 * Maps redux state to RepoList props
 * @param {DefaultState} state foo
 * @return {Object<string, string[] | boolean>}
 */
const mapStateToProps = (state: DefaultState) => {
  return {
    repos: state.repos,
    gotRepos: state.gotRepos
  };
};

export default withRouter<RepoListProps, React.ElementType<RepoListProps>>(connect(mapStateToProps, null)(RepoList));
