import React from 'react'
//import { merge } from 'lodash'
import _ from 'lodash';
import $ from 'jquery';

import './canvas.css'
import '../../assets/fonts/css/icons.css'
import IndividualChatMessage from "./individualChatMessage";
import IndividualUserOnline from "./individualUserOnline";

const moment = require('moment');
/**
 * @prop appId uid
 * @prop transcode attendeeMode videoProfile channel baseMode
 * @prop socket-client
 */
class AgoraCanvas extends React.Component {

  constructor(props) {
    super(props);
    this.client = {};
    this.localStream = {};
    this.userOnlineTime = [];
    this.state = {
      streamList: [],
      readyState: false,
      userChatMsg: [],
      userOnlineTime: [],
      refreshSocketData: false,
      userChatTemp: '',
      finalChatResult: false,
    }
  }

  componentWillMount() {
    let $$ = this.props;
    // init AgoraRTC local client
    this.client = AgoraRTC.createClient({ mode: $$.transcode });
    this.client.init($$.appId, () => {
      console.log("AgoraRTC client initialized");
      this.subscribeStreamEvents();
      this.client.join($$.appId, $$.channel, $$.uid, (uid) => {
        console.log("User " + uid + " join channel successfully");
        console.log('At ' + new Date().toLocaleTimeString());
        this.localStream = this.streamInit(uid, $$.attendeeMode, $$.videoProfile);
        this.localStream.init(() => {
          this.setState({ readyState: true })
        },
          err => {
            console.log("getUserMedia failed", err);
            this.setState({ readyState: true })
          })
      })
    })
  }

  componentDidMount() {
    const self = this;
      this.props.socket.on('userOnline', function(data){
        //if(parseInt(userOnlineType) === 0){
          const userName = data.split(':')[0];
          const userTicker = data.split(':')[1];
            self.userOnlineTime = _.concat(
                _.filter(self.userOnlineTime, s => s.userName !== userName),
                { userName, userTicker: parseInt(userTicker) }
            );
            //this.userOnlineTime.so
            self.userOnlineTime = _.sortBy(self.userOnlineTime, function(o) { return o.userName; });

            self.setState({
                userOnlineTime: self.userOnlineTime
            });
        //}
      });
      this.props.socket.on('userChatTemp', function(data) {
          // self.state.userChatMsg.push(data);
          // self.setState({
          //     refreshSocketData: !self.state.refreshSocketData
          // })
          self.setState({
              userChatTemp: data,
              finalChatResult: false
          });
          self.listElement.scrollTop = self.listElement.scrollHeight;
      });
      this.props.socket.on('userChat', function(data) {
          self.state.userChatMsg.push(data);
          self.setState({
              refreshSocketData: !self.state.refreshSocketData,
              finalChatResult: true
          });
          self.listElement.scrollTop = self.listElement.scrollHeight;
      });
      this.props.socket.on('stopConference', function(data) {
          self.client && self.client.unpublish(self.localStream);
          self.localStream && self.localStream.close();
          self.client && self.client.leave(() => {
              console.log('Client succeed to leave.');
          }, () => {
              console.log('Client failed to leave.');
          });
          // 返回主屏幕
          window.location.hash = "/";
      });
  }

  componentDidUpdate() {
    // rerendering
      this.state.streamList.map((item) => {
          let id = item.getId();
          let dom = document.querySelector('#ag-item-' + id);
          if(!dom) {
              dom = document.createElement('div');
              dom.setAttribute('id', 'ag-item-' + id);
              dom.setAttribute('class', 'remotevideo');
              dom.setAttribute('style', 'width:200px;height:137px;display:inline-block;transform: rotateY(180deg)');
              document.getElementById('remote-video').appendChild(dom);
              item.play('ag-item-' + id);
              if(id === 1) {
                item.play('ag-local');
              }
              document.getElementById('ag-item-' + id).onclick = function() {
                  $($('#ag-local video')[0]).parent().remove();
                  item.play('ag-local');
              };
          }
      });
  }

  componentWillUnmount () {
    this.client && this.client.unpublish(this.localStream);
    this.localStream && this.localStream.close();
    this.client && this.client.leave(() => {
      console.log('Client succeed to leave.')
    }, () => {
      console.log('Client failed to leave.')
    })
  }

