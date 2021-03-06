'use strict';

function EventMan () {

    this._listenerCount = 0;
    this._maxListeners = 10;
    this._events = Object.create(null);
    this._flags = Object.create(null);
}

module.exports = EventMan;
var p = EventMan.prototype;

p.addListener = function (evtName, cb, scope) {

    if (evtName instanceof Array) {

        for (var i = 0; i < evtName.length; ++i) {

            this.addListener(evtName[i], cb, scope);
        }
        return;
    }

    if (!evtName || typeof cb !== 'function') {//HACK
      throw Error('missing evtName or callback - ' + evtName + '|' + cb)
    }

    if (!(evtName in this._events)) {

        this._events[evtName] = [];
    }

    if (typeof evtName !== 'string') throw 'event name must be a string';
    if (typeof cb !== 'function') throw 'Callback must be a function!';

    this.removeListener(evtName, cb, scope);

    var listeners = this._events[evtName],
        reg = scope ? [cb, scope] : cb;

    if (this._maxListeners > 0 && listeners.length > this._maxListeners) {

        throw Error('(node) warning: possible EventEmitter memory ' +
            'leak detected. %d listeners added. ' +
            'Use emitter.setMaxListeners() to increase limit.',
            listeners.length);
    }

    listeners.push(reg);

    if (evtName in this._flags) {

        return this._call(reg, this._flags[evtName]);
    }
};

p.removeListener = function (evtName, cb, scope) {

    if (evtName instanceof Array) {

        for (var i = 0; i < evtName.length; ++i) {

            this.removeListener(evtName[i], cb, scope);
        }
        return;
    }

    var reg, listeners = this._events[evtName];

    if (listeners) {

        for (var i = 0; i < listeners.length; ++i) {

            reg = listeners[i];

            if (typeof(reg) === 'function') {

                if (cb === reg && !scope) {

                    listeners.splice(i--, 1);
                }
            }
            else {
                if (reg[0] === cb && reg[1] === scope) {

                    listeners.splice(i--, 1);
                }
            }
        }
    }
};

p.once = function (evtName, cb, scope) {

    this.addListener(evtName, onceCb);

    function onceCb() {

        this.removeListener(evtName, onceCb);

        this._call([cb, scope], arguments);
    }
};

p.emit = function (evtName) {

    var args = Array.prototype.slice.call(arguments, 1),
        listeners = this.listeners(evtName);

    for (var i = 0, l = listeners.length; i < l; ++i) {

        this._call(listeners[i], args);
    }
};

p.flag = function (evtName) {

    var args = Array.prototype.slice.call(arguments, 1);

    this._flags[evtName] = args;
};

p._call = function (reg, args) {

    if (typeof (reg) === 'function') {

        reg.apply(this, args);
    }
    else {
        reg[0].apply(reg[1], args);
    }
};

p.listeners = function (evtName) {

    var listeners, ret = [];

    do {
        listeners = this._events[evtName];

        if (listeners) {

            ret.push.apply(ret, listeners);
        }

        evtName = evtName.slice(0, Math.max(0, evtName.lastIndexOf('.')));
    }
    while (evtName);

    return ret;
};

p.setMaxListeners = function (maxListeners) {

    this._maxListeners = parseInt(maxListeners) || 0;
};

p.removeAllListeners = function (evtName) {

    this.listeners(evtName).forEach(function (reg) {

        if (typeof (reg) === 'function') {

            this.removeListener(evtName, reg);
        }
        else {
            this.removeListener(evtName, reg[0], reg[1]);
        }
    }, this);
};

//aliases
p.on = p.addListener;
p.off = p.removeListener;
