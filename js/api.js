// ============================================================
// api.js — handles all communication with the Open-Meteo API
// This file fetches live weather data and city search results
// ============================================================


// --- fetchWeather -------------------------------------------
// This function gets live weather data for a specific location
// lat = latitude (north/south position), lon = longitude (east/west position)
async function fetchWeather(lat, lon) {

  // try means: attempt the code below, and if anything breaks go to catch
  try {

    // Build the URL using template literals (backticks let us insert variables with ${})
    // We slot the lat and lon values directly into the URL string
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&hourly=temperature_2m&timezone=auto&forecast_days=7`;

    // Print the URL to the console so we can check it looks correct in DevTools
    console.log("Fetching weather for:", lat, lon);
    console.log("URL:", url);

    // fetch() sends a request to the URL — await pauses here until the server replies
    const response = await fetch(url);

    // Check if the server replied with an error (like 404 or 500)
    // response.ok is true only if the status code is between 200 and 299
    if (!response.ok) {

      // Throw an error with the status code so we know what went wrong
      throw new Error("Weather API error: " + response.status);

    }

    // .json() reads the response body and converts it from text into a JavaScript object
    // await pauses here until that conversion is finished
    const data = await response.json();

    // Print the data to the console so we can inspect it in DevTools
    console.log("Weather data received:", data);

    // Return the data object so other files can use it
    return data;

  // catch runs only if something went wrong inside try
  } catch (error) {

    // Print the error message to the console so we can debug it
    console.log("Error in fetchWeather:", error);

    // Return null so the calling code knows something went wrong
    return null;

  }

}


// --- fetchGeocode -------------------------------------------
// This function searches for cities by name using the Geocoding API
// cityName = the text the user typed in the search box (e.g. "London")
async function fetchGeocode(cityName) {

  // try means: attempt the code below, and if anything breaks go to catch
  try {

    // Build the geocoding URL — we insert the cityName into the URL with ${}
    // count=3 means we ask for the top 3 matching cities
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=3`;

    // Print the search term to the console so we can see what was searched
    console.log("Searching for city:", cityName);

    // fetch() sends the request — await pauses until the server replies
    const response = await fetch(url);

    // Check if the server replied with an error
    if (!response.ok) {

      // Throw an error with the status code
      throw new Error("Geocoding API error: " + response.status);

    }

    // Convert the response from text into a JavaScript object
    const data = await response.json();

    // Print the results to the console so we can inspect them in DevTools
    console.log("City search results:", data);

    // data.results is the array of matching cities
    // If no cities were found, data.results will be undefined — we return [] (empty array) instead
    return data.results || [];

  // catch runs only if something went wrong inside try
  } catch (error) {

    // Print the error message to the console
    console.log("Error in fetchGeocode:", error);

    // Return an empty array so the calling code does not crash
    return [];

  }

}