function calculatePotential(x, y) {
    let potential = 0;
    for (let i = 0; i < charges.length; i++) {
        const charge = charges[i];
        const dx = x - charge.x;
        const dy = y - charge.y;
        const r = Math.sqrt(dx * dx + dy * dy);
        if (r > 0.01) {
            potential += k * charge.q / r;
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
            const E = k * charge.q / r / r2;
            Ex += dx * E;
            Ey += dy * E;
        }
    }
    return {x: Ex, y: Ey, r: Math.sqrt(Ex * Ex + Ey * Ey)};
}

function calculateMagPotential(x, y) {
    let A = 0;
    for (let i = 0; i < charges.length; i++) {
        const wire = charges[i];
        const dx = x - wire.x;
        const dy = y - wire.y;
        const r2 = dx * dx + dy * dy;
        if (r2 > 1e-4) {
            A += kM * wire.q * Math.log(r2) / 2;
        }
    }
    return A;
}

function calculateMagField(x, y) {
    let Bx = 0;
    let By = 0;
    for (let i = 0; i < charges.length; i++) {
        const wire = charges[i];
        const dx = x - wire.x;
        const dy = y - wire.y;
        const r2 = dx * dx + dy * dy;

        if (r2 > 1e-4) {
            const B = kM * wire.q / r2;
            Bx += -dy * B;
            By += dx * B;
        }
    }

    return {x: Bx, y: By, r: Math.sqrt(Bx * Bx + By * By)};
}

let isRendering = false;
let lastRenderTime = 0;
let runningFPS = 30;

