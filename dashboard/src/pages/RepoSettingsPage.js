import React from 'react';

import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import ArrowBack from '@material-ui/icons/ArrowBack';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';

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
      <React.Fragment>
        <Button variant="extendedFab" color="primary" className="back-btn"><ArrowBack/> Back</Button>
        <Paper className="app-paper">
          <Typography variant="title">
          Settings for {this.props.match.params.rUser}/{this.props.match.params.rName}
          </Typography>

          <br/>

          <FormGroup>
            <FormControlLabel
              control={
                <Switch id="enabled"/>
              }
              label="Enable this repository"
            />
            <div className="sameline">
              <TextField className="rsp-entry input-margin" id="ircHost" label="IRC server host"
                style={{ width: '180%' }} />
              <TextField className="rsp-entry input-margin" id="ircPort" label="IRC server port" type="number" />
            </div>
            <div className="sameline">
              <TextField className="rsp-entry input-margin" id="ircNick" label="IRC nickname" />
              <TextField className="rsp-entry input-margin" id="ircUser" label="IRC username/ident" />
            </div>
            <div className="sameline">
              <TextField className="rsp-entry input-margin" id="ircPass" label="IRC password (leave blank for none)" />
              <TextField className="rsp-entry input-margin" id="ircRnam" label="IRC realname/gecos" />
            </div>
            <div className="sameline">
              <TextField className="rsp-entry input-margin" id="ircChannel" label="IRC channel" />
            </div>
            <Divider style={{ margin: '0 20px' }}/>
            <br /><br />
            <FormGroup>
              <Typography variant="subheading">Events</Typography>
              <FormControlLabel
                control={
                  <Checkbox />
                }
                label="Subscribe to this event"
              />
            </FormGroup>
          </FormGroup>


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
