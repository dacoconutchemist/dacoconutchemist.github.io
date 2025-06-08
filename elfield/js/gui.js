// Listeners for all GUI

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
        updateJSI18N();
    }},
    {sel: "#check_equipot", type: "checkbox", var: "drawEquipotential", def: true, defVar: true},
    {sel: "#slider_equipot", type: "slider", var: "equipLineDensityCoef", def: "0.25", defVar: 4, preprocess: v => 1/parseFloat(v)},
    {sel: "#slider_equipot_d", type: "slider", var: "equipLineOpacity", def: "1", defVar: 1, preprocess: v => parseFloat(v)},
    {sel: "#slider_equipot_t", type: "slider", var: "equipLineThickness", def: "1", defVar: 1, preprocess: v => parseInt(v)},
    {sel: "#check_E", type: "checkbox", var: "drawArrows", def: false, defVar: false},
    {sel: "#slider_E", type: "slider", var: "arrowsSpacing", def: "20", defVar: 20, preprocess: v => parseFloat(v)},
    {sel: "#slider_E_d", type: "slider", var: "arrowsOpacity", def: "1", defVar: 1, preprocess: v => parseFloat(v)},
    {sel: "#slider_E_t", type: "slider", var: "arrowsThickness", def: "2", defVar: 2, preprocess: v => parseInt(v)},
    {sel: "#check_E_head", type: "checkbox", var: "drawArrowHeads", def: true, defVar: true},
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

SETTINGS.colorTool = [0, 255, 255];

// set default callbacks per type
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

SETTINGS.mode = "charge";
let toolCoords = [];
$("#tools > input").on('change', e => {
    let prevMode = SETTINGS.mode;
    SETTINGS.mode = $('input[name="toolsgroup"]:checked').val();
    if (prevMode != SETTINGS.mode) {
        switch (SETTINGS.mode) {
        case "charge":
            toolCoords = [];
            break;
        case "voltage":
            if (window.innerWidth > 480) toolCoords = [
                { x: window.innerWidth/3, y: window.innerHeight/2 - 50 },
                { x: window.innerWidth*2/3, y: window.innerHeight/2 + 50 }
            ];
            else toolCoords = [
                { x: window.innerWidth/3, y: window.innerHeight/3 - 50 },
                { x: window.innerWidth*2/3, y: window.innerHeight/3 + 50 }
            ];
            break;
        case "angle":
            if (window.innerWidth > 480) toolCoords = [
                { x: window.innerWidth/3, y: window.innerHeight/2 - 50 },
                { x: window.innerWidth*2/3 - 50, y: window.innerHeight/2 },
                { x: window.innerWidth/3, y: window.innerHeight/2 + 50 }
            ];
            else toolCoords = [
                { x: window.innerWidth/3, y: window.innerHeight/3 - 50 },
                { x: window.innerWidth*2/3 - 50, y: window.innerHeight/3 },
                { x: window.innerWidth/3, y: window.innerHeight/3 + 50 }
            ];
            break;
        case "equipline":
            if (window.innerWidth > 480) toolCoords = [
                { x: window.innerWidth/2 - 50, y: window.innerHeight/2 - 50 }
            ];
            else toolCoords = [
                { x: window.innerWidth/2 - 50, y: window.innerHeight/3  - 50 }
            ];
            break;
        case "powerline":
            if (window.innerWidth > 480) toolCoords = [
                { x: window.innerWidth/2 - 50, y: window.innerHeight/2  - 50 }
            ];
            else toolCoords = [
                { x: window.innerWidth/2 - 50, y: window.innerHeight/3  - 50}
            ];
            break;
        }
    }
});

$("#btn_clear").on('click', e => {
    if (confirm(I18N[LANG].clear_msg)) {
        // delete charges
        charges = [];
        render();
    }
});

