// js/app.js
// ============================================================
// This file is the entry point of the weather dashboard app —
// it is the last script to load and the one that starts
// everything running when the page opens in the browser.
// It handles geolocation, localStorage city memory, the search
// bar, the Enter key shortcut, and all QA tests on page load.
// If geolocation fails and no saved city exists, it falls back
// to London so the app never starts blank for the user.
// ============================================================


// ============================================================
// DEFAULT FALLBACK CITY — London
//
// If both geolocation AND localStorage fail or are unavailable,
// we load London so the app always shows something useful.
// These values are defined here at the top so they are easy
// to find and change if the team wants a different default.
// ============================================================

// Default city label shown in #city-name if all else fails.
const DEFAULT_CITY_NAME = "London";

// Latitude of London — used when calling fetchWeather().
const DEFAULT_LAT = 51.5;

// Longitude of London — used when calling fetchWeather().
const DEFAULT_LON = -0.12;


// ============================================================
// FUNCTION: runTests()
//
// Runs automatic checks on page load to verify all required
// HTML elements and JavaScript functions exist before the app
// tries to use them. Results are printed to the console.
// PASS = everything is fine. FAIL = something needs fixing.
// ============================================================

function runTests() {

  // Print a header so the test output stands out in the console.
  console.log("============================================");
  console.log("QA TESTS — running on page load");
  console.log("============================================");

  // ----------------------------------------------------------
  // INNER HELPER: checkElement(id)
  // Checks if an HTML element with this id exists on the page.
  // ----------------------------------------------------------
  function checkElement(id) {

    // getElementById returns the element or null if not found.
    const el = document.getElementById(id);

    // el !== null means the element was found successfully.
    if (el !== null) {
      // Print a PASS line with the id that was checked.
      console.log(`PASS: element found → id="${id}"`);
    } else {
      // Print a FAIL line — the id is missing from the HTML.
      console.log(`FAIL: missing element → id="${id}" — check your index.html`);
    }

  }

  // ----------------------------------------------------------
  // INNER HELPER: checkFunction(name)
  // Checks if a JavaScript function with this name is defined.
  // ----------------------------------------------------------
  function checkFunction(name) {

    // window[name] accesses the global variable with that name.
    // typeof returns "function" if it exists, "undefined" if not.
    if (typeof window[name] === "function") {
      // Print a PASS — the function is available.
      console.log(`PASS: function found → ${name}()`);
    } else {
      // Print a FAIL — the script that defines it may not have loaded.
      console.log(`FAIL: missing function → ${name}() — check your script tags`);
    }

  }

  // --- CHECK ALL REQUIRED HTML ELEMENTS ---
  checkElement("city-name");        // the city heading
  checkElement("temperature");      // the temperature paragraph
  checkElement("wind-speed");       // the wind speed paragraph
  checkElement("condition");        // the weather condition paragraph
  checkElement("forecast-container"); // the 7-day forecast container
  checkElement("chart-container");  // the hourly chart container
  checkElement("search-input");     // the search text field
  checkElement("search-btn");       // the search button
  checkElement("unit-toggle");      // the °C / °F toggle button
  checkElement("loading");          // the loading message element
  checkElement("error-msg");        // the error message element

  // --- CHECK ALL REQUIRED JAVASCRIPT FUNCTIONS ---
  checkFunction("fetchWeather");    // defined in api.js
  checkFunction("fetchGeocode");    // defined in api.js
  checkFunction("renderCurrent");   // defined in display.js
  checkFunction("renderForecast");  // defined in display.js
  checkFunction("renderChart");     // defined in display.js
  checkFunction("setBackground");   // defined in display.js
  checkFunction("getWeatherInfo");  // defined in weather-codes.js

  // Print a footer to mark the end of the test output.
  console.log("============================================");
  console.log("QA TESTS complete. Check for any FAIL lines above.");
  console.log("============================================");

}


// ============================================================
// FUNCTION: showLoading(message)
// Shows the loading element with a custom message.
// Called whenever the app is waiting for something.
// ============================================================

function showLoading(message) {

  // Find the loading element by its id.
  const loadingEl = document.getElementById("loading");

  // Set its text to the message we want the user to see.
  loadingEl.textContent = message;

  // Make it visible — it starts hidden with display:none.
  loadingEl.style.display = "block";

}


// ============================================================
// FUNCTION: hideLoading()
// Hides the loading element once waiting is complete.
// ============================================================

