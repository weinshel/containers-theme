function saveOptions(e) {
  e.preventDefault();

  let intensity = 1 - document.querySelector("#intensity-slider").value;

  let options = {
      intensity: intensity
  }

  browser.storage.local.set({options});

}

async function restoreOptions() {

  const {options} = await browser.storage.local.get("options");
  document.querySelector("#intensity-slider").value = 1 - options.intensity;

}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);