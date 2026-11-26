import { initSound, pauseMusic } from './audio.js';
import { birthdayPrize, congratulationsHash, writeBirthdayPrizeMessage } from './birthday-prize.js';
import { confetti, setUpDialog } from './party.js';

const welcome = document.querySelector('#welcome');
const enterSite = document.querySelector('#enter-site');
const welcomeKey = 'leha-welcome-seen';
const dialog = document.querySelector('#greeting');
const greet = document.querySelector('#greet');
const video = document.querySelector('#greeting-video');
const prize = document.querySelector('#birthday-prize');
const fromWheel = location.hash === congratulationsHash;

let welcomeSeen = false;
try { welcomeSeen = sessionStorage.getItem(welcomeKey) === 'yes'; } catch {}
const showWelcome = welcome && !fromWheel && !welcomeSeen;

initSound({ paused: fromWheel || showWelcome });
if (showWelcome) {
  function enter() {
    try { sessionStorage.setItem(welcomeKey, 'yes'); } catch {}
    welcome.close();
    pauseMusic(false);
    greet.focus({ preventScroll: true });
  }

  enterSite.addEventListener('click', enter);
  welcome.addEventListener('cancel', event => {
    event.preventDefault();
    enter();
  });
  welcome.showModal();
}
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
