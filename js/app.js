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
//   1. Detecting the user's location with geolocation
//   2. Falling back to a search if location is denied
//   3. Handling the search button click
//   4. Handling the Enter key press in the search input
//   5. Showing clickable city results from the Geocoding API
// ============================================================


// ============================================================
// HELPER FUNCTION: showLoading(message)
// Shows the loading div with a custom message.
// We call this whenever we are waiting for something.
// ============================================================

// "message" is the text to display, e.g. "Locating you..."
function showLoading(message) {

  // Find the element with id="loading" in index.html.
  const loadingEl = document.getElementById("loading");

  // Set the text inside it to our message.
  loadingEl.textContent = message;

  // Make it visible — by default it is hidden with display:none.
  // Setting display to "block" makes it appear on the page.
  loadingEl.style.display = "block";

}


// ============================================================
// HELPER FUNCTION: hideLoading()
// Hides the loading div once we have finished waiting.
// ============================================================

function hideLoading() {

  // Find the loading element.
  const loadingEl = document.getElementById("loading");

  // Set display to "none" — this hides it completely.
  // The element still exists in the HTML, the user just cannot see it.
  loadingEl.style.display = "none";

}


// ============================================================
// HELPER FUNCTION: showError(message)
// Displays an error message in the id="error-msg" element.
// Called when geolocation fails or is not supported.
// ============================================================

// "message" is the error text to show the user.
function showError(message) {

  // Find the element with id="error-msg" in index.html.
  const errorEl = document.getElementById("error-msg");

  // Set the error text.
  errorEl.textContent = message;

  // Make it visible — same technique as showLoading above.
  errorEl.style.display = "block";

}


// ============================================================
// HELPER FUNCTION: hideError()
// Hides the error message element.
// Called before a new search so old errors disappear.
// ============================================================

function hideError() {

  // Find the error element.
  const errorEl = document.getElementById("error-msg");

  // Hide it by setting display to "none".
  errorEl.style.display = "none";

}


// ============================================================
// HELPER FUNCTION: loadWeather(lat, lon, cityLabel)
//
// Fetches weather for any location and updates ALL sections
// of the dashboard at once. Used by both geolocation and
// the city search so we do not repeat the same code twice.
//
// lat       → latitude number,  e.g. 48.85
// lon       → longitude number, e.g. 2.35
// cityLabel → city name to show in #city-name, e.g. "Paris"
// ============================================================

// "async" because it uses "await" to wait for the API response.
async function loadWeather(lat, lon, cityLabel) {

  // Show a loading message while the API call is in progress.
  showLoading("Loading weather...");

  // Call fetchWeather() from api.js with the given coordinates.
  // "await" pauses here until the full response comes back.
  const data = await fetchWeather(lat, lon);

  // Hide the loading message now that we have a response.
  hideLoading();

  // fetchWeather() returns null if the request failed.
  // We check for that here before trying to use the data.
  if (data === null) {

    // Show a friendly error instead of letting the app crash.
    showError("Could not load weather data. Please try again.");

    // Stop the function — do not try to render with null data.
    return;

  }

  // Write the city name into the #city-name heading.
  document.getElementById("city-name").textContent = cityLabel;

  // Pass the data to renderCurrent() in display.js.
  // This updates the temperature, wind speed, and condition.
  renderCurrent(data);

  // Pass data.daily to renderForecast() in display.js.
  // This builds the 7 forecast cards.
  renderForecast(data.daily);

  // Pass data.hourly to renderChart() in display.js.
  // Also pass currentUnit so the chart always draws in the active unit.
  // currentUnit is defined in display.js and is accessible here because
  // display.js loads before app.js in the script tags.
  renderChart(data.hourly, currentUnit);

  // Pass the weather code to setBackground() in display.js.
  // This changes the page background gradient to match the weather.
  setBackground(data.current.weather_code);

  // Log success so we can confirm it worked in the console.
  console.log("loadWeather() complete for:", cityLabel);

}


// ============================================================
// HELPER FUNCTION: runSearch()
//
// Reads the city name from the input, calls the Geocoding API,
// and shows up to 3 clickable result buttons.
// Called by both the button click AND the Enter key press.
// ============================================================

// "async" because fetchGeocode() uses await inside.
async function runSearch() {

  // Find the search input and read its current value.
  const input = document.getElementById("search-input");

  // .value reads the typed text. .trim() removes extra spaces.
  const cityName = input.value.trim();

  // If the field is empty, stop and ask the user to type something.
  // An empty string is falsy — ! flips it to true.
  if (!cityName) {

    // Show an error nudging the user to enter a city name.
    showError("Please enter a city name.");

    // Stop here — no point searching for nothing.
    return;

  }

  // Hide any previous error message before starting a new search.
  hideError();

  // Show a searching message while we wait for the geocoding API.
  showLoading("Searching...");

  // Log what we are searching for.
  console.log("Searching for:", cityName);

  // Call fetchGeocode() from api.js with the typed city name.
  // "await" pauses until the geocoding API responds.
  // "results" is an array of up to 3 matching city objects.
  const results = await fetchGeocode(cityName);

  // Hide the loading message now that results have arrived.
  hideLoading();

  // Find the container where we will show the result buttons.
  const resultsContainer = document.getElementById("search-results");

  // Clear any buttons from a previous search.
  resultsContainer.innerHTML = "";

  // If no cities were found, tell the user and stop.
  if (results.length === 0) {

    // Show a not-found error message.
    showError("City not found. Try a different name.");

    // Stop here — nothing to display.
    return;

  }

  // Loop through each result and create a clickable button for it.
  // forEach runs once per item in the array.
  // "result" is the current city object on each iteration.
  results.forEach(function(result) {

    // Create a new <button> element for this city.
    const btn = document.createElement("button");

    // Set the button label to "City, Country". e.g. "Paris, France"
    btn.textContent = `${result.name}, ${result.country}`;

    // When this button is clicked, load weather for that city.
    btn.addEventListener("click", function() {

      // Log which city was picked.
      console.log("City selected:", result.name);

      // Load weather using this city's coordinates from the geocoding API.
      loadWeather(result.latitude, result.longitude, result.name);

      // Clear the result buttons — the user has made their choice.
      resultsContainer.innerHTML = "";

      // Clear the search input ready for the next search.
      input.value = "";

    });
    // End of click listener for this result button.

    // Add the button into the search-results container on the page.
    resultsContainer.appendChild(btn);

  });
  // End of forEach — all result buttons are now visible on the page.

}


