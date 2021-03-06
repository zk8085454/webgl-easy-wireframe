// Generated by CoffeeScript 1.3.3
var Backend, HTMLAudio, WebAudio, backend,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backend = (function() {

  function Backend() {
    this.loading = 0;
    this.handlers = [];
  }

  Backend.prototype.loaded = function() {
    var handler, _i, _len, _ref;
    if (this.loading === 0) {
      _ref = this.handlers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        handler = _ref[_i];
        if (handler.event === 'loaded') {
          handler.callback.apply(handler);
        }
      }
    }
  };

  Backend.prototype.bind = function(event, callback) {
    var handler;
    handler = {
      event: event,
      callback: callback
    };
    this.handlers.push(handler);
    return handler;
  };

  Backend.prototype.unbind = function(handler) {
    var index;
    index = this.handlers.indexOf(handler);
    if (index >= 0) {
      return this.handlers.splice(index, 1);
    }
  };

  return Backend;

})();

HTMLAudio = (function(_super) {
  var Sample, Voice;

  __extends(HTMLAudio, _super);

  HTMLAudio.available = (window.Audio !== void 0) && (window.URL !== void 0) && (window.BlobBuilder !== void 0);

  Sample = (function() {

    function Sample(backend, data) {
      this.backend = backend;
      this.backend.loading += 1;
      this.url = blob.pack(data, 'audio/ogg');
    }

    Sample.prototype.play = function(looping) {
      var voice;
      voice = this.backend.getFree();
      if (voice) {
        return voice.play(this.url, looping);
      }
    };

    return Sample;

  })();

  Voice = (function() {

    function Voice(backend, id) {
      var self;
      this.id = id;
      self = this;
      this.audio = new Audio();
      this.audio.onended = function() {
        return backend.ended(self);
      };
    }

    Voice.prototype.play = function(url) {
      this.audio.src = url;
      return this.audio.play();
    };

    return Voice;

  })();

  function HTMLAudio() {
    this.check = __bind(this.check, this);

    var id, _i;
    this.free = {};
    this.playing = {};
    for (id = _i = 0; _i < 20; id = ++_i) {
      this.free[id] = new Voice(this, id);
    }
    setInterval(this.check, 100);
  }

  HTMLAudio.prototype.check = function() {};

  HTMLAudio.prototype.getFree = function() {
    var id, voice, _ref;
    _ref = this.free;
    for (id in _ref) {
      voice = _ref[id];
      delete this.free[id];
      this.playing[id] = voice;
      return voice;
    }
  };

  HTMLAudio.prototype.ended = function(voice) {
    this.free[voice.id] = voice;
    return delete this.playing[voice.id];
  };

  HTMLAudio.prototype.createSample = function(data) {
    this.start_time = gettime();
    return new Sample(this, data);
  };

  return HTMLAudio;

})(Backend);

WebAudio = (function(_super) {

  __extends(WebAudio, _super);

  WebAudio.available = window.webkitAudioContext !== void 0;

  function WebAudio() {
    WebAudio.__super__.constructor.call(this);
    this.ctx = new webkitAudioContext();
  }

  WebAudio.prototype.play = function(buffer, looping) {
    var source;
    if (looping == null) {
      looping = false;
    }
    source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = looping;
    source.connect(this.ctx.destination);
    return source.noteOn(this.ctx.currentTime);
  };

  WebAudio.prototype.decode = function(data, callback) {
    return this.ctx.decodeAudioData(data, function(buffer) {
      return callback(buffer);
    });
  };

  return WebAudio;

})(Backend);

if (WebAudio.available) {
  backend = new WebAudio();
  exports.decode = function(data, callback) {
    return backend.decode(data, callback);
  };
  exports.play = function(buffer) {
    return backend.play(buffer);
  };
} else {
  exports.decode = function(data, callback) {};
  exports.play = function(buffer) {};
}
