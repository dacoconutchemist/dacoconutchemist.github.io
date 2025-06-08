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
let isRendering = false;
let lastRenderTime = 0;
let runningFPS = 10;

// multithreading
const numWorkers = Math.min(10, navigator.hardwareConcurrency || 4);
let workerCode = `
    // linear interpolation of colors
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
            // potential calculation

            // pass all parameters and interpret the shared buffer as a float array
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
            // background color calculation

            // pass all parameters and interpret the shared buffer as a float array
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

            // magic here
            const equipotOffset1 = Math.floor(equipLineThickness/2);
            const equipotOffset2 = Math.ceil(equipLineThickness/2);
            const equipLineDensityStart = equipLineDensityCoef ** -4;

            const log5001 = Math.log(5001); // it's measurably faster this way ok???

            for (let y = startY; y < endY; y++) {
                for (let x = 0; x < canvasWidth; x++) {
                    // potential offset by 5 in x and y due to a bit out of the border being calculated
                    const potential = pots[(y + 5) * potsWidth + x + 5];
                    let col = colorBgDefault;
                    
                    if (drawBg) {
                        // for coloring, clamp the potential and do a log scale for color up to 5000 volts in both directions

                        const clampedPotential = Math.max(-5000, Math.min(5000, potential));
                        if (clampedPotential > 0) {
                            col = lerpColors(col, colorBgPos, Math.log(clampedPotential + 1) / log5001);
                        } else {
                            col = lerpColors(col, colorBgNeg, Math.log(-clampedPotential + 1) / log5001);
                        }
                    }

                    if (drawEquipotential) {
                        // get potential in the corners of a pixel (or corners of a bigger range for increased line thickness)
                        const potential00 = pots[(y-equipotOffset1 + 5) * potsWidth + x-equipotOffset1 + 5];
                        const potential01 = pots[(y+equipotOffset2 + 5) * potsWidth + x-equipotOffset1 + 5];
                        const potential10 = pots[(y-equipotOffset1 + 5) * potsWidth + x+equipotOffset2 + 5];
                        const potential11 = pots[(y+equipotOffset2 + 5) * potsWidth + x+equipotOffset2 + 5];

                        // find the biggest and smallest potentials
                        const minPot = Math.min(potential00, potential01, potential10, potential11);
                        const maxPot = Math.max(potential00, potential01, potential10, potential11);

                        // if a "pixel" contains a potential belonging to one of the lines somewhere
                        // inside of it (intermediate value theorem), it belongs to a line
                        for (let val = equipLineDensityStart; val < 5000; val *= equipLineDensityCoef) {
                            if ((maxPot > val && minPot < val) || (maxPot > -val && minPot < -val)) {
                                col = lerpColors(col, colorsEquipotential, equipLineOpacity);
                                break;
                            }
                        }
                    }
                    
                    // set corresponding pixel
                    const index = (y * canvasWidth + x) * 4;
                    DATA[index] = col[0];
                    DATA[index + 1] = col[1];
                    DATA[index + 2] = col[2];
                    DATA[index + 3] = 255;
                }
            }
        }
        
        postMessage(' *microwave bell sound* ');
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

    if (!INSECURE_CONTEXT_DEBUG_MODE && (SETTINGS.drawBg || SETTINGS.drawField)) {
        // make a shared potential buffer (with an array inside) that is a bit bigger than the canvas (for thick equipotential lines)
        const potsWidth = canvasWidth + 10;
        const potsHeight = canvasHeight + 10;
        const sharedPotentialBuffer = new SharedArrayBuffer(Float64Array.BYTES_PER_ELEMENT * potsWidth * potsHeight);
        // assign horizontal slices of the screen to workers
        for (let i = 0; i < numWorkers; i++) {
            const startY = Math.floor(i * potsHeight / numWorkers);
            const endY = Math.floor((i + 1) * potsHeight / numWorkers);
            // pass data
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
        // wait for everyone to cook
        await Promise.all(workers.map(worker => new Promise(resolve => {
            worker.onmessage = resolve
        })));

        // shared background color buffer (array)
        const sharedBgBuffer = new SharedArrayBuffer(Uint8ClampedArray.BYTES_PER_ELEMENT * canvasWidth * canvasHeight * 4);
        // assign horizontal slices of the screen to workers
        for (let i = 0; i < numWorkers; i++) {
            const startY = Math.floor(i * canvasHeight / numWorkers);
            const endY = Math.floor((i + 1) * canvasHeight / numWorkers);
            // pass data
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
        // wait for everyone to cook
        await Promise.all(workers.map(worker => new Promise(resolve => {
            worker.onmessage = resolve
        })));
        
        // put resulting data onto the canvas
        const imageData = new ImageData(canvasWidth, canvasHeight)
        imageData.data.set(new Uint8ClampedArray(sharedBgBuffer));
        ctx.putImageData(imageData, 0, 0);        
    } else {
        // clear screen if i can't be bothered enough to make a certificate when testing on mobile 
        // or if both the background and equipotential lines are shut off (who would even do that but ok)
        ctx.fillStyle = colorToRGBA(SETTINGS.colorBgDefault);
        ctx.fillRect(0, 0, canvasWidth, canvasHeight); 
    }

    if (SETTINGS.drawArrows) {
        ctx.fillStyle = ctx.strokeStyle = colorToRGBA(SETTINGS.colorsArrows, SETTINGS.arrowsOpacity);
        ctx.lineWidth = SETTINGS.arrowsThickness;
        // loop through arrow positions
        for (let y = 0; y < canvas.height/SETTINGS.arrowsSpacing; y++) {
            for (let x = 0; x < canvas.width/SETTINGS.arrowsSpacing; x++) {
                let E = calculateField(x*SETTINGS.arrowsSpacing, y*SETTINGS.arrowsSpacing);
                if (E.r == 0) continue;
                let coordsFromCenter = {
                    x: E.x / E.r * (SETTINGS.arrowsSpacing/2-1),
                    y: E.y / E.r * (SETTINGS.arrowsSpacing/2-1),
                };
                ctx.beginPath();

                let endX = x*SETTINGS.arrowsSpacing + coordsFromCenter.x;
                let endY = y*SETTINGS.arrowsSpacing + coordsFromCenter.y;

                ctx.moveTo(x*SETTINGS.arrowsSpacing - coordsFromCenter.x, y*SETTINGS.arrowsSpacing - coordsFromCenter.y);
                
                if (SETTINGS.drawArrowHeads) {
                    let headLength = SETTINGS.arrowsThickness*3;
                    let angle = Math.atan2(coordsFromCenter.y, coordsFromCenter.x);
                    // shorten line so that it wouldn't stick out from under the arrow head
                    let shaftEndX = endX - headLength * Math.cos(angle) / 2;
                    let shaftEndY = endY - headLength * Math.sin(angle) / 2;
                    ctx.lineTo(shaftEndX, shaftEndY);
                    ctx.stroke();
                    // arrow head triangle
                    ctx.beginPath();
                    ctx.moveTo(endX, endY);
                    ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6),
                               endY - headLength * Math.sin(angle - Math.PI / 6));
                    ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6),
                               endY - headLength * Math.sin(angle + Math.PI / 6));
                    ctx.lineTo(endX, endY);
                    ctx.fill();
                } else {
                    // otherwise just a line
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
            }
        }
    }

    if (SETTINGS.drawField) {
        ctx.strokeStyle = colorToRGBA(SETTINGS.colorsField, SETTINGS.fieldOpacity);
        ctx.lineWidth = SETTINGS.fieldThickness;
        let maxIter = 10000;
        let incomingLines = [];
        // for each charge
        for (let i = 0; i < charges.length; i++) {
            // track already present lines which end in the charge
            let linesNow = (incomingLines[i] || []).length;
            // make enough extra lines so that the total amount would be equal to 2**fieldDensity
            for (let j = 0; j < 2**SETTINGS.fieldDensity - linesNow; j++) {
                // find the biggest gap in the lines to put a new line in
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

                // spawn a probe pseudo-charge
                let Px = charges[i].x + 5*Math.cos(newLineAngle);
                let Py = charges[i].y + 5*Math.sin(newLineAngle);
                ctx.beginPath();
                ctx.moveTo(Px, Py);
                // move in the other direction if coming out of a negative charge
                let negateField = charges[i].q < 0 ? -1 : 1;
                outer: for (let I = 0; I < maxIter; I++) {
                    // step by 1 pixel of length each time in the direction of E (or opposite)
                    let E = calculateField(Px, Py);
                    Px += E.x / E.r * negateField;
                    Py += E.y / E.r * negateField;
                    ctx.lineTo(Px, Py);

                    // stop if the line gets reeeeeally out of bounds
                    if (Px < -2000 || Py < -2000 || Px > canvasWidth+2000 || Py > canvasHeight+2000) break outer;
                    
                    // check if the line approached a charge and add it to the respective charge's tracked lines
                    for (let k = 0; k < charges.length; k++) {
                        if (i == k) continue;
                        if ((Px - charges[k].x)**2 + (Py - charges[k].y)**2 <= 5) {
                            if (!incomingLines[k]) {
                                incomingLines[k] = [];
                            }
                            incomingLines[k].push(Math.atan2(Py - charges[k].y, Px - charges[k].x));
                            break outer; // stop (yay loop labels)
                        }
                    }
                }
                ctx.stroke();
            }
        }
    }

    // START TESTING GROUNDS TESTING GROUNDS TESTING GROUNDS TESTING GROUNDS TESTING GROUNDS TESTING GROUNDS TESTING GROUNDS 

    /*ctx.strokeStyle = colorToRGBA(SETTINGS.colorsEquipotential, SETTINGS.equipLineOpacity);
    ctx.lineWidth = SETTINGS.equipLineThickness;
    */

    // END TESTING GROUNDS TESTING GROUNDS TESTING GROUNDS TESTING GROUNDS TESTING GROUNDS TESTING GROUNDS TESTING GROUNDS 

    currentBg = ctx.getImageData(0, 0, canvas.width, canvas.height);

    lastRenderTime = Math.round(performance.now() - startTime);

    updateJSI18N();

    isRendering = false;
}

function animateWithoutRequest() {
    var bounds = canvas.getBoundingClientRect();
    canvas.setAttribute("width", bounds.width);
    canvas.width = bounds.width;
    canvas.setAttribute("height", bounds.height);
    canvas.height = bounds.height;

    if (currentBg) ctx.putImageData(currentBg, 0, 0);

    // draw ghost charge that is being dragged (if the mode is right)
    if (!SETTINGS.animatedMode) if (draggingIndex != -1) {
        if (dragType == "charge") {
            ctx.beginPath();
            ctx.arc(draggingCoords.x, draggingCoords.y, getChargeRadius(draggingIndex), 0, 2 * Math.PI);
            ctx.fillStyle = charges[draggingIndex].q > 0 ? colorToRGBA(SETTINGS.colorBgPos, 0.5) : colorToRGBA(SETTINGS.colorBgNeg, 0.5);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = colorToRGBA(SETTINGS.colorOutline, 0.5);
            ctx.stroke();
        }
    }

    // draw tool stuff
    ctx.lineWidth = 3;
    ctx.miterLimit = 1;
    ctx.strokeStyle = colorToRGBA(SETTINGS.colorTool);
    ctx.font = "20px monospace";
    switch (SETTINGS.mode) {
    case "voltage":
        ctx.beginPath();
        ctx.moveTo(toolCoords[0].x, toolCoords[0].y);
        ctx.lineTo(toolCoords[1].x, toolCoords[1].y);
        ctx.stroke();

        ctx.fillStyle = colorToRGBA(SETTINGS.colorTool);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let textFlag = true;
        for (let i of charges) {
            if ((i.x - toolCoords[0].x) ** 2 + (i.y - toolCoords[0].y) ** 2 < 8 ||
                (i.x - toolCoords[1].x) ** 2 + (i.y - toolCoords[1].y) ** 2 < 8) {
                textFlag = false;
                break;
            }
        }
        if (!textFlag) break;
        let argsV = [
            Math.abs(
                calculatePotential(toolCoords[0].x, toolCoords[0].y) - 
                calculatePotential(toolCoords[1].x, toolCoords[1].y)
            ).toFixed(2) + I18N[LANG].voltageunit, 
            (toolCoords[0].x + toolCoords[1].x) / 2, 
            (toolCoords[0].y + toolCoords[1].y) / 2
        ];
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black";
        ctx.strokeText(...argsV);
        ctx.fillText(...argsV);
        break;
    case "angle":
        let angle1 = Math.atan2(toolCoords[2].y - toolCoords[1].y, toolCoords[2].x - toolCoords[1].x);
        let angle2 = Math.atan2(toolCoords[0].y - toolCoords[1].y, toolCoords[0].x - toolCoords[1].x);
        if (angle2 < angle1) angle2 += Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(toolCoords[1].x, toolCoords[1].y);
        let ccw = angle2 - angle1 > Math.PI;
        let radius = Math.max(0, Math.min(
            50, 
            Math.sqrt((toolCoords[2].y - toolCoords[1].y)**2 + (toolCoords[2].x - toolCoords[1].x)**2) - 10,
            Math.sqrt((toolCoords[0].y - toolCoords[1].y)**2 + (toolCoords[0].x - toolCoords[1].x)**2) - 10
        ));
        ctx.arc(toolCoords[1].x, toolCoords[1].y, radius, angle1, angle2, ccw);
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle = colorToRGBA(SETTINGS.colorTool, 0.5);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(toolCoords[0].x, toolCoords[0].y);
        ctx.lineTo(toolCoords[1].x, toolCoords[1].y);
        ctx.lineTo(toolCoords[2].x, toolCoords[2].y);
        ctx.stroke();

        ctx.fillStyle = colorToRGBA(SETTINGS.colorTool);
        const angleText = (angle1 + angle2) / 2 + (ccw * Math.PI);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let args = [
            Math.abs(Math.abs(angle1 - angle2)/Math.PI*180 - ccw*360).toFixed(2) + "°", 
            toolCoords[1].x + 25*Math.cos(angleText), 
            toolCoords[1].y + 25*Math.sin(angleText)
        ];
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black";
        ctx.strokeText(...args);
        ctx.fillText(...args);
        break;
    case "equipline":
        ctx.strokeStyle = colorToRGBA(SETTINGS.colorTool);
        ctx.lineWidth = 3;
        let maxIter = 10000;
    
        let Px = toolCoords[0].x;
        let Py = toolCoords[0].y;
        let startPot = calculatePotential(Px, Py);
        ctx.beginPath();
        ctx.moveTo(Px, Py);
        let endFlag = true;
        for (let I = 0; I < maxIter; I++) {
            let E = calculateField(Px, Py);
            Px += E.y / E.r;
            Py += -E.x / E.r;

            let deltaPot = startPot - calculatePotential(Px, Py);
            Px -= Math.min(deltaPot * E.x / E.r / E.r, 2);
            Py -= Math.min(deltaPot * E.y / E.r / E.r, 2);

            ctx.lineTo(Px, Py);
            if (Px < -2000 || Py < -2000 || Px > canvas.width+2000 || Py > canvas.height+2000) break;
            if (endFlag && I > 50 && (toolCoords[0].x - Px)**2 + (toolCoords[0].y - Py)**2 < 25) {
                I = maxIter - 30;
                endFlag = false;
            }
        }
        ctx.stroke();
        break;
    case "powerline":
        ctx.strokeStyle = colorToRGBA(SETTINGS.colorTool);
        ctx.lineWidth = 3;
        let drawLine = negateField => {
            let Px = toolCoords[0].x;
            let Py = toolCoords[0].y;
            ctx.beginPath();
            ctx.moveTo(Px, Py);
            negateField = negateField ? -1 : 1;
            outer: for (let I = 0; I < 10000; I++) {
                let E = calculateField(Px, Py);
                Px += E.x / E.r * negateField;
                Py += E.y / E.r * negateField;
                ctx.lineTo(Px, Py);

                if (Px < -2000 || Py < -2000 || Px > canvas.width+2000 || Py > canvas.height+2000) break outer;
                for (let k = 0; k < charges.length; k++) {
                    if ((Px - charges[k].x)**2 + (Py - charges[k].y)**2 <= 5) {
                        break outer;
                    }
                }
            }
            ctx.stroke();
        };
        drawLine(false);
        drawLine(true);
        break;
    }

    // draw charge circles
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

    // draw tool circles
    for (let i = 0; i < toolCoords.length; i++) {
        const circle = toolCoords[i];
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = colorToRGBA(SETTINGS.colorTool);
        ctx.fill();
    }
}
function animate() {
    animateWithoutRequest();
    requestAnimationFrame(animate);
}