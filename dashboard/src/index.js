import React from 'react';
import ReactDOM from 'react-dom';
import 'react-app-polyfill/ie11';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import './index.css';
import CssBaseline from '@material-ui/core/CssBaseline';

import App from './App';

import registerServiceWorker from './registerServiceWorker';

const theme = createMuiTheme({
  palette: {
    primary: { main: '#212121' },
    secondary: { main: '#fafafa' },
    type: 'dark'
  }
});

ReactDOM.render(<React.Fragment>
  <CssBaseline/>
  <main>
    <MuiThemeProvider theme={theme}>
      <App/>
    </MuiThemeProvider>
  </main>
</React.Fragment>, document.getElementById('root'));
registerServiceWorker();
