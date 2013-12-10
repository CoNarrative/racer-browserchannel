var racer = require('racer');
var BCSocket = require('browserchannel/dist/bcsocket-uncompressed').BCSocket;

racer.Model.prototype._createSocket = function(bundle) {
  var options = bundle.racerBrowserChannel;
  var base = options.base || '/channel';
  if (bundle.mount) base = bundle.mount + base;
  var socket = new BCSocket(base, options);
  window.theSocket = socket;
  return socket;
};

var underlyingCreate = racer.Model.prototype._createChannel;
racer.Model.prototype._createChannel = function(){
  underlyingCreate.call(this); //it wraps the onmessage handler...we wrap it again
  var socket = this.root.socket;
  var underlyingOnMessage = socket.onmessage;
  socket.onmessage = function(data){
    if (data && data.a && data.a=='oob'){
      racer.emit('oobmessage', data);
      return;
    }
    underlyingOnMessage.call(socket,data);
  }
}

racer.sendOobMessage = function(msg){
  if (!racer || !racer._model || !racer._model.socket) {
    console.log('Warning: Unable to send oob message because model not yet configured');
    return;
  }
  racer._model.socket.send({a:'oob',payload:msg});
}
