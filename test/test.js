'use strict';

var assert = require('chai').assert;
var EventMan = require('../eventman')

suite('Test EventMan', function () {

    test('create instance', function () {
        assert.ok(new EventMan());
    });

    suite('basics', function () {

        var ee = new EventMan(),
            xFired = 0;

        function onX (param) {

            ++xFired;

            if (param) xFired += param;
        } 
        



        test('on() === addListener()', function () {

            ee.on === ee.addListener;
        });

        test('off() === removeListener()', function () {

            ee.off === ee.removeListener;
        });
        
        test('add an event', function () {
            
            ee.on('x', onX);

            return ee.listeners('x').length === 1 && typeof(ee.listeners('x')[0]) === 'function';
        });
        
        test('ignore double bounding', function () {
            
            ee.on('x', onX);
            ee.on('x', onX);
            ee.on('x', onX);

            return ee.listeners('x').length === 1;
        });
        
        test('emit and catch event', function () {
            
            ee.emit('x');

            return xFired === 1;
        });
        
        test('emit and catch event with param', function () {
            
            ee.emit('x', 10);

            return xFired === 12;
        });
        
        test('emit not listened event', function () {
            
            ee.emit('y');

            return xFired === 12;
        });
        
        test('remove wrong litener', function () {
            
            ee.off('x', function () {});

            return ee.listeners('x').length === 1;
        });
        
        test('remove and dont catch event', function () {
            
            ee.off('x', onX);
            ee.emit('x');

            return xFired === 12 && ee.listeners('x').length === 0;
        });
    });

    suite('subevents', function () {

        var ee = new EventMan(),
            xFired = 0,
            xyFired = 0;

        function onX () {

            ++xFired;
        } 

        function onXY () {

            ++xyFired;
        } 



        
        test('add x and x.y listener', function () {

            ee.on('x', onX);
            ee.on('x.y', onXY);

            return ee.listeners('x').length === 2 && ee.listeners('x.y').length === 1;
        });
        
        test('emit x and x.y', function () {
            
            ee.emit('x');
            ee.emit('x.y');

            return xFired === 2 && xyFired === 1;
        });
        
        test('remove listeners', function () {
            
            ee.off('x', onX);
            ee.off('x.y', onX);

            return ee.listeners('x').length === 0 && ee.listeners('x.y').length === 0;
        });
    });

    suite('scope binding', function () {

        var ee = new EventMan(),
            xFired = 0,
            s = {value: 10};

        function onX () {

            xFired += this.value ? this.value : 1;
        }



        
        test('add listeners', function () {

            ee.on('x', onX);
            ee.on('x', onX, s);

            return ee.listeners('x').length === 2 && ee.listeners('x')[1] instanceof Array;
        });
        
        test('emit', function () {
            
            ee.emit('x');

            return xFired === 11;
        });
        
        test('emit with param', function () {
            
            ee.emit('x', 100);

            return xFired === 222;
        });
        
        test('remove listeners', function () {
            
            ee.off('x', onX);
            ee.off('x.y', onX);

            return ee.listeners('x').length === 0 && ee.listeners('x.y').length === 0;
        });
    });

    test('removeAllListeners', function () {

        var ee = new EventMan();

        ee.on('x', function () {});
        ee.on('x.y', function () {});

        ee.removeAllListeners('x');

        return ee.listeners('x').length === 0 && ee.listeners('x.y').length === 0;
    })
});


