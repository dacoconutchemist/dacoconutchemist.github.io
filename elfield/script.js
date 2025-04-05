// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
// /Array Remove

// Sliders and checkboxes and their linked variables

let SETTINGS = {};

let listeners = [
    /*
        sel: selector for input
        event: will set the event that the listener gets triggered by. `change` by default
        type: will set a default `callback`, decide if `preprocess` gets used and decide exact `def` behavior
        var: linked variable in `SETTINGS`
        def: default value of the input
        defVar: default value of the linked variable
        callback: if no type is specified, this is the body of the listener
        preprocess: only for sliders, self-explanatory
    */
    {sel: "#slider_charge", event: "input", type: "", var: "placedCharge", def: "2", defVar: 2, callback: e=>{
        SETTINGS.placedCharge = parseFloat(e.target.value);
        $("#val_charge").html(parseFloat(e.target.value).toFixed(2).padStart(5, " ") + I18N[LANG].chargeunit)
    }},
    {sel: "#check_equipot", type: "checkbox", var: "drawEquipotential", def: true, defVar: true},
    {sel: "#slider_equipot", type: "slider", var: "equipLineDensityCoef", def: "0.25", defVar: 4, preprocess: v => 1/parseFloat(v)},
    {sel: "#slider_equipot_d", type: "slider", var: "equipLineOpacity", def: "1", defVar: 1, preprocess: v => parseFloat(v)},
    {sel: "#slider_equipot_t", type: "slider", var: "equipLineThickness", def: "1", defVar: 1, preprocess: v => parseInt(v)},
    {sel: "#check_E", type: "checkbox", var: "drawArrows", def: false, defVar: false},
    {sel: "#slider_E", type: "slider", var: "arrowsSpacing", def: "20", defVar: 20, preprocess: v => parseFloat(v)},
    {sel: "#slider_E_d", type: "slider", var: "arrowsOpacity", def: "1", defVar: 1, preprocess: v => parseFloat(v)},
    {sel: "#slider_E_t", type: "slider", var: "arrowsThickness", def: "2", defVar: 2, preprocess: v => parseInt(v)},
    {sel: "#check_powerline", type: "checkbox", var: "drawField", def: true, defVar: true},
    {sel: "#slider_powerline", type: "slider", var: "fieldDensity", def: "4", defVar: 4, preprocess: v => parseInt(v)},
    {sel: "#slider_powerline_d", type: "slider", var: "fieldOpacity", def: "1", defVar: 1, preprocess: v => parseFloat(v)},
    {sel: "#slider_powerline_t", type: "slider", var: "fieldThickness", def: "2", defVar: 2, preprocess: v => parseInt(v)},
    {sel: "#check_bg", type: "checkbox", var: "drawBg", def: true, defVar: true},
    {sel: "#color_equipot", type: "color", var: "colorsEquipotential", def: "#ffffff", defVar: [255, 255, 255]},
    {sel: "#color_powerline", type: "color", var: "colorsField", def: "#00ff00", defVar: [0, 255, 0]},
    {sel: "#color_E", type: "color", var: "colorsArrows", def: "#ff00ff", defVar: [255, 0, 255]},
    {sel: "#color_bg_def", type: "color", var: "colorBgDefault", def: "#000000", defVar: [0, 0, 0]},
    {sel: "#color_pos", type: "color", var: "colorBgPos", def: "#ff0000", defVar: [255, 0, 0]},
    {sel: "#color_neg", type: "color", var: "colorBgNeg", def: "#0000ff", defVar: [0, 0, 255]},
    {sel: "#color_outline", type: "color", var: "colorOutline", def: "#ffffff", defVar: [255, 255, 255]},
];

for (let i of listeners) {
    let callback = () => {};
    switch (i.type) {
    case "checkbox":
        callback = () => {
            SETTINGS[i.var] = $(i.sel).is(":checked");
            render();
        };
        break;
    case "slider":
        callback = e => {
            SETTINGS[i.var] = i.preprocess(e.target.value);
            render();
        };
        break;
    case "color":
        callback = e => {
            SETTINGS[i.var] = hexToArr(e.target.value);
            render();
        };
        break;
    default:
        callback = i.callback;
    }
    SETTINGS[i.var] = i.defVar;
    $(i.sel).on(i.event || "change", callback);
}

function hexToArr(hex) {
    return hex.substring(1).match(/.{2}/g)
              .map(x => parseInt(x, 16));
}

