// js/display.js
// ============================================================
// This file is responsible for everything the user sees on
// screen — it takes the raw weather data returned by api.js
// and writes it into the HTML elements on the page.
// It contains four functions: renderCurrent() for live stats,
// renderForecast() for the 7-day cards, renderChart() for the
// hourly bar chart, and setBackground() for the page gradient.
// It also stores shared state (currentUnit, lastTempCelsius,
// lastHourlyData) so the unit toggle can update the display
// instantly without making a new API call.
// ============================================================


// ============================================================
// SHARED STATE VARIABLES
//
// These variables live OUTSIDE all functions so every function
// in this file can read and update them.
// This is called "module-level" or "global" state.
// ============================================================

// Tracks which unit the user currently wants to see.
// Starts as "C" for Celsius — switches to "F" when toggled.
// "let" is used instead of "const" because this value changes.
let currentUnit = "C";

// Stores the last temperature we received from the API in Celsius.
// We save the raw Celsius value so we can convert it any time
// the unit is toggled — without needing to call the API again.
// Starts at 0 as a safe default before any data arrives.
let lastTempCelsius = 0;

// Stores the full hourly data object from the last API call.
// We save it here so the unit toggle can redraw the chart
// in the new unit without fetching from the API again.
// Starts as null — means "no data yet".
let lastHourlyData = null;


// ============================================================
// FUNCTION: convertTemp(celsius, unit)
//
// WHAT IT DOES:
//   Converts a raw Celsius number into the unit the user has
//   selected. Returns a rounded whole number in either °C or °F.
//
// INPUTS:
//   celsius → a number from the API, e.g. 21.4
//   unit    → the string "C" or "F"
//
// OUTPUT:
//   A rounded integer. Examples:
//     convertTemp(21.4, "C") → 21
//     convertTemp(21.4, "F") → 70
//
// WHY WE NEED IT:
//   The API always returns temperatures in Celsius. When the
//   user clicks "Switch to °F" we call this function to convert
//   the stored value without fetching from the API again.
// ============================================================

// "celsius" is the raw temperature number, e.g. 21.4
// "unit"    is the string "C" or "F"
function convertTemp(celsius, unit) {

  // Check if the user wants Fahrenheit.
  if (unit === "F") {

    // Apply the conversion formula and round to nearest whole number.
    // 9/5 is 1.8 — multiplying by it scales Celsius to the F range.
    // Adding 32 shifts the scale to match the Fahrenheit baseline.
    // Example: (21.4 × 9/5) + 32 = 70.52 → Math.round → 71
    return Math.round((celsius * 9 / 5) + 32);

  }

  // If unit is "C" (or anything else), return the value unchanged.
  // We still round it so the display is always a whole number.
  return Math.round(celsius);

}


// ============================================================
// FUNCTION: renderCurrent(data)
//
// WHAT IT DOES:
//   Reads the current weather values from the API data object
//   and writes them into the matching HTML elements on the page.
//   Also saves the raw Celsius temperature for the unit toggle.
//
// INPUT:
//   data → the full object returned by fetchWeather() in api.js.
//   The values it reads are:
//     data.current.temperature_2m   → e.g. 21.4  (current temp °C)
//     data.current.wind_speed_10m   → e.g. 13.2  (wind in km/h)
//     data.current.weather_code     → e.g. 3     (WMO code number)
//
// HOW TO CALL IT:
//   const data = await fetchWeather(lat, lon);
//   renderCurrent(data);
//
// WHAT IT UPDATES ON THE PAGE:
//   id="temperature" → e.g. "21°C" or "70°F"
//   id="wind-speed"  → e.g. "Wind: 13.2 km/h"
//   id="condition"   → e.g. "⛅ Partly cloudy"
// ============================================================

