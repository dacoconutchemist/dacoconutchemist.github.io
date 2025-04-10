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
    {sel: "#check_anim", type: "checkbox", var: "animatedMode", def: false, defVar: false}
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

const canvas = $('#can')[0];

const ctx = canvas.getContext('2d');

const k = 9e9; // \frac{1}{4\pi\epsilon_0}
let charges = [];

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
let isRendering = false;
let lastRenderTime = 0;
let runningFPS = 10;

const numWorkers = Math.min(10, navigator.hardwareConcurrency || 4);
let workerCode = `
    function lerpColors(bg, overlay, opacity) {
        return [
            bg[0]+(overlay[0]-bg[0])*opacity,
            bg[1]+(overlay[1]-bg[1])*opacity,
            bg[2]+(overlay[2]-bg[2])*opacity,
        ];
    }

    onmessage = function(e) {
        let TYPE = e.data.TYPE;
        if (TYPE == "potential") {
            const { sharedPotentialBuffer, potsWidth, potsHeight, startY, endY, charges, k } = e.data;
            const pots = new Float64Array(sharedPotentialBuffer);

            for (let y = startY; y < endY; y++) {
                for (let x = 0; x < potsWidth; x++) {
                    let potential = 0;
                    for (let i = 0; i < charges.length; i++) {
                        const charge = charges[i];
                        const dx = x - (charge.x + 5);
                        const dy = y - (charge.y + 5);
                        const r = Math.sqrt(dx * dx + dy * dy);
                        if (r > 0.01) {
                            potential += (k * charge.q) / r;
                        }
                    }
                    pots[y * potsWidth + x] = potential;
                }
            }
        } else if (TYPE == "bg") {
            const {
                sharedBgBuffer,
                sharedPotentialBuffer,
                potsWidth,
                equipLineThickness,
                equipLineDensityCoef,
                colorBgDefault,
                drawBg,
                colorBgPos,
                colorBgNeg,
                drawEquipotential,
                colorsEquipotential,
                equipLineOpacity,
                canvasWidth,
                canvasHeight,
                startY,
                endY
            } = e.data;
            let DATA = new Uint8ClampedArray(sharedBgBuffer);
            const pots = new Float64Array(sharedPotentialBuffer);
            const equipotOffset1 = Math.floor(equipLineThickness/2);
            const equipotOffset2 = Math.ceil(equipLineThickness/2);
            const equipLineDensityStart = equipLineDensityCoef ** -4;
            const log5001 = Math.log(5001);
            for (let y = startY; y < endY; y++) {
                for (let x = 0; x < canvasWidth; x++) {
                    const potential = pots[(y + 5) * potsWidth + x + 5];
                    let col = colorBgDefault;
                    
                    if (drawBg) {
                        const clampedPotential = Math.max(-5000, Math.min(5000, potential));
                        if (clampedPotential > 0) {
                            col = lerpColors(col, colorBgPos, Math.log(clampedPotential + 1) / log5001);
                        } else {
                            col = lerpColors(col, colorBgNeg, Math.log(-clampedPotential + 1) / log5001);
                        }
                    }

                    if (drawEquipotential) {
                        const potential00 = pots[(y-equipotOffset1 + 5) * potsWidth + x-equipotOffset1 + 5];
                        const potential01 = pots[(y+equipotOffset2 + 5) * potsWidth + x-equipotOffset1 + 5];
                        const potential10 = pots[(y-equipotOffset1 + 5) * potsWidth + x+equipotOffset2 + 5];
                        const potential11 = pots[(y+equipotOffset2 + 5) * potsWidth + x+equipotOffset2 + 5];

                        const minPot = Math.min(potential00, potential01, potential10, potential11);
                        const maxPot = Math.max(potential00, potential01, potential10, potential11);

                        for (let val = equipLineDensityStart; val < 5000; val *= equipLineDensityCoef) {
                            if ((maxPot > val && minPot < val) || (maxPot > -val && minPot < -val)) {
                                col = lerpColors(col, colorsEquipotential, equipLineOpacity);
                                break;
                            }
                        }
                    }
                    
                    const index = (y * canvasWidth + x) * 4;
                    DATA[index] = col[0];
                    DATA[index + 1] = col[1];
                    DATA[index + 2] = col[2];
                    DATA[index + 3] = 255;
                }
            }
        }
        
        postMessage('done');
    };
`;
const workerURL = URL.createObjectURL(new Blob([workerCode], { type: "application/javascript" }));
let workers = [];
for (let i = 0; i < numWorkers; i++) workers.push(new Worker(workerURL));

