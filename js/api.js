// js/api.js
// ============================================================
// This file is responsible for all communication between the
// weather dashboard and the two external APIs it depends on.
// It contains two functions: fetchWeather() which retrieves
// live temperature, wind, forecast, and hourly data for any
// coordinates, and fetchGeocode() which converts a city name
// into the latitude and longitude the weather API needs.
// Both functions manage the loading spinner and error messages
// so that app.js and display.js never have to handle failed
// network requests themselves.
// ============================================================


// ============================================================
// HELPER: showLoadingSpinner()
// Makes the loading div visible with a message.
// Called before any fetch starts so the user sees feedback.
// ============================================================

function showLoadingSpinner() {

  // Find the loading element by its id in index.html.
  const loadingEl = document.getElementById("loading");

  // Only update it if it actually exists in the HTML.
  // This guard prevents a crash if the element is missing.
  if (loadingEl) {

    // Set the message the user will see.
    loadingEl.textContent = "Loading weather...";

    // Make the element visible — it starts hidden with display:none.
    // Setting display to "block" makes it appear as a block on the page.
    loadingEl.style.display = "block";

  }

}


// ============================================================
// HELPER: hideLoadingSpinner()
// Hides the loading div once a fetch is complete.
// Called in both the success and error paths so it always hides.
// ============================================================

function hideLoadingSpinner() {

  // Find the loading element.
  const loadingEl = document.getElementById("loading");

  // Only update it if it exists.
  if (loadingEl) {

    // Setting display to "none" hides the element completely.
    // It still exists in the HTML — the user just cannot see it.
    loadingEl.style.display = "none";

  }

}


// ============================================================
// HELPER: showApiError(message)
// Makes the error-msg div visible with a friendly message.
// Called whenever a fetch fails or returns bad data.
// ============================================================

// "message" is the text to show the user, e.g. "City not found."
function showApiError(message) {

  // Find the error message element by its id in index.html.
  const errorEl = document.getElementById("error-msg");

  // Only update it if it exists.
  if (errorEl) {

    // Set the error text so the user can read it.
    errorEl.textContent = message;

    // Make it visible — it starts hidden with display:none.
    errorEl.style.display = "block";

  }

}


// ============================================================
// HELPER: clearApiError()
// Hides the error-msg div and clears its text.
// Called at the start of a new fetch so old errors disappear.
// ============================================================

function clearApiError() {

  // Find the error element.
  const errorEl = document.getElementById("error-msg");

  // Only update it if it exists.
  if (errorEl) {

    // Clear the text so old messages do not reappear later.
    errorEl.textContent = "";

    // Hide the element.
    errorEl.style.display = "none";

  }

}


// ============================================================
// FUNCTION: fetchWeather(lat, lon)
//
// Fetches current weather, 7-day forecast, and hourly
// temperature data for a given latitude and longitude.
//
// Shows a loading spinner before fetching and hides it after.
// Shows a friendly error message if anything goes wrong.
//
// Returns the data object on success, or null on failure.
//
// How to call it:
//   const data = await fetchWeather(48.85, 2.35);
//   if (data !== null) { renderCurrent(data); }
// ============================================================

