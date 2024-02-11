function ID(id) { return document.getElementById(id); };
function CLASS(cl) { return document.getElementsByClassName(cl); };
function getRandomInt(max) {
 	return Math.floor(Math.random() * max);
}
function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16)} : null;
}

var r = 255, g = 255, b = 255;
var avgcloseness = 200;
var avgcount = 0;
function initHexFromColor() {
	r = getRandomInt(255);
	g = getRandomInt(255);
	b = getRandomInt(255);
	ID("guessedhex").style.backgroundColor = `rgb(${r},${g},${b})`;
	ID("result").innerText = ""
	ID("guessedhex").style.width = "200px";
	ID("comparisonhex").style.display = "none";
	ID("hexinput").value = "";
	ID("hexnext").style.display = "none";
	ID("hexsubmit").style.display = "block";
}
initHexFromColor();
function submitHex(e) {
	var inpcol = ID("hexinput").value;
	if(/^#?[0-9a-fA-F]{6}$/.test(inpcol)) {
		inpcol = inpcol.replace(/^#/, '');
		var rgbinpcol = hexToRgb(inpcol);
		var closeness = 100 - (
			(Math.abs(r - rgbinpcol.r) * 100 / 255) + 
			(Math.abs(g - rgbinpcol.g) * 100 / 255) + 
			(Math.abs(b - rgbinpcol.b) * 100 / 255)
		) / 3;
		if(avgcloseness == 200) avgcloseness = closeness;
		else avgcloseness = (avgcloseness * avgcount + closeness) / (avgcount + 1)
		avgcount++;
		ID("result").innerText = `The color was #${r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0')}\r\nYour answer is ${+closeness.toFixed(2)}% close\r\nYour average closeness is ${+avgcloseness.toFixed(2)}%`;
		ID("guessedhex").style.width = "100px";
		ID("comparisonhex").style.display = "inline-block";
		ID("comparisonhex").style.backgroundColor = "#" + inpcol;
		ID("hexnext").style.display = "block";
		ID("hexsubmit").style.display = "none";
	}
}
ID("hexsubmit").addEventListener('click', submitHex);
ID("hexinput").addEventListener("keyup", (event) => {
  if (event.key === "Enter") submitHex(event);
});