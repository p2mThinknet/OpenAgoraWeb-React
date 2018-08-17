import React from 'react'
import { merge } from 'lodash'

import './canvas.css'
import '../../assets/fonts/css/icons.css'
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
    this.state = {
      streamList: [],
      readyState: false
    }
  }

  componentWillMount() {
    let $ = this.props;
    // init AgoraRTC local client
    this.client = AgoraRTC.createClient({ mode: $.transcode });
    this.client.init($.appId, () => {
      console.log("AgoraRTC client initialized");
      this.subscribeStreamEvents()
      this.client.join($.appId, $.channel, $.uid, (uid) => {
        console.log("User " + uid + " join channel successfully");
        console.log('At ' + new Date().toLocaleTimeString());
        this.localStream = this.streamInit(uid, $.attendeeMode, $.videoProfile);
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
      this.props.socket.on('userOnline', function(data){
      });
      this.props.socket.on('userChat', function(data) {
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
                if(document.getElementsByTagName('video').length > 1) {
                    document.getElementsByTagName('video')[1].parentElement.remove();
                    item.play('ag-local');
                } else {
                    item.play('ag-local');
                }
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

  render() {

    return (
        <div style={{display:'flex',flex: 1,flexDirection:'row',height:'100%'}}>
          <div id="remote-video" style={{height:'100%', width:'200px',overflow: 'auto',transform: 'rotateY(180deg)'}}/>
          <div id="ag-local" style={{height:'100%', width:'calc(100% - 400px)'}}/>
          <div style={{display:'flex', flex:'1', flexDirection:'column', width:'200px', height:'100%'}}>
            <div id="chat-div" style={{flexGrow: 1,overflow: 'auto'}}/>
            <div id="userOnline-div" style={{flexGrow: 1,overflow: 'auto'}}/>
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
        defaultConfig.video = false
        break;
      case 'audience':
        defaultConfig.video = false
        defaultConfig.audio = false
        break;
      default:
      case 'video':
        break;
    }

    let stream = AgoraRTC.createStream(merge(defaultConfig, config));
    stream.setVideoProfile(videoProfile);
    return stream
  }

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
    })

    rt.client.on('peer-leave', function (evt) {
      console.log("Peer has left: " + evt.uid)
      console.log(new Date().toLocaleTimeString())
      console.log(evt)
      rt.removeStream(evt.uid)
    })

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
      console.log("Stream removed: " + stream.getId())
      console.log(new Date().toLocaleTimeString())
      console.log(evt)
      rt.removeStream(stream.getId())
    })
  }

  removeStream = (uid) => {
    this.state.streamList.map((item, index) => {
      if (item.getId() === uid) {
        item.close()
        let element = document.querySelector('#ag-item-' + uid)
        if (element) {
          element.parentNode.removeChild(element)
        }
        let tempList = [...this.state.streamList]
        tempList.splice(index, 1)
        this.setState({
          streamList: tempList
        })
      }

    })
  }

  addStream = (stream, push = false) => {
    let repeatition = this.state.streamList.some(item => {
      return item.getId() === stream.getId()
    })
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