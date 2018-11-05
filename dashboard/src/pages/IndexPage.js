import React from 'react';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import RepoList from '../components/RepoList';
import { getCookie } from '../App';

/** Index page of the app */
export default class IndexPage extends React.Component {
  /** Renders the component
   * @return {React.ReactElement}
   */
  render() {
    return (
      <Paper className="app-paper">
        <Typography variant="title">Repositories</Typography>
        <RepoList key="indexRepoList" />
      </Paper>
    );
  }
}