function renderCurrent(data) {

  // ── DEMO LOG ──────────────────────────────────────────────
  // This single line prints the entire data object in DevTools
  // so during the demo you can expand it and show the raw API
  // response that this function is about to turn into visible text.
  // Click the ▶ arrow next to "Object" in the console to explore it.
  console.log("Rendering current weather:", data);
  // ──────────────────────────────────────────────────────────

  // Read the current temperature from the data object.
  const temperature = data.current.temperature_2m;

  // Save the raw Celsius temperature into our shared variable.
  // We store it here so the unit toggle can convert it later
  // without needing to call the API again.
  lastTempCelsius = temperature;

  // Read the current wind speed from the data object.
  const windSpeed = data.current.wind_speed_10m;

  // Read the weather code number from the data object.
  const weatherCode = data.current.weather_code;

  // Print a divider line so the output is easy to spot in the console.
  console.log("--- renderCurrent() called ---");
  console.log("Temperature:", temperature);
  console.log("Wind Speed:", windSpeed);
  console.log("Weather Code:", weatherCode);

  // Convert the temperature to whichever unit is currently active.
  const displayTemp = convertTemp(temperature, currentUnit);

  // Build the unit label string to show after the number.
  const unitLabel = currentUnit === "F" ? "°F" : "°C";

  // Update the temperature element on the page.
  document.getElementById("temperature").textContent = `${displayTemp}${unitLabel}`;

  // Update the wind speed element on the page.
  document.getElementById("wind-speed").textContent = `Wind: ${windSpeed} km/h`;

  // Look up the weather code to get the description and emoji.
  // getWeatherInfo() is defined in weather-codes.js which loads first.
  const weatherInfo = getWeatherInfo(weatherCode);

  // Update the condition element with emoji + description.
  document.getElementById("condition").textContent = `${weatherInfo.icon} ${weatherInfo.description}`;

  console.log("renderCurrent() finished — page has been updated.");

}


// ============================================================
// FUNCTION: renderForecast(daily)
//
// PLAIN ENGLISH:
//   Imagine printing 7 sticky notes — one for each day of the
//   week — and sticking them in a row on the page. That is
//   exactly what this function does. It takes the 7-day forecast
//   data from the API, loops through each day one at a time,
//   builds a small card div for that day, and adds it to the
//   forecast row on the page. It uses getWeatherInfo() to look
//   up the emoji and description for each day's weather code.
//   Before building new cards it always wipes the old ones, so
//   switching cities never shows stale data underneath.
//
// WHAT IT DOES:
//   Builds 7 forecast cards (one per day) and adds them into
//   the element with id="forecast-container" on the page.
//   Clears the container first so old cards never stack up.
//
// INPUT:
//   daily → the daily section of the API response object.
//   The arrays it reads are:
//     daily.time               → ["2025-06-01", "2025-06-02", ...]
//     daily.weather_code       → [3, 61, 0, 2, 80, 1, 45]
//     daily.temperature_2m_max → [24.1, 19.3, 22.0, ...]
//     daily.temperature_2m_min → [14.2, 11.8, 13.5, ...]
//
// HOW TO CALL IT:
//   const data = await fetchWeather(lat, lon);
//   renderForecast(data.daily);
//
// WHAT IT CREATES ON THE PAGE:
//   7 divs with class="forecast-card" inside #forecast-container.
//   Each card shows: day name, weather emoji, high temp, low temp.
// ============================================================

