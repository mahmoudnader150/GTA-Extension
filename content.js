function playSound(fileName) {
  const audio = new Audio(chrome.runtime.getURL(fileName));
  audio.play();
}

const observer = new MutationObserver(() => {
  const result = document.querySelector('.text-green-s');
  if (result && result.textContent.includes("Accepted")) {
    chrome.storage.sync.get("selectedSound", ({ selectedSound }) => {
      const sound = selectedSound || "mission-passed.mp3";
      playSound(sound);
    });
    observer.disconnect();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
