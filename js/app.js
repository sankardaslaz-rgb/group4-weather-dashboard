// js/app.js
// ============================================================
// This is the ENTRY POINT of the whole application.
// It is the last script to load, so by the time it runs,
// all functions from the other files already exist:
//   fetchWeather()    → from api.js
//   fetchGeocode()    → from api.js
//   renderCurrent()   → from display.js
//   renderForecast()  → from display.js
//   renderChart()     → from display.js
//   setBackground()   → from display.js
//   getWeatherInfo()  → from weather-codes.js
//
// This file is responsible for:
//   1. Running QA tests on page load (runTests)
//   2. Detecting the user's location with geolocation
//   3. Falling back to a search if location is denied
//   4. Handling the search button click
//   5. Handling the Enter key press in the search input
//   6. Showing clickable city results from the Geocoding API
// ============================================================


// ============================================================
// FUNCTION: runTests()
//
// A QA (Quality Assurance) function that runs automatic checks
// when the page loads. It verifies that all the key HTML elements
// and JavaScript functions exist before the app tries to use them.
//
// Results are printed to the browser console (F12 → Console).
// Each check prints either:
//   PASS: ... → everything is fine
//   FAIL: ... → something is missing and needs to be fixed
//
// How to read the results:
//   Green text / no red errors = your project is set up correctly
//   FAIL messages = check your HTML ids or script tag order
// ============================================================

// No parameters needed — it reads directly from the DOM and global scope.
function runTests() {

  // Print a header so the test results stand out in the console.
  console.log("============================================");
  console.log("QA TESTS — running on page load");
  console.log("============================================");

  // ----------------------------------------------------------
  // HELPER: checkElement(id)
  // Checks if an HTML element with the given id exists on the page.
  // Logs PASS or FAIL depending on whether it was found.
  // ----------------------------------------------------------

  // "id" is the id string to look for, e.g. "city-name".
  function checkElement(id) {

    // document.getElementById returns the element if found, or null if not.
    const el = document.getElementById(id);

    // Check if the result is not null — meaning the element was found.
    if (el !== null) {

      // Log a PASS message — the element exists in the HTML.
      console.log(`PASS: element found → id="${id}"`);

    } else {

      // Log a FAIL message — the element is missing from the HTML.
      // This means either the id is wrong or the element was not added.
      console.log(`FAIL: missing element → id="${id}" — check your index.html`);

    }

  }

  // ----------------------------------------------------------
  // HELPER: checkFunction(name)
  // Checks if a JavaScript function with the given name exists.
  // Uses typeof to safely check without crashing if it is missing.
  // ----------------------------------------------------------

  // "name" is the function name as a string, e.g. "fetchWeather".
  function checkFunction(name) {

    // typeof window[name] reads the type of the variable with that name.
    // window is the global object — all global variables live on it.
    // If the function was defined in another script file and loaded
    // before this one, it will be accessible via window[name].
    // typeof returns "function" if it is a function, "undefined" if missing.
    if (typeof window[name] === "function") {

      // Log a PASS — the function exists and is ready to be called.
      console.log(`PASS: function found → ${name}()`);

    } else {

      // Log a FAIL — the function is not defined.
      // This usually means the script file that defines it failed to load,
      // or the script tags in index.html are in the wrong order.
      console.log(`FAIL: missing function → ${name}() — check your script tags`);

    }

  }

  // ----------------------------------------------------------
  // DOM ELEMENT CHECKS
  // Each call to checkElement() tests one id from index.html.
  // If any of these FAIL, check that the id exists in your HTML
  // and is spelled exactly the same (ids are case-sensitive).
  // ----------------------------------------------------------

  // Check the city name heading exists.
  checkElement("city-name");

  // Check the temperature paragraph exists.
  checkElement("temperature");

  // Check the wind speed paragraph exists.
  checkElement("wind-speed");

  // Check the condition paragraph exists.
  checkElement("condition");

  // Check the forecast container div exists.
  checkElement("forecast-container");

  // Check the chart container div exists.
  checkElement("chart-container");

  // Check the search input field exists.
  checkElement("search-input");

  // Check the search button exists.
  checkElement("search-btn");

  // Check the unit toggle button exists.
  checkElement("unit-toggle");

  // Check the loading message element exists.
  checkElement("loading");

  // Check the error message element exists.
  checkElement("error-msg");

  // ----------------------------------------------------------
  // FUNCTION EXISTENCE CHECKS
  // Each call to checkFunction() tests whether a key function
  // was successfully defined by one of the other script files.
  // If any FAIL, the matching .js file likely did not load.
  // ----------------------------------------------------------

  // Check fetchWeather exists — defined in api.js.
  checkFunction("fetchWeather");

  // Check fetchGeocode exists — defined in api.js.
  checkFunction("fetchGeocode");

  // Check renderCurrent exists — defined in display.js.
  checkFunction("renderCurrent");

  // Check renderForecast exists — defined in display.js.
  checkFunction("renderForecast");

  // Check renderChart exists — defined in display.js.
  checkFunction("renderChart");

  // Check setBackground exists — defined in display.js.
  checkFunction("setBackground");

  // Check getWeatherInfo exists — defined in weather-codes.js.
  checkFunction("getWeatherInfo");

  // Print a footer to mark the end of the test output.
  console.log("============================================");
  console.log("QA TESTS complete. Check for any FAIL lines above.");
  console.log("============================================");

}


