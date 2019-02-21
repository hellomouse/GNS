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

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';

import store, { storeGetRepoSettings, PassedStore } from '../store/store';

const theme = createMuiTheme({
  palette: {
    primary: green
  },
  typography: {
    useNextVariants: true
  }
});

interface Props extends RouteComponentProps<{
  rUser: string;
  rName: string
}> {
  gotRepoSettings: boolean;
  repoSettings: any;
}

/** Repo settings page of the app */
class RepoSettingsPage extends React.Component<Props> {
  /**
   * @param {Event} event
   */
  public onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Placeholder funtion
  }

  /** Renders the component
   * @return {React.ReactNode}
   */
  public render(): React.ReactNode {
    if (this.props.gotRepoSettings) {
      return (
        <React.Fragment>
          <BackButton/>
          <Paper className='app-paper'>
            <Typography variant='h6'>
            Settings for {this.props.match.params.rUser}/{this.props.match.params.rName}
            </Typography>

            <br/>

            <form onSubmit={this.onSubmit}>
              <SwitchLabel id='enabled' label='Enable this repository' checked={true} />
              <IRCSettings state={this.props.repoSettings}/>
              <Divider style={{ margin: '20px 0 20px' }}/>
              <br /><br />
              <EventPicker state={this.props.repoSettings}/>
              <Divider style={{ margin: '20px 0 20px' }}/>
              <MuiThemeProvider theme={theme}>
                <Button type='submit' color='primary' variant='contained' style={{ display: 'block' }}>Submit</Button>
              </MuiThemeProvider>
            </form>
          </Paper>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <BackButton/>
        <Paper className='app-paper'>
          <Loading/>
        </Paper>
      </React.Fragment>
    );
  }

  public async componentDidMount() {
    await storeGetRepoSettings(store, `${this.props.match.params.rUser}/${this.props.match.params.rName}`);
  }
}

/** Maps redux state to RepoSettingsPage props
 * @param {Object} state
 * @return {Object}
 */
const mapStateToProps = (state: {
  repos: string[];
  gotRepos: boolean;
  gotRepoSettings: boolean
  repoSettings: {
    [key: string]: {
      [key: string]: any;
      enabled?: boolean | undefined;
    } | undefined;
  };
}) => {
  return {
    repoSettings: state.repoSettings,
    gotRepoSettings: state.gotRepoSettings
  };
};

export default withRouter(connect(mapStateToProps, null)(RepoSettingsPage));
