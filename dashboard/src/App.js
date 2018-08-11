import React, { Component } from 'react';
import Switch from 'rc-switch';
import 'rc-switch/assets/index.css';
import logo from './logo.svg';
import './App.css';

function onChange(value) {
  console.log(`switch checked: ${value}`);
}

class App extends Component {
  constructor() {
    super();
    this.state={
      disabled: false
    };
  }

  toggle() {
    this.setState({
      disabled: !this.state.disabled
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
          <Switch
            onChange={onChange}
            disabled={this.state.disabled}
            checkedChildren={'开'}
            unCheckedChildren={'关'}
          />
        </p>
      </div>
    );
  }
}

export default App;
