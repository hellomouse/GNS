import React from 'react';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import RepoList from '../components/RepoList';
import { getCookie } from '../App';

/** Index page of the app */
export default class IndexPage extends React.Component {
  /** Renders the component
   * @return {React.ReactNode}
   */
  public render(): React.ReactNode {
    return (
      <Paper className='app-paper'>
        <Typography variant='h6'>Repositories</Typography>
        <RepoList key='indexRepoList' />
      </Paper>
    );
  }
}