function colorToRGBA(rgb, a) {
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
}

function lerpColors(bg, overlay, opacity) {
    return [
        bg[0]+(overlay[0]-bg[0])*opacity,
        bg[1]+(overlay[1]-bg[1])*opacity,
        bg[2]+(overlay[2]-bg[2])*opacity,
    ];
}


const canvas = $('#can')[0];

const ctx = canvas.getContext('2d');

const k = 9e9; // \frac{1}{4\pi\epsilon_0}
let charges = [
    { x: window.innerWidth/3, y: window.innerHeight/2, q: 2e-6 },
    { x: window.innerWidth*2/3, y: window.innerHeight/2, q: -2e-6 }
];

$("#btn_clear").on('click', e => {
    if (confirm(I18N[LANG].clear_msg)) {
        charges = [];
        render();
    }
});

$("#btn_reset").on('click', e => {
    if (confirm(I18N[LANG].reset_msg)) {
        for (let i of listeners) {
            SETTINGS[i.var] = i.defVar;
            if (i.type == "checkbox") {
                $(i.sel).prop("checked", i.def);
            } else {
                $(i.sel).val(i.def);
            }
        }
        render();
    }
});

function getChargeRadius(i) {
    return Math.sqrt(Math.abs(charges[i].q) * 1e6) * 5
}

function calculateField(x, y) {
    let Ex = 0;
    let Ey = 0;
    for (let i = 0; i < charges.length; i++) {
        const charge = charges[i];
        const dx = x - charge.x;
        const dy = y - charge.y;
        const r2 = dx * dx + dy * dy;
        const r = Math.sqrt(r2);
        
        if (r > 0.01) {
            const E = (k * charge.q) / r / r2;
            Ex += dx * E;
            Ey += dy * E;
        }
    }
    return {x: Ex, y: Ey, r: Math.sqrt(Ex * Ex + Ey * Ey)};
}

