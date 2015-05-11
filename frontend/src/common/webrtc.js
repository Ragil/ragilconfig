import env from 'env';
import $ from 'jquery'
import SimpleWebRTC from 'simplewebrtc';


export default class WebRTC {
  constructor(opts) {
    this.opts = opts || {};
    this.opts.initialized = this.opts.initialized || (() => {});
    this.opts.initError = this.opts.initError || (() => {});

    this.fetchNTS();
  }

  fetchNTS() {
    let params = {
      room : 'homecam'
    };
    $.ajax(env.service.NTS + '?' + $.param(params), {
      method : 'POST'
    }).done(this.onNTSSuccess.bind(this))
      .fail(this.onNTSFail.bind(this));
  }

  onNTSSuccess(data, status, jqXHR) {
    this.iceServers = data.iceServers;
    this.proxy = new SimpleWebRTC(_.extend(this.opts, {
      peerConnectionConfig : {
        iceServers : data.iceServers
      }
    }));

    // always override ice servers
    this.on('stunservers', ((args) => {
      this.proxy.webrtc.config.peerConnectionConfig.iceServers =
          data.iceServers;
    }).bind(this));

    // logging
    this.on('createdPeer', (peer) => {
      console.log(peer);
    });

    this.opts.initialized(this);
  }

  onNTSFail(jqXHR, status, error) {
    this.opts.initError(this, error);
  }

  /* proxy calls */
  on() {
    this.proxy.on.apply(this.proxy, arguments);
  }
  joinRoom() {
    this.proxy.joinRoom.apply(this.proxy, arguments);
  }
}