$("#btn_reset").on('click', e => {
    if (confirm(I18N[LANG].reset_msg)) {
        // reset all settings to default values
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

function updateJSI18N() {
    // update time/fps display
    if (!SETTINGS.animatedMode) $('#progress').text(I18N[LANG].rendered.replace('%time%', lastRenderTime.toString()));
    else {
        let fps = 1000/lastRenderTime;
        runningFPS = runningFPS * 0.8 + fps * 0.2;
        $('#progress').text(I18N[LANG].rendered_fps.replace('%fps%', runningFPS.toFixed(2)));
    }
    // update Coulomb units
    $("#val_charge").html(SETTINGS.placedCharge.toFixed(2).padStart(5, " ") + I18N[LANG].chargeunit)
}

let draggingIndex = -1;
let draggingOffset = { x: 0, y: 0 }; // distance from center of charge to mouse pointer when dragging
let draggingCoords = { x: -100, y: -100 };
let dragType = "charge";

function clickOrStartDrag(e) {
    if (draggingIndex != -1) return;
    let mousePos = {
        x: e.clientX - canvas.offsetTop,
        y: e.clientY - canvas.offsetLeft
    };
    let chargeDragged = false;
    let chargeIndex = -1;
    if (e._interaction.pointerType != "touch") {
        // if using a mouse, find the first intersecting charge/circle
        for (let i = 0; i < charges.length; i++) {
            if ((mousePos.x - charges[i].x)**2 + (mousePos.y - charges[i].y)**2 <= (e.radius || getChargeRadius(i))**2) {
                chargeIndex = i;
                dragType = "charge";
                break;
            }
        }
        for (let i = 0; i < toolCoords.length; i++) {
            if ((mousePos.x - toolCoords[i].x)**2 + (mousePos.y - toolCoords[i].y)**2 <= 25) {
                chargeIndex = i;
                dragType = "tool";
                break;
            }
        }
    } else {
        // on touchscreen, use voronoi shaped areas for easier aiming (find closest charge to tap up to 20 px away)
        let minDistanceSq = 1e10;
        for (let i = 0; i < charges.length; i++) {
            let distanceSq = (mousePos.x - charges[i].x)**2 + (mousePos.y - charges[i].y)**2;
            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                dragType = "charge";
                chargeIndex = i;
            }
        }
        for (let i = 0; i < toolCoords.length; i++) {
            let distanceSq = (mousePos.x - toolCoords[i].x)**2 + (mousePos.y - toolCoords[i].y)**2;
            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                dragType = "tool";
                chargeIndex = i;
            }
        }
        if (minDistanceSq > 400) chargeIndex = -1;
    }
    // if we are actually dragging something:
    if (chargeIndex > -1) {
        if (e.button == 0) {
            // charge dragged
            if (dragType == "charge") {
                draggingOffset = {
                    x: mousePos.x - charges[chargeIndex].x,
                    y: mousePos.y - charges[chargeIndex].y
                };
                // field line priority hack - lines for first charge det drawn first
                // any dragged charge gets deprioritised by readding it to the end of the array
                let charge = charges[chargeIndex];
                charges.remove(chargeIndex);
                charges.push(charge);
                draggingIndex = charges.length - 1;
            }
            else {
                draggingOffset = {
                    x: mousePos.x - toolCoords[chargeIndex].x,
                    y: mousePos.y - toolCoords[chargeIndex].y
                };
                draggingIndex = chargeIndex;
            }
            chargeDragged = true;
        } else if (e.button == 2) {
            if (dragType == "charge") {
                // charge deleted
                charges.remove(chargeIndex);
                chargeDragged = true;
                render();
            }
        }
    }
    if (!chargeDragged) {
        // if it's not being dragged, it's placed
        if (e.button == 0 || e.button == 2) {
            charges.sort((a, b) => Math.abs(b.q) - Math.abs(a.q));
            charges.push({ x: mousePos.x, y: mousePos.y, q: SETTINGS.placedCharge * 1e-6 * (e.button == 0 ? 1 : -1) });
            render();
        }
    }
    updateCursor(e);
}

interact.pointerMoveTolerance(5);
interact(canvas)
    .draggable({
        listeners: {
            start(e) {
                clickOrStartDrag(e);
            },
            move(e) {
                let mousePos = {
                    x: e.clientX - canvas.offsetTop,
                    y: e.clientY - canvas.offsetLeft
                };
                // drag either ghost charge or actual charge depending on mode
                if (draggingIndex != -1) {
                    draggingCoords.x = mousePos.x - draggingOffset.x;
                    draggingCoords.y = mousePos.y - draggingOffset.y;
                    if (dragType == "charge") {
                        if (SETTINGS.animatedMode) {
                            charges[draggingIndex].x = draggingCoords.x;
                            charges[draggingIndex].y = draggingCoords.y;
                            if (!isRendering) render();
                        }
                    } else {
                        toolCoords[draggingIndex].x = draggingCoords.x;
                        toolCoords[draggingIndex].y = draggingCoords.y;
                    }
                    
                }
            },
            end(e) {
                // if we release without dragging, exit
                if (draggingIndex == -1) return;
                // if we did drag, but actually didn't (this was some edge case i think)
                // then also basically exit and reset everything to normal
                if (draggingCoords.x == -100) {
                    draggingIndex = -1;
                } else {
                    // if we did drag something then put it there and reset
                    if (dragType == "charge") {
                        charges[draggingIndex].x = draggingCoords.x;
                        charges[draggingIndex].y = draggingCoords.y;
                    } else {
                        toolCoords[draggingIndex].x = draggingCoords.x;
                        toolCoords[draggingIndex].y = draggingCoords.y;
                    }
                    draggingCoords = {x: -100, y: -100};
                    draggingIndex = -1;
                    if (dragType == "charge") render().then(() => {render()});
                }
                updateCursor(e);
            }
        }
    })
    .on('tap', e => {
        if (e.dt > 500) return; // https://github.com/taye/interact.js/issues/964
        clickOrStartDrag(e);
        // when tapping on a charge, reset everything because otherwise the charge will be dragged
        draggingCoords = {x: -100, y: -100};
        draggingIndex = -1;
    })
    .on('hold', e => {
        // do hold behavior only on touchscreen
        if (e._interaction.pointerType == "touch") {
            e.button = 2;
            clickOrStartDrag(e);
            // same here as above
            draggingCoords = {x: -100, y: -100};
            draggingIndex = -1;
        }
    })
    .styleCursor(false);

$(canvas).on('mousemove', updateCursor)

function updateCursor(e) {
    // hand when mousing over, clenched hand when dragging, crosshair otherwise
    let mousePos = {
        x: e.clientX - canvas.offsetTop,
        y: e.clientY - canvas.offsetLeft
    };
    let onFlag = false;
    for (let i = 0; i < charges.length; i++) {
        if ((mousePos.x - charges[i].x)**2 + (mousePos.y - charges[i].y)**2 <= getChargeRadius(i)**2) {
            onFlag = true;
            break;
        }
    }
    for (let i = 0; i < toolCoords.length; i++) {
        if ((mousePos.x - toolCoords[i].x)**2 + (mousePos.y - toolCoords[i].y)**2 <= 25) {
            onFlag = true;
            break;
        }
    }
    canvas.style.cursor = draggingIndex == -1 ? (onFlag ? "grab" : "crosshair") : "grabbing";
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