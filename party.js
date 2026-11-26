export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

export function setUpDialog(dialog, button) {
  dialog.querySelectorAll('[data-close]').forEach(close => {
    close.addEventListener('click', () => dialog.close());
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => button.focus({ preventScroll: true }));
}

const colors = ['#e9b5ff', '#feacc7', '#af9bff', '#ffdc86', '#96e8f5', '#faf2ff'];
let confettiFrame;

export function confetti(big = false) {
  if (reducedMotion.matches) return;
  const canvas = document.querySelector('#confetti');
  const context = canvas.getContext('2d');
  if (!context) return;
  cancelAnimationFrame(confettiFrame);
  const w = innerWidth;
  const h = innerHeight;
  const density = Math.min(devicePixelRatio || 1, 2);
  canvas.width = w * density;
  canvas.height = h * density;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  context.scale(density, density);
  if (canvas.showPopover && !canvas.matches(':popover-open')) canvas.showPopover();
  const bits = Array.from({ length: big ? 175 : 105 }, (_, i) => ({
    x: w * (.28 + Math.random() * .44),
    y: h * (.48 + Math.random() * .20),
    vx: (Math.random() - .5) * (w * .47 + 130),
    vy: -130 - Math.random() * (h * .83 + 60),
    spin: (Math.random() - .5) * 16,
    size: 4 + Math.random() * 7,
    color: colors[i % colors.length],
    life: 1.3 + Math.random() * 1.5
  }));
  const started = performance.now();

  function draw(now) {
    const t = (now - started) / 1000;
    context.clearRect(0, 0, w, h);
    for (const bit of bits) {
      if (t > bit.life) continue;
      context.save();
      context.translate(bit.x + bit.vx * t, bit.y + bit.vy * t + 280 * t * t);
      context.rotate(bit.spin * t);
      context.scale(Math.cos(bit.spin * t * .63), 1);
      context.globalAlpha = Math.min(1, (bit.life - t) * 3);
      context.fillStyle = bit.color;
      context.fillRect(-bit.size / 2, -bit.size / 2, bit.size, bit.size * .57);
      context.restore();
    }
    if (t < 2.8) {
      confettiFrame = requestAnimationFrame(draw);
    } else if (canvas.hidePopover && canvas.matches(':popover-open')) {
      canvas.hidePopover();
    }
  }
  confettiFrame = requestAnimationFrame(draw);
}
