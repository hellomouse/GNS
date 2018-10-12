import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import SwitchLabel from './SwitchLabel';

/**
* EventPicker component
*/
export default class EventPicker extends React.Component {
  /**
   * Function to enable all default GitHub events
   * @param {Event} event
   */
  enableAllGitHub = event => {
    this.setState({
      checkedGitHub: event.target.checked,
      checkedA: event.target.checked
    });
  };

  state = {
    checkedGitHub: true,
    checkedA: false
  };

  /**
   * @return {React.ReactElement}
   */
  render() {
    return (
      <FormGroup>
        <Typography variant="subheading">Events</Typography>
        <SwitchLabel label="Enable all GitHub defaults" id="github-defaults"
          onChange={this.enableAllGitHub}
          checked={this.state.checkedGitHub} />
        <FormControlLabel
          control={
            <Checkbox checked={this.state.checkedA}/>
          }
          label="Subscribe to this event"
        />
      </FormGroup>
    );
  }
}