// ============================================================
// HELPER FUNCTION: showLoading(message)
// Shows the loading div with a custom message.
// ============================================================

function showLoading(message) {

  // Find the loading element and set its text.
  const loadingEl = document.getElementById("loading");
  loadingEl.textContent = message;

  // Make it visible by setting display to "block".
  loadingEl.style.display = "block";

}


// ============================================================
// HELPER FUNCTION: hideLoading()
// Hides the loading div once we have finished waiting.
// ============================================================

function hideLoading() {

  // Find the loading element and hide it.
  const loadingEl = document.getElementById("loading");
  loadingEl.style.display = "none";

}


// ============================================================
// HELPER FUNCTION: showError(message)
// Displays an error message in the id="error-msg" element.
// ============================================================

function showError(message) {

  // Find the error element, set its text, and make it visible.
  const errorEl = document.getElementById("error-msg");
  errorEl.textContent = message;
  errorEl.style.display = "block";

}


// ============================================================
// HELPER FUNCTION: hideError()
// Hides the error message element.
// ============================================================

function hideError() {

  // Find the error element and hide it.
  const errorEl = document.getElementById("error-msg");
  errorEl.style.display = "none";

}


// ============================================================
// HELPER FUNCTION: loadWeather(lat, lon, cityLabel)
//
// Fetches weather for any location and updates ALL sections
// of the dashboard at once.
//
// Each render function is wrapped in its own try/catch block.
// This means if one function crashes, the others still run —
// the app degrades gracefully instead of going completely blank.
// ============================================================

async function loadWeather(lat, lon, cityLabel) {

  // Show a loading message while waiting for the API.
  showLoading("Loading weather...");

  // Call fetchWeather() from api.js with the coordinates.
  const data = await fetchWeather(lat, lon);

  // Hide the loading message once the response arrives.
  hideLoading();

  // If data is null, fetchWeather failed — show error and stop.
  if (data === null) {
    showError("Could not load weather data. Please try again.");
    return;
  }

  // Update the city name heading.
  document.getElementById("city-name").textContent = cityLabel;

  // ----------------------------------------------------------
  // ERROR BOUNDARY: renderCurrent
  // Wrapped in try/catch so a crash here does not stop the
  // forecast or chart from rendering below.
  // ----------------------------------------------------------
  try {

    // Call renderCurrent() to update temperature, wind, condition.
    renderCurrent(data);

  } catch (error) {

    // If renderCurrent crashes, log a clear message to the console.
    // "error.message" is the built-in description of what went wrong.
    console.log("ERROR in renderCurrent():", error.message);

    // Show a partial error on the page so the user knows something failed.
    document.getElementById("condition").textContent = "Could not display current weather.";

  }

  // ----------------------------------------------------------
  // ERROR BOUNDARY: renderForecast
  // Wrapped separately — a crash here does not affect the chart.
  // ----------------------------------------------------------
  try {

    // Call renderForecast() to build the 7-day forecast cards.
    renderForecast(data.daily);

  } catch (error) {

    // Log which function failed and what the error was.
    console.log("ERROR in renderForecast():", error.message);

    // Show a fallback message inside the forecast container.
    const fc = document.getElementById("forecast-container");

    // Only update if the element exists — avoids a second crash.
    if (fc) {
      fc.textContent = "Could not display forecast.";
    }

  }

  // ----------------------------------------------------------
  // ERROR BOUNDARY: renderChart
  // Wrapped separately — a crash here does not affect anything above.
  // ----------------------------------------------------------
  try {

    // Call renderChart() to draw the hourly temperature bar chart.
    // Pass currentUnit so the chart always draws in the active unit.
    renderChart(data.hourly, currentUnit);

  } catch (error) {

    // Log which function failed and what the error was.
    console.log("ERROR in renderChart():", error.message);

    // Show a fallback message inside the chart container.
    const cc = document.getElementById("chart-container");

    // Only update if the element exists — avoids a second crash.
    if (cc) {
      cc.textContent = "Could not display hourly chart.";
    }

  }

  // ----------------------------------------------------------
  // ERROR BOUNDARY: setBackground
  // Wrapped separately — a background crash should never affect data.
  // ----------------------------------------------------------
  try {

    // Call setBackground() to change the page gradient.
    setBackground(data.current.weather_code);

  } catch (error) {

    // Background failing is cosmetic — just log it, do not show the user.
    console.log("ERROR in setBackground():", error.message);

  }

  // Log overall success.
  console.log("loadWeather() complete for:", cityLabel);

}


