// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
// /Array Remove

var LANG = 'ua';

let paramLang = new URLSearchParams(window.location.search).get('l');
if (paramLang == "en" || paramLang == "de" || paramLang == "ua") {
    LANG = paramLang;
}

$('[id], [class], details summary, label span, span, title').each(function() {
    var text = $(this).html();
    
    if (text.startsWith('i18n_')) {
        var key = text.replace('i18n_', '');
        if (I18N[LANG] && I18N[LANG][key]) {
            $(this).html(I18N[LANG][key]);
        }
    }
});

// Sliders and checkboxes and their linked variables

let placedCharge = 2e-6;
$("#slider_charge").on('input', e => {
    placedCharge = parseFloat(e.target.value) * 1e-6;
    $("#val_charge").html(parseFloat(e.target.value).toFixed(2).padStart(5, " ") + I18N[LANG].chargeunit)
});

let drawEquipotential = true;
$("#check_equipot").on('change', e => {
    drawEquipotential = $('#check_equipot').is(":checked");
    render();
});

let equipLineDensityCoef = 4;
$("#slider_equipot").on('change', e => {
    equipLineDensityCoef = 1/parseFloat(e.target.value);
    render();
});

let equipLineOpacity = 1;
$("#slider_equipot_d").on('change', e => {
    equipLineOpacity = parseFloat(e.target.value);
    render();
});

let equipLineThickness = 1;
$("#slider_equipot_t").on('change', e => {
    equipLineThickness = parseInt(e.target.value);
    render();
});

let drawArrows = false;
$("#check_E").on('change', e => {
    drawArrows = $('#check_E').is(":checked");
    render();
});

let arrowsSpacing = 20;
$("#slider_E").on('change', e => {
    arrowsSpacing = parseFloat(e.target.value);
    render();
});

let arrowsOpacity = 1;
$("#slider_E_d").on('change', e => {
    arrowsOpacity = parseFloat(e.target.value);
    render();
});

let arrowsThickness = 2;
$("#slider_E_t").on('change', e => {
    arrowsThickness = parseInt(e.target.value);
    render();
});

let drawField = true;
$("#check_powerline").on('change', e => {
    drawField = $('#check_powerline').is(":checked");
    render();
});

let fieldDensity = 4;
$("#slider_powerline").on('change', e => {
    fieldDensity = parseFloat(e.target.value);
    render();
});

let fieldOpacity = 1;
$("#slider_powerline_d").on('change', e => {
    fieldOpacity = parseFloat(e.target.value);
    render();
});

let fieldThickness = 2;
$("#slider_powerline_t").on('change', e => {
    fieldThickness = parseInt(e.target.value);
    render();
});


const canvas = $('#can')[0];

const ctx = canvas.getContext('2d');

const k = 9e9; // \frac{1}{4\pi\epsilon_0}
const charges = [
    { x: window.innerWidth/3, y: window.innerHeight/2, q: 2e-6 },
    { x: window.innerWidth*2/3, y: window.innerHeight/2, q: -2e-6 }
];

function getChargeRadius(i) {
    return Math.sqrt(Math.abs(charges[i].q) * 1e6) * 5
}

