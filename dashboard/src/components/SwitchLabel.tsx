// @ts-check
import React from 'react';

import PropTypes from 'prop-types';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

interface SwitchProps {
  label: string;
  checked: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  id: string;
}
/**
 * Switch with Label
 */
class SwitchLabel extends React.Component<SwitchProps> {
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
  // tslint:disable-next-line:max-line-length
  handleChange = (name: string): React.ChangeEventHandler<HTMLInputElement> => (event: React.ChangeEvent<HTMLInputElement>) => {
    return this.setState({ [name]: event.target.checked });
  }

  /**
   * @return {React.ReactElement}
   */
  render(): React.ReactNode {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={this.props.checked}
            onChange={
              this.props.onChange !== undefined ? this.props.onChange : this.handleChange('checked')
            }
            value='checked'
            id={this.props.id}
          />
        }
        label={this.props.label}
      />
    );
  }
}

export default SwitchLabel;