// ============================================================
// DOMContentLoaded — THE STARTING POINT
//
// The browser fires this event the moment all HTML elements
// are fully loaded and ready to be used by JavaScript.
// We wrap everything in here so getElementById() can find
// elements like #search-btn without returning null.
// ============================================================

// Listen for the DOMContentLoaded event on the document.
// The function inside runs once the HTML is fully parsed.
document.addEventListener("DOMContentLoaded", function() {

  // Log so we know the DOM is ready and app.js has started.
  console.log("DOM ready — app.js running.");


  // ============================================================
  // SECTION 1: BROWSER GEOLOCATION
  //
  // We try to get the user's real location automatically.
  // navigator.geolocation is built into every modern browser.
  // It asks the user for permission before sharing coordinates.
  //
  // There are three possible outcomes:
  //   A) Browser does not support geolocation at all
  //   B) User denies permission → error callback runs
  //   C) User allows → success callback runs with coordinates
  // ============================================================

  // Check if the browser supports geolocation at all.
  // "navigator.geolocation" is undefined in very old browsers.
  if (navigator.geolocation) {

    // The browser supports geolocation — try to get the position.
    // Show a message so the user knows the app is working.
    showLoading("Locating you...");

    // getCurrentPosition() asks the browser to find the user's location.
    // It takes two callback functions:
    //   1st → runs if the user allows location access (success)
    //   2nd → runs if the user denies or something goes wrong (error)
    navigator.geolocation.getCurrentPosition(

      // --------------------------------------------------------
      // SUCCESS CALLBACK
      // Runs when the browser successfully gets the user's location.
      // "position" is an object the browser passes in automatically.
      // It contains the coordinates we need.
      // --------------------------------------------------------
      function(position) {

        // Log that geolocation succeeded.
        console.log("Geolocation success:", position);

        // Read the latitude from the position object.
        // position.coords is an object with latitude, longitude, accuracy etc.
        const lat = position.coords.latitude;

        // Read the longitude from the position object.
        const lon = position.coords.longitude;

        // Log the coordinates so we can check them in the console.
        console.log("User coordinates — lat:", lat, "lon:", lon);

        // Hide the "Locating you..." message now that we have the position.
        hideLoading();

        // Load weather for the user's actual location.
        // We use "My Location" as the city label because we do not
        // know the city name from coordinates alone at this stage.
        loadWeather(lat, lon, "My Location");

      },
      // End of success callback.

      // --------------------------------------------------------
      // ERROR CALLBACK
      // Runs when the user denies permission OR the browser
      // cannot determine the location for any reason.
      // "err" is an error object the browser passes in automatically.
      // --------------------------------------------------------
      function(err) {

        // Log the error code and message for debugging.
        console.log("Geolocation error:", err.code, err.message);

        // Hide the "Locating you..." loading message.
        hideLoading();

        // Show a helpful error message and point the user to the search bar.
        showError("Location access denied. Please search for a city.");

      }
      // End of error callback.

    );
    // End of getCurrentPosition() call.

  } else {

    // --------------------------------------------------------
    // GEOLOCATION NOT SUPPORTED
    // This branch runs if navigator.geolocation does not exist,
    // meaning the browser is too old to support location access.
    // --------------------------------------------------------

    // Log so we know geolocation is unavailable.
    console.log("Geolocation is not supported by this browser.");

    // Show an error message pointing the user to the search bar.
    showError("Geolocation not supported by your browser.");

  }
  // End of geolocation if/else block.


  // ============================================================
  // SECTION 2: SEARCH BUTTON CLICK LISTENER
  // When the user clicks "Search", run the search function.
  // ============================================================

  // Find the search button element by its id.
  const searchBtn = document.getElementById("search-btn");

  // Attach a click event listener to the search button.
  searchBtn.addEventListener("click", function() {

    // Log so we can confirm the click was detected.
    console.log("Search button clicked.");

    // Run the search — reads the input, calls API, shows results.
    runSearch();

  });
  // End of search button click listener.


  // ============================================================
  // SECTION 3: ENTER KEY LISTENER
  // Pressing Enter in the search input triggers the same search.
  // ============================================================

  // Find the search input element.
  const searchInput = document.getElementById("search-input");

  // Attach a keydown listener — fires whenever a key is pressed
  // while the cursor is inside the search input field.
  searchInput.addEventListener("keydown", function(event) {

    // event.key is the name of the key that was pressed.
    // We only want to trigger search when Enter is pressed.
    if (event.key === "Enter") {

      // Log that Enter was detected.
      console.log("Enter key pressed — running search.");

      // Run the same search function as the button click.
      runSearch();

    }
    // Any other key press is ignored here.

  });
  // End of Enter key listener.

});
// End of DOMContentLoaded — all setup is complete.