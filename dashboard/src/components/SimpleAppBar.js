/* eslint-disable new-cap */
import React from 'react';

import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import Logo from './Logo';

const styles = {
  root: {
    flexGrow: 1
  },
  grow: {
    flexGrow: 1
  },
  'login-button': {
    marginLeft: -12,
    marginRight: 20
  },
  logo: {
    height: '25px',
    width: 'auto'
  }
};

/**
 * App bar component
 */
class SimpleAppBar extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.arrayOf(PropTypes.node)
    ]),
    classes: PropTypes.object
  };

  /** Renders the component
   * @return {React.ReactElement}
   */
  render() {
    return (
      <AppBar position="static" color="default">
        <Toolbar>
          <div color="inherit" className={this.props.classes.grow}>
            <Logo className={this.props.classes.logo} />
          </div>
          {this.props.children}
        </Toolbar>
      </AppBar>
    );
  }
}

export default withStyles(styles)(SimpleAppBar);
