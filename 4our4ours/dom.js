var MQ = MathQuill.getInterface(2);

var mathField = MQ.MathField(document.getElementById('mathquill-input'));
var currentEntered = {
	latex: "",
	js: "", 
	result: -1
};

var addNumShown = false;
function mathEditEvent() {
	let latex = mathField.latex();
    let toJS = toJavascript(latex, CURRENTGAME.options);
    let result = safeEvaluate(toJS);

    /*console.info(
    `[INFO]
    input expression: ${latex}
    replaced expression: ${toJS}
    result: ${result}`);*/

    $('#result_add').hide();
    addNumShown = false;
    if (result) {

    	$('#comp_result').text(`= ${+result.toFixed(10)}`);

    	if (!CURRENTGAME.checkValidity(latex)) 
    		$('#result_note').text(`The expression should contain ${CURRENTGAME.N} ${CURRENTGAME.Ns}s`);
    	else if (!isFinite(result))
    		$('#result_note').text(`The result should be finite (or at least not THIS big)`);
    	else if (!CURRENTGAME.checkResult(result)) 
    		$('#result_note').text(`The result should be a positive integer`);
        else if (!CURRENTGAME.checkUniqueness(toJS, Math.round(result))) 
        	$('#result_note').text(`A similar expression was already saved before`);
        else {
        	$('#result_add').show();
        	addNumShown = true;
        	currentEntered = {
				latex,
				js: toJS, 
				result
			};
        	$('#result_note').text("");
        }
    } else {
    	$('#comp_result').text("= ...");
    	$('#result_note').text("");
    }
}

mathField.config({
    autoCommands: 'sqrt',
    autoOperatorNames: "floor ceil log ln exp gcd lcm sin cos tan",
    spaceBehavesLikeTab: true,
    handlers: {
        edit: mathEditEvent,
        enter: function() {
        	if (addNumShown) addExpr();
        }
    }
});

function addExpr() {
	CURRENTGAME.addExpression(
		currentEntered.latex, 
		currentEntered.js, 
		Math.round(currentEntered.result)
	);
	mathEditEvent();
}

function updateLeftPanel(currNum) {
	let content = "";
	for (let i of CURRENTGAME.expressions[currNum]) {
		let latex = i.latex;
		content += `<div class="expressioninlist" onclick="mathField.latex(String.raw\`${latex}\`)"><div>${currNum}=${latex}</div></div>`;
	}
	$("#lefthold").html(content);
	$("#lefthold").children().each(function() {
		MQ.StaticMath(this.children[0]);
	});
}
var prevBtn, prevNum;
function updateBottomPanel() {
	let content = "";
	for (let i in CURRENTGAME.expressions) {
		if (prevNum == i) content += `<button class="numberselector selected" onclick="selectBottomPanel(this, ${i})">${i}</button>`;
		else content += `<button class="numberselector" onclick="selectBottomPanel(this, ${i})">${i}</button>`;
	}
	if (content) {
		$("#bottomhold").html(`<div id="bottomholdinternal">${content}</div>`);
		prevBtn = $(".numberselector.selected")[0];
	}
	updateLeftPanel(prevNum);
}
function selectBottomPanel(btn, currNum) {
	$(btn).addClass("selected");
	if (prevBtn && prevBtn != btn) $(prevBtn).removeClass("selected");
	prevBtn = btn;
	prevNum = currNum;
	updateLeftPanel(prevNum);
}

safeEvaluateInit();
updateBottomPanel();