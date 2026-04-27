// js/weather-codes.js
// ============================================================
// This file is a "dictionary" that translates WMO weather code
// numbers into human-readable descriptions and emoji icons.
//
// WMO stands for World Meteorological Organization — they set
// the standard numbering system that Open-Meteo uses.
//
// The API gives us a number like 3. This file tells us that
// 3 means "Overcast ☁️".
//
// Other files (display.js) will call getWeatherInfo(code)
// to look up the right description and icon to show the user.
// ============================================================


// ============================================================
// THE weatherCodes OBJECT
//
// An object in JavaScript stores data as key: value pairs.
// Here the KEY is the weather code number (e.g. 61)
// and the VALUE is another object with two properties:
//   description → the text label, e.g. "Moderate rain"
//   icon        → the emoji shown on screen, e.g. "🌧️"
//
// Structure looks like this:
//   weatherCodes = {
//     61: { description: "Moderate rain", icon: "🌧️" },
//     ...
//   }
// ============================================================

// "const" means this variable cannot be reassigned to something else.
// The object itself can still have its contents read — which is all we need.
const weatherCodes = {

  // Code 0: completely clear sky, no clouds at all
  0: { description: "Clear sky", icon: "☀️" },

  // Code 1: mostly clear but with a few small clouds
  1: { description: "Mainly clear", icon: "🌤️" },

  // Code 2: mix of sun and clouds covering roughly half the sky
  2: { description: "Partly cloudy", icon: "⛅" },

  // Code 3: completely covered by clouds, no sun visible
  3: { description: "Overcast", icon: "☁️" },

  // Code 45: visibility reduced by fog — water droplets in the air
  45: { description: "Foggy", icon: "🌫️" },

  // Code 48: fog where the droplets freeze — dangerous for roads and paths
  48: { description: "Icy fog", icon: "🌫️" },

  // Code 51: very light drizzle — tiny drops, barely feels wet
  51: { description: "Light drizzle", icon: "🌦️" },

  // Code 53: noticeable drizzle — slightly wetter than light drizzle
  53: { description: "Moderate drizzle", icon: "🌦️" },

  // Code 55: heavy drizzle — almost counts as proper rain
  55: { description: "Heavy drizzle", icon: "🌧️" },

  // Code 61: light rain — proper drops but not very intense
  61: { description: "Slight rain", icon: "🌧️" },

  // Code 63: steady normal rain — you will need an umbrella
  63: { description: "Moderate rain", icon: "🌧️" },

  // Code 65: heavy downpour — strong and persistent rainfall
  65: { description: "Heavy rain", icon: "🌧️" },

  // Code 71: light snowfall — a dusting, roads likely still clear
  71: { description: "Slight snow", icon: "🌨️" },

  // Code 73: steady snowfall — accumulation likely on surfaces
  73: { description: "Moderate snow", icon: "❄️" },

  // Code 75: heavy snowfall — significant accumulation, travel disrupted
  75: { description: "Heavy snow", icon: "❄️" },

  // Code 80: brief light rain showers — comes and goes quickly
  80: { description: "Slight showers", icon: "🌦️" },

  // Code 81: moderate rain showers — heavier bursts of rain
  81: { description: "Moderate showers", icon: "🌧️" },

  // Code 82: violent rain showers — very intense, short-lived downpours
  82: { description: "Heavy showers", icon: "🌧️" },

  // Code 95: thunderstorm with lightning and rain but no hail
  95: { description: "Thunderstorm", icon: "⛈️" },

  // Code 96: thunderstorm that also produces hailstones
  96: { description: "Thunderstorm with hail", icon: "⛈️" },

};
// End of weatherCodes object.
// The closing brace } ends the object definition.


// ============================================================
// FUNCTION: getWeatherInfo(code)
//
// Takes a weather code number and returns the matching object
// from weatherCodes above, which contains a description and icon.
//
// If the code does not exist in our object (e.g. the API sends
// a new code we have not added yet), it returns a safe fallback
// so the app never crashes or shows a blank condition.
//
// How to call it:
//   const info = getWeatherInfo(63);
//   console.log(info.description); // "Moderate rain"
//   console.log(info.icon);        // "🌧️"
//
// How to call it with a fallback example:
//   const info = getWeatherInfo(999);
//   console.log(info.description); // "Unknown"
//   console.log(info.icon);        // "🌡️"
// ============================================================

// "function" creates a reusable block of code named getWeatherInfo.
// "code" is the parameter — the weather code number passed in when called.
function getWeatherInfo(code) {

  // Look up the code number as a key inside the weatherCodes object.
  // weatherCodes[code] means: go to the weatherCodes object and find
  // the entry whose key matches the value of "code".
  // We use square brackets [] here instead of a dot because the key
  // is a variable — dot notation only works with fixed known names.
  // Example: weatherCodes[63] returns { description: "Moderate rain", icon: "🌧️" }
  const result = weatherCodes[code];

  // Check if a result was found.
  // If the code did not exist in our object, "result" will be "undefined"
  // (JavaScript's way of saying "nothing was found here").
  // The "if" block runs only when result is undefined (code not found).
  if (result === undefined) {

    // Log a warning so we know an unexpected code came from the API.
    // This helps us know which codes to add to the object in future.
    console.log("getWeatherInfo: unknown weather code received:", code);

    // Return a fallback object with safe default values.
    // This means the app keeps working even with an unrecognised code —
    // it just shows "Unknown 🌡️" instead of crashing or showing nothing.
    return { description: "Unknown", icon: "🌡️" };

  }

  // If we get here, the code WAS found in the weatherCodes object.
  // Return the matching { description, icon } object to whoever called us.
  return result;

}
// End of getWeatherInfo function.