// display.js
// This file is in charge of SHOWING data on the screen.
// It does NOT fetch data — it only takes data and puts it into the HTML.
// Think of it as the "painter": api.js collects the weather, display.js paints it.

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION: renderCurrent(data)
//
// PURPOSE:
//   Takes one weather data object and updates three parts of the page:
//   temperature, wind speed, and weather condition.
//
// PARAMETER:
//   data — the full object returned by the weather API.
//          It is shaped like this:
//          {
//            current: {
//              temperature_2m: 18.4,
//              wind_speed_10m: 12.6,
//              weather_code:   3
//            }
//          }
//
// HOW TO CALL IT (from app.js, once you have fetched the data):
//   renderCurrent(data);
// ─────────────────────────────────────────────────────────────────────────────

function renderCurrent(data) {              // define a function named renderCurrent; it receives one argument called data

  // ── STEP 1: PULL THE VALUES OUT OF THE DATA OBJECT ──────────────────────
  //
  // data.current is the nested object that holds today's live readings.
  // We copy each value into its own variable so the names are short and clear.

  var temperature = data.current.temperature_2m;   // grab the temperature number, e.g. 18.4
  var windSpeed   = data.current.wind_speed_10m;   // grab the wind speed number, e.g. 12.6
  var weatherCode = data.current.weather_code;     // grab the weather code number, e.g. 3

  // ── STEP 2: LOG THE VALUES TO THE BROWSER CONSOLE ───────────────────────
  //
  // console.log() prints a message in DevTools → Console tab (press F12).
  // This is the easiest way to check that your data arrived correctly.
  // You can remove these lines later once you are confident everything works.

  console.log("renderCurrent() was called — here are the three values:");  // heading line so you can find it easily in the console
  console.log("Temperature  :", temperature);   // prints the temperature number
  console.log("Wind speed   :", windSpeed);     // prints the wind speed number
  console.log("Weather code :", weatherCode);   // prints the weather code number

  // ── STEP 3: FIND THE HTML ELEMENTS WE WANT TO UPDATE ────────────────────
  //
  // document.getElementById("some-id") searches the whole HTML page and
  // returns the element that has that id="..." attribute.
  // We store each element in a variable so we can change its text below.

  var tempElement      = document.getElementById("temperature");  // finds <p id="temperature">  in index.html
  var windElement      = document.getElementById("wind-speed");   // finds <p id="wind-speed">   in index.html
  var conditionElement = document.getElementById("condition");    // finds <p id="condition">     in index.html

  // ── STEP 4: UPDATE THE TEXT INSIDE EACH ELEMENT ─────────────────────────
  //
  // .textContent sets the visible text inside an element.
  // We build a string that combines the number with the right label.
  //
  // The + operator joins (concatenates) two strings together.
  // For example:  18.4  +  "°C"  →  "18.4°C"

  tempElement.textContent      = temperature + "°C";          // e.g. displays  18.4°C
  windElement.textContent      = "Wind: " + windSpeed + " km/h";  // e.g. displays  Wind: 12.6 km/h
  conditionElement.textContent = weatherCode;                 // e.g. displays  3  (we will replace this with a description on Day 3)

  // ── DONE ─────────────────────────────────────────────────────────────────
  //
  // The three HTML elements on the page now show the live weather values.
  // Nothing is returned from this function — its only job is the side-effect
  // of changing what the user can see.

} // end of renderCurrent function