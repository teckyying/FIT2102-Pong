"use strict";
exports.__esModule = true;
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
function pong() {
    // Inside this function you will use the classes and functions 
    // from rx.js
    // to add visuals to the svg element in pong.html, animate them, and make them interactive.
    // Study and complete the tasks in observable exampels first to get ideas.
    // Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/ 
    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code!  
    var svg = document.getElementById("canvas");
    keyboardControl();
}
/**
 * Create and control user's paddle using the keyboard! Use only one subscribe call and no the interval method
 * If statements
 */
function keyboardControl() {
    // get the svg canvas element
    var svg = document.getElementById("canvas");
    //...
    var rect = document.createElementNS(svg.namespaceURI, 'rect');
    Object.entries({
        x: 20, y: 200,
        width: 20, height: 100,
        fill: '#95B3D7'
    }).forEach(function (_a) {
        var key = _a[0], val = _a[1];
        return rect.setAttribute(key, String(val));
    });
    svg.appendChild(rect);
    var pos = document.getElementById("canvas"), o = rxjs_1.fromEvent(document, "keydown").
        pipe(operators_1.filter(function (e) { return ["ArrowDown", "ArrowUp"].includes(e.key); }));
    var up = o.pipe(operators_1.filter(function (e) { return e.key == "ArrowUp"; }), operators_1.map(function (e) { return { x: 0, y: -1 }; }));
    o.pipe(operators_1.filter(function (e) { return e.key == "ArrowDown"; }), operators_1.map(function (e) { return { x: 0, y: 1 }; }), operators_1.merge(up)).subscribe(function (e) {
        rect.setAttribute('x', String(e.x + Number(rect.getAttribute('x')))),
            rect.setAttribute('y', String(e.y + Number(rect.getAttribute('y'))));
    });
}
// the following simply runs your pong function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
    window.onload = function () {
        pong();
    };
