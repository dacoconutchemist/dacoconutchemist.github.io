const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

let pause = true;
let things = [];

let emoji = {
  'rock': '⛰️',
  'paper': '📜',
  'scissors': '✂️',
}
if (window.location.hash) {
  emoji['lizard'] = '🦎';
  emoji['spock'] = '🖖';
}

function toggleMode() {
  if (window.location.hash) {
    window.location.href =  window.location.href.split('#')[0];
  } else {
    window.location.href =  window.location.href + '#l';
    location.reload();
    return false;
  }
}
let types = Object.keys(emoji);
let enemies = {
  'rock': ['paper', 'spock'],
  'paper': ['scissors', 'lizard'],
  'scissors': ['spock', 'rock'],
  'lizard': ['rock', 'scissors'],
  'spock': ['paper', 'lizard']
}

let food = {};
for (i of Object.keys(enemies)) {
  food[i] = types.filter(x => !enemies[i].includes(x) && x != i);
}

function normalize(dx, dy) {
  let len = Math.sqrt(dx**2 + dy**2);
  return {
    x: dx/len,
    y: dy/len
  }
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1-x2)**2 + (y1-y2)**2);
}

let distchanges = [
  {x: 0, y: 0},
  {x: 500, y: 0},
  {x: -500, y: 0},
  {x: 0, y: 500},
  {x: 0, y: -500},
  {x: 500, y: 500},
  {x: -500, y: 500},
  {x: 500, y: -500},
  {x: -500, y: -500}
];

class Thing {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.radius = 12;
  }
  dist(other) {
    let mins = [
      dist(other.x, other.y, this.x, this.y),
      dist(other.x + 500, other.y, this.x, this.y),
      dist(other.x - 500, other.y, this.x, this.y),
      dist(other.x, other.y + 500, this.x, this.y),
      dist(other.x, other.y - 500, this.x, this.y),
      dist(other.x + 500, other.y + 500, this.x, this.y),
      dist(other.x - 500, other.y + 500, this.x, this.y),
      dist(other.x + 500, other.y - 500, this.x, this.y),
      dist(other.x - 500, other.y - 500, this.x, this.y),
    ];
    let minind = 0;
    for (let i = 0; i < mins.length; i++) {
      if (mins[minind] > mins[i]) minind = i;
    }
    return {
      dist: mins[minind],
      dc: distchanges[minind]
    }
    //return Math.sqrt((this.x - other.x)**2 + (this.y - other.y)**2);
  }
  draw() {
    ctx.fillText(emoji[this.type], this.x-12, this.y+12);
  }
  move() {
    let currenemies = things.filter(x => enemies[this.type].includes(x.type));
    let currfood = things.filter(x => food[this.type].includes(x.type));
    
    let closestenemy = currenemies.reduce((min, current) => this.dist(current).dist < this.dist(min).dist ? current : min, {x: 10000000000, y: 10000000000});
    let closestfood = currfood.reduce((min, current) => this.dist(current).dist < this.dist(min).dist ? current : min, {x: 10000000000, y: 10000000000});

    let closestenemydist = this.dist(closestenemy);
    let closestfooddist = this.dist(closestfood);
    if (closestenemydist.dist < closestfooddist.dist) {
      let vec = normalize(closestenemy.x + closestenemydist.dc.x - this.x, closestenemy.y + closestenemydist.dc.y - this.y);
      this.x -= vec.x;
      this.y -= vec.y;
    } else {
      let vec = normalize(closestfood.x + closestfooddist.dc.x - this.x, closestfood.y + closestfooddist.dc.y - this.y);
      this.x += vec.x;
      this.y += vec.y;
    }
    if (dist(closestfood.x, closestfood.y, this.x, this.y) < 2*this.radius) closestfood.type = this.type;
    
    if (this.x < 0) this.x = 500; 
    if (this.y < 0) this.y = 500; 
    if (this.x > 500) this.x = 0; 
    if (this.y > 500) this.y = 0; 
  }
}
function randGen() {
  for (let i = 0; i < types.length; i++) {
    for (let j = 0; j < 40; j++) {
      let x = Math.random() * canvas.width;
      let y = Math.random() * canvas.height;
      things.push(new Thing(x, y, types[i]));
    }
  }
}
/*things = [
  new Thing(50, 50, 'rock'),
  new Thing(200, 150, 'paper'),
  new Thing(350, 300, 'scissors'),
  new Thing(100, 300, 'lizard'),
  new Thing(300, 100, 'spock')
];*/

function draw() {
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "24px Arial";
    for (const thing of things) {
      thing.move();
      thing.draw();
    }
  } catch(e) {console.log(e);}
  if (document.getElementById('respawn').checked) {
    for (let i = 0; i < types.length; i++) {
      var count = 0;
      for (j of things) if (j.type == types[i]) count++;
      if (count == 0)
        things[Math.floor(Math.random() * things.length)].type = types[i];
    }
  }
  if (pause) requestAnimationFrame(draw);
}
var chf = true;
for (i of types) {
  $(`<input type="radio" name="typesel" value="${i}"${chf && " checked"}>
<label>${i}</label><br>`).insertAfter("#ppb");
  chf = true;
}
function getMousePosition(event) {
  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  const radioButtons = document.getElementsByName("typesel");
  checkedValue = "";
  for (let i = 0; i < radioButtons.length; i++) {
    if (radioButtons[i].checked) {
      checkedValue = radioButtons[i].value;
      break;
    }
  }
  things.push(new Thing(x, y, checkedValue))
  for (const thing of things) {thing.draw();}
}
canvas.addEventListener("mousedown", getMousePosition);
randGen();
draw();