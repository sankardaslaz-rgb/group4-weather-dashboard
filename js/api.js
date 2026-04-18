// js/api.js
// ============================================================
// This file handles ALL communication with the weather APIs.
// It fetches raw data from the internet and returns it to
// other files (like display.js and app.js) to show on screen.
// ============================================================


// ============================================================
// FUNCTION 1: fetchWeather(lat, lon)
// Fetches current weather, 7-day forecast, and hourly
// temperature data for a given latitude and longitude.
//
// How to call it:
//   const data = await fetchWeather(48.85, 2.35);
// ============================================================

// "async" tells JavaScript this function contains waiting steps.
// "lat" and "lon" are the inputs — the coordinates of the city.
async function fetchWeather(lat, lon) {

  // "try" means: attempt the code inside this block.
  // If anything goes wrong, skip to "catch" below instead of crashing.
  try {

    // Build the API URL using a template literal (backticks ` `).
    // Template literals let us drop variables directly into a string
    // using ${variableName} — much cleaner than joining strings with +.
    // This URL asks Open-Meteo for:
    //   current=  → temperature, wind speed, and weather code right now
    //   daily=    → max/min temps and weather code for each of 7 days
    //   hourly=   → temperature for every hour of the day
    //   timezone=auto → use the timezone of the requested location
    //   forecast_days=7 → give us data for exactly 7 days ahead
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&hourly=temperature_2m&timezone=auto&forecast_days=7`;

    // Log the URL we're about to call — useful for debugging.
    // You can see this in the browser console (press F12).
    console.log("Fetching weather from:", url);

    // Send a GET request to the URL and wait for the server to respond.
    // "await" pauses here until the response arrives — without it,
    // JavaScript would move on before the data is ready.
    // "response" at this point is a raw HTTP response, not usable data yet.
    const response = await fetch(url);

    // Check if the server responded with an OK status (status code 200-299).
    // response.ok is false if the server returned an error like 404 or 500.
    if (!response.ok) {
      // Throw a custom error message so it gets caught below.
      // We include the status code so it's easier to debug.
      throw new Error(`Weather API error — status code: ${response.status}`);
    }

    // Convert the raw response into a usable JavaScript object.
    // .json() reads the response body and parses the JSON text.
    // "await" again because this step also takes a moment.
    const data = await response.json();

    // Log the full data object so you can inspect it in the console.
    // Click the arrow next to the object in the console to expand it.
    console.log("Weather data received:", data);

    // Return the data object to whoever called this function.
    // For example: const weatherData = await fetchWeather(48.85, 2.35);
    // Now weatherData holds everything — current, daily, and hourly.
    return data;

  // "catch" runs only if something went wrong inside "try".
  // "error" is the error object that JavaScript creates automatically.
  } catch (error) {

    // Print the error message in the console so you can read it.
    console.log("fetchWeather failed:", error.message);

    // Return null so the calling code knows no data came back.
    // This prevents crashes when other functions try to use the result.
    return null;

  }

}


// ============================================================
// FUNCTION 2: fetchGeocode(cityName)
// Converts a city name typed by the user into coordinates
// (latitude and longitude) using the Open-Meteo Geocoding API.
// Returns an array of up to 3 matching city results.
//
// How to call it:
//   const results = await fetchGeocode("Paris");
//   // results[0] → { name, country, latitude, longitude, ... }
// ============================================================

// "async" again — this function also uses fetch() which needs waiting.
// "cityName" is the string the user typed in the search box.
async function fetchGeocode(cityName) {

  // try/catch again — same pattern as fetchWeather above.
  try {

    // Build the Geocoding API URL.
    // encodeURIComponent() makes the city name safe to put in a URL.
    // For example, "New York" becomes "New%20York" (spaces aren't
    // allowed in URLs — this function handles that automatically).
    // count=3 tells the API to return a maximum of 3 matching cities.
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=3`;

    // Log so we can see exactly what URL is being called.
    console.log("Fetching geocode from:", url);

    // Send the request and wait for the server to respond.
    const response = await fetch(url);

    // Check if the server response was successful.
    if (!response.ok) {
      // If not, throw an error with the status code for debugging.
      throw new Error(`Geocoding API error — status code: ${response.status}`);
    }

    // Convert the raw response body into a JavaScript object.
    const data = await response.json();

    // Log the full geocoding result for debugging.
    console.log("Geocode data received:", data);

    // The geocoding API returns an object like:
    //   { results: [ {name, country, latitude, longitude}, ... ] }
    // We only want the "results" array, not the wrapper object.
    // data.results might be undefined if no city was found,
    // so we use "|| []" as a fallback — return an empty array instead
    // of undefined, which would crash code that tries to loop over it.
    return data.results || [];

  } catch (error) {

    // Log the error so you can read it in the console.
    console.log("fetchGeocode failed:", error.message);

    // Return an empty array so other code doesn't crash trying
    // to loop over an undefined value.
    return [];

  }

}