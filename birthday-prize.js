export const birthdayPrize = [
  '🎁', 'Чек', 'Чек на 2 200 ₽ на Ozon / Wildberries и 2 200 ₽ в Steam'
];

export const congratulationsHash = '#pozdravlenie';
const prizeKey = 'leha-birthday-prize';

export function hasBirthdayPrize() {
  try {
    return localStorage.getItem(prizeKey) === 'claimed';
  } catch {
    return false;
  }
}

export function saveBirthdayPrize() {
  try {
    localStorage.setItem(prizeKey, 'claimed');
  } catch {
    // The congratulations still opens when browser storage is unavailable.
  }
}

export function writeBirthdayPrizeMessage(container) {
  const paragraphs = [
    'Какая удача! Тебе несказанно повезло, лучший выигрыш из всех! Скорее сделай скриншот и отправь друзьям свой выигрыш!',
    'А также можешь крутить колесо ещё сколько хочешь, чтобы посмотреть, что ещё могло бы выпасть. Но лучше данного подарка уже не будет, уж поверь мне.'
  ];
  for (const text of paragraphs) {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    container.append(paragraph);
  }
}
