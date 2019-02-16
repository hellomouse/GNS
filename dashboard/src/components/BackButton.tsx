// @ts-check
import React from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import ArrowBack from '@material-ui/icons/ArrowBack';

/** Custom Back button component */
class BackButton extends React.Component<RouteComponentProps> {
  public onClick: React.MouseEventHandler<HTMLButtonElement> = event => {
    event.preventDefault();
    this.props.history.goBack();
  }
  /**
   * @return {React.ReactElement}
   */
  public render(): React.ReactNode {
    return (
      <Button variant='extendedFab' color='primary' className='back-btn' onClick={ this.onClick }>
        <ArrowBack/> Back
      </Button>
    );
  }
}

export default withRouter(connect<any, null>(null, null)(BackButton));
