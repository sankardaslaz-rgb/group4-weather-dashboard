// js/display.js
// ============================================================
// This file handles everything the USER SEES on screen.
// It takes raw data from api.js and puts it into the HTML.
//
// Think of it like this:
//   api.js    = goes to the internet and gets the weather data
//   display.js = takes that data and writes it onto the page
//
// Right now it has one function: renderCurrent(data)
// More functions (renderForecast, renderChart) will be added
// by Member 4 later in the project.
// ============================================================


// ============================================================
// FUNCTION: renderCurrent(data)
//
// This function receives the full weather data object returned
// by fetchWeather() in api.js, reads the values we need,
// and updates the matching elements on the HTML page.
//
// How to call it from app.js:
//   const data = await fetchWeather(lat, lon);
//   renderCurrent(data);
//
// The "data" object looks like this (from Open-Meteo API):
//   data.current.temperature_2m   → e.g. 21.4
//   data.current.wind_speed_10m   → e.g. 13.2
//   data.current.weather_code     → e.g. 3
// ============================================================

// "function" creates a reusable block of code with the name renderCurrent.
// "data" is the parameter — it receives the weather data object when called.
function renderCurrent(data) {

  // ----------------------------------------------------------
  // STEP 1: Read the values we need out of the data object.
  // We store them in variables so they are easy to use below.
  // ----------------------------------------------------------

  // Read the current temperature from the data object.
  // data.current is an object. temperature_2m is a property inside it.
  // The dot (.) is how we reach inside an object to get a value.
  // Example result: 21.4
  const temperature = data.current.temperature_2m;

  // Read the current wind speed from the data object.
  // wind_speed_10m means wind speed measured at 10 metres above ground.
  // Example result: 13.2
  const windSpeed = data.current.wind_speed_10m;

  // Read the weather code from the data object.
  // This is a number (e.g. 0, 1, 2, 3...) set by the WMO standard.
  // For now we will just display the number — on Day 3 we will swap
  // this for a text description using the weatherDescriptions object.
  // Example result: 3
  const weatherCode = data.current.weather_code;


  // ----------------------------------------------------------
  // STEP 2: Log all three values to the browser console.
  // Press F12 in your browser and click the "Console" tab to see these.
  // This is how developers check that the right data arrived before
  // trying to put it on the page.
  // ----------------------------------------------------------

  // Print a divider line so the output is easy to spot in the console.
  console.log("--- renderCurrent() called ---");

  // Print the temperature value we just read.
  // The comma between the label string and the variable prints both.
  console.log("Temperature:", temperature);

  // Print the wind speed value.
  console.log("Wind Speed:", windSpeed);

  // Print the weather code number.
  console.log("Weather Code:", weatherCode);


  // ----------------------------------------------------------
  // STEP 3: Find each HTML element by its id and update it.
  //
  // document.getElementById("some-id") searches the whole HTML page
  // and returns the element that has that id — like finding a labelled
  // box by reading the label.
  //
  // .textContent is the text written inside that element.
  // Setting it replaces whatever was there before (the "--" placeholders).
  //
  // Template literals (backticks ` `) let us mix text and variables
  // cleanly using ${variableName} — much neater than joining with +.
  // ----------------------------------------------------------

  // Find the element with id="temperature" in index.html.
  // Set its text to the temperature number followed by "°C".
  // Example result on page: "21.4°C"
  document.getElementById("temperature").textContent = `${temperature}°C`;

  // Find the element with id="wind-speed" in index.html.
  // Set its text to include the "Wind:" label and "km/h" unit.
  // Example result on page: "Wind: 13.2 km/h"
  document.getElementById("wind-speed").textContent = `Wind: ${windSpeed} km/h`;

  // Find the element with id="condition" in index.html.
  // For now we just show the raw weather code number.
  // On Day 3, Member 3 will replace this line with a lookup into
  // the weatherDescriptions object to show text like "Partly cloudy ⛅".
  // Example result on page: "Weather code: 3"
  // NEW — shows real description and emoji
const info = getWeatherInfo(weatherCode);
document.getElementById("condition").textContent = `${info.icon} ${info.description}`;
 

  // Print a confirmation message so we know the function finished
  // without any errors. If you see this in the console, it worked!
  console.log("renderCurrent() finished — page has been updated.");

}
// End of renderCurrent function.
// The closing brace } marks where the function ends.
// Any code outside these braces is NOT part of the function.