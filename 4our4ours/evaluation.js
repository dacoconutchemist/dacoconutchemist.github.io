const EVAL_ALL_ALLOWED = {
    sqrt: true,
    floor: true,
    ceil: true,
    log10: true,
    log: true,
    ln: true,
    exp: true,
    gcd: true,
    lcm: true,
    sin: true,
    cos: true,
    tan: true,
    abs: true,
    perc: true,
    fact: true
};

function toJavascript(lat, EVAL_OPTIONS={}) {    // TODO: add arc, hyperbolic, cofunctions
    // this is shitcode
    let defaultOptionsCopy = $.extend(true, {}, EVAL_ALL_ALLOWED);
    for (let i in EVAL_OPTIONS) {
        defaultOptionsCopy[i] = EVAL_OPTIONS[i];
    }
    EVAL_OPTIONS = defaultOptionsCopy;

    let latStarting = lat;
    var replacements = {};
    // replace stuff with its js counterparts. order MATTERS
    if (EVAL_OPTIONS.sqrt)  replacements["\\sqrt{"]                      = "Math.sqrt(";
    if (EVAL_OPTIONS.floor) replacements["\\operatorname{floor}\\left("] = "Math.floor(";
    if (EVAL_OPTIONS.ceil)  replacements["\\operatorname{ceil}\\left("]  = "Math.ceil(";
    if (EVAL_OPTIONS.lcm)   replacements["\\operatorname{lcm}\\left("]   = "Cust_lcm(";
    if (EVAL_OPTIONS.log10) replacements["\\log\\left("]                 = "Math.log10(";
    if (EVAL_OPTIONS.log) {
                            replacements["\\log_{"]                      = "Cust_log(";
                            replacements["}\\left("]                     = ",";
    }
    if (EVAL_OPTIONS.ln)    replacements["\\ln\\left("]                  = "Math.log(";
    if (EVAL_OPTIONS.exp)   replacements["\\exp\\left("]                 = "Math.exp(";
    if (EVAL_OPTIONS.gcd)   replacements["\\gcd\\left("]                 = "Cust_gcd(";
    if (EVAL_OPTIONS.sin)   replacements["\\sin\\left("]                 = "Math.sin(";
    if (EVAL_OPTIONS.cos)   replacements["\\cos\\left("]                 = "Math.cos(";
    if (EVAL_OPTIONS.tan)   replacements["\\tan\\left("]                 = "Math.tan(";
    if (EVAL_OPTIONS.abs) {
                            replacements["\\abs\\left("]                 = "Math.abs(";
                            replacements["\\left|"]                      = "Math.abs(";
                            replacements["\\right|"]                     = ")";
    }
    if (EVAL_OPTIONS.perc)  replacements["\\%"]                          = "/100";
    if (EVAL_OPTIONS.fact)  replacements["!"]                            = " .Cust_fact()";

    // this should be replaced last as those things are contained in the previous replacements
    replacements = {
        ...replacements,
        "\\frac{": "(",
        "^{": "**(",
        "^": "**",
        "}{": ")/(",
        "\\right)": ")",
        "}": ")",
        "\\cdot": "*"
    }

    // replace anything exploity before we add these functions in an INTENDED way
    lat = lat.replaceAll("Math", "");
    lat = lat.replaceAll("Cust_gcd", "");
    lat = lat.replaceAll("Cust_lcm", "");
    lat = lat.replaceAll("Cust_log", "");
    lat = lat.replaceAll("`", "");

    for (let i in replacements) lat = lat.replaceAll(i, replacements[i]);

    // replace log_\d, as regexes don't fit into the dictionary as keys
    if (EVAL_OPTIONS.log) lat = lat.replaceAll(/\\log_(\d)\\left\(/g, "Cust_log($1,");

    // IF there was no log this wouldn't have to be separated from the dictionary
    // without this \log_4\left(...\right) became \log_4(...) instead of Cust_log(4,...)
    lat = lat.replaceAll("\\left(", "("); 

    return lat;
}

// safe as in "no cheating" safe, not "no arbitrary code execution" safe
var safeEvalCode;
function safeEvaluateInit() {
    // generate the code of the function that the converted code is going to be put into
    const Cust_gcd = (a, b) => { while(b) [a, b] = [b, a % b]; return Math.abs(a)};
    const Cust_lcm = (a, b) => (a * b) / Cust_gcd(a, b);
    const Cust_log = (x, y) => Math.log(y) / Math.log(x);

    // for factorials, a new function of Number is defined (scuffed but still works)
    Object.defineProperty(Number.prototype, 'Cust_fact', {
        value: function() {
            return Array.from({length: this}, (_, i) => i + 1).reduce((acc, num) => acc * num, 1)
        },
        enumerable: true,
        configurable: true
    });

    // get the global scope keys
    // make every one of them a variable and make them all equal null
    // also pass functions we DO want do have

    let KEYS = Object.keys(globalThis);
    // TODO: make functions that can't be gotten via the line above null as well,
    // such as Math, Array or FileSystemWritableFileStream (although we need Math out of all the others but still)
    safeEvalCode =  `
        "use strict";
        ${KEYS.map(e => "let " + e + " = null;").join("\n")}
        const Cust_gcd = ${Cust_gcd.toString()};
        const Cust_lcm = ${Cust_lcm.toString()};
        const Cust_log = ${Cust_log.toString()};
    `;
}
function safeEvaluate(lat) {
    let result;
    try {
        result = (new Function(`
            ${safeEvalCode}
            return (${lat});
        `))();
    } catch (error) { return undefined; }
    if (typeof result != 'number' || isNaN(result)) return undefined;
    return result;
}