let currentBg = null;
let lastRenderTime = 0;
function render(wait=true) {
    let innerCode = () => {
        const startTime = performance.now();

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        //performance.mark("start-pots");

        let pots = [];
        for (let y = -5; y < canvas.height+5; y++) {
            pots[y] = [];
            for (let x = -5; x < canvas.width+5; x++) {
                let potential = 0;
                for (let i = 0; i < charges.length; i++) {
                    const charge = charges[i];
                    const dx = x - charge.x;
                    const dy = y - charge.y;
                    const r = Math.sqrt(dx * dx + dy * dy);
                    
                    if (r > 0.01) {
                        potential += (k * charge.q) / r;
                    }
                }
                pots[y][x] = potential;
            }
        }

        //performance.mark("end-pots");
        //performance.measure("pots", "start-pots", "end-pots");
        //performance.mark("start-bg");
        
        // when drawing equipotential lines, this is the offset to the back and to the front of the
        // checked pixel in both x and y to find the potential being searched for
        let equipotOffset1 = Math.floor(SETTINGS.equipLineThickness/2);
        let equipotOffset2 = Math.ceil(SETTINGS.equipLineThickness/2);
        let equipLineDensityStart = SETTINGS.equipLineDensityCoef ** -4;
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const potential = pots[y][x];
                let col = SETTINGS.colorBgDefault;
                
                if (SETTINGS.drawBg) {
                    const clampedPotential = Math.max(-5000, Math.min(5000, potential));
                    if (clampedPotential > 0) {
                        col = lerpColors(col, SETTINGS.colorBgPos, Math.log(clampedPotential + 1) / Math.log(5001));
                    } else {
                        col = lerpColors(col, SETTINGS.colorBgNeg, Math.log(-clampedPotential + 1) / Math.log(5001));
                    }
                }

                if (SETTINGS.drawEquipotential) {
                    const potential00 = pots[y-equipotOffset1][x-equipotOffset1];
                    const potential01 = pots[y+equipotOffset2][x-equipotOffset1];
                    const potential10 = pots[y-equipotOffset1][x+equipotOffset2];
                    const potential11 = pots[y+equipotOffset2][x+equipotOffset2];

                    const minPot = Math.min(potential00, potential01, potential10, potential11);
                    const maxPot = Math.max(potential00, potential01, potential10, potential11);

                    for (let val = equipLineDensityStart; val < 5000; val *= SETTINGS.equipLineDensityCoef) {
                        if ((maxPot > val && minPot < val) || (maxPot > -val && minPot < -val)) {
                            col = lerpColors(col, SETTINGS.colorsEquipotential, SETTINGS.equipLineOpacity);
                            break;
                        }
                    }
                }
                
                const index = (y * canvas.width + x) * 4;
                data[index] = col[0];
                data[index + 1] = col[1];
                data[index + 2] = col[2];
                data[index + 3] = 255;
            }
        }

        //performance.mark("end-bg");
        //performance.measure("bg", "start-bg", "end-bg");

        ctx.putImageData(imageData, 0, 0);


        if (SETTINGS.drawArrows) {
            //performance.mark("start-arrows");

            ctx.strokeStyle = colorToRGBA(SETTINGS.colorsArrows, SETTINGS.arrowsOpacity);
            ctx.lineWidth = SETTINGS.arrowsThickness;
            for (let y = 0; y < canvas.height/SETTINGS.arrowsSpacing; y++) {
                for (let x = 0; x < canvas.width/SETTINGS.arrowsSpacing; x++) {
                    let E = calculateField(x*SETTINGS.arrowsSpacing, y*SETTINGS.arrowsSpacing);
                    let coordsFromCenter = {
                        x: E.x / E.r * (SETTINGS.arrowsSpacing/2-1),
                        y: E.y / E.r * (SETTINGS.arrowsSpacing/2-1),
                    };
                    ctx.beginPath();
                    ctx.moveTo(x*SETTINGS.arrowsSpacing - coordsFromCenter.x, y*SETTINGS.arrowsSpacing - coordsFromCenter.y);
                    ctx.lineTo(x*SETTINGS.arrowsSpacing + coordsFromCenter.x, y*SETTINGS.arrowsSpacing + coordsFromCenter.y);
                    ctx.stroke();
                }
            }
            //performance.mark("end-arrows");
            //performance.measure("arrows", "start-arrows", "end-arrows");
        }

        if (SETTINGS.drawField) {
            //performance.mark("start-field");

            ctx.strokeStyle = colorToRGBA(SETTINGS.colorsField, SETTINGS.fieldOpacity);
            ctx.lineWidth = SETTINGS.fieldThickness;
            let incomingLines = [];
            for (let i = 0; i < charges.length; i++) {
                let linesNow = (incomingLines[i] || []).length;
                for (let j = 0; j < 2**SETTINGS.fieldDensity - linesNow; j++) {
                    let newLineAngle = 0;
                    if (!incomingLines[i]) {
                        incomingLines[i] = [];
                        newLineAngle = 0;
                    } else {
                        incomingLines[i].sort((a, b) => a - b);

                        let maxGap = 0;
                        incomingLines[i].forEach((angle, I) => {
                            let next = incomingLines[i][(I + 1) % incomingLines[i].length] + (I + 1 == incomingLines[i].length ? 2 * Math.PI : 0);
                            let gap = next - angle;
                            if (gap > maxGap) [maxGap, newLineAngle] = [gap, (angle + next) / 2 % (2 * Math.PI)];
                        });
                    }
                    incomingLines[i].push(newLineAngle);

                    let Px = charges[i].x + 5*Math.cos(newLineAngle);
                    let Py = charges[i].y + 5*Math.sin(newLineAngle);
                    ctx.beginPath();
                    ctx.moveTo(Px, Py);
                    let negateField = charges[i].q < 0 ? -1 : 1;
                    outer: for (let I = 0; I < 50000; I++) {
                        let E = calculateField(Px, Py);
                        Px += E.x / E.r * negateField;
                        Py += E.y / E.r * negateField;
                        ctx.lineTo(Px, Py);
                        if (Px*Px + Py*Py > 1e8) break outer;
                        for (let k = 0; k < charges.length; k++) {
                            if (i == k) continue;
                            if ((Px - charges[k].x)**2 + (Py - charges[k].y)**2 <= 5) {
                                if (!incomingLines[k]) {
                                    incomingLines[k] = [];
                                }
                                incomingLines[k].push(Math.atan2(Py - charges[k].y, Px - charges[k].x));
                                break outer;
                            }
                        }
                    }
                    ctx.stroke();
                }
            }
            //performance.mark("end-field");
            //performance.measure("field", "start-field", "end-field");
        }

        //performance.mark("end-all");

        currentBg = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const endTime = performance.now();
        lastRenderTime = Math.round(endTime - startTime);
        $('#progress').text(I18N[LANG].rendered.replace('%time%', lastRenderTime.toString()));
    };

    if (wait) {
        $('#progress').text(I18N[LANG].rendering);
        setTimeout(innerCode, 2);
    }
    else innerCode();
}

