import React from 'react';

import PropTypes from 'prop-types';

import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';

/**
 * Switch with Label
 */
class SwitchLabel extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    label: PropTypes.string
  };
  state = {
    checked: true
  };

  /**
   * @param {string} name
   * @return {function(Event):void}
   */
  handleChange = name => event => {
    this.setState({ [name]: event.target.checked });
  };

  /**
   * @return {React.ReactElement}
   */
  render() {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={this.state.checked}
            onChange={this.handleChange('checked')}
            value="checked"
            id={this.props.id}
          />
        }
        label={this.props.label}
      />
    );
  }
}

export default SwitchLabel;
