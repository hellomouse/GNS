// @ts-check
import React from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';

/**
 * @extends {React.Component}
 * @class
 * @desc IRC Settings component for the repo settings page
 */
class IRCSettings extends React.Component<{state: any}> {
  /** Renders the component
  * @return {React.ReactElement}
  */
  public render(): React.ReactNode {
    this.setState(this.props.state);
    return (
      <React.Fragment>
        <div className='sameline'>
          <TextField className='rsp-entry input-margin extra-width' id='ircHost' label='IRC server host'
            defaultValue='chat.freenode.net' />
          <TextField className='rsp-entry input-margin' id='ircPort' label='IRC server port' type='number'
            defaultValue={6697} />
        </div>
        <div className='sameline'>
          <TextField className='rsp-entry input-margin' id='ircNick' label='IRC nickname'
            defaultValue='GNS' />
          <TextField className='rsp-entry input-margin' id='ircUser' label='IRC username/ident' />
        </div>
        <div className='sameline'>
          <TextField className='rsp-entry input-margin' id='ircPass' label='IRC password (leave blank for none)' />
          <TextField className='rsp-entry input-margin' id='ircRnam' label='IRC realname/gecos'
            defaultValue='GitHub Notification System by Hellomouse' />
        </div>
        <div className='sameline'>
          <TextField className='rsp-entry input-margin' id='ircChannel' label='IRC channel' />
        </div>
      </React.Fragment>
    );
  }
}

export default IRCSettings;
