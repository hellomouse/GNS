import React from 'react';

import TextField from '@material-ui/core/TextField';

/**
 * @extends {React.Component}
 * @class
 * @desc IRC Settings component for the repo settings page
 */
export default class IRCSettings extends React.Component {
  /** Renders the component
  * @return {React.ReactElement}
  */
  render() {
    return (
      <React.Fragment>
        <div className="sameline">
          <TextField className="rsp-entry input-margin" id="ircHost" label="IRC server host"
            style={{ width: '180%' }} />
          <TextField className="rsp-entry input-margin" id="ircPort" label="IRC server port" type="number" />
        </div>
        <div className="sameline">
          <TextField className="rsp-entry input-margin" id="ircNick" label="IRC nickname" />
          <TextField className="rsp-entry input-margin" id="ircUser" label="IRC username/ident" />
        </div>
        <div className="sameline">
          <TextField className="rsp-entry input-margin" id="ircPass" label="IRC password (leave blank for none)" />
          <TextField className="rsp-entry input-margin" id="ircRnam" label="IRC realname/gecos" />
        </div>
        <div className="sameline">
          <TextField className="rsp-entry input-margin" id="ircChannel" label="IRC channel" />
        </div>
      </React.Fragment>
    );
  }
}