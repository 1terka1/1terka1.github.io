import { reducedMotion } from './party.js';

const canvas = document.querySelector('#space');
const ctx = canvas.getContext('2d');
const explosionCanvas = document.querySelector('#wheel-explosion');
const stars = Array.from({ length: 120 }, () => ({
  x: Math.random(), y: Math.random(), size: .4 + Math.random() * 1.25,
  depth: .3 + Math.random() * .7
}));
const ships = Array.from({ length: 15 }, (_, index) => ({
  team: index % 2 ? 1 : -1, lane: Math.random(), delay: Math.random(),
  speed: .12 + Math.random() * .16, size: 8 + Math.random() * 15
}));
const sparks = Array.from({ length: 105 }, () => ({
  angle: Math.random() * Math.PI * 2, speed: .21 + Math.random() * .67,
  size: 1 + Math.random() * 3, hue: 22 + Math.random() * 39
}));
let width, height;

function ellipseGlow(context, x, y, radius, inside, outside) {
  const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, inside);
  gradient.addColorStop(1, outside);
  context.fillStyle = gradient;
  context.fillRect(x - radius, y - radius, 2 * radius, 2 * radius);
}

function ship(x, y, body, size, team) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(team, 1);
  const plume = ctx.createLinearGradient(-size * 3.6, 0, -size * .65, 0);
  plume.addColorStop(0, 'transparent');
  plume.addColorStop(1, body);
  ctx.fillStyle = plume;
  ctx.fillRect(-size * 3.6, -size * .12, size * 3, size * .24);
  ctx.beginPath();
  ctx.moveTo(size * 1.45, 0);
  ctx.lineTo(-size * .99, -size * .75);
  ctx.lineTo(-size * .65, 0);
  ctx.lineTo(-size * .99, size * .75);
  ctx.closePath();
  ctx.fillStyle = body;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * .96, 0);
  ctx.lineTo(-size * .66, -size * .34);
  ctx.lineTo(-size * .42, 0);
  ctx.lineTo(-size * .66, size * .34);
  ctx.closePath();
  ctx.fillStyle = '#1b1634';
  ctx.fill();
  ctx.restore();
}

function beam(x, y, length, team, color, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(team, 1);
  const trail = ctx.createLinearGradient(-length, 0, 0, 0);
  trail.addColorStop(0, 'transparent');
  trail.addColorStop(1, color);
  ctx.fillStyle = trail;
  ctx.fillRect(-length, -size, length, size * 2);
  ctx.fillStyle = '#fff5f4';
  ctx.fillRect(-length * .34, -.5, length * .34, 1);
  ctx.restore();
}

function planet(x, y, radius, cold) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-.43);
  ctx.strokeStyle = cold ? '#8a9bf177' : '#f892ae63';
  ctx.lineWidth = radius * .045;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 1.67, radius * .31, 0, 0, Math.PI * 2);
  ctx.stroke();
  const light = ctx.createRadialGradient(-radius * .45, -radius * .62, 0, 0, 0, radius);
  light.addColorStop(0, cold ? '#948af1' : '#e589ae');
  light.addColorStop(.55, cold ? '#3b407a' : '#74406f');
  light.addColorStop(1, '#141024');
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 1.68, radius * .31, 0, 0, Math.PI);
  ctx.stroke();
  ctx.restore();
}

function blast(context, x, y, p, scale) {
  if (p < 0 || p >= 1) return;
  const power = (1 - p) ** 2;
  ellipseGlow(context, x, y, scale * (.1 + p * .58), 'rgba(255,220,162,' + power * .82 + ')', '#ff604000');
  context.strokeStyle = 'rgba(255,203,132,' + power * .84 + ')';
  context.lineWidth = Math.max(.5, 4 * power);
  context.beginPath();
  context.arc(x, y, scale * (.045 + .6 * p), 0, Math.PI * 2);
  context.stroke();
  for (const spark of sparks) {
    const length = scale * spark.speed * (p ** .72);
    const dx = Math.cos(spark.angle) * length;
    const dy = Math.sin(spark.angle) * length;
    context.strokeStyle = 'hsla(' + spark.hue + ',100%,72%,' + power + ')';
    context.lineWidth = spark.size * (1 - p);
    context.beginPath();
    context.moveTo(x + dx * .87, y + dy * .87);
    context.lineTo(x + dx, y + dy);
    context.stroke();
  }
}

function fireball(context, x, y, time, size) {
  const expansion = 1 - Math.exp(-time * 5);
  for (let i = 0; i < 9; i++) {
    const spark = sparks[i];
    const distance = size * spark.speed * expansion * .48;
    const radius = size * (.12 + spark.speed * .12 + expansion * .16);
    const cloudX = x + Math.cos(spark.angle) * distance;
    const cloudY = y + Math.sin(spark.angle) * distance - time * size * .08;
    const glow = context.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, radius);
    glow.addColorStop(0, 'rgba(255,242,191,' + Math.exp(-time * 6) + ')');
    glow.addColorStop(.34, 'rgba(255,146,63,' + Math.exp(-time * 3.8) + ')');
    glow.addColorStop(.66, 'rgba(94,53,68,' + .58 * Math.sin(Math.PI * time / 1.45) + ')');
    glow.addColorStop(1, '#3b253f00');
    context.fillStyle = glow;
    context.fillRect(cloudX - radius, cloudY - radius, radius * 2, radius * 2);
  }
  ellipseGlow(context, x, y, size * (.27 + expansion * .23), 'rgba(255,252,235,' + Math.exp(-time * 9) + ')', '#ffab5600');
}

