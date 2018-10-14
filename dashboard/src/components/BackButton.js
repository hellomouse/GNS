import React from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import ArrowBack from '@material-ui/icons/ArrowBack';

/** Custom Back button component */
class BackButton extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired
  };

  onClick = () => { this.props.history.goBack(); };
  /**
   * @return {React.ReactElement}
   */
  render() {
    return (
      <Button variant="extendedFab" color="primary" className="back-btn" onClick={ this.onClick }>
        <ArrowBack/> Back
      </Button>
    );
  }
}

export default withRouter(connect(null, null)(BackButton));
