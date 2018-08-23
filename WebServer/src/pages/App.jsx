import React, { Component } from 'react'
import { HashRouter as Router, Route } from 'react-router-dom'
import SocketIOClient from 'socket.io-client';
import 'bulma/css/bulma.css'

import './App.css'
import Index from './index'
import Meeting from './meeting'

class App extends Component {
    constructor(props) {
        super(props);
        this.socket = SocketIOClient('http://localhost:3001');
    };
  render() {
    return (
      <Router>
        <div className="full">
          <Route exact path="/" render={(props) => <Index {...props} socket={this.socket}/>} />
          <Route path="/meeting" render={(props) => <Meeting {...props} socket={this.socket}/>} />
        </div>
      </Router>
    )
  }
}

export default App
