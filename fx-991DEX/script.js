var keysRAW = {
	n1       : [2, [0, 2]],
	n2       : [2, [1, 2]],
	n3       : [2, [2, 2]],
	n4       : [2, [0, 1]],
	n5       : [2, [1, 1]],
	n6       : [2, [2, 1]],
	n7       : [2, [0, 0]],
	n8       : [2, [1, 0]],
	n9       : [2, [2, 0]],
	n0       : [2, [0, 3]],
	point    : [2, [1, 3]],
	exp      : [2, [2, 3]],
	ans      : [2, [3, 3]],
	equals   : [2, [4, 3]],
	plus     : [2, [3, 2]],
	minus    : [2, [4, 2]],
	mul      : [2, [3, 1]],
	div      : [2, [4, 1]],
	del      : [2, [3, 0]],
	ans      : [2, [4, 0]],
	right    : [1, [0, 0]],
	up       : [1, [1, 0]],
	left     : [1, [2, 0]],
	down     : [1, [3, 0]],
	S        : [1, [4, 0]],
	A        : [1, [5, 0]],
	optn     : [1, [0, 1]],
	calc     : [1, [1, 1]],
	integral : [1, [4, 1]],
	x        : [1, [5, 1]],
	fraction : [1, [0, 2]],
	sqrt     : [1, [1, 2]],
	square   : [1, [2, 2]],
	power    : [1, [3, 2]],
	log      : [1, [4, 2]],
	ln       : [1, [5, 2]],
	negative : [1, [0, 3]],
	deg      : [1, [1, 3]],
	inverse  : [1, [2, 3]],
	sin      : [1, [3, 3]],
	cos      : [1, [4, 3]],
	tan      : [1, [5, 3]],
	sto      : [1, [0, 4]],
	eng      : [1, [1, 4]],
	leftpar  : [1, [2, 4]],
	rightpar : [1, [3, 4]],
	sd       : [1, [4, 4]],
	mplus    : [1, [5, 4]],
	unknown  : [1, [2, 1]]
};

var keys = {};
for (let key in keysRAW) {
	var keydata = keysRAW[key];
	if (keydata[0] == 1) keys[key] = `<div class="sprite1" style="background-position: -${49.75 * keydata[1][0]}px -${30 * keydata[1][1]}px;"></div>`;
	if (keydata[0] == 2) keys[key] = `<div class="sprite2" style="background-position: -${43.7 * keydata[1][0]}px -${30 * keydata[1][1]}px;"></div>`;
}

