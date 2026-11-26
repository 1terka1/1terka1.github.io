import { initSound, pauseMusic } from './audio.js';
import { birthdayPrize, congratulationsHash, writeBirthdayPrizeMessage } from './birthday-prize.js';
import { confetti, setUpDialog } from './party.js';

const dialog = document.querySelector('#greeting');
const greet = document.querySelector('#greet');
const video = document.querySelector('#greeting-video');
const prize = document.querySelector('#birthday-prize');
const fromWheel = location.hash === congratulationsHash;

initSound({ paused: fromWheel });
setUpDialog(dialog, greet);

function openGreeting(showPrize) {
  pauseMusic(true);
  prize.hidden = !showPrize;
  if (showPrize) prize.querySelector('h3').textContent = birthdayPrize[2];
  dialog.showModal();
  if (showPrize) confetti(true);
  else video.play().catch(() => {});
}

greet.addEventListener('click', () => openGreeting(false));
dialog.addEventListener('close', () => {
  video.pause();
  pauseMusic(false);
});

if (fromWheel) {
  writeBirthdayPrizeMessage(prize.querySelector('#birthday-prize-message'));
  openGreeting(true);
  history.replaceState(null, '', location.pathname + location.search);
}
