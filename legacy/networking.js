var hyperlog = require('hyperlog')
var levelup = require('level')
var leveldb = levelup('./ephemeral/hyperlog_state')
var WebTorrentHybrid = require('webtorrent-hybrid')
var log = hyperlog(leveldb)
var effects = require('../model/effects')
var fileExists = require('file-exists')
var fs = require('fs')
var wrtc = require('electron-webrtc')({headless: true})

var swarm = new WebTorrentHybrid()
var state = {log, swarm}
var blobFolder = '../blob-stream'

wrtc.on('error', err => !err || console.log(err))
var subscriptions = require('../model/subscriptions')({wrtc}, log)

module.exports = {
  add: (file) => {
    var data = {'file': file}
    var send = (send, data) => {
      effects['create log entry'](data, state, null, err => !err || console.log(err))
    }
    effects['create torrent'](data, state, send, err => !err || console.log(err))
  }
}

var subscribeToLogChanges = subscriptions.find(elem => elem.name === 'subscribeToLogChanges')

subscribeToLogChanges((next, data) => {
  console.log('received torrent')
  var torrent = state.swarm.get(data.magnetLink)
  var magnetLink = data.magnetLink

  function handleTorrent (torrent) {
    console.log('handleTorrent')
    var fqn = blobFolder + '/' + torrent.name
    if (fileExists(fqn)) {
      console.log('file exists', torrent.name)
      return
    }
    var ws = fs.createWriteStream(fqn)
    torrent.files[0].createReadStream().pipe(ws)
  }

  if (torrent) {
    handleTorrent(torrent)
    return
  }
  state.swarm.add(magnetLink, {}, torrent => handleTorrent(torrent))
}, err => !err || console.log(err))

var findWebRTCPeers = subscriptions.find(elem => elem.name === 'findWebRTCPeers')
findWebRTCPeers((send, data) => {
  console.log('found a peer:', data.id)
  effects['sync with peer'](data, state, null, err => !err && console.log(err))
}, err => !err || console.log(err))