function renderForecast(daily) {

  console.log("--- renderForecast() called ---");
  console.log("Daily data received:", daily);

  // Find the forecast container and clear any old cards.
  const container = document.getElementById("forecast-container");
  container.innerHTML = "";

  // Loop through all 7 days.
  for (let i = 0; i < 7; i++) {

    // Get the date string for this day. Example: "2025-06-03"
    const dateString = daily.time[i];

    // Convert to a Date object — add T00:00:00 to avoid timezone bugs.
    const dateObject = new Date(dateString + "T00:00:00");

    // Get the short day name like "Mon", "Tue", "Wed".
    const dayName = dateObject.toLocaleDateString("en-US", { weekday: "short" });

    // Get the weather code for this day.
    const code = daily.weather_code[i];

    // Look up the description and emoji for this code.
    const weatherInfo = getWeatherInfo(code);

    // Get the high and low temperatures for this day.
    const high = daily.temperature_2m_max[i];
    const low = daily.temperature_2m_min[i];

    console.log(`Day ${i}: ${dayName} | ${weatherInfo.icon} ${weatherInfo.description} | High: ${high}° Low: ${low}°`);

    // Create the card div and give it the forecast-card class.
    const card = document.createElement("div");
    card.className = "forecast-card";

    // --- Day name paragraph ---
    const dayEl = document.createElement("p");
    dayEl.className = "day-label";
    dayEl.textContent = dayName;

    // --- Weather icon paragraph ---
    const iconEl = document.createElement("p");
    iconEl.className = "forecast-icon";
    iconEl.textContent = weatherInfo.icon;

    // --- High temperature paragraph ---
    const highEl = document.createElement("p");
    highEl.className = "temp-high";
    // Math.round() removes the decimal: 24.1 becomes 24.
    highEl.textContent = `${Math.round(high)}°`;

    // --- Low temperature paragraph ---
    const lowEl = document.createElement("p");
    lowEl.className = "temp-low";
    lowEl.textContent = `${Math.round(low)}°`;

    // Nest all four elements inside the card.
    card.appendChild(dayEl);
    card.appendChild(iconEl);
    card.appendChild(highEl);
    card.appendChild(lowEl);

    // Add the finished card into the forecast container on the page.
    container.appendChild(card);

  }

  console.log("renderForecast() finished — 7 cards added to the page.");

}


// ============================================================
// FUNCTION: renderChart(hourly, unit)
//
// PLAIN ENGLISH:
//   Think of a classic bar chart where taller bars mean higher
//   temperatures. This function builds that chart using only
//   HTML divs — no chart library at all. It first filters the
//   API's 168-hour array down to just today's 24 hours, then
//   calculates how tall each bar should be by comparing each
//   temperature to the day's maximum (the hottest hour always
//   reaches the top). It creates one column per hour, each
//   containing a yellow temperature label on top, a blue bar
//   in the middle, and a grey time label below. The whole
//   chart scrolls sideways if it does not fit on the screen.
//   When the unit is toggled it redraws instantly using the
//   stored lastHourlyData — no extra API call needed.
//
// WHAT IT DOES:
//   Draws a bar chart of today's hourly temperatures using only
//   HTML divs and CSS — no external chart library needed.
//   Each column shows the temperature above the bar and the
//   hour label below it. Bars are proportional to the max temp.
//
// INPUTS:
//   hourly → the hourly section of the API response object.
//     hourly.time           → ["2025-06-01T00:00", ...] (168 entries)
//     hourly.temperature_2m → [16.1, 15.8, 15.2, ...]  (168 values)
//   unit   → "C" or "F". If not passed, falls back to currentUnit.
//
// HOW TO CALL IT:
//   const data = await fetchWeather(lat, lon);
//   renderChart(data.hourly, "C");
//
// WHAT IT CREATES ON THE PAGE:
//   24 bar columns inside #chart-container, one per hour of today.
//   Each column: temperature label (yellow) → bar (blue) → time label.
// ============================================================

