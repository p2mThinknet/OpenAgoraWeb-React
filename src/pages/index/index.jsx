import React from 'react'
import * as Cookies from 'js-cookie'

import '../../assets/fonts/css/icons.css'
import './index.css'


class Index extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      joinBtn: true,
      channel: 'p2m13456',
      baseMode: 'avc',
      transcode: 'interop',
      attendeeMode: 'audience',//video-only, audio-only, audience
      videoProfile: '480p_4',
    }
  };

  componentDidMount() {
      const self = this;
      this.props.socket.on('startConference', function(data) {
        self.handleJoin();
      });

      this.props.socket.on('loginInfo', function(data) {

      });
  };

  handleJoin = () => {
    if (!this.state.joinBtn) {
      return
    }
    console.log(this.state);
    Cookies.set('channel', this.state.channel);
    Cookies.set('baseMode', this.state.baseMode);
    Cookies.set('transcode', this.state.transcode);
    Cookies.set('attendeeMode', this.state.attendeeMode);
    Cookies.set('videoProfile', this.state.videoProfile);
    window.location.hash = "meeting"
  };

  render() {
    return (
      <div className="wrapper index">
        <div className="ag-header"/>
        <div className="ag-main">
          <section className="login-wrapper">
            <div className="login-header">
              <img src={require('../../assets/images/ag-logo.png')} alt="" />
              <p className="login-title">皮图麦视频会议系统</p>
            </div>
            <div className="login-body">
              <div className="columns">
                <div className="column is-12">
                  <InputChannel/>
                </div>
              </div>
            </div>
            <div className="login-footer">
              <a id="joinBtn"
                onClick={this.handleJoin}
                disabled={!this.state.joinBtn}
                className="ag-rounded button is-info">Join
                  </a>
            </div>
          </section>
        </div>
        <div className="ag-footer">
            <span>Powered By P2M</span>
        </div>
      </div>
    );
  }
}

class InputChannel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      errorMsg: '',
      state: ''
    }
  };

  render() {
    return (
      <div className="channel-wrapper control has-icons-left">
        <input
          id="channel"
          className={'ag-rounded input ' + this.state.state}
          type="text"
          placeholder={this.props.placeholder}
          value={'p2m13456'}
        disabled={true}/>
        <span className="icon is-small is-left">
          <img src={require('../../assets/images/ag-login.png')} alt="" />
        </span>
      </div>
    )
  }
}

export default Index