// "async" tells JavaScript this function contains await steps.
// "lat" and "lon" are the coordinates of the location to fetch.
async function fetchWeather(lat, lon) {

  // Print the exact coordinates being requested so we can confirm
  // the right location is being fetched during the demo.
  // This appears in DevTools before any network request is made.
  // Example output: "Fetching weather for:  lat: 48.85  lon: 2.35"
  console.log("Fetching weather for: ", "lat:", lat, " lon:", lon);

  // Clear any error message left over from a previous failed fetch.
  // We do this first so the user sees a clean state before loading.
  clearApiError();

  // Show the loading spinner so the user knows something is happening.
  // This replaces the blank wait that would otherwise confuse users.
  showLoadingSpinner();

  // "try" means: attempt the code below.
  // If anything goes wrong, jump to "catch" instead of crashing.
  try {

    // Build the API URL using a template literal (backticks).
    // ${lat} and ${lon} insert the coordinate variables into the string.
    // This URL requests:
    //   current=  → temperature, wind speed, weather code right now
    //   daily=    → max/min temps and weather codes for 7 days
    //   hourly=   → temperature for every hour of the day
    //   timezone=auto     → use the local timezone of the location
    //   forecast_days=7   → return exactly 7 days of data
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&hourly=temperature_2m&timezone=auto&forecast_days=7`;

    // Log the URL so we can inspect it in the console if needed.
    console.log("Fetching weather from:", url);

    // Send the HTTP request to the API and wait for a response.
    // "await" pauses here until the response arrives from the server.
    // Without "await", JavaScript would move on before data is ready.
    const response = await fetch(url);

    // Check if the server responded with a success status (200–299).
    // response.ok is false if the server returned 404, 500, etc.
    if (!response.ok) {

      // Hide the loading spinner — we are done waiting.
      hideLoadingSpinner();

      // Show a friendly error message to the user.
      // We include the status code to help with debugging.
      showApiError(`Weather service error (code ${response.status}). Please try again later.`);

      // Log the technical details for the developer.
      console.log("fetchWeather: bad response status:", response.status);

      // Return null so the calling code knows the fetch failed.
      return null;

    }

    // Convert the raw response body into a usable JavaScript object.
    // .json() parses the JSON text the server sent back.
    // "await" again because this step also takes a brief moment.
    const data = await response.json();

    // Hide the loading spinner now that data has arrived successfully.
    hideLoadingSpinner();

    // Log the full data object so we can inspect it in DevTools.
    // Click the arrow next to "Object" in the console to expand it.
    console.log("Weather data received:", data);

    // Return the data to whoever called this function.
    // The caller can then pass it to renderCurrent(), renderForecast(), etc.
    return data;

  // "catch" runs only if something threw an error inside "try".
  // "error" is the Error object JavaScript creates automatically.
  } catch (error) {

    // Hide the loading spinner — the fetch is over even though it failed.
    hideLoadingSpinner();

    // Show a friendly message — most likely the user has no internet.
    showApiError("Could not load weather. Please check your internet connection.");

    // Log the technical error message for the developer to read.
    console.log("fetchWeather failed:", error.message);

    // Return null to signal that no data is available.
    return null;

  }

}


// ============================================================
// FUNCTION: fetchGeocode(cityName)
//
// Converts a city name typed by the user into coordinates
// (latitude and longitude) using the Open-Meteo Geocoding API.
//
// Shows a loading state while fetching.
// Shows a friendly error if the city is not found or fetch fails.
//
// Returns an array of up to 3 matching city result objects,
// or an empty array [] if nothing was found or fetch failed.
//
// How to call it:
//   const results = await fetchGeocode("Tokyo");
//   // results[0] → { name, country, latitude, longitude }
// ============================================================

// "cityName" is the string the user typed in the search input.
async function fetchGeocode(cityName) {

  // Clear any previous error message before starting a new search.
  clearApiError();

  // Show a loading message while we wait for the geocoding API.
  // We reuse showLoadingSpinner() but update the text to be specific.
  const loadingEl = document.getElementById("loading");

  // Only update if the element exists.
  if (loadingEl) {

    // Set a search-specific message instead of "Loading weather...".
    loadingEl.textContent = "Searching for city...";

    // Make the loading element visible.
    loadingEl.style.display = "block";

  }

  // try/catch — same pattern as fetchWeather above.
  try {

    // Build the Geocoding API URL.
    // encodeURIComponent() makes the city name safe to use in a URL.
    // Spaces become %20, special characters are escaped automatically.
    // Example: "New York" → "New%20York"
    // count=3 tells the API to return a maximum of 3 matching cities.
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=3`;

    // Log the URL for debugging.
    console.log("Fetching geocode from:", url);

    // Send the request and wait for the response.
    const response = await fetch(url);

    // Check the response status — same as in fetchWeather.
    if (!response.ok) {

      // Hide the loading spinner.
      hideLoadingSpinner();

      // Show a friendly error — the geocoding service had a problem.
      showApiError(`Search service error (code ${response.status}). Please try again.`);

      console.log("fetchGeocode: bad response status:", response.status);

      // Return an empty array — no results to show.
      return [];

    }

    // Parse the JSON response into a JavaScript object.
    const data = await response.json();

    // Hide the loading spinner now that results have arrived.
    hideLoadingSpinner();

    // Log the full geocoding result for debugging.
    console.log("Geocode data received:", data);

    // The geocoding API returns: { results: [ {...}, {...} ] }
    // If no city was found, data.results is undefined.
    // data.results || [] means: use data.results if it exists,
    // otherwise fall back to an empty array to avoid a crash.
    const results = data.results || [];

    // If the results array is empty, the city was not found.
    if (results.length === 0) {

      // Show a friendly "not found" message to the user.
      // This covers the case where the API responded successfully
      // but returned zero matching cities.
      showApiError("City not found. Please try another name.");

      // Log for debugging.
      console.log("fetchGeocode: no results found for:", cityName);

    }

    // Return the results array — empty or populated.
    // The calling code in app.js will check results.length before using it.
    return results;

  } catch (error) {

    // Hide the loading spinner — the fetch is done even though it failed.
    hideLoadingSpinner();

    // Show a connection error message.
    showApiError("Could not search for city. Please check your internet connection.");

    // Log the technical error.
    console.log("fetchGeocode failed:", error.message);

    // Return an empty array so the calling code does not crash.
    return [];

  }

}