function renderChart(hourly, unit) {

  // If no unit argument was passed, fall back to currentUnit.
  unit = unit || currentUnit;

  // Save the hourly data so the unit toggle can redraw without re-fetching.
  lastHourlyData = hourly;

  console.log("--- renderChart() called --- unit:", unit);

  // Find the chart container and clear any old bars.
  const container = document.getElementById("chart-container");
  container.innerHTML = "";

  // Get today's date as YYYY-MM-DD to filter hourly entries.
  // .toISOString() gives "2025-06-03T10:30:00.000Z"
  // .slice(0, 10) cuts it to "2025-06-03"
  const today = new Date().toISOString().slice(0, 10);
  console.log("Today's date:", today);

  // Find the index numbers in hourly.time that belong to today.
  const todayIndexes = [];
  for (let i = 0; i < hourly.time.length; i++) {
    // .startsWith(today) checks if this entry is today's date.
    if (hourly.time[i].startsWith(today)) {
      todayIndexes.push(i);
    }
  }
  console.log("Hours found for today:", todayIndexes.length);

  // Collect today's raw Celsius temperatures using the indexes.
  const todayCelsius = todayIndexes.map(i => hourly.temperature_2m[i]);

  // Convert every temperature to the selected unit.
  // .map() loops through each value "t" and applies the formula if °F.
  const todayTemps = todayCelsius.map(function(t) {
    if (unit === "F") {
      return Math.round((t * 9 / 5) + 32);
    }
    return Math.round(t);
  });

  // Find the highest temperature — used as the 100% bar height reference.
  const maxTemp = Math.max(...todayTemps);
  console.log("Max temperature today:", maxTemp, unit);

  // Create the wrapper div that lines all bar columns up in a row.
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";        // line columns up side by side
  wrapper.style.alignItems = "flex-end"; // all bars grow upward from the bottom
  wrapper.style.gap = "4px";             // space between each column
  wrapper.style.height = "150px";        // total chart height (increased to fit temp labels)
  wrapper.style.overflowX = "auto";      // allow sideways scroll if needed
  wrapper.style.paddingBottom = "20px";  // room for time labels below bars

  // Build one column for each hour of today.
  for (let j = 0; j < todayIndexes.length; j++) {

    // i is the original array index — used to get the time string.
    const i = todayIndexes[j];

    // temp is the already-converted temperature for this hour.
    const temp = todayTemps[j];

    // Get the time string and cut it to just "HH:00". Example: "14:00"
    const timeString = hourly.time[i];
    const hourLabel = timeString.slice(11, 16);

    // Calculate the bar height proportional to the max temperature.
    // Math.max(1, ...) ensures the bar is never invisible at 0px.
    const barHeight = Math.max(1, (temp / maxTemp) * 100) + "px";

    // --------------------------------------------------------
    // Build the column div — stacks tempLabel, bar, timeLabel
    // from top to bottom using flexbox column direction.
    // --------------------------------------------------------
    const column = document.createElement("div");
    column.style.display = "flex";
    column.style.flexDirection = "column"; // stack children top to bottom
    column.style.alignItems = "center";    // centre everything horizontally
    column.style.gap = "2px";             // small gap between each child

    // --------------------------------------------------------
    // NEW: Temperature label — shown ABOVE the bar always.
    // Previously the temperature was only visible on hover.
    // Now it is permanently displayed above each bar in yellow.
    // --------------------------------------------------------

    // Create a span to hold the temperature number above the bar.
    const tempLabel = document.createElement("span");

    // Show the temperature with a degree symbol. Example: "32°"
    tempLabel.textContent = `${temp}°`;

    // Small font so it fits neatly above the narrow 20px bar.
    tempLabel.style.fontSize = "9px";

    // Warm yellow — matches the main temperature colour on the dashboard.
    tempLabel.style.color = "#f5c542";

    // Prevent the text wrapping onto two lines.
    tempLabel.style.whiteSpace = "nowrap";

    // --------------------------------------------------------
    // Build the bar div — the coloured rectangle.
    // Its height is proportional to this hour's temperature.
    // --------------------------------------------------------
    const bar = document.createElement("div");
    bar.style.width = "20px";
    bar.style.height = barHeight;         // proportional height
    bar.style.background = "#5bc8f5";     // light blue bar colour
    bar.style.borderRadius = "4px 4px 0 0"; // round top corners only
    // Tooltip on hover shows temperature with unit. Example: "32°C"
    bar.title = `${temp}°${unit}`;

    // --------------------------------------------------------
    // Build the time label — shown BELOW the bar always.
    // Example: "14:00"
    // --------------------------------------------------------
    const label = document.createElement("span");
    label.textContent = hourLabel;
    label.style.fontSize = "10px";
    label.style.color = "#aaaaaa";
    label.style.whiteSpace = "nowrap";

    // --------------------------------------------------------
    // Assemble the column: tempLabel on top, bar in middle,
    // time label at the bottom.
    // This is the NEW order — tempLabel added before bar.
    // --------------------------------------------------------

    // Add the temperature number above the bar — NEW line.
    column.appendChild(tempLabel);

    // Add the bar in the middle.
    column.appendChild(bar);

    // Add the time label below the bar.
    column.appendChild(label);

    // Add the finished column into the chart wrapper.
    wrapper.appendChild(column);

  }

  // Add the fully built wrapper into the chart-container on the page.
  container.appendChild(wrapper);

  console.log("renderChart() finished —", todayIndexes.length, "bars drawn.");

}


