import React from 'react';
import ReactDOM from 'react-dom';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import './index.css';

import App from './App';

import registerServiceWorker from './registerServiceWorker';

const theme = createMuiTheme({
  palette: {
    primary: { main: '#142646' },
    secondary: { main: '#284a8a' }
  }
});

ReactDOM.render(<MuiThemeProvider theme={theme}><App/></MuiThemeProvider>, document.getElementById('root'));
registerServiceWorker();