function calculatePotential(x, y) {
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
    return potential;
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
function render(wait=true) {
    let innerCode = () => {
        const startTime = performance.now();

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let pots = [];
        for (let y = -5; y < canvas.height+5; y++) {
            pots[y] = [];
            for (let x = -5; x < canvas.width+5; x++) {
                pots[y][x] = calculatePotential(x, y);
            }
        }
        
        // when drawing equipotential lines, this is the offset to the back and to the front of the
        // checked pixel in both x and y to find the potential being searched for
        let equipotOffset1 = Math.floor(equipLineThickness/2);
        let equipotOffset2 = Math.ceil(equipLineThickness/2);
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const potential = pots[y][x];
                let r = 0, g = 0, b = 0;
                
                const clampedPotential = Math.max(-5000, Math.min(5000, potential));

                // coloring
                let value = 0;
                if (clampedPotential > 0) {
                    value = Math.log(clampedPotential + 1) / Math.log(5001);
                    r = value * 255;
                } else {
                    value = Math.log(-clampedPotential + 1) / Math.log(5001);
                    g = value * 255;
                    b = value * 255;
                }

                if (drawEquipotential) {
                    const potential00 = pots[y-equipotOffset1][x-equipotOffset1];
                    const potential01 = pots[y+equipotOffset2][x-equipotOffset1];
                    const potential10 = pots[y-equipotOffset1][x+equipotOffset2];
                    const potential11 = pots[y+equipotOffset2][x+equipotOffset2];

                    const minPot = Math.min(potential00, potential01, potential10, potential11);
                    const maxPot = Math.max(potential00, potential01, potential10, potential11);

                    for (let i = -4; i < Math.log(5000)/Math.log(equipLineDensityCoef); i++) {
                        let val = equipLineDensityCoef ** i;
                        if ((maxPot > val && minPot < val) || (maxPot > -val && minPot < -val)) {
                            r = r*(1-equipLineOpacity) + 255*equipLineOpacity;
                            g = g*(1-equipLineOpacity) + 255*equipLineOpacity;
                            b = b*(1-equipLineOpacity) + 255*equipLineOpacity;
                            break;
                        }
                    }
                }
                
                const index = (y * canvas.width + x) * 4;
                data[index] = r;
                data[index + 1] = g;
                data[index + 2] = b;
                data[index + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);


        if (drawArrows) {
            ctx.strokeStyle = `rgba(255, 0, 255, ${arrowsOpacity})`;
            ctx.lineWidth = arrowsThickness;
            for (let y = 0; y < canvas.height/arrowsSpacing; y++) {
                for (let x = 0; x < canvas.width/arrowsSpacing; x++) {
                    let E = calculateField(x*arrowsSpacing, y*arrowsSpacing);
                    let coordsFromCenter = {
                        x: E.x / E.r * (arrowsSpacing/2-1),
                        y: E.y / E.r * (arrowsSpacing/2-1),
                    };
                    ctx.beginPath();
                    ctx.moveTo(x*arrowsSpacing - coordsFromCenter.x, y*arrowsSpacing - coordsFromCenter.y);
                    ctx.lineTo(x*arrowsSpacing + coordsFromCenter.x, y*arrowsSpacing + coordsFromCenter.y);
                    ctx.stroke();
                }
            }
        }

        if (drawField) {
            ctx.strokeStyle = `rgba(0, 255, 0, ${fieldOpacity})`;
            ctx.lineWidth = fieldThickness;
            let incomingLines = [];
            for (let i = 0; i < charges.length; i++) {
                let linesNow = (incomingLines[i] || []).length;
                for (let j = 0; j < 2**fieldDensity - linesNow; j++) {
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
                        if (Px*Px + Py*Py > 100000000) break outer;
                        for (let k = 0; k < charges.length; k++) {
                            if (i == k) continue;
                            if ((Px - charges[k].x)**2 + (Py - charges[k].y)**2 <= 5) {
                                if (!incomingLines[k]) {
                                    incomingLines[k] = [];
                                }
                                incomingLines[k].push(Math.atan2(Py - charges[k].y, Px - charges[k].x))
                                break outer;
                            }
                        }
                    }
                    ctx.stroke();
                }
            }
        }

        currentBg = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const endTime = performance.now();
        
        $('#progress').text(I18N[LANG].rendered.replace('%time%', Math.round(endTime - startTime).toString()));
    };

    if (wait) {
        $('#progress').text(I18N[LANG].rendering);
        setTimeout(innerCode, 2);
    }
    else innerCode();
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
            charges.push({ x: mousePos.x, y: mousePos.y, q: placedCharge * (e.button == 0 ? 1 : -1) });
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
    if (draggingCoords.x == -100) return;
    charges[draggingIndex].x = draggingCoords.x;
    charges[draggingIndex].y = draggingCoords.y;
    draggingIndex = -1;
    draggingCoords = {x: -100, y: -100};
    render();
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
        ctx.fillStyle = charge.q > 0 ? "#ff0000" : "#0000ff";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
    }

    if (draggingIndex != -1) {
        ctx.beginPath();
        ctx.arc(draggingCoords.x, draggingCoords.y, getChargeRadius(draggingIndex), 0, 2 * Math.PI);
        ctx.fillStyle = charges[draggingIndex].q > 0 ? "#ff000088" : "#0000ff88";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff88";
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