function playSound(fileName) {
  const audio = new Audio(chrome.runtime.getURL(`assets/${fileName}`));
  audio.play();
}

function showMissionPassedEffect() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = 9999;
  overlay.style.pointerEvents = 'none';
  overlay.style.background = 'rgba(0,0,0,0)';

  // Create text
  const text = document.createElement('div');
  text.textContent = 'MISSION PASSED!';
  text.style.fontFamily = 'Impact, Arial Black, sans-serif';
  text.style.fontSize = '5vw';
  text.style.color = '#FFD700';
  text.style.textShadow = '2px 2px 8px #000, 0 0 20px #FF8C00';
  text.style.letterSpacing = '0.2em';
  text.style.animation = 'mp-fade 2.5s ease-out';

  overlay.appendChild(text);
  document.body.appendChild(overlay);

  // Remove after animation
  setTimeout(() => {
    overlay.remove();
  }, 2500);
}

// Add keyframes for fade effect
const style = document.createElement('style');
style.textContent = `@keyframes mp-fade { 0% { opacity: 0; transform: scale(0.8); } 10% { opacity: 1; transform: scale(1.05); } 80% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1.1); } }`;
document.head.appendChild(style);

const observer = new MutationObserver(() => {
  // Check for Accepted/Passed
  const accepted = document.querySelector('.text-green-s');
  if (accepted && accepted.textContent.includes("Accepted")) {
    playSound('passed.mp3');
    showMissionPassedEffect();
    observer.disconnect();
    return;
  }
  // Check for Wrong Answer
  const wrong = Array.from(document.querySelectorAll('div')).find(div => div.textContent && div.textContent.includes('Wrong Answer'));
  if (wrong) {
    playSound('wasted.mp3');
    observer.disconnect();
    return;
  }
});

observer.observe(document.body, { childList: true, subtree: true });
