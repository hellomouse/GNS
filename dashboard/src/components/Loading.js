import React from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';

/**
 * @return {React.ReactElementp[]}
 */
function Loading() {
  return (
    <React.Fragment>
      <CircularProgress color="secondary" />
      <div>Loading...</div>
    </React.Fragment>
  );
}

export default Loading;
