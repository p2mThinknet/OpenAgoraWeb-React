import React from 'react'
import * as Cookies from 'js-cookie'

import '../../assets/fonts/css/icons.css'
import './index.css'
import UserLoginInfo from "./userLoginInfo";

const moment = require('moment');

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.userSigninList = [];
    this.state = {
      joinBtn: true,
      channel: 'p2m13456',
      baseMode: 'avc',
      transcode: 'interop',
      attendeeMode: 'audience',//video-only, audio-only, audience
      videoProfile: '480p_4',
      signinBtn: false,
      userSigninList: []
    }
  };

  componentDidMount() {
      const self = this;
      this.props.socket.on('startSignin', function(data) {
        self.setState({
            signinBtn: true
        })
      });

      this.props.socket.on('startConference', function(data) {
        self.handleJoin();
      });

      this.props.socket.on('loginInfo', function(data) {
          if(self.userSigninList.indexOf(data) === -1) {
              self.userSigninList.push(data);
              self.setState({
                  userSigninList: self.userSigninList
              });
          }
      });
      self.handleJoin();
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
                {this.state.signinBtn ? <p style={{fontSize: 24}}>请扫码签到</p> : <p style={{fontSize: 24}}>皮图麦视频会议系统</p>}
                {this.state.signinBtn ? <img src={require('../../assets/images/barcode.png')} alt="" /> : <img src={require('../../assets/images/ag-logo.png')} alt="" />}
            </div>
          </section>
        </div>
          {this.state.signinBtn ? <div style={{position:'absolute', width: '200px', height: '100%', right:0, backgroundColor:'rgba(120, 120, 120, 0.4)', paddingTop: '10px',paddingLeft: '5px', paddingRight: '5px'}}>
                  {this.state.userSigninList.map((loginInfo) => (
                      <UserLoginInfo
                          userName={loginInfo.split(':')[0]}
                          loginTime={moment().format('MM-DD HH:mm')}
                          loginType={loginInfo.split(':')[1]}
                      />
                  ))}
          </div> : <div/>}
      </div>
    );
  }
}

export default Index