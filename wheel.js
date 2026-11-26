import { allowSound, initSound, pauseMusic, prepareEffect } from './audio.js';
import { birthdayPrize, congratulationsHash, hasBirthdayPrize, saveBirthdayPrize, writeBirthdayPrizeMessage } from './birthday-prize.js';
import { confetti, reducedMotion, setUpDialog } from './party.js';
import { drawSpace, explodeOverWheel } from './space.js';

const prizes = [
  ['🏠', 'Дом', 'Дом в Москве'],
  ['🎬', 'Ди-Каприо', 'Встреча с Ди-Каприо'],
  ['🏎️', 'Авто 2026', 'Любая машина 2026 года на выбор'],
  ['🏝️', 'Остров', 'Свой личный остров'],
  ['✈️', 'Европа', 'Полный переезд в Европу с родственниками'],
  ['🎮', 'PS5 + GTA', 'PS5 Pro с GTA 6'],
  ['🛥️', 'Яхта', 'Личная яхта'],
  ['🌯', 'Шаурма', 'Бесплатная шаурма 10 лет подряд'],
  ['🍕', 'Пеперони', 'Пицца пеперони, 100 штук'],
  ['🤖', 'Трансформер', 'Личный трансформер'],
  ['♨️', 'Сауна', 'Финская сауна'],
  birthdayPrize,
  ['🐧', 'Пингвины', 'Участок в Антарктиде с фермой пингвинов'],
  ['♠️', 'Покер', 'Абонемент на безлимитные фишки для покера в Вегасе'],
  ['🎥', 'Паттинсон', 'Сняться в голливудском фильме с Паттинсоном'],
  ['🕷️', 'Человек-паук', 'Стать новым Человеком-пауком'],
  ['🎯', 'Тир', 'Личный тир с сотнями видов оружия'],
  ['🏢', 'Япония', 'Своя корпорация в Японии'],
  ['🦖', 'Ти-рекс', 'Личный ти-рекс'],
  ['📹', 'MrBeast', 'Участие в видео MrBeast'],
  ['🧠', 'Эйнштейн', 'Получить знания Эйнштейна'],
  ['🎂', '+100 лет', 'Продлить жизнь на 100 лет'],
  ['💬', '10 языков', 'Знание 10 языков на выбор']
];

const wishes = [
  'Лёха, с днюхой! Пусть в этом году будет побольше дней, которые захочется повторить.',
  'Пусть друзья пишут «го» и правда собираются в тот же вечер.',
  'Пусть на всё, что давно хотелось попробовать, наконец найдётся время.',
  'Желаю поездок, из которых возвращаешься с историями на весь год.',
  'Пусть отличные новости прилетают чаще, чем сообщения «ты не спишь?».',
  'Желаю побольше вечеров, когда можно выдохнуть и сказать: «Вот это был хороший день».',
  'Пусть даже самые дурацкие идеи оборачиваются историями, которые потом смешно вспоминать.',
  'За тебя, Лёха! Пусть впереди будет много поводов собраться.'
];

const circle = document.querySelector('#wheel');
const ctx = circle.getContext('2d');
const wheelStage = document.querySelector('.wheel-stage');
const spin = document.querySelector('#spin');
const status = document.querySelector('#spin-status');
const hint = document.querySelector('#spin-hint');
const result = document.querySelector('#result');
const prizeList = document.querySelector('#prize-list');
const firstSpinDuration = 44000;
const repeatSpinDuration = 6500;
const finaleDuration = 6000;
const wishInterval = 6000;
const turn = Math.PI * 2;
const slice = turn / prizes.length;
const winningIndex = prizes.indexOf(birthdayPrize);
const savedPrize = document.querySelector('#saved-prize');
const resultIcon = document.querySelector('#result-icon');
const resultPrize = document.querySelector('#result-prize');
const resultBirthdayMessage = document.querySelector('#result-birthday-message');
writeBirthdayPrizeMessage(resultBirthdayMessage);
const playFinale = prepareEffect(new URL('./wheel-finale.mp3', import.meta.url));
const palette = ['#f6d16d', '#efa9cf', '#b6d593', '#bdcdf5', '#f7ad87'];
let angle = 0;
let busy = false;
let highlightedPrize;

function showSavedPrize() {
  savedPrize.querySelector('span').textContent = birthdayPrize[2];
  savedPrize.hidden = false;
}

if (hasBirthdayPrize()) showSavedPrize();
window.addEventListener('pageshow', () => {
  if (hasBirthdayPrize()) showSavedPrize();
  if (!busy && !result.open) pauseMusic(false);
});
window.addEventListener('storage', () => {
  if (hasBirthdayPrize()) showSavedPrize();
});

const prizeItems = prizes.map(([icon, , label]) => {
  const item = document.createElement('li');
  const emoji = document.createElement('span');
  emoji.className = 'prize-emoji';
  emoji.setAttribute('aria-hidden', 'true');
  emoji.textContent = icon;
  item.append(emoji, document.createTextNode(label));
  prizeList.append(item);
  return item;
});

