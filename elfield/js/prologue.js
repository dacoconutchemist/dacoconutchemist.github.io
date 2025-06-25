// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
// /Array Remove

// https://stackoverflow.com/a/52256801
function debounce(func, time=100){
    var timer;
    return function(event){
        if(timer) clearTimeout(timer);
        timer = setTimeout(func, time, event);
    };
}
// / https://stackoverflow.com/a/52256801

// helper functions and constants

function hexToArr(hex) {
    return hex.substring(1).match(/.{2}/g)
              .map(x => parseInt(x, 16));
}

function colorToRGBA(rgb, a=1) {
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
}

const canvas = $('#can')[0];
const canvasGUI = $('#cangui')[0];

const ctx = canvas.getContext('2d', { willReadFrequently: true });
const ctxGUI = canvasGUI.getContext('2d');

const k = 8.98755179e9; // \frac{1}{4\pi\epsilon_0}
const kM = 2e-7; // \frac{\mu_0}{2\pi} (yes, this turns out to be 2e-7 with a precision of 9 digits)

let charges = [];

function getChargeRadius(i) {
    //return Math.sqrt(Math.abs(charges[i].q) * 1e6) * 5
    return 2.55*Math.log(Math.abs(charges[i].q)) + 40.52;
}

var INSECURE_CONTEXT_DEBUG_MODE = false;