var letters = {
	"A": [[keys.A, keys.negative], [keys.S, keys.n7, keys.n3, keys.n6], [], [], [], []],
	"Ä": [[keys.A, keys.negative], [keys.S, keys.n7, keys.n3, keys.n6], [], [], [], []],
	"B": [[keys.A, keys.deg], [], [], [], [], []],
	"C": [[keys.A, keys.inverse], [keys.S, keys.div], [], [], [], []],
	"D": [[keys.A, keys.sin], [], [], [], [], []],
	"E": [[keys.A, keys.cos], [keys.optn, keys.n3, keys.deg], [], [keys.S, keys.n7, keys.n2, keys.n3], [], [keys.A, keys.exp]],
	"F": [[keys.A, keys.tan], [], [keys.S, keys.n7, keys.n4, keys.n2], [], [keys.optn, keys.n3, keys.n5], []],
	"G": [[keys.S, keys.n7, keys.n1, keys.n7], [keys.optn, keys.n3, keys.n8], [keys.S, keys.n7, keys.down, keys.n1, keys.n1], [], [], []],
	"H": [[], [], [], [keys.S, keys.n7, keys.n1], [], []],
	"I": [[keys.n1], [], [], [], [], []],
	"J": [[], [], [], [], [], []],
	"K": [[], [], [], [keys.S, keys.n7, keys.n4, keys.n4], [keys.optn, keys.n3, keys.n6], []],
	"L": [[], [], [], [keys.n1], [], []],
	"M": [[keys.A, keys.mplus], [keys.optn, keys.n3, keys.n7], [], [], [keys.optn, keys.n3, keys.n1], []],
	"N": [[], [], [], [], [keys.optn, keys.n3, keys.n3], []],
	"O": [[keys.n0], [], [], [keys.S, keys.n7, keys.n4, keys.n9], [], []],
	"Ö": [[keys.n0], [], [], [keys.S, keys.n7, keys.n4, keys.n9], [], []],
	"P": [[keys.optn, keys.n3, keys.negative], [keys.S, keys.mul], [], [], [keys.optn, keys.n3, keys.n4], []],
	"Q": [[], [], [], [], [], []],
	"R": [[keys.S, keys.n7, keys.n4, keys.n6], [], [], [], [], []],
	"S": [[keys.n5], [], [], [], [], []],
	"T": [[], [keys.optn, keys.n3, keys.n9], [keys.S, keys.n7, keys.down, keys.n2, keys.n1], [], [], []],
	"U": [[], [], [], [keys.S, keys.n7, keys.n4, keys.n1], [], [keys.optn, keys.n3, keys.n2]],
	"Ü": [[], [], [], [keys.S, keys.n7, keys.n4, keys.n1], [], [keys.optn, keys.n3, keys.n2]],
	"V": [[], [], [], [keys.S, keys.n7, keys.n4, keys.n1], [], []],
	"W": [[], [], [], [], [], []],
	"X": [[], [], [], [], [], [keys.x]],
	"Y": [[], [], [], [], [], [keys.A, keys.sd]],
	"Z": [[], [], [], [], [], []],
	" ": [[keys.negative], [], [], [], [], []],
	"!": [[keys.S, keys.inverse], [], [], [], [], []],
	",": [[keys.point], [], [], [], [], []],
};

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ! ,";
const tableBody = $("#characterTable tbody");

for (let i = 0; i < characters.length; i++) {
    const character = characters[i];
    const newRow = $("<tr>");
    const c1 = $("<td>").text(character);
    const c2 = $("<td>").html(letters[character][0]);
    const c3 = $("<td>").html(letters[character][1]);
    const c4 = $("<td>").html(letters[character][2]);
    const c5 = $("<td>").html(letters[character][3]);
    const c6 = $("<td>").html(letters[character][4]);
    const c7 = $("<td>").html(letters[character][5]);
    newRow.append(c1, c2, c3, c4, c5, c6, c7);
    tableBody.append(newRow);
}

function getUpperCase(c) {
	var letter = letters[c.toUpperCase()];
	if (!letter) return keys.unknown;
	var retval = [letter[0], letter[1], letter[2]].sort(e => e.length).filter(e => e.length > 0)[0];
	if (!retval) {
		retval = [letter[3], letter[4], letter[5]].sort(e => e.length).filter(e => e.length > 0)[0];
		if (!retval) {
			return keys.unknown;
		}
		return retval.join("");
	}
	return retval.join("");
}

function getLowerCase(c) {
	var letter = letters[c.toUpperCase()];
	if (!letter) return keys.unknown;
	var retval = [letter[3], letter[4], letter[5]].sort(e => e.length).filter(e => e.length > 0)[0];
	if (!retval) {
		retval = [letter[0], letter[1], letter[2]].sort(e => e.length).filter(e => e.length > 0)[0];
		if (!retval) {
			return keys.unknown;
		}
		return retval.join("");
	}
	return retval.join("");
}

$('#textinput').on('input', () => {
	var output = "Buttons you need to press on the calculator to get the text above:<br>Die Tasten, die auf dem Taschenrechner gedrückt werden müssen, um den obigen Text zu erhalten:<br>";
	for(let c of $('#textinput').val()) {
        if (c == c.toLowerCase()) output += getLowerCase(c);
        else output += getUpperCase(c);
	}
	$('#output').html(output);
});