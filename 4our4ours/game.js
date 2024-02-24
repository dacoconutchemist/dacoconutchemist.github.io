class Game {
	constructor(json) {
		this.constructorDebug(json);
	}
	constructorDebug(json) {
		this.N = json.N ?? 4;
		this.Ns = json.Ns ?? 4;
		this.options = json.options ?? {};
		this.expressions = json.expressions ?? {};
		for (let i in this.expressions) {
			this.expressions[i] = this.expressions[i].map(expression => {
				let toJs = toJavascript(expression, this.options);
				return {
					latex: expression,
					js: toJs
				};
			});
		}
		this.currentNumber = -1;
		this.epsilon = 20 * Number.EPSILON;
	}
	checkValidity(expression) {
		// check that the expression contains EXACTLY ${N} ${Ns}s
		let num = this.Ns.toString();
		let allnumcount = (expression.match(/\d/g) || []).length;
		let targetnumcount = (expression.match(new RegExp(num, "g")) || []).length;
		let result = allnumcount - targetnumcount * (this.Ns.toString().length);
		return result == 0 && targetnumcount == this.N;
	}
	checkResult(result) {
		// check if the result is a positive integer (within a given epsilon)
		if (result < 0) return false;
		return Math.abs(result - Math.round(result)) < this.epsilon;
	}
	checkUniqueness(expressionJS, num) {
		// check for existing expressions
		// ignoring parentheses and spaces (to make it harder to change an expression into a different one)
		// also the resulting js is checked instead of latex so that it would not be possible to replace one alias with another
		let expArr = this.expressions[num];
		if (!expArr) return true;
		expArr = this.expressions[num].map(e => e.js);
		const modify = el => el.replaceAll(" ", "").replaceAll(")", "").replaceAll("(", "").replaceAll("`", "");
		let checkArr = expArr.map(modify);
		return !checkArr.includes(modify(expressionJS));
	}
	selectNumber(num) {
		this.currentNumber = num;
	}
	addExpression(latex, js, result) {
		if (!this.expressions[result]) this.expressions[result] = [];
		this.expressions[result].push({latex, js});
		console.log(this.expressions);
		updateBottomPanel();
	}
	generateJSON() {
		let newExpressions = {};
		for (let i in this.expressions) {
			newExpressions[i] = this.expressions[i].map(e => e.latex);
		}
		return {
			N: this.N,
			Ns: this.Ns,
			expressions: newExpressions,
			options: this.options
		}
	}
}

var CURRENTGAME = new Game({
	N: 4,
	Ns: 4,
	expressions: {}
});

function saveGame() {
	// add <a> tag with object url, click, delete element in dom
	const blob = new Blob([JSON.stringify(CURRENTGAME.generateJSON())], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    let $link = $('<a>', {
        href: url,
        download: `${CURRENTGAME.N}-${CURRENTGAME.Ns}s-${Date.now()}.json`,
        css: { display: 'none' }
    }).appendTo('body');
    $link[0].click();
    setTimeout(function() {
        $link.remove();
        URL.revokeObjectURL($link);
    }, 100);
}

$('#fileInput').on('change input', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            var jsonData = JSON.parse(event.target.result);
            CURRENTGAME.constructorDebug(jsonData);
            updateBottomPanel();
        };
        reader.readAsText(file);
    }
});