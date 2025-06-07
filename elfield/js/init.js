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