async function render() {
    if (isRendering) return;
    isRendering = true;

    if (!SETTINGS.animatedMode) $('#progress').text(I18N[LANG].rendering);

    const startTime = performance.now();

    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;

    const potsWidth = canvasWidth + 10;
    const potsHeight = canvasHeight + 10;
    const sharedPotentialBuffer = new SharedArrayBuffer(Float64Array.BYTES_PER_ELEMENT * potsWidth * potsHeight);
    //const pots = new Float64Array(sharedPotentialBuffer);
    for (let i = 0; i < numWorkers; i++) {
        const startY = Math.floor(i * potsHeight / numWorkers);
        const endY = Math.floor((i + 1) * potsHeight / numWorkers);
        workers[i].postMessage({
            TYPE: "potential",
            sharedPotentialBuffer,
            potsWidth,
            potsHeight,
            startY,
            endY,
            charges,
            k
        });
    }
    await Promise.all(workers.map(worker => new Promise(resolve => {
        worker.onmessage = resolve
    })));

    const sharedBgBuffer = new SharedArrayBuffer(Uint8ClampedArray.BYTES_PER_ELEMENT * canvasWidth * canvasHeight * 4);
    for (let i = 0; i < numWorkers; i++) {
        const startY = Math.floor(i * canvasHeight / numWorkers);
        const endY = Math.floor((i + 1) * canvasHeight / numWorkers);
        workers[i].postMessage({
            TYPE: "bg",
            sharedBgBuffer,
            sharedPotentialBuffer,
            potsWidth,
            // accessing variables instead of properties of SETTINGS goes vroom vroom so I do it here
            equipLineThickness: SETTINGS.equipLineThickness,
            equipLineDensityCoef: SETTINGS.equipLineDensityCoef,
            colorBgDefault: SETTINGS.colorBgDefault,
            drawBg: SETTINGS.drawBg,
            colorBgPos: SETTINGS.colorBgPos,
            colorBgNeg: SETTINGS.colorBgNeg,
            drawEquipotential: SETTINGS.drawEquipotential,
            colorsEquipotential: SETTINGS.colorsEquipotential,
            equipLineOpacity: SETTINGS.equipLineOpacity,
            canvasWidth,
            canvasHeight,
            startY,
            endY,
        });
    }
    await Promise.all(workers.map(worker => new Promise(resolve => {
        worker.onmessage = resolve
    })));
    
    ////console.log(pixelData);
    const imageData = new ImageData(canvasWidth, canvasHeight)
    imageData.data.set(new Uint8ClampedArray(sharedBgBuffer));
    ctx.putImageData(imageData, 0, 0);

    //ctx.fillStyle = "black";
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    ////console.log("for (const key in $0) if (key.startsWith('on')) document.addEventListener(key.slice(2), //console.log);")


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
        let maxIter = 10000;//Math.ceil(Math.sqrt(canvasWidth*canvasWidth + canvasHeight*canvasHeight) * 2);
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
                outer: for (let I = 0; I < maxIter; I++) {
                    let E = calculateField(Px, Py);
                    Px += E.x / E.r * negateField;
                    Py += E.y / E.r * negateField;
                    ctx.lineTo(Px, Py);
                    if (Px < -2000 || Py < -2000 || Px > canvasWidth+2000 || Py > canvasHeight+2000) break outer;
                    
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

    if (!SETTINGS.animatedMode) $('#progress').text(I18N[LANG].rendered.replace('%time%', lastRenderTime.toString()));
    else {
        let fps = 1000/lastRenderTime;
        runningFPS = runningFPS * 0.8 + fps * 0.2;
        $('#progress').text(I18N[LANG].rendered_fps.replace('%fps%', runningFPS.toFixed(2)));
    }

    isRendering = false;
}

function updateJSI18N() {
    $('#progress').text(I18N[LANG].rendered.replace('%time%', lastRenderTime.toString()));
    $("#val_charge").html(SETTINGS.placedCharge.toFixed(2).padStart(5, " ") + I18N[LANG].chargeunit)
}

let draggingIndex = -1;
let draggingOffset = {x: 0, y: 0};
let draggingCoords = {x: -100, y: -100};
$(canvas).on("mousedown", e => {
    ////console.log(e.button);
    if (draggingIndex != -1) return;
    let mousePos = {
        x: e.clientX - canvas.offsetTop,
        y: e.clientY - canvas.offsetLeft
    };
    let chargeDragged = false;
    for (let i = 0; i < charges.length; i++) {
        if ((mousePos.x - charges[i].x)**2 + (mousePos.y - charges[i].y)**2 <= (e.radius || getChargeRadius(i))**2) {
            //console.log('intersecting charge found')
            if (e.button == 0) {
                //console.log('charge dragged')
                draggingOffset = {
                    x: mousePos.x - charges[i].x,
                    y: mousePos.y - charges[i].y
                };
                chargeDragged = true;
                draggingIndex = i;
                break;
            } else if (e.button == 2) {
                //console.log('charge yeeted')
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
    let mousePos = {
        x: e.clientX - canvas.offsetTop,
        y: e.clientY - canvas.offsetLeft
    };
    if (draggingIndex != -1) {
        draggingCoords.x = mousePos.x - draggingOffset.x;
        draggingCoords.y = mousePos.y - draggingOffset.y;
        if (SETTINGS.animatedMode) {
            charges[draggingIndex].x = draggingCoords.x;
            charges[draggingIndex].y = draggingCoords.y;
            if (!isRendering) render();
        }
    }
});
$(canvas).on("mouseup", e => {
    //console.log(draggingIndex, draggingCoords)
    if (draggingIndex == -1) return;
    if (draggingCoords.x == -100) {
        draggingIndex = -1;
    } else {
        charges[draggingIndex].x = draggingCoords.x;
        charges[draggingIndex].y = draggingCoords.y;
        draggingCoords = {x: -100, y: -100};
        draggingIndex = -1;
        render().then(() => {render()});
    }
});
$(canvas).on("contextmenu", e => {
    return false;
});




const hammer = new Hammer(canvas);

canvas.style.touchAction = 'none';
hammer.get('tap').set({ time: 250 });
hammer.get('press').set({ time: 500 });
hammer.get('pan').set({
    direction: Hammer.DIRECTION_ALL,
});

// Handle single tap (simulate left click)
hammer.on("tap", ev => {
    //console.log('tap')
    const e = {
        button: 0,
        clientX: ev.center.x,
        clientY: ev.center.y
    };
    $(canvas).triggerHandler($.Event("mousedown", e));
    $(canvas).triggerHandler($.Event("mouseup", e));
});

// Handle press (long tap) as right-click
hammer.on("press", ev => {
    //console.log('press')
    const e = {
        button: 2,
        clientX: ev.center.x,
        clientY: ev.center.y,
        radius: 18
    };
    $(canvas).triggerHandler($.Event("mousedown", e));
    $(canvas).triggerHandler($.Event("mouseup", e));
});

// Dragging support
let isDragging = false;

hammer.on("panstart", ev => {
    //console.log('pan start')
    const e = {
        button: 0,
        clientX: ev.center.x,
        clientY: ev.center.y,
        radius: 18
    };
    isDragging = true;
    $(canvas).triggerHandler($.Event("mousedown", e));
});

hammer.on("panmove", ev => {
    //console.log('pan move')
    //if (!isDragging) return;
    //console.log(ev)
    const e = {
        clientX: ev.center.x,
        clientY: ev.center.y
    };
    $(canvas).triggerHandler($.Event("mousemove", e));
});

hammer.on("panend pancancel", ev => {
    //console.log('pan end')
    //if (!isDragging) return;
    const e = {
        clientX: ev.center.x,
        clientY: ev.center.y
    };
    isDragging = false;
    $(canvas).triggerHandler($.Event("mouseup", e));
});

/*let isTouchDragging = false;
let forceTimeout = null;
let isShortClick = false;
let touchX = 0;
let touchY = 0;
let lastX = 0;
let lastY = 0;
$(canvas).on("touchstart", e => {
    touchX = e.touches[0].clientX;
    lastX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
    lastY = e.touches[0].clientY;
    if (!isShortClick && !isTouchDragging) {
        isShortClick = true;
        forceTimeout = setTimeout(() => {
            if (isShortClick) {
                isShortClick = false;
                $(canvas).triggerHandler(jQuery.Event("mousedown", {clientX: touchX, clientY: touchY, button: 2}));
                $(canvas).triggerHandler(jQuery.Event("mouseup", {clientX: touchX, clientY: touchY}));
            }
        }, 500);
    }
});
$(canvas).on("touchmove", e => {
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    //console.log((touchX-lastX)**2+(touchY-lastY)**2);
    if (isShortClick && (touchX-lastX)**2+(touchY-lastY)**2 > 400) {
        isShortClick = false;
        isTouchDragging = true;
        clearTimeout(forceTimeout);
        $(canvas).triggerHandler(jQuery.Event("mousedown", {clientX: touchX, clientY: touchY, button: 0}));
        $(canvas).triggerHandler(jQuery.Event("mousemove", {clientX: lastX, clientY: lastY}));
    }
    if (isTouchDragging) {
        clearTimeout(forceTimeout);
        $(canvas).triggerHandler(jQuery.Event("mousemove", {clientX: lastX, clientY: lastY}));
    }
});
$(canvas).on("touchend", e => {
    clearTimeout(forceTimeout);
    if (isShortClick) {
        isShortClick = false;
        $(canvas).triggerHandler(jQuery.Event("mousedown", {clientX: lastX, clientY: lastY, button: 0}));
        $(canvas).triggerHandler(jQuery.Event("mouseup"));
    }
    if (isTouchDragging) {
        isTouchDragging = false;
        $(canvas).triggerHandler(jQuery.Event("mouseup"));
    }
});*/



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

    if (!SETTINGS.animatedMode) if (draggingIndex != -1) {
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

function setRealVh() {
  document.documentElement.style.setProperty('--real-vh', `${window.innerHeight}px`);
}
setRealVh();
window.addEventListener('resize', setRealVh);

$(document).ready(() => {
    if (window.innerWidth > 480) charges = [
        { x: window.innerWidth/3, y: window.innerHeight/2, q: 2e-6 },
        { x: window.innerWidth*2/3, y: window.innerHeight/2, q: -2e-6 }
    ];
    else charges = [
        { x: window.innerWidth/3, y: window.innerHeight/3, q: 2e-6 },
        { x: window.innerWidth*2/3, y: window.innerHeight/3, q: -2e-6 }
    ];
    requestAnimationFrame(animate);
    animateWithoutRequest();
    render();
});