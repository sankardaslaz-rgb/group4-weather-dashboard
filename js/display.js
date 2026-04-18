// js/display.js
// ============================================================
// This file handles everything the USER SEES on screen.
// It takes raw data from api.js and puts it into the HTML.
//
// Think of it like this:
//   api.js    = goes to the internet and gets the weather data
//   display.js = takes that data and writes it onto the page
//
// Functions in this file:
//   renderCurrent(data)   → updates current weather on screen
//   renderForecast(daily) → builds the 7-day forecast cards
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
  document.getElementById("condition").textContent = `Weather code: ${weatherCode}`;

  // Print a confirmation message so we know the function finished
  // without any errors. If you see this in the console, it worked!
  console.log("renderCurrent() finished — page has been updated.");

}
// End of renderCurrent function.
// The closing brace } marks where the function ends.
// Any code outside these braces is NOT part of the function.


// ============================================================
// FUNCTION: renderForecast(daily)
//
// Builds 7 forecast cards and injects them into the page
// inside the element with id="forecast-container".
//
// "daily" is the daily data object from the API. It looks like:
//   daily.time              → ["2025-06-01","2025-06-02", ...] (7 dates)
//   daily.weather_code      → [3, 61, 0, 2, 80, 1, 45]         (7 codes)
//   daily.temperature_2m_max → [24.1, 19.3, 22.0, ...]         (7 highs)
//   daily.temperature_2m_min → [14.2, 11.8, 13.5, ...]         (7 lows)
//
// How to call it from app.js:
//   const data = await fetchWeather(lat, lon);
//   renderForecast(data.daily);
// ============================================================