function drawWheel() {
  if (!ctx) return;
  const radius = circle.width / 2;
  ctx.translate(radius, radius);

  prizes.forEach(([icon, label], index) => {
    const center = index * slice - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, center - slice / 2, center + slice / 2);
    ctx.closePath();
    ctx.fillStyle = palette[index % palette.length];
    ctx.fill();
    ctx.strokeStyle = '#292623a8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.rotate(center);
    ctx.fillStyle = '#292623';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = '43px system-ui';
    ctx.fillText(icon, radius * .82, 0);
    const upsideDown = Math.cos(center) < -.02;
    ctx.translate(radius * .545, 0);
    if (upsideDown) ctx.rotate(Math.PI);
    ctx.font = '750 31px system-ui';
    ctx.fillText(label, 0, 0, radius * .35);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(0, 0, radius * .935, 0, turn);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#2926238a';
  ctx.stroke();
  for (let i = 0; i < 80; i++) {
    const direction = i * turn / 80;
    const major = i % 4 === 0;
    ctx.beginPath();
    ctx.arc(Math.cos(direction) * radius * .966, Math.sin(direction) * radius * .966, major ? 3.7 : 2, 0, turn);
    ctx.fillStyle = major ? '#292623' : '#29262375';
    ctx.fill();
  }
}

function easedDistance(p) {
  // Integrate a smooth acceleration ramp, a cruise, and a smooth braking ramp.
  const ramp = q => q ** 3 - .5 * q ** 4;
  if (p < .10) return .10 * ramp(p / .10) / .78;
  if (p < .66) return (.05 + p - .10) / .78;
  const braking = (p - .66) / .34;
  return (.61 + .34 * (braking - ramp(braking))) / .78;
}

function setAngle(degrees) {
  angle = degrees % 360;
  circle.style.transform = 'rotate(' + angle + 'deg)';
}

function endSpin({ index, firstSpin, duration, destination }) {
  const [icon, , label] = prizes[index];
  setAngle(destination);
  document.body.classList.remove('spinning');
  document.body.classList.add('won');
  hint.hidden = true;
  status.textContent = 'Выпало: ' + label;
  highlightedPrize?.classList.remove('selected-prize');
  highlightedPrize = prizeItems[index];
  highlightedPrize.classList.add('selected-prize');

  pauseMusic(true);
  playFinale();
  explodeOverWheel(wheelStage, duration / 1000);

  if (firstSpin) {
    setTimeout(() => {
      saveBirthdayPrize();
      showSavedPrize();
      resetSpinButton();
      location.assign(new URL('./' + congratulationsHash, import.meta.url));
    }, finaleDuration);
  } else {
    setTimeout(() => {
      resultIcon.textContent = icon;
      resultPrize.textContent = label;
      resultBirthdayMessage.hidden = index !== winningIndex;
      result.showModal();
      confetti(true);
      resetSpinButton();
    }, reducedMotion.matches ? 120 : 900);
  }
}

function resetSpinButton() {
  busy = false;
  spin.disabled = false;
  spin.textContent = 'Крутить ещё';
}

function startSpin() {
  if (busy) return;
  const firstSpin = !hasBirthdayPrize();
  const index = firstSpin ? winningIndex : Math.floor(Math.random() * prizes.length);
  const duration = firstSpin ? firstSpinDuration : repeatSpinDuration;
  const destination = (360 - 360 * index / prizes.length) % 360;

  busy = true;
  spin.disabled = true;
  spin.textContent = 'Колесо крутится…';
  hint.hidden = false;
  status.textContent = wishes[0];
  document.body.classList.remove('won');
  document.body.classList.add('spinning');
  const firstAngle = angle;
  const fullTurns = firstSpin ? 31 : 5;
  const lastAngle = firstAngle + 360 * fullTurns + ((destination - firstAngle + 360) % 360);
  const started = performance.now();
  let previousWish = 0;
  allowSound();

  function frame(now) {
    const elapsed = Math.min(duration, Math.max(0, now - started));
    const ratio = elapsed / duration;
    const wish = Math.floor(elapsed / wishInterval) % wishes.length;
    if (wish !== previousWish) {
      previousWish = wish;
      status.textContent = wishes[wish];
    }
    if (!reducedMotion.matches) {
      setAngle(firstAngle + (lastAngle - firstAngle) * easedDistance(ratio));
      drawSpace(elapsed / 1000);
    }
    if (elapsed < duration) requestAnimationFrame(frame);
    else endSpin({ index, firstSpin, duration, destination });
  }
  requestAnimationFrame(frame);
}

setUpDialog(result, spin);
result.addEventListener('close', () => pauseMusic(false));
spin.addEventListener('click', startSpin);
spin.disabled = false;
drawWheel();
initSound();
