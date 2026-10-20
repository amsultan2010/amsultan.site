// the network in the loader and behind the about statement: four layers of
// neurons on a canvas, signals running input to output. one canvas each, same
// drawing. the css gives each canvas its place, the network fills it
import gsap from "gsap";
import "./network.css";

const LAYERS = [8, 12, 12, 8];
// how many signals a firing neuron passes on, by the layer it sits in
const FAN = [2, 2, 1];

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// read off :root, so the three colours are not copied into a fourth file
function palettes() {
  const css = getComputedStyle(document.documentElement);
  const [orange, cream, ink] = ["--orange", "--cream", "--ink"].map((name) =>
    css.getPropertyValue(name).trim(),
  );
  return {
    // on the orange ground: ink wiring, a neuron flashes cream and then ink
    orange: { ground: orange, line: ink, hot: ink, heat: 0.6, head: cream, flash: cream, after: ink, ring: 0.8 },
    // on the ink ground: cream wiring, a neuron flashes orange and then cream
    ink: { ground: ink, line: cream, hot: orange, heat: 0.9, head: cream, flash: orange, after: cream, ring: 0.5 },
  };
}

// `ground` is the colour it is drawn on. tween `front` from 0 to 1 to wire it
// up left to right. `ahead` is the ground the front has not reached yet, for
// the loader, where the front is the edge of the bar and both sides are drawn.
// without it the part ahead of the front is simply not there yet
export function createNetwork(canvas, { ground, ahead }) {
  const ctx = canvas.getContext("2d");
  const still = reducedMotion();
  const pal = palettes();
  const net = { front: still ? 1 : 0, kill };

  const nodes = [];
  const edges = [];
  LAYERS.forEach((count, layer) => {
    const first = nodes.length;
    for (let i = 0; i < count; i++) {
      nodes.push({ layer, row: i, x: 0, y: 0, cross: 0, a: 0, out: edges.length });
      for (let j = 0; j < (LAYERS[layer + 1] || 0); j++) {
        edges.push({ from: first + i, to: first + count + j, heat: 0 });
      }
    }
  });

  let pulses = [];
  let width = 0;
  let height = 0;
  let radius = 0;
  let wiring = 0;
  let lastFront = 0;
  let nextPass = 0;
  let winner = 0;

  function layout() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // the full height of the canvas, less the room a lifted neuron needs
    const boxW = Math.min(width * 0.84, 1180);
    const boxH = Math.min(height - 28, 560);
    const gap = boxH / (Math.max(...LAYERS) - 1);
    radius = gsap.utils.clamp(2.5, 7, gap * 0.19);
    // packed into a short band the same wiring reads as a grey slab, so it dims
    wiring = 0.16 * gsap.utils.clamp(0.5, 1, gap / 24);

    nodes.forEach((node) => {
      node.x = (width - boxW) / 2 + (boxW * node.layer) / (LAYERS.length - 1);
      node.y = height / 2 + (node.row - (LAYERS[node.layer] - 1) / 2) * gap;
      // a column firing as one block reads as a switch. a little scatter in
      // where the front meets each neuron makes it a ripple
      node.cross = node.x + gsap.utils.random(-0.5, 0.5) * boxW * 0.05;
    });

    lastFront = net.front * width;
    draw();
  }

  // `reach` is how many more layers the signal may cross from here
  function fire(node, reach = Infinity) {
    node.a = 1;
    const next = LAYERS[node.layer + 1];
    if (!next || reach < 1) return;
    for (let i = 0; i < FAN[node.layer]; i++) {
      // the last hidden layer leans on one output, so a pass ends in an answer
      const lean = node.layer === LAYERS.length - 2 && Math.random() < 0.6;
      const to = lean ? winner : gsap.utils.random(0, next - 1, 1);
      pulses.push({
        edge: edges[node.out + to],
        t: 0,
        speed: 1 / gsap.utils.random(0.3, 0.5),
        reach: reach - 1,
      });
    }
  }

  function step(dt) {
    // the front fires each neuron as it passes over it. in the loader those
    // signals run one layer ahead of the bar, which fires that layer itself
    // when it gets there. with nothing drawn ahead of the front they would
    // only land as a tangle, so there the neuron just flashes
    const front = net.front * width;
    if (front > lastFront) {
      nodes.forEach((node) => {
        if (node.cross > lastFront && node.cross <= front) fire(node, ahead ? 1 : 0);
      });
    }
    lastFront = front;

    nextPass -= dt;
    if (nextPass <= 0) {
      // about as long as a pass takes to cross, so each one reads left to right
      nextPass = gsap.utils.random(1.1, 1.7);
      winner = gsap.utils.random(0, LAYERS[LAYERS.length - 1] - 1, 1);
      gsap.utils
        .shuffle(nodes.slice(0, LAYERS[0]))
        .slice(0, 3)
        .forEach((node) => fire(node));
    }

    nodes.forEach((node) => (node.a = Math.max(0, node.a - dt * 1.7)));
    edges.forEach((edge) => (edge.heat = Math.max(0, edge.heat - dt * 2.4)));

    // a signal that lands fires the neuron it reached, which sends its own.
    // those are added after the filter, or they would be lost with the old list
    const landed = [];
    pulses = pulses.filter((pulse) => {
      pulse.t += dt * pulse.speed;
      pulse.edge.heat = 1;
      if (pulse.t < 1) return true;
      landed.push(pulse);
      return false;
    });
    landed.forEach((pulse) => fire(nodes[pulse.edge.to], pulse.reach));
  }

  function paint(p, from, to) {
    if (to <= from) return;
    // a phone draws the same network a third of the size, so its strokes thin
    const thin = radius < 5;
    ctx.save();
    ctx.beginPath();
    ctx.rect(from, 0, to - from, height);
    ctx.clip();

    // every connection, faint
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    ctx.globalAlpha = wiring;
    ctx.beginPath();
    edges.forEach(({ from: a, to: b }) => {
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
    });
    ctx.stroke();

    // the ones a signal is on, or has just left
    ctx.strokeStyle = p.hot;
    ctx.lineWidth = thin ? 1 : 1.5;
    edges.forEach(({ from: a, to: b, heat }) => {
      if (heat < 0.02) return;
      ctx.globalAlpha = heat * p.heat;
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.stroke();
    });

    // the signal itself: a short hard dash, no glow
    ctx.globalAlpha = 1;
    ctx.strokeStyle = p.head;
    ctx.lineWidth = thin ? 2 : 3;
    ctx.beginPath();
    pulses.forEach(({ edge, t }) => {
      const a = nodes[edge.from];
      const b = nodes[edge.to];
      const tail = Math.max(0, t - 0.22);
      ctx.moveTo(a.x + (b.x - a.x) * tail, a.y + (b.y - a.y) * tail);
      ctx.lineTo(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
    });
    ctx.stroke();

    // a firing neuron lifts off a hard shadow, the way everything on the page
    // does on hover, then sinks back onto it
    const ringWidth = thin ? 1.5 : 2;
    nodes.forEach(({ x, y, a }) => {
      const lift = a * radius * 0.7;
      if (a > 0) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = p.line;
        ctx.beginPath();
        ctx.arc(x, y, radius + ringWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(x - lift, y - lift, radius, 0, Math.PI * 2);
      ctx.globalAlpha = 1;
      ctx.fillStyle = a > 0.55 ? p.flash : a > 0.12 ? p.after : p.ground;
      ctx.fill();
      ctx.globalAlpha = a > 0 ? 1 : p.ring;
      ctx.strokeStyle = p.line;
      ctx.lineWidth = ringWidth;
      ctx.stroke();
    });

    ctx.restore();
  }

  function draw() {
    const front = net.front * width;
    ctx.clearRect(0, 0, width, height);
    if (ahead) paint(pal[ahead], front, width);
    paint(pal[ground], 0, front);
  }

  const tick = (time, delta) => {
    step(Math.min(delta, 64) / 1000);
    draw();
  };

  const resize = new ResizeObserver(layout);
  resize.observe(canvas);

  // a move to a screen with another pixel ratio resizes nothing, so the observer
  // never hears of it. a query matches one ratio, so it is remade after each change
  let ratio;
  function watchRatio() {
    ratio = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    ratio.addEventListener("change", onRatio, { once: true });
  }
  function onRatio() {
    layout();
    watchRatio();
  }
  watchRatio();

  // it draws on the ticker rather than in a tween, so an observer parks it
  // when the canvas is off screen. reduced motion gets the wiring, at rest
  const park = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !still) gsap.ticker.add(tick);
    else gsap.ticker.remove(tick);
  });
  park.observe(canvas);

  function kill() {
    resize.disconnect();
    ratio.removeEventListener("change", onRatio);
    park.disconnect();
    gsap.ticker.remove(tick);
  }

  return net;
}
