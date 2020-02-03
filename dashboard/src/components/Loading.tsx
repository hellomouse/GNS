/* eslint-disable react/prop-types */
// @ts-check
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

interface Props {
  classes: Record<'flex' | 'flx-center' | string, string>;
}

/**
 * @param {Props} props
 * @return {React.ReactElement}
 */
const Loading: React.FunctionComponent<Props> = props => {
  return (
    <div className={props.classes.flex}>
      <div className={props.classes['flex-center']}>
        <CircularProgress color='secondary' size={100} />
        <Typography variant='body1' gutterBottom>
          Loading
        </Typography>
      </div>
    </div>
  );
};

export default withStyles(styles)(Loading);