// ============================================================
// HELPER FUNCTION: runSearch()
//
// Reads the city name from the input, calls the Geocoding API,
// and shows up to 3 clickable result buttons.
// ============================================================

async function runSearch() {

  // Read the typed city name and remove extra spaces.
  const input = document.getElementById("search-input");
  const cityName = input.value.trim();

  // If the input is empty, stop and prompt the user.
  if (!cityName) {
    showError("Please enter a city name.");
    return;
  }

  // Clear any old error before starting a new search.
  hideError();

  // Show a searching message.
  showLoading("Searching...");

  console.log("Searching for:", cityName);

  // Fetch up to 3 matching cities from the Geocoding API.
  const results = await fetchGeocode(cityName);

  // Hide the loading message now that results are back.
  hideLoading();

  // Clear any old result buttons.
  const resultsContainer = document.getElementById("search-results");
  resultsContainer.innerHTML = "";

  // If no cities matched, show an error and stop.
  if (results.length === 0) {
    showError("City not found. Try a different name.");
    return;
  }

  // Build a clickable button for each result.
  results.forEach(function(result) {

    // Create a button showing "City, Country".
    const btn = document.createElement("button");
    btn.textContent = `${result.name}, ${result.country}`;

    // When clicked, load weather for that city.
    btn.addEventListener("click", function() {

      console.log("City selected:", result.name);

      // Fetch and display weather for the selected city.
      loadWeather(result.latitude, result.longitude, result.name);

      // Clear the result buttons and the search input.
      resultsContainer.innerHTML = "";
      input.value = "";

    });

    // Add the button into the search results container.
    resultsContainer.appendChild(btn);

  });

}


// ============================================================
// DOMContentLoaded — THE STARTING POINT
//
// Everything inside here runs once the HTML is fully loaded.
// This guarantees all elements exist before we try to use them.
// ============================================================

document.addEventListener("DOMContentLoaded", function() {

  // Log so we know the DOM is ready and app.js has started.
  console.log("DOM ready — app.js running.");

  // ----------------------------------------------------------
  // STEP 1: Run QA tests before anything else.
  // This checks that all elements and functions are in place.
  // Read the console output — any FAIL lines need to be fixed first.
  // ----------------------------------------------------------

  // Call runTests() — all results appear in the console immediately.
  runTests();

  // ----------------------------------------------------------
  // STEP 2: Try to get the user's location with geolocation.
  // ----------------------------------------------------------

  // Check if the browser supports geolocation at all.
  if (navigator.geolocation) {

    // Show a locating message while the browser finds the position.
    showLoading("Locating you...");

    // Ask the browser for the user's coordinates.
    // Takes two callbacks: one for success, one for failure.
    navigator.geolocation.getCurrentPosition(

      // SUCCESS CALLBACK — runs if the user allows location access.
      function(position) {

        console.log("Geolocation success:", position);

        // Read latitude and longitude from the position object.
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        console.log("User coordinates — lat:", lat, "lon:", lon);

        // Hide the locating message.
        hideLoading();

        // Load weather for the user's real location.
        loadWeather(lat, lon, "My Location");

      },

      // ERROR CALLBACK — runs if the user denies permission.
      function(err) {

        console.log("Geolocation error:", err.code, err.message);

        // Hide the locating message.
        hideLoading();

        // Tell the user to search manually instead.
        showError("Location access denied. Please search for a city.");

      }

    );

  } else {

    // Browser does not support geolocation at all.
    console.log("Geolocation not supported by this browser.");
    showError("Geolocation not supported by your browser.");

  }

  // ----------------------------------------------------------
  // STEP 3: Attach the search button click listener.
  // ----------------------------------------------------------

  // Find the search button.
  const searchBtn = document.getElementById("search-btn");

  // Run the search when the button is clicked.
  searchBtn.addEventListener("click", function() {
    console.log("Search button clicked.");
    runSearch();
  });

  // ----------------------------------------------------------
  // STEP 4: Attach the Enter key listener on the search input.
  // ----------------------------------------------------------

  // Find the search input.
  const searchInput = document.getElementById("search-input");

  // Listen for key presses inside the input field.
  searchInput.addEventListener("keydown", function(event) {

    // Only trigger search if the Enter key was pressed.
    if (event.key === "Enter") {
      console.log("Enter key pressed — running search.");
      runSearch();
    }

  });

});
// End of DOMContentLoaded.