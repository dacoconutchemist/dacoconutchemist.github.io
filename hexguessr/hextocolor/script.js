function ID(id) { return document.getElementById(id); };
function CLASS(cl) { return document.getElementsByClassName(cl); };
function getRandomInt(max) {
 	return Math.floor(Math.random() * max);
}

var currcol = AColorPicker.parseColor("#e96010");
AColorPicker.from('#picker')
.on('change', (picker, color) => {
  if(!lockedpicker) {
    currcol = AColorPicker.parseColor(color);
    ID("guessedcolor").style.backgroundColor = color;
  }
});

var lockedpicker = false;
var r = 255, g = 255, b = 255;
var avgcloseness = 200;
var avgcount = 0;
function initColorFromHex() {
  r = getRandomInt(255);
	g = getRandomInt(255);
	b = getRandomInt(255);
  ID("guessedhex").innerText = "Hex code: #" + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0')
	ID("result").innerText = ""
	ID("guessedcolor").style.width = "200px";
	ID("comparisoncolor").style.display = "none";
	ID("colornext").style.display = "none";
	ID("colorsubmit").style.display = "block";
  lockedpicker = false;
}
initColorFromHex();

ID("colorsubmit").addEventListener('click', () => {
	var closeness = 100 - (
		(Math.abs(r - currcol[0]) * 100 / 255) + 
		(Math.abs(g - currcol[1]) * 100 / 255) + 
		(Math.abs(b - currcol[2]) * 100 / 255)
	) / 3;
	if(avgcloseness == 200) avgcloseness = closeness;
	else avgcloseness = (avgcloseness * avgcount + closeness) / (avgcount + 1)
	avgcount++;
	ID("result").innerText = `Your answer is ${+closeness.toFixed(2)}% close\r\nYour average closeness is ${+avgcloseness.toFixed(2)}%`;
	ID("guessedcolor").style.width = "100px";
	ID("comparisoncolor").style.display = "inline-block";
	ID("comparisoncolor").style.backgroundColor = `rgb(${r},${g},${b})`;
	ID("colornext").style.display = "block";
	ID("colorsubmit").style.display = "none";
  lockedpicker = true;
});

setTimeout(() => { CLASS("a-color-picker-clipbaord")[0].remove(); }, 500);