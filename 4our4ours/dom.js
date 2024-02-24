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
    if (result === 0 || result) {
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
    autoOperatorNames: "floor ceil log ln exp gcd lcm sin cos tan tg csc " + 
                       "sec cot ctg arcsin arccos arctg arctan arccsc arcsec " + 
                       "arccot arcctg sinh cosh tanh tgh csch sech coth ctgh " + 
                       "arcsinh arccosh arctgh arctanh arccsch arcsech arccoth arcctgh",
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
	let content = `
		<div class="expressioninlist exprarrowhold">
			<b class="fonted exprarrow" onclick="selectPrevButton()"><</b>
			<b class="fonted exprarrow" onclick="selectNextButton()">></b>
		</div>
	`;
	if (CURRENTGAME.expressions && currNum) {
		$('#lefthold').removeAttr('style');
		for (let i of CURRENTGAME.expressions[currNum]) {
			let latex = i.latex;
			content += `<div class="expressioninlist" onclick="mathField.latex(String.raw\`${latex}\`)"><div>${currNum}=${latex}</div></div>`;
		}
		$("#lefthold").html(content);
		$("#lefthold").children().slice(1).each(function() {
			MQ.StaticMath(this.children[0]);
		});
	}
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

function selectNextButton() {
	let nextSibling = prevBtn.nextElementSibling;
	if (!nextSibling) nextSibling = prevBtn.parentElement.firstElementChild;
	selectBottomPanel(nextSibling, parseInt(nextSibling.innerText));
}

function selectPrevButton() {
	let previousSibling = prevBtn.previousElementSibling;
	if (!previousSibling) {
	    const siblings = prevBtn.parentElement.children;
	    previousSibling = siblings[siblings.length - 1];
	}
	selectBottomPanel(previousSibling, parseInt(previousSibling.innerText));
}

// toggle keyboard, toggle the opening button's height and the arrow direction
function toggleKbd() {
	$('#kbd').toggleClass("hidden");
	let $toggle = $("#openKbd");
	let $toggleArr = $("#openKbdArr");
	if ($toggle.css('bottom') != "0px") {
		$toggle.css('bottom', '');
		$toggleArr.css('transform', 'rotate(0deg)');
	} else {
		$toggle.css('bottom', '40%');
		$toggleArr.css('transform', 'rotate(180deg)');
	}
}

function typeLatex(text, trig) {
	// click to erase the placeholder
	$("#mathquill-input").click();
	if (trig) {
		// for trig, add arc and h before and after depending on checkboxes
		let arc = $('#trigarccheck').is(":checked");
		let hyper = $('#trighcheck').is(":checked");
		if (arc) mathField.typedText("arc")
		mathField.typedText(text);
		if (hyper) mathField.typedText("h");
		mathField.typedText("(")
	}
	else {
		// else, type characters accounting for special keys
		for (let i of [...text]) {
			if (i == "→") mathField.keystroke('Right');
			else if (i == "←") mathField.keystroke('Left');
			else if (i == "↑") mathField.keystroke('Up');
			else if (i == "↓") mathField.keystroke('Down');
			else if (i == "⌫") mathField.keystroke('Backspace');
			else mathField.typedText(i);
		}
	}
}

// erase placeholder
$("#mathquill-input").click(function(){
    mathField.latex("");
    $(this).off("click");
});

// hide arc and h by default
$(".trigarc").hide();
$(".trigh").hide();
// show it if the chekboxes are pressed
$("#trigarccheck, #trighcheck").on("change", () => {
	let arc = $('#trigarccheck').is(":checked");
	let hyper = $('#trighcheck').is(":checked");
	$(".trigarc").toggle(arc);
	$(".trigh").toggle(hyper);
});

/*var timeouts = [];
$(".repeatPresses").each(function() {
    var element = $(this);
    var timeout;
    element.on('mousedown touchstart', function(e) {
    	e.preventDefault();
        timeout = setTimeout(function() {
            triggerAction();
            timeout = setInterval(triggerAction, 100);
        }, 1000);
        timeouts.push(timeout);
    }).on('mouseup mouseleave touchend touchcancel', function() {
        clearTimeout(timeout);
        clearInterval(timeout);
    });
    function triggerAction() {
        element.trigger('click');
    }
});*/

/*$(".repeatPresses").each(function() {
    var element = $(this);
    var timeout;

    element.on('mousedown touchstart', function(e) {
        e.preventDefault(); // Prevent default touch behavior
        timeout = setTimeout(function() {
            triggerAction();
            timeout = setInterval(triggerAction, 100);
        }, 1000);
    }).on('mouseup mouseleave touchend touchcancel', function() {
        clearTimeout(timeout);
        clearInterval(timeout);
    });

    element.on('click touchend', function(e) {
        e.preventDefault(); // Prevent default touch behavior
        triggerAction();
    });

    function triggerAction() {
        element.trigger('click');
    }
});*/

$(".repeatPresses").each(function() {
    var element = $(this);
    var timeout, interval;
    element.on('mousedown touchstart', function(e) {
    	e.preventDefault();
        timeout = setTimeout(function() {
            triggerAction();
            interval = setInterval(triggerAction, 100);
        }, 750);
    }).on('mouseup mouseleave touchend touchcancel', function() {
    	if (!interval) triggerAction();
    	// both of those just set to undefined but this looks cleaner
        timeout = clearTimeout(timeout);
        interval = clearInterval(timeout);
    });
    function triggerAction() {
    	element.trigger('click');
    }
});


safeEvaluateInit(); // checks globals so needs to be at the end
updateBottomPanel();