import React from 'react';
import PropTypes from 'prop-types';

import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  flex: {
    width: '100%',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center'
  },
  'flex-center': {
    'align-self': 'flex-start'
  }
};

/**
 * @param {*} props
 * @return {React.ReactElement}
 */
function Loading(props) {
  return (
    <div className={props.classes.flex}>
      <div className={props.classes['flex-center']}>
        <CircularProgress color="secondary" size={100} />
        <Typography variant="body1" gutterBottom>
          Loading
        </Typography>
      </div>
    </div>
  );
}

Loading.propTypes = {
  classes: PropTypes.object
};

export default withStyles(styles)(Loading);
