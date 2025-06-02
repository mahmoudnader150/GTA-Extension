function playSound(fileName) {
  const audio = new Audio(chrome.runtime.getURL(`assets/${fileName}`));
  audio.play();
}

const observer = new MutationObserver(() => {
  // Check for Accepted/Passed
  const accepted = document.querySelector('.text-green-s');
  if (accepted && accepted.textContent.includes("Accepted")) {
    playSound('passed.mp3');
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
