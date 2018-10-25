import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import SwitchLabel from '../SwitchLabel';

/**
* EventPicker component
*/
class EventPicker extends React.Component {
  static propTypes = {
    state: PropTypes.object
  };

  /**
   * Function to enable all default GitHub events
   * @param {Event} event
   */
  enableAllGitHub = event => {
    this.setState({
      checkedGitHub: event.target.checked,
      checkedEvent: event.target.checked
    });
  };

  state = {
    config: this.props.state,
    checkedGitHub: false,
    checkedEvent: false
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
        {this.state.config.map(event =>
          <FormControlLabel key={`event-${event}`}
            control={
              <Checkbox checked={this.state[`checked${event}`]}/>
            }
            label={event.toUpperCase()}
          />
        )}
      </FormGroup>
    );
  }
}

export default EventPicker;