// ============================================================
// FUNCTION: setBackground(weatherCode)
//
// WHAT IT DOES:
//   Changes the entire page background to a gradient that
//   visually matches the current weather condition.
//   Applied directly to document.body so it covers the full page.
//   A 0.8s CSS transition makes the change fade in smoothly.
//
// INPUT:
//   weatherCode → a WMO weather code number from the API, e.g. 95.
//   The ranges it handles:
//     0–1   → clear/sunny  → warm orange gradient
//     2–3   → cloudy       → blue-grey gradient
//     45–48 → fog          → flat grey gradient
//     51–67 → rain         → deep navy gradient
//     71–77 → snow         → icy blue gradient
//     80–82 → showers      → mid-blue gradient
//     95+   → thunderstorm → near-black gradient
//     other → default dark navy (#0b1630)
//
// HOW TO CALL IT:
//   setBackground(data.current.weather_code);
// ============================================================

function setBackground(weatherCode) {

  console.log("setBackground() called with code:", weatherCode);

  let gradient;

  if (weatherCode === 0 || weatherCode === 1) {
    gradient = "linear-gradient(to bottom, #1a1a2e, #f97c4b)";
  } else if (weatherCode === 2 || weatherCode === 3) {
    gradient = "linear-gradient(to bottom, #1a1a2e, #4a4a6a)";
  } else if (weatherCode === 45 || weatherCode === 48) {
    gradient = "linear-gradient(to bottom, #2a2a3a, #7a7a8a)";
  } else if (weatherCode >= 51 && weatherCode <= 67) {
    gradient = "linear-gradient(to bottom, #0b1630, #1e3a5f)";
  } else if (weatherCode >= 71 && weatherCode <= 77) {
    gradient = "linear-gradient(to bottom, #1a2a4a, #b0c4de)";
  } else if (weatherCode >= 80 && weatherCode <= 82) {
    gradient = "linear-gradient(to bottom, #0b1630, #2e4a6a)";
  } else if (weatherCode >= 95) {
    gradient = "linear-gradient(to bottom, #0a0a1a, #1a1a2e)";
  } else {
    gradient = "#0b1630";
  }

  // Apply the gradient to the whole page background.
  document.body.style.background = gradient;

  // Smooth 0.8s fade transition when the background changes.
  document.body.style.transition = "background 0.8s ease";

  console.log("setBackground() applied:", gradient);

}


// ============================================================
// UNIT TOGGLE EVENT LISTENER
//
// Flips currentUnit between "C" and "F" when the button is clicked.
// Updates the temperature display and redraws the chart.
// ============================================================

// Find the unit toggle button.
const unitToggleBtn = document.getElementById("unit-toggle");

// Listen for clicks on the toggle button.
unitToggleBtn.addEventListener("click", function() {

  console.log("Unit toggle clicked. Current unit was:", currentUnit);

  // Flip the unit — "C" becomes "F", "F" becomes "C".
  currentUnit = currentUnit === "C" ? "F" : "C";

  console.log("Unit is now:", currentUnit);

  // Convert the stored Celsius temperature to the new unit.
  const converted = convertTemp(lastTempCelsius, currentUnit);

  // Build the correct unit label.
  const unitLabel = currentUnit === "F" ? "°F" : "°C";

  // Update the temperature element on the page.
  document.getElementById("temperature").textContent = `${converted}${unitLabel}`;

  // Update the button text to show what the NEXT click will do.
  unitToggleBtn.textContent = currentUnit === "F" ? "Switch to °C" : "Switch to °F";

  console.log("Temperature updated to:", converted + unitLabel);

  // Redraw the chart in the new unit if data has already loaded.
  if (lastHourlyData !== null) {
    renderChart(lastHourlyData, currentUnit);
  }

});