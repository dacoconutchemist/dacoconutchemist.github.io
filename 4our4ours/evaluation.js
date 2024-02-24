const EVAL_ALL_ALLOWED = {
    sqrt: true, floor: true, ceil: true, log10: true, log: true,
    ln: true, exp: true, gcd: true, lcm: true, sin: true, cos: true,
    tan: true, csc: true, sec: true, ctg: true, arcsin: true, arccos: true,
    arctan: true, arccsc: true, arcsec: true, arcctg: true, sinh: true,
    cosh: true, tanh: true, csch: true, sech: true, ctgh: true, arcsinh: true,
    arccosh: true, arctanh: true, arccsch: true, arcsech: true, arcctgh: true,
    abs: true, perc: true, fact: true
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
    if (EVAL_OPTIONS.sqrt)     replacements["\\sqrt{"]                        = "Math.sqrt(";
    if (EVAL_OPTIONS.floor)    replacements["\\operatorname{floor}\\left("]   = "Math.floor(";
    if (EVAL_OPTIONS.ceil)     replacements["\\operatorname{ceil}\\left("]    = "Math.ceil(";
    if (EVAL_OPTIONS.lcm)      replacements["\\operatorname{lcm}\\left("]     = "Cust_lcm(";
    if (EVAL_OPTIONS.log10)    replacements["\\log\\left("]                   = "Math.log10(";
    
    if (EVAL_OPTIONS.ln)       replacements["\\ln\\left("]                    = "Math.log(";
    if (EVAL_OPTIONS.exp)      replacements["\\exp\\left("]                   = "Math.exp(";
    if (EVAL_OPTIONS.gcd)      replacements["\\gcd\\left("]                   = "Cust_gcd(";

    if (EVAL_OPTIONS.sin)      replacements["\\sin\\left("]                   = "Math.sin(";
    if (EVAL_OPTIONS.cos)      replacements["\\cos\\left("]                   = "Math.cos(";
    if (EVAL_OPTIONS.tan)      replacements["\\tan\\left("]                   = "Math.tan(";
    if (EVAL_OPTIONS.tan)      replacements["\\operatorname{tg}\\left("]      = "Math.tan(";

    if (EVAL_OPTIONS.csc)      replacements["\\csc\\left("]                   = "Cust_csc(";
    if (EVAL_OPTIONS.sec)      replacements["\\sec\\left("]                   = "Cust_sec(";
    if (EVAL_OPTIONS.ctg)      replacements["\\operatorname{ctg}\\left("]     = "Cust_ctg(";
    if (EVAL_OPTIONS.ctg)      replacements["\\cot\\left("]                   = "Cust_ctg(";

    if (EVAL_OPTIONS.arcsin)   replacements["\\arcsin\\left("]                = "Math.asin(";
    if (EVAL_OPTIONS.arccos)   replacements["\\arccos\\left("]                = "Math.acos(";
    if (EVAL_OPTIONS.arctan)   replacements["\\arctan\\left("]                = "Math.atan(";
    if (EVAL_OPTIONS.arctan)   replacements["\\operatorname{arctg}\\left("]   = "Math.atan(";

    if (EVAL_OPTIONS.arccsc)   replacements["\\operatorname{arccsc}\\left("]  = "Cust_acsc(";
    if (EVAL_OPTIONS.arcsec)   replacements["\\operatorname{arcsec}\\left("]  = "Cust_asec(";
    if (EVAL_OPTIONS.arcctg)   replacements["\\operatorname{arcctg}\\left("]  = "Cust_actg(";
    if (EVAL_OPTIONS.arcctg)   replacements["\\operatorname{arccot}\\left("]  = "Cust_actg(";

    if (EVAL_OPTIONS.sinh)     replacements["\\sinh\\left("]                  = "Math.sinh(";
    if (EVAL_OPTIONS.cosh)     replacements["\\cosh\\left("]                  = "Math.cosh(";
    if (EVAL_OPTIONS.tanh)     replacements["\\tanh\\left("]                  = "Math.tanh(";
    if (EVAL_OPTIONS.tanh)     replacements["\\operatorname{tgh}\\left("]     = "Math.tanh(";
    if (EVAL_OPTIONS.csch)     replacements["\\operatorname{csch}\\left("]    = "Cust_csch(";
    if (EVAL_OPTIONS.sech)     replacements["\\operatorname{sech}\\left("]    = "Cust_sech(";
    if (EVAL_OPTIONS.ctgh)     replacements["\\operatorname{ctgh}\\left("]    = "Cust_ctgh(";
    if (EVAL_OPTIONS.ctgh)     replacements["\\coth\\left("]                  = "Cust_ctgh(";

    if (EVAL_OPTIONS.arcsinh)  replacements["\\operatorname{arcsinh}\\left("] = "Math.asinh(";
    if (EVAL_OPTIONS.arccosh)  replacements["\\operatorname{arccosh}\\left("] = "Math.acosh(";
    if (EVAL_OPTIONS.arctanh)  replacements["\\operatorname{arctanh}\\left("] = "Math.atanh(";
    if (EVAL_OPTIONS.arctanh)  replacements["\\operatorname{arctgh}\\left("]  = "Math.atanh(";
    
    if (EVAL_OPTIONS.arccsch)  replacements["\\operatorname{arccsch}\\left("] = "Cust_acsch(";
    if (EVAL_OPTIONS.arcsech)  replacements["\\operatorname{arcsech}\\left("] = "Cust_asech(";
    if (EVAL_OPTIONS.arcctgh)  replacements["\\operatorname{arcctgh}\\left("] = "Cust_actgh(";
    if (EVAL_OPTIONS.arcctgh)  replacements["\\operatorname{arccoth}\\left("] = "Cust_actgh(";

    if (EVAL_OPTIONS.abs) {
                               replacements["\\abs\\left("]                   = "Math.abs(";
                               replacements["\\left|"]                        = "Math.abs(";
                               replacements["\\right|"]                       = ")";
    }
    if (EVAL_OPTIONS.perc)     replacements["\\%"]                            = "/100";
    if (EVAL_OPTIONS.fact)     replacements["!"]                              = " .Cust_fact()";
    if (EVAL_OPTIONS.log) {
                               replacements["\\log_{"]                        = "Cust_log(";
                               replacements["}\\left("]                       = ",";
    }

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
var safeEvalCode, evalForbiddenVars;
function safeEvaluateInit() {
    // generate the code of the function that the converted code is going to be put into

    let customFunctions = {
        Cust_gcd: (a, b) => { while(b) [a, b] = [b, a % b]; return Math.abs(a)},
        Cust_lcm: (a, b) => (a * b) / Cust_gcd(a, b),
        Cust_log: (x, y) => Math.log(y) / Math.log(x),

        Cust_csc: x => 1 / Math.sin(x),
        Cust_sec: x => 1 / Math.cos(x),
        Cust_ctg: x => 1 / Math.tan(x),
        Cust_acsc: x => Math.asin(1 / x),
        Cust_asec: x => Math.acos(1 / x),
        Cust_actg: x => Math.atan(1 / x) + (x < 0 ? Math.PI : 0),

        Cust_csch: x => 1 / Math.sinh(x),
        Cust_sech: x => 1 / Math.cosh(x),
        Cust_ctgh: x => 1 / Math.tanh(x),
        Cust_acsch: x => x == 0 ? NaN : Math.log(1 / x + Math.sqrt(1 / (x * x) + 1)),
        Cust_asech: x => (x > 0 && x <= 1) ? Math.log(1 / x + Math.sqrt(1 / (x * x) - 1)) : NaN,
        Cust_actgh: x => (x >= -1 && x <= 1) ? NaN : 0.5 * Math.log((x + 1) / (x - 1)),
    }
    // for factorials, a new function of Number is defined (scuffed but still works)
    Object.defineProperty(Number.prototype, 'Cust_fact', {
        value: function() {
            if (!Number.isInteger(this.valueOf())) return NaN;
            return Array.from({length: this}, (_, i) => i + 1).reduce((acc, num) => acc * num, 1)
        },
        enumerable: true,
        configurable: true
    });

    // sanitize user input for exploity stuff
    evalForbiddenVars = Object.getOwnPropertyNames(globalThis).concat(Reflect.ownKeys(globalThis)).filter(e => typeof e == "string");
    // don't remove math, we need it. we already do sanitize user input checking for "Math. ..."
    evalForbiddenVars = evalForbiddenVars.filter(e => e != "Math");

    safeEvalCode =  `
        "use strict";
        ${Object.keys(customFunctions).map(k =>`const ${k} = ${customFunctions[k].toString()};`).join("\n")}
    `;
}
function safeEvaluate(lat) {
    let result;
    if (!lat) return undefined;
    try {
        for (let i of evalForbiddenVars) lat = lat.replaceAll(i, "");
        result = (new Function(`
            ${safeEvalCode}
            return (${lat});
        `))();
    } catch (error) { return undefined; }
    if (typeof result != 'number' || isNaN(result)) return undefined;
    return result;
}