    formatSecondsAsTime(secs, format) {
        let hr  = Math.floor(secs / 3600);
        let min = Math.floor((secs - (hr * 3600)) / 60);
        let sec = Math.floor(secs - (hr * 3600) - (min * 60));

        if (hr < 10)   { hr    = "0" + hr; }
        if (min < 10) { min = "0" + min; }
        if (sec < 10)  { sec  = "0" + sec; }
        if (hr)            { hr   = "00"; }

        if (format != null) {
            let formatted_time = format.replace('hh', hr);
            formatted_time = formatted_time.replace('h', hr+""); // check for single hour formatting
            formatted_time = formatted_time.replace('mm', min);
            formatted_time = formatted_time.replace('m', min+""); // check for single minute formatting
            formatted_time = formatted_time.replace('ss', sec);
            formatted_time = formatted_time.replace('s', sec+""); // check for single second formatting
            return formatted_time;
        } else {
            return hr + ':' + min + ':' + sec;
        }
    }

  render() {
    return (
        <div style={{display:'flex',flex: 1,flexDirection:'row',height:'100%'}}>
          <div id="remote-video" style={{height:'100%', width:'200px',overflow: 'auto',transform: 'rotateY(180deg)'}}/>
          <div id="ag-local" style={{height:'100%', width:'calc(100% - 400px)'}}/>
          <div style={{display:'flex', flex:'1', flexDirection:'column', width:'200px', height:'100%',overflow: 'auto'}}>
            <div id="chat-div" style={{overflow: 'auto', paddingTop: '10px', height: '50%'}} ref={(list) => this.listElement = list}>
                {this.state.userChatMsg.map((chat) => (
                    <IndividualChatMessage
                      userName={chat.split(':')[0]}
                      postTime={moment().format('MM-DD HH:mm')}
                      chatMsg={chat.split(':')[1]}
                />
                ))}
                {this.state.finalChatResult ? <div/> : <div style={{color: 'white'}}>{this.state.userChatTemp}</div>}
            </div>
            <div id="userOnline-div" style={{overflow: 'auto', paddingTop: '10px', height: '50%'}}>
                {this.state.userOnlineTime.map((online) => (
                    <IndividualUserOnline
                        userName={online.userName}
                        userOnline={this.formatSecondsAsTime(online.userTicker)}
                    />
                ))}
            </div>
          </div>
        </div>
    )
  }

  streamInit = (uid, attendeeMode, videoProfile, config) => {
    let defaultConfig = {
      streamID: uid,
      audio: true,
      video: true,
      screen: false
    };

    switch (attendeeMode) {
      case 'audio-only':
        defaultConfig.video = false;
        break;
      case 'audience':
        defaultConfig.video = false;
        defaultConfig.audio = false;
        break;
      default:
      case 'video':
        break;
    }

    let stream = AgoraRTC.createStream(_.merge(defaultConfig, config));
    stream.setVideoProfile(videoProfile);
    return stream
  };

  subscribeStreamEvents = () => {
    let rt = this;
    rt.client.on('stream-added', function (evt) {
      let stream = evt.stream;
      console.log("New stream added: " + stream.getId());
      console.log('At ' + new Date().toLocaleTimeString());
      console.log("Subscribe ", stream);
      rt.client.subscribe(stream, function (err) {
        console.log("Subscribe stream failed", err)
      })
    });

    rt.client.on('peer-leave', function (evt) {
      console.log("Peer has left: " + evt.uid);
      console.log(new Date().toLocaleTimeString());
      console.log(evt);
      rt.removeStream(evt.uid);
    });

    rt.client.on('stream-subscribed', function (evt) {
      let stream = evt.stream;
      console.log("Got stream-subscribed event");
      console.log(new Date().toLocaleTimeString());
      console.log("Subscribe remote stream successfully: " + stream.getId());
      console.log(evt);
      rt.addStream(stream)
    });

    rt.client.on("stream-removed", function (evt) {
      let stream = evt.stream;
      console.log("Stream removed: " + stream.getId());
      console.log(new Date().toLocaleTimeString());
      console.log(evt);
      rt.removeStream(stream.getId());
    })
  };

  removeStream = (uid) => {
    this.state.streamList.map((item, index) => {
      if (item.getId() === uid) {
        item.close();
        let element = document.querySelector('#ag-item-' + uid);
        if (element) {
          element.parentNode.removeChild(element)
        }
        let tempList = [...this.state.streamList];
        tempList.splice(index, 1);
        this.setState({
          streamList: tempList
        })
      }

    })
  };

  addStream = (stream, push = false) => {
    let repeatition = this.state.streamList.some(item => {
      return item.getId() === stream.getId()
    });
    if (repeatition) {
      return
    }
    if (push) {
      this.setState({
        streamList: this.state.streamList.concat([stream])
      })
    }
    else {
      this.setState({
        streamList: [stream].concat(this.state.streamList)
      })
    }

  }

}

export default AgoraCanvas