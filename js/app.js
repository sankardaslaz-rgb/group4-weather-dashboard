async function init() {
  const data = await fetchWeather(48.85, 2.35);
  renderCurrent(data);
  renderForecast(data.daily);
  renderChart(data.hourly);
  setBackground(data.current.weather_code); // ← add this
}

init();