// multithreading
const numWorkers = Math.min(10, navigator.hardwareConcurrency || 4);
let workerCode = `
    // linear interpolation of colors
    function lerpColors(bg, overlay, opacity) {
        const r = (bg >> 16) + ((overlay >> 16) - (bg >> 16)) * opacity;
        const g = ((bg >> 8) & 0xFF) + (((overlay >> 8) & 0xFF) - ((bg >> 8) & 0xFF)) * opacity;
        const b = (bg & 0xFF) + ((overlay & 0xFF) - (bg & 0xFF)) * opacity;
        return (r << 16) | (g << 8) | b;
    }

    function byteify(color) {
        return (color[0] << 16) | (color[1] << 8) | color[2];
    }

    onmessage = function(e) {
        let TYPE = e.data.TYPE;
        if (TYPE == "potential") {
            // potential calculation

            // pass all parameters and interpret the shared buffer as a float array
            const { sharedPotentialBuffer, potsWidth, potsHeight, startY, endY, charges, k, kM } = e.data;
            const pots = new Float64Array(sharedPotentialBuffer);

            let maxAbsPot = 0;

            for (let y = startY; y < endY; y++) {
                for (let x = 0; x < potsWidth; x++) {
                    let potential = 0;
                    let closeFlag = true;
                    for (let i = 0; i < charges.length; i++) {
                        const charge = charges[i];
                        const dx = x - (charge.x + 5);
                        const dy = y - (charge.y + 5);
                        const r = Math.sqrt(dx * dx + dy * dy);
                        if (r > 0.01) {
                            potential += (k * charge.q) / r;
                        }
                        if (r < 5) {
                            closeFlag = false;
                        }
                    }
                    pots[y * potsWidth + x] = potential;
                    if (closeFlag) if (maxAbsPot < Math.abs(potential)) maxAbsPot = Math.abs(potential);
                }
            }

            postMessage(maxAbsPot);
        } else if (TYPE == "bg") {
            // background color calculation

            // pass all parameters and interpret the shared buffer as a float array
            let {
                sharedBgBuffer,
                sharedPotentialBuffer,
                potsWidth,
                maxAbsPot,
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

            const logMaxPot = Math.log(maxAbsPot + 1);

            colorBgDefault = byteify(colorBgDefault);
            colorBgPos = byteify(colorBgPos);
            colorBgNeg = byteify(colorBgNeg);
            colorsEquipotential = byteify(colorsEquipotential);

            for (let y = startY; y < endY; y++) {
                for (let x = 0; x < canvasWidth; x++) {
                    // potential offset by 5 in x and y due to a bit out of the border being calculated
                    const potential = pots[(y + 5) * potsWidth + x + 5];
                    let col = colorBgDefault;
                    
                    if (drawBg) {
                        // for coloring, clamp the potential and do a log scale for color up to 5000 volts in both directions

                        const clampedPotential = Math.max(-5000, Math.min(5000, potential));
                        if (clampedPotential > 0) {
                            col = lerpColors(col, colorBgPos, Math.log(potential + 1) / logMaxPot);
                        } else {
                            col = lerpColors(col, colorBgNeg, Math.log(-potential + 1) / logMaxPot);
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

                        let zeroPosition = maxAbsPot / 2048;
                        for (let val = zeroPosition; val < maxAbsPot; val *= equipLineDensityCoef) {
                            if ((maxPot > val-zeroPosition && minPot < val-zeroPosition) || 
                                (maxPot > zeroPosition-val && minPot < zeroPosition-val)) {
                                col = lerpColors(col, colorsEquipotential, equipLineOpacity);
                                break;
                            }
                        }
                        if ((maxPot > 0 && minPot < 0) || (maxPot > 0 && minPot < 0)) {
                            col = lerpColors(col, colorsEquipotential, equipLineOpacity);
                        }
                    }
                    
                    // set corresponding pixel
                    const index = (y * canvasWidth + x) * 4;
                    DATA[index] = col >> 16;
                    DATA[index + 1] = (col >> 8) & 0xFF;
                    DATA[index + 2] = col & 0xFF;
                    DATA[index + 3] = 255;
                }
            }
            postMessage(' *microwave bell sound* ');
        } else if (TYPE == "potentialM") {
            // potential calculation

            // pass all parameters and interpret the shared buffer as a float array
            const { sharedPotentialBuffer, potsWidth, potsHeight, startY, endY, charges, k, kM } = e.data;
            const pots = new Float64Array(sharedPotentialBuffer);

            let maxAbsPot = 0;

            let potentialOffset = 0;
            for (let i = 0; i < charges.length; i++) {
                //const wire = charges[i];
                //const dx = wire.x;
                //const dy = wire.y + 10000;
                //const r2 = dx * dx + dy * dy;
                potentialOffset += - kM * charges[i].q * Math.log(1e8) / 2;
            }

            for (let y = startY; y < endY; y++) {
                for (let x = 0; x < potsWidth; x++) {
                    let A = 0;
                    let closeFlag = true;
                    for (let i = 0; i < charges.length; i++) {
                        const wire = charges[i];
                        const dx = x - (wire.x + 5);
                        const dy = y - (wire.y + 5);
                        const r2 = dx * dx + dy * dy;
                        if (r2 > 1e-4) {
                            A += - kM * wire.q * Math.log(r2) / 2;
                        }
                        if (r2 < 25) {
                            closeFlag = false;
                        }
                    }
                    pots[y * potsWidth + x] = A - potentialOffset;
                    if (closeFlag) if (maxAbsPot < Math.abs(A)) maxAbsPot = Math.abs(A);
                }
            }

            postMessage(maxAbsPot);
        }
    };
`;
const workerURL = URL.createObjectURL(new Blob([workerCode], { type: "application/javascript" }));
let workers = [];
for (let i = 0; i < numWorkers; i++) workers.push(new Worker(workerURL));

