// js/app.js

async function init() {
  const data = await fetchWeather(48.85, 2.35); // Paris
  renderCurrent(data);
}

init();