// @ts-check
import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import SwitchLabel from '../SwitchLabel';

interface EventPickerState {
  [key: string]: any;
  checkedGitHub: boolean;
  checkedEvent: boolean;
  config: any;
}

interface EventPickerProps {
  state: any;
}

/**
* EventPicker component
*/
class EventPicker extends React.Component<EventPickerProps, EventPickerState> {
  static propTypes = {
    state: PropTypes.object
  };

  /**
   * Function to enable all default GitHub events
   * @param {Event} event
   */
  enableAllGitHub: React.ChangeEventHandler<HTMLInputElement> = event => {
    this.setState({
      checkedGitHub: event.target.checked,
      checkedEvent: event.target.checked
    });
  }

  componentWillMount() {
    this.setState({
      config: this.props.state,
      checkedGitHub: false,
      checkedEvent: false
    });
  }

  /**
   * @return {React.ReactElement}
   */
  render(): React.ReactNode {
    const repo = Object.keys(this.props.state)[0];

    return (
      <FormGroup>
        <Typography variant='subtitle1'>Events</Typography>
        <SwitchLabel label='Enable all GitHub defaults' id='github-defaults'
          onChange={this.enableAllGitHub}
          checked={this.state.checkedGitHub} />
        {Object.keys(this.props.state[repo].events).map(event =>
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
