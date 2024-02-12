const canv = $('#canv')[0];

const iterations = 10;
const dt = 0.02 / iterations;
var attractors = [[0, 0, 500000], [0,0, -500000]];

setInterval(()=>{
    var bounds = canv.getBoundingClientRect();
    canv.setAttribute("width", bounds.width);
    canv.setAttribute("height", bounds.height);
    update();
}, dt * 1000 * iterations);

class Particle {
	constructor(x, y, vx, vy) {
	    this.x = x;
	    this.y = y;
	    this.vx = vx;
	    this.vy = vy;
	}

	update() {
		var maxx = canv.width / 2;
		var maxy = canv.height / 2;
		var ax = 0;
		var ay = 0;
		for (let i of attractors) {
			var dx = i[0] - this.x;
			var dy = i[1] - this.y;
			var distsq = Math.max(25,(dx**2 + dy**2));
			if (distsq == 0) continue;
			// a = GM / r^2
			// r = (dx^2 + dy^2)^0.5
			// ax = a * dx / r = A * dx
			// ay = a * dy / r = A * dy
			// A = GM / r^3 = GM / (dx^2+dy^2)^1.5
			var A = i[2] / distsq ** 1.5;
			ax += A * dx;
			ay += A * dy;
		}
	  	this.vx += ax * dt;
	  	this.vy += ay * dt;

	  	this.vx *= 0.9999;
	  	this.vy *= 0.9999;
	  	/*var vabs = Math.sqrt(this.vx**2 + this.vy**2);
	  	if (vabs > 1000) {

	  	}*/

	    this.x += this.vx * dt;
	    this.y += this.vy * dt;
	    if (this.x > maxx) {
	    	this.x = maxx;
	    	this.vx *= -0.5;
	    }
	    if (this.x < -maxx) {
	    	this.x = -maxx;
	    	this.vx *= -0.5;
	    }
	    if (this.y > maxy) {
	    	this.y = maxy;
	    	this.vy *= -0.5;
	    }
	    if (this.y < -maxy) {
	    	this.y = -maxy;
	    	this.vy *= -0.5;
	    }
	}
}
var particles = [];
setTimeout(()=>{
	for (let i = 1; i < 20; i++) {
		for (let j = 1; j < 20; j++) {
			particles.push(new Particle(
				Math.random()*canv.width-canv.width / 2,
				Math.random()*canv.height-canv.height / 2,
				Math.random()*300-150,
				Math.random()*300-150
			));
		}
	}
}, 100);

document.body.addEventListener("mousemove", (event) => {
	var c = getMouse(canv, event);
	attractors[1][0] = c.x;
	attractors[1][1] = c.y;
});

function update() {
	const ctx = canv.getContext("2d");
	ctx.translate(canv.width / 2, canv.height / 2);
	
	ctx.fillStyle = 'red';
	for (let i = 0; i < iterations; i++) for (let p of particles) {
		p.update();
	}
	for (let p of particles) {
	    ctx.beginPath();
	    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
	    ctx.fill();
	}
	ctx.fillStyle = 'blue';
	for (let i of attractors) {
	    ctx.beginPath();
	    ctx.arc(i[0], i[1], 5, 0, Math.PI * 2);
	    ctx.fill();
	}
}