function hideLoading() {

  // Find the loading element.
  const loadingEl = document.getElementById("loading");

  // Set display to "none" — hides it without removing it from HTML.
  loadingEl.style.display = "none";

}


// ============================================================
// FUNCTION: showError(message)
// Shows the error message element with a custom message.
// Called when geolocation fails, a city is not found, etc.
// ============================================================

function showError(message) {

  // Find the error element by its id.
  const errorEl = document.getElementById("error-msg");

  // Set the error text the user will read.
  errorEl.textContent = message;

  // Make it visible.
  errorEl.style.display = "block";

}


// ============================================================
// FUNCTION: hideError()
// Hides the error message element.
// Called at the start of a new action so old errors disappear.
// ============================================================

function hideError() {

  // Find the error element.
  const errorEl = document.getElementById("error-msg");

  // Hide it.
  errorEl.style.display = "none";

}


// ============================================================
// FUNCTION: loadWeather(lat, lon, cityLabel)
//
// Fetches weather for a location and updates ALL sections of
// the dashboard at once. Each render call is wrapped in its own
// try/catch so one crash never stops the others from running.
//
// lat       → latitude number,  e.g. 51.5
// lon       → longitude number, e.g. -0.12
// cityLabel → the name shown in #city-name, e.g. "London"
// ============================================================

// "async" because it uses "await" inside to wait for the API.
async function loadWeather(lat, lon, cityLabel) {

  // Show a loading message while the API request is in progress.
  showLoading("Loading weather...");

  // Call fetchWeather() from api.js — await pauses until done.
  const data = await fetchWeather(lat, lon);

  // Hide the loading message now that a response has arrived.
  hideLoading();

  // fetchWeather() returns null if the request failed.
  if (data === null) {
    // Show a friendly error and stop — do not try to render null.
    showError("Could not load weather data. Please try again.");
    return;
  }

  // Write the city label into the #city-name heading on the page.
  document.getElementById("city-name").textContent = cityLabel;

  // --- ERROR BOUNDARY: renderCurrent ---
  // Each try/catch is separate so a crash here does not stop
  // renderForecast or renderChart from running below.
  try {
    // Update temperature, wind speed, and condition on the page.
    renderCurrent(data);
  } catch (error) {
    // Log a clear message — the developer can see exactly where it failed.
    console.log("ERROR in renderCurrent():", error.message);
    // Show a fallback in the condition element so the page is not blank.
    document.getElementById("condition").textContent = "Could not display current weather.";
  }

  // --- ERROR BOUNDARY: renderForecast ---
  try {
    // Build the 7 forecast cards using data.daily from the API.
    renderForecast(data.daily);
  } catch (error) {
    console.log("ERROR in renderForecast():", error.message);
    // Show fallback text inside the forecast container.
    const fc = document.getElementById("forecast-container");
    // Guard against the element itself being missing.
    if (fc) { fc.textContent = "Could not display forecast."; }
  }

  // --- ERROR BOUNDARY: renderChart ---
  try {
    // Draw the hourly bar chart using data.hourly from the API.
    // Pass currentUnit so the chart always draws in the active unit.
    // currentUnit is defined in display.js which loads before app.js.
    renderChart(data.hourly, currentUnit);
  } catch (error) {
    console.log("ERROR in renderChart():", error.message);
    // Show fallback text inside the chart container.
    const cc = document.getElementById("chart-container");
    if (cc) { cc.textContent = "Could not display hourly chart."; }
  }

  // --- ERROR BOUNDARY: setBackground ---
  try {
    // Change the page background gradient to match the weather code.
    setBackground(data.current.weather_code);
  } catch (error) {
    // Background failure is cosmetic — log it but do not show the user.
    console.log("ERROR in setBackground():", error.message);
  }

  // Log confirmation that the full load completed.
  console.log("loadWeather() complete for:", cityLabel);

}


// ============================================================
// FUNCTION: runSearch()
//
// Reads the city name from the search input, calls the
// Geocoding API, and shows up to 3 clickable result buttons.
// Called by both the search button click and the Enter key.
// ============================================================

