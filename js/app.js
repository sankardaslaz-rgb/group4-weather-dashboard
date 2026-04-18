async function init() {
  const data = await fetchWeather(48.85, 2.35);
  renderCurrent(data);
  renderForecast(data.daily);  // ← add this line
}

init();