import React from 'react';
import Button from '@material-ui/core/Button';
import ArrowBack from '@material-ui/icons/ArrowBack';

/** Custom Back button component */
class BackButton extends React.Component {
  /**
   * @return {React.ReactElement}
   */
  render() {
    return (
      <Button variant="extendedFab" color="primary" className="back-btn"
        onClick={
          function() {}
        }>
        <ArrowBack/> Back
      </Button>
    );
  }
}

export default BackButton;
