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
//   renderChart(hourly)   → draws the hourly temperature bar chart
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

// ============================================================
// FUNCTION: renderChart(hourly)
//
// Draws a simple horizontal bar chart of today's hourly
// temperatures using only HTML divs and CSS — no libraries.
//
// "hourly" is the hourly data object from the API. It looks like:
//   hourly.time            → ["2025-06-01T00:00", "2025-06-01T01:00", ...]
//                            (168 entries — 24 per day × 7 days)
//   hourly.temperature_2m  → [16.1, 15.8, 15.2, ...]
//                            (matching temperature for each hour)
//
// We only want TODAY's 24 hours, so we filter out the rest.
//
// How to call it from app.js:
//   const data = await fetchWeather(lat, lon);
//   renderChart(data.hourly);
// ============================================================

// "function" creates a reusable block named renderChart.
// "hourly" is the parameter — receives data.hourly from the API.
function renderChart(hourly) {

  // Print a divider so we can easily spot this in the console.
  console.log("--- renderChart() called ---");

  // ----------------------------------------------------------
  // STEP 1: Find the chart container and clear it.
  // ----------------------------------------------------------

  // Find the element with id="chart-container" in index.html.
  // We store it in a variable so we only search for it once.
  const container = document.getElementById("chart-container");

  // Clear any bars that might already exist inside the container.
  // This prevents duplicate bars if renderChart is called again
  // when the user searches for a different city.
  container.innerHTML = "";

  // ----------------------------------------------------------
  // STEP 2: Get today's date as a string in YYYY-MM-DD format.
  // We use this to filter hourly entries to only today's hours.
  // ----------------------------------------------------------

  // new Date() creates an object representing right now.
  // .toISOString() converts it to a string like "2025-06-03T10:30:00.000Z".
  // .slice(0, 10) cuts the string to just the first 10 characters: "2025-06-03".
  const today = new Date().toISOString().slice(0, 10);

  // Log today's date so we can verify the correct day is being used.
  console.log("Today's date:", today);

  // ----------------------------------------------------------
  // STEP 3: Find the indexes for today's hours only.
  //
  // The hourly.time array has 168 entries (24 hours x 7 days).
  // Each entry looks like "2025-06-03T14:00" — date + time.
  // We use .startsWith(today) to check if an entry belongs to today.
  //
  // We collect the INDEX numbers (0, 1, 2...) not the values,
  // because we need the same index to get the matching temperature
  // from hourly.temperature_2m.
  // ----------------------------------------------------------

  // Start with an empty array that will hold today's index numbers.
  const todayIndexes = [];

  // Loop through every entry in the hourly.time array.
  // hourly.time.length is 168 — the loop runs 168 times.
  for (let i = 0; i < hourly.time.length; i++) {

    // Check if this time entry starts with today's date string.
    // Example: "2025-06-03T14:00".startsWith("2025-06-03") → true
    // Example: "2025-06-04T00:00".startsWith("2025-06-03") → false
    if (hourly.time[i].startsWith(today)) {

      // This entry belongs to today — save its index number.
      // .push() adds a value to the end of an array.
      todayIndexes.push(i);

    }

  }

  // Log how many hours we found for today (should always be 24).
  console.log("Hours found for today:", todayIndexes.length);

  // ----------------------------------------------------------
  // STEP 4: Collect today's temperatures into their own array.
  // We need this to calculate the maximum temperature, which
  // is used to set the proportional height of each bar.
  // ----------------------------------------------------------

  // .map() creates a new array by transforming each item.
  // For each index in todayIndexes, we grab the matching temperature.
  // Result: an array of 24 temperature numbers, e.g. [16.1, 15.8, ...]
  const todayTemps = todayIndexes.map(i => hourly.temperature_2m[i]);

  // Math.max(...todayTemps) finds the highest temperature in the array.
  // The "..." (spread operator) unpacks the array into individual arguments
  // because Math.max expects separate numbers, not an array.
  // We use this as the 100% height reference for all bars.
  const maxTemp = Math.max(...todayTemps);

  // Log the max temperature so we can verify the bar heights make sense.
  console.log("Max temperature today:", maxTemp);

  // ----------------------------------------------------------
  // STEP 5: Create the wrapper div that holds all the bars.
  // This div uses flexbox to line bars up side by side.
  // ----------------------------------------------------------

  // Create a new <div> element to act as the chart wrapper.
  const wrapper = document.createElement("div");

  // style is an object on every element — we set CSS properties on it.
  // Each line below is the same as writing that CSS property in a stylesheet.

  // Flexbox lines child elements (the bar columns) up in a row.
  wrapper.style.display = "flex";

  // Align all columns to the bottom so short bars sit at the baseline,
  // not floating in the middle — like a real bar chart.
  wrapper.style.alignItems = "flex-end";

  // Small gap between each bar column.
  wrapper.style.gap = "4px";

  // Fixed height for the chart area — bars grow upward from the bottom.
  wrapper.style.height = "120px";

  // If the bars are too wide to fit, allow sideways scrolling.
  wrapper.style.overflowX = "auto";

  // A little breathing room below the bars for the time labels.
  wrapper.style.paddingBottom = "20px";

  // ----------------------------------------------------------
  // STEP 6: Loop through today's hours and build one column per hour.
  // ----------------------------------------------------------

  // Loop through each index in todayIndexes (24 iterations for 24 hours).
  for (let j = 0; j < todayIndexes.length; j++) {

    // Get the original array index for this hour.
    // We need it to look up the correct time and temperature.
    const i = todayIndexes[j];

    // Get the temperature for this specific hour. Example: 21.4
    const temp = hourly.temperature_2m[i];

    // Get the time string for this hour. Example: "2025-06-03T14:00"
    const timeString = hourly.time[i];

    // Extract just the hour portion for the label.
    // .slice(11, 16) cuts characters at positions 11 to 15.
    // "2025-06-03T14:00" → "14:00"
    const hourLabel = timeString.slice(11, 16);

    // Calculate the bar height proportionally.
    // If this temp is the max, the bar is 100px tall.
    // If this temp is half the max, the bar is 50px tall.
    // We add "px" at the end because CSS height needs a unit.
    // Math.max(1, ...) ensures the bar is never 0px tall (invisible).
    const barHeight = Math.max(1, (temp / maxTemp) * 100) + "px";

    // --------------------------------------------------------
    // Build the column div — the outer wrapper for one hour.
    // It stacks the bar on top and the time label below.
    // --------------------------------------------------------

    // Create the outer column div for this hour.
    const column = document.createElement("div");

    // Flexbox stacks children vertically (bar on top, label below).
    column.style.display = "flex";

    // flex-direction column stacks children top to bottom.
    column.style.flexDirection = "column";

    // Centre the bar and label horizontally within the column.
    column.style.alignItems = "center";

    // Small gap between the bar and the label below it.
    column.style.gap = "4px";

    // --------------------------------------------------------
    // Build the bar div — the coloured rectangle.
    // Its height is proportional to the temperature.
    // --------------------------------------------------------

    // Create the inner bar div.
    const bar = document.createElement("div");

    // Fixed width for every bar — keeps the chart uniform.
    bar.style.width = "20px";

    // The calculated proportional height for this temperature.
    bar.style.height = barHeight;

    // Light blue colour for the bar — matches the dashboard theme.
    bar.style.background = "#5bc8f5";

    // Round only the top corners — the bottom stays flat at the baseline.
    bar.style.borderRadius = "4px 4px 0 0";

    // Add a tooltip so the user can hover over a bar to see the exact temp.
    // title is a standard HTML attribute that shows on hover.
    bar.title = `${temp}°C`;

    // --------------------------------------------------------
    // Build the label span — the hour text below the bar.
    // --------------------------------------------------------

    // Create a <span> element to display the hour label.
    const label = document.createElement("span");

    // Set the text to the hour portion of the time. Example: "14:00"
    label.textContent = hourLabel;

    // Small font so the label fits under the narrow bar.
    label.style.fontSize = "10px";

    // Muted colour so the labels do not compete with the bars.
    label.style.color = "#aaaaaa";

    // Prevent the label from wrapping onto two lines.
    label.style.whiteSpace = "nowrap";

    // --------------------------------------------------------
    // Assemble: nest bar and label inside column, then add
    // the finished column into the wrapper.
    // --------------------------------------------------------

    // Add the bar div inside the column div — appears at the top.
    column.appendChild(bar);

    // Add the label span inside the column div — appears below the bar.
    column.appendChild(label);

    // Add the completed column into the wrapper div.
    wrapper.appendChild(column);

  }
  // End of the bar-building loop — all 24 columns are now in the wrapper.

  // ----------------------------------------------------------
  // STEP 7: Add the finished wrapper into the page.
  // Only now does the chart actually appear on screen.
  // ----------------------------------------------------------

  // Place the fully built wrapper div inside chart-container on the page.
  container.appendChild(wrapper);

  // Confirm in the console that the chart was drawn successfully.
  console.log("renderChart() finished —", todayIndexes.length, "bars drawn.");

}
// End of renderChart function.