let fpsTimeout;
async function render() {
    //performance.mark('renderStart');
    if (isRendering) return;
    isRendering = true;

    clearTimeout(fpsTimeout);
    if (!startTime) startTime = performance.now();

    if (!SETTINGS.animatedMode) $('#progress').text(I18N[LANG].rendering);

    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;
    
    if (!INSECURE_CONTEXT_DEBUG_MODE && (SETTINGS.drawBg || SETTINGS.drawField)) {
        let canvasWidth = canvas.width;
        let canvasHeight = canvas.height;
        const potsWidth = canvasWidth + 10;
        const potsHeight = canvasHeight + 10;
        // assign horizontal slices of the screen to workers
        for (let i = 0; i < numWorkers; i++) {
            const startY = Math.floor(i * potsHeight / numWorkers);
            const endY = Math.floor((i + 1) * potsHeight / numWorkers);
            // pass data
            workers[i].postMessage({
                TYPE: SETTINGS.MAGNETIC ? "potentialM" : "potential",
                sharedPotentialBuffer,
                potsWidth,
                potsHeight,
                startY,
                endY,
                charges,
                k, kM
            });
        }
        // wait for everyone to cook
        let maxAbsPot = -1;
        await Promise.all(workers.map(worker => new Promise(resolve => {
            worker.onmessage = message => {
                maxAbsPot = Math.max(maxAbsPot, message.data);
                resolve();
            }
        })));

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
                maxAbsPot,
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
        const halfSpacing = SETTINGS.arrowsSpacing / 2 - 1;
        const color = colorToRGBA(SETTINGS.colorsArrows, SETTINGS.arrowsOpacity);

        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.lineJoin = "miter";
        ctx.lineWidth = SETTINGS.arrowsThickness * SETTINGS.arrowsSpacing / 30;

        const rows = Math.ceil(canvas.height / SETTINGS.arrowsSpacing) + 1;
        const cols = Math.ceil(canvas.width / SETTINGS.arrowsSpacing) + 1;

        ctx.beginPath();
        let fieldFunction = SETTINGS.MAGNETIC ? calculateMagField : calculateField;
        for (let y = 0; y < rows; y++) {
            const py = y * SETTINGS.arrowsSpacing;
            for (let x = 0; x < cols; x++) {
                const px = x * SETTINGS.arrowsSpacing;
                const E = fieldFunction(px, py);
                if (E.r === 0) continue;

                const dx = (E.x / E.r) * halfSpacing;
                const dy = (E.y / E.r) * halfSpacing;

                ctx.moveTo(px - dx, py - dy);
                ctx.lineTo(px + dx, py + dy);
            }
        }
        ctx.stroke();

        if (SETTINGS.drawArrowHeads) {
            const headLength = ctx.lineWidth * 3;

            ctx.beginPath();
            for (let y = 0; y < rows; y++) {
                const py = y * SETTINGS.arrowsSpacing;
                for (let x = 0; x < cols; x++) {
                    const px = x * SETTINGS.arrowsSpacing;
                    const E = fieldFunction(px, py);
                    if (E.r === 0) continue;

                    const dx = (E.x / E.r) * halfSpacing;
                    const dy = (E.y / E.r) * halfSpacing;

                    const endX = px + dx;
                    const endY = py + dy;
                    const angle = Math.atan2(dy, dx);

                    const x1 = endX - headLength * Math.cos(angle - Math.PI / 6);
                    const y1 = endY - headLength * Math.sin(angle - Math.PI / 6);
                    const x2 = endX - headLength * Math.cos(angle + Math.PI / 6);
                    const y2 = endY - headLength * Math.sin(angle + Math.PI / 6);

                    ctx.moveTo(x1, y1);
                    ctx.lineTo(endX, endY);
                    ctx.lineTo(x2, y2);
                }
            }
            ctx.stroke();
        }
    }

    if (SETTINGS.drawField && !SETTINGS.MAGNETIC) {
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
                let negateField = (charges[i].q < 0 ? -1 : 1) / SETTINGS.fieldQuality;
                outer: for (let I = 0; I < maxIter; I++) {
                    // step by 1 pixel of length each time in the direction of E (or opposite)
                    let E = calculateField(Px, Py);
                    Px += E.x / E.r * negateField;
                    Py += E.y / E.r * negateField;
                    ctx.lineTo(Px, Py);

                    // stop if the line gets reeeeeally out of bounds
                    if (Px < -2000 || Py < -2000 || Px > canvasWidth + 2000 || Py > canvasHeight + 2000) break outer;
                    
                    // check if the line approached a charge and add it to the respective charge's tracked lines
                    for (let k = 0; k < charges.length; k++) {
                        if (i == k) continue;
                        if ((Px - charges[k].x)**2 + (Py - charges[k].y)**2 <= 30) {
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
    
    animateWithoutRequest();

    let currTime = performance.now();
    lastRenderTime = Math.round(currTime - startTime);
    runningFPS = runningFPS * 0.8 + 200/lastRenderTime;
    updateJSI18N();

    isRendering = false;
    //performance.mark('renderEnd');
    startTime = currTime;

    fpsTimeout = setTimeout(e => startTime = null, 100);
}

function animateWithoutRequest() {
    ctxGUI.clearRect(0, 0, canvas.width, canvas.height)

    // draw ghost charge that is being dragged (if the mode is right)
    if (!SETTINGS.animatedMode) if (draggingIndex != -1) {
        if (dragType == "charge") {
            ctxGUI.beginPath();
            ctxGUI.arc(draggingCoords.x, draggingCoords.y, getChargeRadius(draggingIndex), 0, 2 * Math.PI);
            ctxGUI.fillStyle = charges[draggingIndex].q > 0 ? colorToRGBA(SETTINGS.colorBgPos, 0.5) : colorToRGBA(SETTINGS.colorBgNeg, 0.5);
            ctxGUI.fill();
            ctxGUI.lineWidth = 2;
            ctxGUI.strokeStyle = colorToRGBA(SETTINGS.colorOutline, 0.5);
            ctxGUI.stroke();
        }
    }

    // draw charge circles
    for (let i = 0; i < charges.length; i++) {
        const charge = charges[i];
        ctxGUI.beginPath();
        ctxGUI.arc(charge.x, charge.y, getChargeRadius(i), 0, 2 * Math.PI);
        ctxGUI.fillStyle = charge.q > 0 ? colorToRGBA(SETTINGS.colorBgPos, 1) : colorToRGBA(SETTINGS.colorBgNeg, 1);
        ctxGUI.fill();
        ctxGUI.lineWidth = 2;
        ctxGUI.strokeStyle = colorToRGBA(SETTINGS.colorOutline, 1);
        ctxGUI.stroke();
    }

    // draw tool stuff
    let excludeCircles = [];
    ctxGUI.lineWidth = 3;
    ctxGUI.miterLimit = 1;
    ctxGUI.strokeStyle = colorToRGBA(SETTINGS.colorTool);
    ctxGUI.font = "20px monospace";
    switch (SETTINGS.mode) {
    case "voltage":
        if (SETTINGS.voltageInftyMode) {
            excludeCircles = [1];
        } else {
            ctxGUI.beginPath();
            ctxGUI.moveTo(toolCoords[0].x, toolCoords[0].y);
            ctxGUI.lineTo(toolCoords[1].x, toolCoords[1].y);
            ctxGUI.stroke();
        }
        ctxGUI.fillStyle = colorToRGBA(SETTINGS.colorTool);
        ctxGUI.textAlign = "center";
        ctxGUI.textBaseline = SETTINGS.voltageInftyMode ? "bottom" : "middle";
        let textFlag = true;
        for (let i of charges) {
            if ((i.x - toolCoords[0].x) ** 2 + (i.y - toolCoords[0].y) ** 2 < 8 ||
                (i.x - toolCoords[1].x) ** 2 + (i.y - toolCoords[1].y) ** 2 < 8) {
                textFlag = false;
                break;
            }
        }
        if (!textFlag) break;
        let argsV = SETTINGS.voltageInftyMode ? [
            calculatePotential(toolCoords[0].x, toolCoords[0].y).toFixed(2) + I18N[LANG].voltageunit, 
            toolCoords[0].x, 
            toolCoords[0].y - 5
        ] : [
            Math.abs(
                calculatePotential(toolCoords[0].x, toolCoords[0].y) - 
                calculatePotential(toolCoords[1].x, toolCoords[1].y)
            ).toFixed(2) + I18N[LANG].voltageunit, 
            (toolCoords[0].x + toolCoords[1].x) / 2, 
            (toolCoords[0].y + toolCoords[1].y) / 2
        ];
        ctxGUI.lineWidth = 3;
        ctxGUI.strokeStyle = "black";
        ctxGUI.strokeText(...argsV);
        ctxGUI.fillText(...argsV);
        break;
    case "angle":
        let args;
        if (SETTINGS.angleDistanceMode) {
            excludeCircles = [2];
            ctxGUI.beginPath();
            ctxGUI.moveTo(toolCoords[0].x, toolCoords[0].y);
            ctxGUI.lineTo(toolCoords[1].x, toolCoords[1].y);
            ctxGUI.stroke();

            ctxGUI.fillStyle = colorToRGBA(SETTINGS.colorTool);
            ctxGUI.textAlign = "center";
            ctxGUI.textBaseline = "middle";
            args = [
                Math.sqrt((toolCoords[0].x-toolCoords[1].x)**2 + (toolCoords[0].y-toolCoords[1].y)**2).toFixed(2) + " m", 
                (toolCoords[1].x + toolCoords[0].x) / 2,
                (toolCoords[1].y + toolCoords[0].y) / 2,
            ];
        } else {
            let angle1 = Math.atan2(toolCoords[2].y - toolCoords[1].y, toolCoords[2].x - toolCoords[1].x);
            let angle2 = Math.atan2(toolCoords[0].y - toolCoords[1].y, toolCoords[0].x - toolCoords[1].x);
            if (angle2 < angle1) angle2 += Math.PI * 2;

            ctxGUI.beginPath();
            ctxGUI.moveTo(toolCoords[1].x, toolCoords[1].y);
            let ccw = angle2 - angle1 > Math.PI;
            let radius = Math.max(0, Math.min(
                50, 
                Math.sqrt((toolCoords[2].y - toolCoords[1].y)**2 + (toolCoords[2].x - toolCoords[1].x)**2) - 10,
                Math.sqrt((toolCoords[0].y - toolCoords[1].y)**2 + (toolCoords[0].x - toolCoords[1].x)**2) - 10
            ));
            ctxGUI.arc(toolCoords[1].x, toolCoords[1].y, radius, angle1, angle2, ccw);
            ctxGUI.stroke();
            ctxGUI.closePath();
            ctxGUI.fillStyle = colorToRGBA(SETTINGS.colorTool, 0.5);
            ctxGUI.fill();

            ctxGUI.beginPath();
            ctxGUI.moveTo(toolCoords[0].x, toolCoords[0].y);
            ctxGUI.lineTo(toolCoords[1].x, toolCoords[1].y);
            ctxGUI.lineTo(toolCoords[2].x, toolCoords[2].y);
            ctxGUI.stroke();

            ctxGUI.fillStyle = colorToRGBA(SETTINGS.colorTool);
            const angleText = (angle1 + angle2) / 2 + (ccw * Math.PI);
            ctxGUI.textAlign = "center";
            ctxGUI.textBaseline = "middle";
            args = [
                Math.abs(Math.abs(angle1 - angle2)/Math.PI*180 - ccw*360).toFixed(2) + "°", 
                toolCoords[1].x + 25*Math.cos(angleText), 
                toolCoords[1].y + 25*Math.sin(angleText)
            ];
        }

        ctxGUI.lineWidth = 3;
        ctxGUI.strokeStyle = "black";
        ctxGUI.strokeText(...args);
        ctxGUI.fillText(...args);
        break;
    case "equipline":
        ctxGUI.strokeStyle = colorToRGBA(SETTINGS.colorTool);
        ctxGUI.lineWidth = 3;
        let maxIter = 10000;

        let fieldFunction = SETTINGS.MAGNETIC ? calculateMagField : calculateField;
        let potFunction = SETTINGS.MAGNETIC ? calculateMagPotential : calculatePotential;
        
        let Px1 = toolCoords[0].x;
        let Py1 = toolCoords[0].y;
        let Px2 = toolCoords[0].x;
        let Py2 = toolCoords[0].y;
        let startPot = potFunction(toolCoords[0].x, toolCoords[0].y);
        ctxGUI.beginPath();
        ctxGUI.moveTo(Px1, Py1);
        let endFlag = true;
        for (let I = 0; I < maxIter; I++) {
            let E = fieldFunction(Px1, Py1);
            if (SETTINGS.MAGNETIC) {
                Px1 += E.x / E.r;
                Py1 += E.y / E.r;
                let deltaPot = startPot - potFunction(Px1, Py1);
                Px1 += Math.min(deltaPot * E.y / E.r / E.r, 2);
                Py1 += -Math.min(deltaPot * E.x / E.r / E.r, 2);
            } else {
                Px1 += E.y / E.r;
                Py1 += -E.x / E.r;
                let deltaPot = startPot - potFunction(Px1, Py1);
                Px1 -= Math.min(deltaPot * E.x / E.r / E.r, 2);
                Py1 -= Math.min(deltaPot * E.y / E.r / E.r, 2);
            }

            ctxGUI.lineTo(Px1, Py1);
            if (Px1 < -2000 || Py1 < -2000 || Px1 > canvas.width+2000 || Py1 > canvas.height+2000) break;
            if (endFlag && I > 50 && (toolCoords[0].x - Px1)**2 + (toolCoords[0].y - Py1)**2 < 25) {
                I = maxIter - 30;
                endFlag = false;
            }
        }
        ctxGUI.stroke();
        ctxGUI.beginPath();
        if (endFlag) {
            for (let I = 0; I < maxIter; I++) {
                let E = fieldFunction(Px2, Py2);
                if (SETTINGS.MAGNETIC) {
                    Px2 += -E.x / E.r;
                    Py2 += -E.y / E.r;
                    let deltaPot = startPot - potFunction(Px2, Py2);
                    Px2 += -deltaPot * E.y / E.r * Math.log(E.r);
                    Py2 += deltaPot * E.x / E.r * Math.log(E.r);
                } else {
                    Px2 += E.y / E.r;
                    Py2 += -E.x / E.r;
                    let deltaPot = startPot - potFunction(Px2, Py2);
                    Px2 -= Math.min(deltaPot * E.x / E.r / E.r, 2);
                    Py2 -= Math.min(deltaPot * E.y / E.r / E.r, 2);
                }

                ctxGUI.lineTo(Px2, Py2);
                if (Px2 < -2000 || Py2 < -2000 || Px2 > canvas.width+2000 || Py2 > canvas.height+2000) break;
                if (endFlag && I > 50 && (Px2 - Px1)**2 + (Py2 - Py1)**2 < 25) {
                    I = maxIter - 30;
                    endFlag = false;
                }
            }
        }
        ctxGUI.stroke();
        break;
    case "powerline":
        ctxGUI.strokeStyle = colorToRGBA(SETTINGS.colorTool);
        ctxGUI.lineWidth = 3;
        let drawLine = negateField => {
            let Px = toolCoords[0].x;
            let Py = toolCoords[0].y;
            ctxGUI.beginPath();
            ctxGUI.moveTo(Px, Py);
            negateField = negateField ? -1 : 1;
            outer: for (let I = 0; I < 10000; I++) {
                let E = calculateField(Px, Py);

                let DX = E.x / E.r * negateField;
                let DY = E.y / E.r * negateField;
                /*if (I % 40 == 0) {
                    let headLength = 8;

                    const endX = Px + DX;
                    const endY = Py + DY;
                    const angle = Math.atan2(DY, DX);

                    const x1 = endX - headLength * Math.cos(angle - Math.PI / 6);
                    const y1 = endY - headLength * Math.sin(angle - Math.PI / 6);
                    const x2 = endX - headLength * Math.cos(angle + Math.PI / 6);
                    const y2 = endY - headLength * Math.sin(angle + Math.PI / 6);

                    ctx.moveTo(x1, y1);
                    ctx.lineTo(endX, endY);
                    ctx.lineTo(x2, y2);
                }*/

                Px += DX;
                Py += DY;
                ctxGUI.lineTo(Px, Py);

                if (Px < -2000 || Py < -2000 || Px > canvas.width+2000 || Py > canvas.height+2000) break outer;
                for (let k = 0; k < charges.length; k++) {
                    if ((Px - charges[k].x)**2 + (Py - charges[k].y)**2 <= 5) {
                        break outer;
                    }
                }
            }
            ctxGUI.stroke();
        };
        drawLine(false);
        drawLine(true);
        break;
    }

    // draw tool circles
    for (let i = 0; i < toolCoords.length; i++) {
        if (excludeCircles.includes(i)) continue;
        const circle = toolCoords[i];
        ctxGUI.beginPath();
        ctxGUI.arc(circle.x, circle.y, 5, 0, 2 * Math.PI);
        ctxGUI.fillStyle = colorToRGBA(SETTINGS.colorTool);
        ctxGUI.fill();
    }
}

function animate() {
    if (!isRendering) animateWithoutRequest();
    requestAnimationFrame(animate);
}