export function explodeOverWheel(stage, stoppedAt) {
  const foreground = explosionCanvas.getContext('2d');
  if (!foreground || reducedMotion.matches) return;
  const density = Math.min(devicePixelRatio || 1, 1.75);
  const started = performance.now();
  explosionCanvas.hidden = false;
  drawSpace(stoppedAt);
  const recoil = stage.querySelector('.wheel-shell').animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.045) translateY(-3px)', offset: .16 },
    { transform: 'scale(.985) translateY(2px)', offset: .46 },
    { transform: 'scale(1)' }
  ], { duration: 390, easing: 'ease-out' });

  function frame(now) {
    const time = Math.max(0, now - started) / 1000;
    if (time >= 1.45 || reducedMotion.matches) {
      explosionCanvas.hidden = true;
      recoil.cancel();
      drawSpace();
      return;
    }
    const w = innerWidth;
    const h = innerHeight;
    const pixelWidth = Math.round(w * density);
    const pixelHeight = Math.round(h * density);
    if (explosionCanvas.width !== pixelWidth || explosionCanvas.height !== pixelHeight) {
      explosionCanvas.width = pixelWidth;
      explosionCanvas.height = pixelHeight;
      foreground.setTransform(density, 0, 0, density, 0, 0);
    }
    foreground.clearRect(0, 0, w, h);
    const bounds = stage.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = Math.max(h * .16, Math.min(h * .84, bounds.top + bounds.height / 2));
    fireball(foreground, x, y, time, bounds.width);
    blast(foreground, x, y, time / 1.45, Math.max(bounds.width * 1.34, Math.min(w, h)));
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

export function drawSpace(t = -1) {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  const moving = t >= 0 && !reducedMotion.matches;
  const stage = t < 9 ? 0 : t < 26 ? 1 : 2;
  const w = width;
  const h = height;
  const shortSide = Math.min(w, h);

  if (moving) {
    ctx.fillStyle = stage === 2 ? '#2b1433be' : '#10142db8';
    ctx.fillRect(0, 0, w, h);
    const sway = Math.sin(t * .14) * w * .11;
    ellipseGlow(ctx, w * .75 + sway, h * .35, w * .55, stage === 2 ? '#bc4e7660' : '#804dce69', '#6737cf00');
    ellipseGlow(ctx, w * .22 - sway, h * .73, w * .57, '#4866d54a', '#32309900');
    planet(w * (.14 + .012 * Math.sin(t * .15)), h * .32, shortSide * (stage === 2 ? .22 : .125), stage !== 2);
    planet(w * .94, h * (.81 + Math.sin(t * .09) * .05), shortSide * .14, stage === 2);
  }

  for (const star of stars) {
    const offset = moving ? t * star.depth * (stage === 0 ? .033 : .009) : 0;
    const x = ((star.x + 1 - offset % 1) % 1) * w;
    const y = star.y * h;
    const trail = moving && stage === 0 ? 55 * star.depth : star.size;
    ctx.fillStyle = 'rgba(222,199,255,' + (.15 + star.depth * .5) + ')';
    ctx.fillRect(x, y, trail, star.size * .7);
  }
  if (!moving) return;

  if (stage > 0) {
    ships.forEach((s, index) => {
      const p = (t * s.speed + s.delay) % 1;
      const x = w * (s.team === 1 ? p : 1 - p);
      const y = h * (.12 + s.lane * .7) + Math.sin(p * 8 + index) * shortSide * .065;
      const color = s.team === 1 ? '#96bbff' : '#ff91c4';
      ship(x, y, color, s.size * Math.min(1.4, shortSide / 600), s.team);
      const fire = (t * (stage === 2 ? .95 : .66) + s.delay) % 1;
      if (fire < .6) {
        const travel = w * fire;
        beam(x + s.team * travel, y - Math.sin(fire * 3) * h * .065, w * .13, s.team, color, stage === 2 ? 1.5 : 1);
      }
    });
    for (let i = 0; i < (stage === 2 ? 5 : 2); i++) {
      const cycle = (t * .5 + i * .321) % 1;
      const x = w * (.13 + .16 * i + .06 * Math.sin(Math.floor(t * .5 + i * .321) * 3));
      const y = h * (.43 + .24 * Math.sin(i * 1.8 + Math.floor(t * .5 + i * .321)));
      blast(ctx, x, y, cycle * 2 / 1.45, shortSide * (.13 + i * .032));
    }
  }
}

function resize() {
  width = innerWidth;
  height = innerHeight;
  if (!ctx) return;
  const density = Math.min(devicePixelRatio || 1, 1.75);
  canvas.width = width * density;
  canvas.height = height * density;
  ctx.scale(density, density);
  drawSpace();
}

resize();
window.addEventListener('resize', resize);