// "function" creates a reusable block named renderForecast.
// "daily" is the parameter — receives data.daily from the API response.
function renderForecast(daily) {

  // Print a divider in the console so we can track when this runs.
  console.log("--- renderForecast() called ---");

  // Log the full daily object so we can inspect it in DevTools.
  // Click the arrow next to it in the console to expand and read it.
  console.log("Daily data received:", daily);

  // ----------------------------------------------------------
  // STEP 1: Find the forecast container and clear it.
  // We find it once and store it in a variable so we do not
  // have to search for it again on every loop iteration.
  // ----------------------------------------------------------

  // document.getElementById() searches the HTML for id="forecast-container".
  // We store the result in a variable called "container" for convenience.
  const container = document.getElementById("forecast-container");

  // Clear any cards that might already be inside the container.
  // innerHTML = "" deletes all child elements inside the container.
  // This prevents duplicate cards if renderForecast is called again
  // (e.g. when the user searches for a new city).
  container.innerHTML = "";

  // ----------------------------------------------------------
  // STEP 2: Loop through all 7 days and build one card per day.
  //
  // A "for loop" repeats a block of code a set number of times.
  // Structure:  for (start; condition; step) { ... }
  //   let i = 0    → start at index 0 (the first day, today)
  //   i < 7        → keep going as long as i is less than 7
  //   i++          → after each loop, add 1 to i (i++ means i = i + 1)
  // So i goes: 0, 1, 2, 3, 4, 5, 6  — that is exactly 7 days.
  // ----------------------------------------------------------

  // Begin the loop — runs once for each of the 7 days.
  for (let i = 0; i < 7; i++) {

    // --------------------------------------------------------
    // STEP 2a: Read this day's values from the daily arrays.
    // Arrays use index numbers starting at 0.
    // daily.time[0] is today, daily.time[1] is tomorrow, etc.
    // --------------------------------------------------------

    // Get the date string for this day. Example: "2025-06-03"
    const dateString = daily.time[i];

    // Convert the date string into a Date object so JavaScript
    // can understand and work with it as an actual date.
    // We add "T00:00:00" to avoid timezone shift bugs — without it,
    // some browsers interpret the date as UTC midnight and subtract
    // hours, making it show the wrong day name.
    const dateObject = new Date(dateString + "T00:00:00");

    // Convert the Date object into a short day name like "Mon" or "Tue".
    // toLocaleDateString() formats the date for a specific language/region.
    // "en-US" = English (United States).
    // { weekday: "short" } means we only want the short day name.
    // Example result: "Mon", "Tue", "Wed"
    const dayName = dateObject.toLocaleDateString("en-US", { weekday: "short" });

    // Get the weather code number for this day.
    // Example: 63 (which means "Moderate rain")
    const code = daily.weather_code[i];

    // Look up the code in weatherCodes using getWeatherInfo().
    // This returns an object like { description: "Moderate rain", icon: "🌧️" }.
    // getWeatherInfo() is defined in weather-codes.js which loads first.
    const weatherInfo = getWeatherInfo(code);

    // Get the highest temperature for this day. Example: 24.1
    const high = daily.temperature_2m_max[i];

    // Get the lowest temperature for this day. Example: 13.5
    const low = daily.temperature_2m_min[i];

    // Log this day's values so we can verify them in the console.
    console.log(`Day ${i}: ${dayName} | ${weatherInfo.icon} ${weatherInfo.description} | High: ${high}° Low: ${low}°`);

    // --------------------------------------------------------
    // STEP 2b: Create the card div element for this day.
    // We build the card in JavaScript and then add it to the page.
    // --------------------------------------------------------

    // document.createElement("div") creates a brand new <div> element.
    // It is not on the page yet — we are just building it in memory.
    const card = document.createElement("div");

    // Give the card the class "forecast-card" so style.css styles it.
    // className sets the class attribute — same as writing class="forecast-card" in HTML.
    card.className = "forecast-card";

    // --------------------------------------------------------
    // STEP 2c: Create the four <p> elements for this card.
    // Each one holds one piece of information for this day.
    // --------------------------------------------------------

    // --- Day name paragraph ---

    // Create a new <p> element to hold the day name.
    const dayEl = document.createElement("p");

    // Give it the class "day-label" so style.css can style it.
    dayEl.className = "day-label";

    // Set its text to the short day name. Example: "Mon"
    dayEl.textContent = dayName;

    // --- Weather icon paragraph ---

    // Create a new <p> element to hold the weather emoji.
    const iconEl = document.createElement("p");

    // Give it the class "forecast-icon" for styling.
    iconEl.className = "forecast-icon";

    // Set its text to the emoji icon from getWeatherInfo(). Example: "🌧️"
    iconEl.textContent = weatherInfo.icon;

    // --- High temperature paragraph ---

    // Create a new <p> element to hold the maximum temperature.
    const highEl = document.createElement("p");

    // Give it the class "temp-high" — style.css colours this in warm yellow.
    highEl.className = "temp-high";

    // Set its text to the high temp with a degree symbol. Example: "24°"
    // Math.round() removes the decimal point: 24.1 becomes 24.
    highEl.textContent = `${Math.round(high)}°`;

    // --- Low temperature paragraph ---

    // Create a new <p> element to hold the minimum temperature.
    const lowEl = document.createElement("p");

    // Give it the class "temp-low" — style.css colours this in cool blue-grey.
    lowEl.className = "temp-low";

    // Set its text to the low temp with a degree symbol. Example: "13°"
    // Math.round() removes the decimal here too.
    lowEl.textContent = `${Math.round(low)}°`;

    // --------------------------------------------------------
    // STEP 2d: Nest the four <p> elements inside the card div.
    // appendChild() adds a child element inside a parent element.
    // The order we append determines the order they appear on screen.
    // --------------------------------------------------------

    // Add the day name <p> inside the card div — appears at the top.
    card.appendChild(dayEl);

    // Add the icon <p> below the day name.
    card.appendChild(iconEl);

    // Add the high temp <p> below the icon.
    card.appendChild(highEl);

    // Add the low temp <p> below the high temp — appears at the bottom.
    card.appendChild(lowEl);

    // --------------------------------------------------------
    // STEP 2e: Add the completed card into the forecast container.
    // Only NOW does the card appear on the actual page.
    // appendChild() on the container places the card inside it.
    // --------------------------------------------------------

    // Add this day's fully built card into the forecast-container on the page.
    container.appendChild(card);

  }
  // The for loop ends here — all 7 cards have been built and added.

  // Confirm in the console that the function completed successfully.
  console.log("renderForecast() finished — 7 cards added to the page.");

}
// End of renderForecast function.