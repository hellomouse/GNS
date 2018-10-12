import React from 'react';

import PropTypes from 'prop-types';

import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';

/**
 * Switch with Label
 */
class SwitchLabel extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    checked: PropTypes.bool,
    onChange: PropTypes.func
  };
  state = {
    checked: this.props.checked !== undefined ? this.props.checked : false
  };

  /**
   * @param {string} name
   * @return {function(Event):void}
   */
  handleChange = name => event => this.setState({ [name]: event.target.checked });

  /**
   * @return {React.ReactElement}
   */
  render() {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={this.props.checked}
            onChange={
              this.props.onChange !== undefined ? this.props.onChange : this.handleChange('checked')
            }
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
