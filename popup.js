// Load current setting
chrome.storage.sync.get("selectedSound", ({ selectedSound }) => {
  if (selectedSound) {
    document.querySelectorAll('input[name="sound"]').forEach(input => {
      if (input.value === selectedSound) {
        input.checked = true;
      }
    });
  }
});

// Save setting on change
document.querySelectorAll('input[name="sound"]').forEach(input => {
  input.addEventListener('change', () => {
    chrome.storage.sync.set({ selectedSound: input.value });
  });
});
