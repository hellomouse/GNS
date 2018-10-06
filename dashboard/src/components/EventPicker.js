import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';

/**
 * @return {React.ReactHTMLElement}
 */
export default function EventPicker() {
  return (
    <FormGroup>
      <Typography variant="subheading">Events</Typography>
      <FormControlLabel
        control={
          <Checkbox />
        }
        label="Subscribe to this event"
      />
    </FormGroup>
  );
}
