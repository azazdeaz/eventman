'use strict';

function EventMan () {

    this._listenerCount = 0;
    this._maxListeners = 10;
    this._events = Object.create(null);
}

module.exports = EventMan;
var p = EventMan.prototype;

p.addListener = function (evtName, cb, scope) {

    if (!(evtName in this._events)) {

        this._events[evtName] = [];
    }

    if (typeof evtName !== 'string') throw 'event name must be a string';
    if (typeof cb !== 'function') throw 'Callback must be a function!';

    this.removeListener(evtName, cb, scope);

    var liteners = this._events[evtName];

    liteners.push(scope ? [cb, scope] : cb);

    if (this._maxListeners > 0 && liteners.length > this._maxListeners) {

        console.error('(node) warning: possible EventEmitter memory ' +
            'leak detected. %d listeners added. ' +
            'Use emitter.setMaxListeners() to increase limit.',
            listeners.length);
        console.trace();
    }
};

p.removeListener = function (evtName, cb, scope) {

    var reg, cb, listeners = this._events[evtName];

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

p.emit = function (evtName) {

    var reg, args = Array.prototype.slice.call(arguments, 1),
        listeners = this.listeners(evtName);

    for (var i = 0, l = listeners.length; i < l; ++i) {

        reg = listeners[i];

        if (typeof (reg) === 'function') {

            reg.apply(this, args);
        }
        else {
            reg[0].apply(reg[1], args);
        }
    }
};

p.listeners = function (evtName) {

    var listeners, i, l, ret = [];

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
}

//aliases
p.on = p.addListener;
p.off = p.removeListener;