function updateJSI18N() {
    $('#progress').text(I18N[LANG].rendered.replace('%time%', lastRenderTime.toString()));
    $("#val_charge").html(SETTINGS.placedCharge.toFixed(2).padStart(5, " ") + I18N[LANG].chargeunit)
}

let draggingIndex = -1;
let draggingOffset = {x: 0, y: 0};
let draggingCoords = {x: -100, y: -100};
$(canvas).on("mousedown", e => {
    if (draggingIndex != -1) return;
    const mousePos = {
        x: e.clientX - canvas.offsetTop,
        y: e.clientY - canvas.offsetLeft
    };
    let chargeDragged = false;
    for (let i = 0; i < charges.length; i++) {
        if ((mousePos.x - charges[i].x)**2 + (mousePos.y - charges[i].y)**2 <= getChargeRadius(i)**2) {
            if (e.button == 0) {
                draggingOffset = {
                    x: mousePos.x - charges[i].x,
                    y: mousePos.y - charges[i].y
                };
                chargeDragged = true;
                draggingIndex = i;
                break;
            } else if (e.button == 2) {
                charges.remove(i);
                chargeDragged = true;
                render();
                break;
            }
        }
    }
    if (!chargeDragged) {
        if (e.button == 0 || e.button == 2) {
            charges.push({ x: mousePos.x, y: mousePos.y, q: SETTINGS.placedCharge * 1e-6 * (e.button == 0 ? 1 : -1) });
            charges.sort((a, b) => Math.abs(b.q) - Math.abs(a.q));
            render();
        }
    }
});
$(canvas).on("mousemove", e => {
    const mousePos = {
        x: e.clientX - canvas.offsetTop,
        y: e.clientY - canvas.offsetLeft
    };
    if (draggingIndex != -1) {
        draggingCoords.x = mousePos.x - draggingOffset.x;
        draggingCoords.y = mousePos.y - draggingOffset.y;
    }
});
$(canvas).on("mouseup", e => {
    if (draggingIndex == -1) return;
    if (draggingCoords.x == -100) {
        draggingIndex = -1;
    } else {
        charges[draggingIndex].x = draggingCoords.x;
        charges[draggingIndex].y = draggingCoords.y;
        draggingCoords = {x: -100, y: -100};
        draggingIndex = -1;
        render();
    }
});
$(canvas).on("contextmenu", e => {
    return false;
});


function animateWithoutRequest() {
    var bounds = canvas.getBoundingClientRect();
    canvas.setAttribute("width", bounds.width);
    canvas.width = bounds.width;
    canvas.setAttribute("height", bounds.height);
    canvas.height = bounds.height;

    if (currentBg) ctx.putImageData(currentBg, 0, 0);

    for (let i = 0; i < charges.length; i++) {
        const charge = charges[i];
        ctx.beginPath();
        ctx.arc(charge.x, charge.y, getChargeRadius(i), 0, 2 * Math.PI);
        ctx.fillStyle = charge.q > 0 ? colorToRGBA(SETTINGS.colorBgPos, 1) : colorToRGBA(SETTINGS.colorBgNeg, 1);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = colorToRGBA(SETTINGS.colorOutline, 1);
        ctx.stroke();
    }

    if (draggingIndex != -1) {
        ctx.beginPath();
        ctx.arc(draggingCoords.x, draggingCoords.y, getChargeRadius(draggingIndex), 0, 2 * Math.PI);
        ctx.fillStyle = charges[draggingIndex].q > 0 ? colorToRGBA(SETTINGS.colorBgPos, 0.5) : colorToRGBA(SETTINGS.colorBgNeg, 0.5);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = colorToRGBA(SETTINGS.colorOutline, 0.5);
        ctx.stroke();
    }
}
function animate() {
    animateWithoutRequest();
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
animateWithoutRequest();
render(false);
$(window).on("resize", () => {
    animateWithoutRequest();
    render();
});

$("#collapse").on("click", () => {
    $("#controls").hide();
    $("#uncollapse").show();
});
$("#uncollapse").on("click", () => {
    $("#controls").show();
    $("#uncollapse").hide();
});