function clamp(min, val, max) {
  return Math.min(Math.max(min, max), Math.max(Math.min(min, max), val))
}

function mapRange(value, fromMin, fromMax, toMin, toMax, func = x => x) {
  const clampedValue = Math.max(fromMin, Math.min(fromMax, value));
  var normalizedValue = (clampedValue - fromMin) / (fromMax - fromMin);
  normalizedValue = func(normalizedValue);
  const mappedValue = toMin + normalizedValue * (toMax - toMin);
  return mappedValue;
}

var winHeight = window.innerHeight;
if (window.innerWidth <= 768) winHeight *= 1.1;
var winWidth = window.innerWidth;

// блять я не їбу чого якщо ширина екрану 424 на телефоні воно з першого разу думає шо вона 393
// КОСТИИИЛЬ TIME
setInterval(()=>document.getElementById('screen1').style.minWidth = `${window.innerWidth}px`, 200);

setInterval(()=>document.body.style.height = `${8*winHeight}px`, 200);

var screen2 = $('#screen2');
var screen2text = $('#screen2text');
var screen3 = $('#screen3');
var screen3text = $('#screen3text');
var screen4 = $('#screen4');
var screen4text = $('#screen4text');
var screen5 = $('#screen5');

screen5.css('top', `${winHeight*6}px`);

var hinttimeout = setTimeout(()=>$('#scrollhint').css('color', '#888888ff'), 5000)

window.addEventListener('scroll', () => {
  var screen2pos = (() => {
    if (window.scrollY < winHeight) return winHeight - window.scrollY;
    if (window.scrollY > 2 * winHeight) return 2 * winHeight - window.scrollY;
    return 0;
  })();
  screen2.css('top', `${screen2pos}px`);
  if ((winHeight < window.scrollY) && (window.scrollY < 2 * winHeight)) {
    screen2text.css('transform', `translateX(${mapRange(
      window.scrollY, winHeight, 2 * winHeight, -(winWidth + screen2text.width()) / 2, (winWidth + screen2text.width()) / 2,
      func = x => (4 * Math.pow(x - 0.5, 3) + 0.5)
    )
      }px)`);
    screen2text.css('display', 'block');
  } else screen2text.css('display', 'none');

  var screen3pos = (() => {
    if (window.scrollY < 3 * winHeight) return 3 * winHeight - window.scrollY;
    if (window.scrollY > 4 * winHeight) return 4 * winHeight - window.scrollY;
    return 0;
  })();
  screen3.css('top', `${screen3pos}px`);
  if ((3 * winHeight < window.scrollY) && (window.scrollY < 4 * winHeight)) {
    screen3text.css('transform', `translateX(${mapRange(
      window.scrollY, 3 * winHeight, 4 * winHeight, (winWidth + screen3text.width()) / 2, -(winWidth + screen3text.width()) / 2,
      func = x => (4 * Math.pow(x - 0.5, 3) + 0.5)
    )
      }px)`);
    screen3text.css('display', 'block');
  } else screen3text.css('display', 'none');

  var screen4pos = (() => {
    if (window.scrollY < 5 * winHeight) return 5 * winHeight - window.scrollY;
    if (window.scrollY > 6 * winHeight) return 6 * winHeight - window.scrollY;
    return 0;
  })();
  screen4.css('top', `${screen4pos}px`);
  if ((5 * winHeight < window.scrollY) && (window.scrollY < 6 * winHeight)) {
    var mapp = mapRange(
      window.scrollY, 5 * winHeight, 6 * winHeight, 0, 1,
      func = x => {
        const angle = Math.PI * (x - 0.5);
        const tanSquared = Math.tan(angle) ** 2;
        const sign = Math.sign(x - 0.5);
        const exponent = 1 + tanSquared * sign;
        const result = (2 ** exponent) / 2;
        if (result > 100) return 0
        return Math.min(result, 100);
      }
    );
    screen4text.css('transform', `scale(${mapp}) translateY(-5px)`);
    screen4text.css('display', 'block');
  } else screen4text.css('display', 'none');

  screen5.css('top', `${7 * winHeight - window.scrollY}px`);
  if (hinttimeout) clearTimeout(hinttimeout);
});