async function runSearch() {

  // Read and trim the text the user typed in the search field.
  const input = document.getElementById("search-input");
  const cityName = input.value.trim();

  // If the field is empty, prompt the user and stop.
  // An empty string is falsy — ! flips it to true.
  if (!cityName) {
    showError("Please enter a city name.");
    return;
  }

  // Clear any old error before starting a fresh search.
  hideError();

  // Show a searching message while the API call is in progress.
  showLoading("Searching...");

  // Log what we are searching for.
  console.log("Searching for city:", cityName);

  // Call fetchGeocode() from api.js — returns up to 3 city objects.
  const results = await fetchGeocode(cityName);

  // Hide the loading message now that results have arrived.
  hideLoading();

  // Clear any old result buttons from a previous search.
  const resultsContainer = document.getElementById("search-results");
  resultsContainer.innerHTML = "";

  // If no cities were found, show an error and stop.
  if (results.length === 0) {
    showError("City not found. Try a different name.");
    return;
  }

  // Build a clickable button for each matching city.
  // forEach runs once per item — "result" is the current city object.
  results.forEach(function(result) {

    // Create a new <button> element for this city result.
    const btn = document.createElement("button");

    // Label it "City, Country" — e.g. "Paris, France".
    btn.textContent = `${result.name}, ${result.country}`;

    // When this button is clicked, load weather for that city.
    btn.addEventListener("click", function() {

      // Log which city was selected.
      console.log("City selected:", result.name);

      // ── localStorage SAVE ──────────────────────────────────
      // Save the selected city name to localStorage so that when
      // the page is refreshed, the app can reload this city
      // automatically instead of starting blank.
      // localStorage.setItem(key, value) stores a string in the
      // browser — it persists even after the tab is closed.
      localStorage.setItem("lastCity", result.name);
      // ────────────────────────────────────────────────────────

      // Log that we saved to localStorage.
      console.log("Saved to localStorage — lastCity:", result.name);

      // Load weather for this city using its coordinates from the API.
      loadWeather(result.latitude, result.longitude, result.name);

      // Clear the result buttons — the user has made their choice.
      resultsContainer.innerHTML = "";

      // Clear the search input ready for the next search.
      input.value = "";

    });
    // End of click listener for this result button.

    // Add the button into the search-results container.
    resultsContainer.appendChild(btn);

  });
  // End of forEach loop — all result buttons are now on the page.

}


// ============================================================
// DOMContentLoaded — THE STARTING POINT
//
// Everything inside here runs once the HTML is fully loaded.
// This guarantees all elements exist before we try to use them.
//
// START-UP PRIORITY ORDER:
//   1. Run QA tests
//   2. Try geolocation (user's real location)
//   3. If geolocation fails → try localStorage (last searched city)
//   4. If localStorage empty → fall back to London
// ============================================================

