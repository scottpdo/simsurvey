const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const HEIGHT = 11 * 40;
const WIDTH = 11 * 60;
const TILE_HEIGHT = HEIGHT / 11;
const TILE_WIDTH = WIDTH / 11;

canvas.width = WIDTH;
canvas.height = HEIGHT;

const rand = (x) => {
  return x + 0.9 * (Math.random() - 0.5);
};

const hash = (x, y) => {
  return x.toString() + "," + y.toString()
};

const unhash = (str) => {
  return {
    x: parseInt(str.split(',')[0]),
    y: parseInt(str.split(',')[1])
  };
};

let displayX = (x) => x * TILE_WIDTH;
let displayY = (y) => HEIGHT - y * TILE_HEIGHT;

const sq = (x) => x * x;
const dist = (a, b) => Math.sqrt(sq(a.x - b.x) + sq(a.y - b.y));

const Heatmap = {};
const Statements = {};

RESULTS.forEach(result => {
  result.x = displayX(result.MODEL);
  result.y = displayY(result.LIVING);

  const key = hash(result.MODEL, result.LIVING)
  if (!Heatmap.hasOwnProperty(key)) {
    Heatmap[key] = 1;
    Statements[key] = [result.DEFINITION];
  } else {
    Heatmap[key]++;
    Statements[key].push(result.DEFINITION);
  }
});

// now get range of Heatmap
let max = -Infinity;

Object.values(Heatmap).forEach(value => {
  if (value > max) max = value;
});

let visibleResult = null;
let mouse = { x: -1, y: -1 };
let onMouseMove = (e) => { 
  
  const x = Math.floor(e.layerX / TILE_WIDTH);
  const y = Math.floor((HEIGHT - e.layerY) / TILE_HEIGHT);
  const key = hash(x, y);

  if (Statements.hasOwnProperty(key)) {

    statements.innerHTML = '<h3>A simulation is...</h3>' + Statements[key].map(p => {

      let size = 22;
      if (p.length > 20) size = 20;
      if (p.length > 35) size = 16;
      if (p.length > 50) size = 14;

      let text = p.trim();
      const last = text[text.length - 1];
      if (['.', '!', '?'].indexOf(last) === -1) text += '.';

      return '<p style="font-size: ' + size + 'px;">...' + text + '</p>';
    }).join('');

    statements.style.display = 'block';

    const w = parseInt(getComputedStyle(statements).width);
    const tooFarRight = e.x + 20 + w > window.innerWidth;

    const left = tooFarRight ? e.x - 20 - w : e.x + 20;

    statements.style.left = left.toString() + 'px';
    statements.style.top = (e.y).toString() + 'px';
  } else {
    statements.style.display = 'none';
    statements.innerHTML = "";
  }
};
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mouseleave', () => statements.style.display = 'none');

let draw = (result, i) => {

  context.beginPath();
  context.arc(result.x, result.y, 20, 0, 2 * Math.PI);
  context.fill();
  context.closePath();

  if (dist(mouse, result) < 8) visibleResult = result;
};

const map = (val, min, max) => {
  return min + val * (max - min);
};

const ease = t => t * (2 - t);

let render = () => {

  const dark = [0, 0, 50];
  const light = [255, 200, 0];

  // reset
  visibleResult = null;

  context.globalAlpha = 1;
  context.fillStyle = 'rgb(' + dark.join(',') + ')';
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let key in Heatmap) {

    const coords = unhash(key);
    const x = displayX(coords.x);
    const y = displayY(coords.y);
    
    let val = Heatmap[key] / max;
    val = ease(val); // bump it up a little

    const arr = light.map((n, i) => Math.round(map(val, dark[i], n)));
    
    const fill = 'rgb(' + arr.join(',') + ')';

    context.fillStyle = fill;
    context.fillRect(x, y - TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
    
  }

  // window.requestAnimationFrame(render, 100);
};

render();