document.addEventListener("DOMContentLoaded", function() {

  // Log so we know the DOM is ready and app.js has started.
  console.log("DOM ready — app.js running.");

  // ----------------------------------------------------------
  // STEP 1: Run QA tests before anything else.
  // Any FAIL lines in the console need to be fixed before demo.
  // ----------------------------------------------------------
  runTests();

  // ----------------------------------------------------------
  // STEP 2: Attach the search button click listener.
  // Attaching this early so the user can search at any time.
  // ----------------------------------------------------------

  // Find the search button element.
  const searchBtn = document.getElementById("search-btn");

  // Run the search when the button is clicked.
  searchBtn.addEventListener("click", function() {
    console.log("Search button clicked.");
    runSearch();
  });

  // ----------------------------------------------------------
  // STEP 3: Attach the Enter key listener on the search input.
  // ----------------------------------------------------------

  // Find the search input element.
  const searchInput = document.getElementById("search-input");

  // Listen for any key press inside the input field.
  searchInput.addEventListener("keydown", function(event) {

    // Only trigger the search if the key pressed was Enter.
    if (event.key === "Enter") {
      console.log("Enter key pressed — running search.");
      runSearch();
    }

  });

  // ----------------------------------------------------------
  // STEP 4: Decide what weather to load on startup.
  //
  // We try three options in order:
  //   A) Geolocation — the user's real current location
  //   B) localStorage — the last city the user searched for
  //   C) London — the hardcoded fallback so the app never blanks
  //
  // The geolocation success callback handles options A.
  // The geolocation error callback handles options B and C.
  // ----------------------------------------------------------

  // Check if the browser supports geolocation at all.
  // navigator.geolocation is undefined in very old browsers.
  if (navigator.geolocation) {

    // Browser supports geolocation — show a locating message.
    showLoading("Locating you...");

    // Ask the browser for the user's position.
    // Takes two callbacks — one for success, one for failure.
    navigator.geolocation.getCurrentPosition(

      // ── SUCCESS CALLBACK ───────────────────────────────────
      // Runs if the user allows location access.
      // "position" is passed in automatically by the browser.
      function(position) {

        // Log that geolocation succeeded.
        console.log("Geolocation success:", position);

        // Read the latitude from the position object.
        const lat = position.coords.latitude;

        // Read the longitude from the position object.
        const lon = position.coords.longitude;

        // Log the coordinates so we can verify in the console.
        console.log("User coordinates — lat:", lat, "lon:", lon);

        // Hide the locating message.
        hideLoading();

        // Load weather for the user's real location.
        // "My Location" is the label shown in #city-name.
        loadWeather(lat, lon, "My Location");

      },
      // ── END SUCCESS CALLBACK ───────────────────────────────


      // ── ERROR CALLBACK ─────────────────────────────────────
      // Runs if the user denies permission or geolocation fails.
      // "err" is the error object the browser provides.
      function(err) {

        // Log the error code and message for debugging.
        console.log("Geolocation error:", err.code, err.message);

        // Hide the locating message.
        hideLoading();

        // ── localStorage CHECK ─────────────────────────────
        // Geolocation failed — check if the user previously
        // searched for a city that we saved to localStorage.
        // localStorage.getItem(key) returns the saved string,
        // or null if nothing was ever saved under that key.
        const savedCity = localStorage.getItem("lastCity");
        // ───────────────────────────────────────────────────

        // Check if a saved city name exists in localStorage.
        if (savedCity) {

          // A saved city was found — log it.
          console.log("Found saved city in localStorage:", savedCity);

          // Show a message so the user knows what is loading.
          showLoading(`Loading your last city: ${savedCity}...`);

          // Search for the saved city name using the Geocoding API.
          // We need to fetch the coordinates because localStorage
          // only stores the name, not the lat/lon.
          fetchGeocode(savedCity).then(function(results) {

            // Hide the loading message once geocoding responds.
            hideLoading();

            // Check if at least one result came back.
            if (results.length > 0) {

              // Use the first (best) result from the geocoding API.
              const city = results[0];

              // Log the city we are about to load.
              console.log("Loading saved city:", city.name, city.latitude, city.longitude);

              // Load weather for the saved city coordinates.
              loadWeather(city.latitude, city.longitude, city.name);

            } else {

              // The saved city name returned no results — it may
              // have been misspelled or the city no longer exists.
              console.log("Saved city not found in geocoding — falling back to London.");

              // Remove the stale saved city from localStorage.
              // localStorage.removeItem(key) deletes the entry.
              localStorage.removeItem("lastCity");

              // Fall back to London.
              loadWeather(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY_NAME);

            }

          });

        } else {

          // No saved city in localStorage either — use London.
          console.log("No saved city found — loading default city:", DEFAULT_CITY_NAME);

          // Show an informational message to the user.
          showError("Location access denied. Showing weather for London.");

          // Load the default London weather.
          loadWeather(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY_NAME);

        }

      }
      // ── END ERROR CALLBACK ─────────────────────────────────

    );
    // End of getCurrentPosition() call.

  } else {

    // ----------------------------------------------------------
    // GEOLOCATION NOT SUPPORTED
    // The browser is too old to support navigator.geolocation.
    // Skip straight to localStorage → London fallback chain.
    // ----------------------------------------------------------

    // Log that geolocation is unavailable.
    console.log("Geolocation not supported by this browser.");

    // ── localStorage CHECK (no geolocation) ─────────────────
    // Try to load the last saved city from localStorage.
    const savedCity = localStorage.getItem("lastCity");
    // ─────────────────────────────────────────────────────────

    // Check if a saved city exists.
    if (savedCity) {

      // Found a saved city — log it.
      console.log("No geolocation but found saved city:", savedCity);

      // Show a loading message.
      showLoading(`Loading your last city: ${savedCity}...`);

      // Search for the saved city to get its coordinates.
      fetchGeocode(savedCity).then(function(results) {

        // Hide loading once geocoding responds.
        hideLoading();

        // If we got results, load the first one.
        if (results.length > 0) {

          // Use the best matching result.
          const city = results[0];
          console.log("Loading saved city:", city.name);
          loadWeather(city.latitude, city.longitude, city.name);

        } else {

          // Saved city not found — fall back to London.
          console.log("Saved city geocoding failed — loading London.");
          localStorage.removeItem("lastCity");
          loadWeather(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY_NAME);

        }

      });

    } else {

      // No geolocation, no saved city — load London.
      console.log("No geolocation or saved city — loading default:", DEFAULT_CITY_NAME);
      showError("Geolocation not supported. Showing weather for London.");
      loadWeather(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY_NAME);

    }

  }
  // End of geolocation if/else block.

});
// End of DOMContentLoaded.