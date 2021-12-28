// GLOBAL VARIABLES
var cityWeatherData = [];
var cityName = "";
const globalDate = new Date();
var currentDate = (globalDate.getMonth() + 1) + "/" + globalDate.getDate() + "/" + globalDate.getFullYear();
var currentDay = { "city": "", "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": "" };
//var currentDay = {};
var next5Days = [
  { "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": "" },
  { "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": "" },
  { "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": "" },
  { "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": "" },
  { "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": "" }
];
var inputCityEl = document.querySelector("#city-input")
var inputCityBtnEl = document.querySelector("#search-button")
var historyBtnListEl = document.querySelector("#history-buttons");

/**
 * foundCityWeatherData() searches for previously pulled weather data
 *   for the city named in the argument list.
 * @param {string - the city name} city 
 * @returns {boolean} true or false
 */
var foundCityWeatherData = function (city) {
  for (var i = 0; i < cityWeatherData.length; i++) {
    if (cityWeatherData[i].city === city) {
      return true;
    }
  }
  return false;
};

/**
 * reuseCityWeatherData() refreshes the current weather data from previously
 *   stored data.
 * @param {string - the city name} city 
 */
var reuseCityWeatherData = function (city) {
  for (var i = 0; i < cityWeatherData.length; i++) {
    if (cityWeatherData[i].city === city) {
      currentDay = cityWeatherData[i].currentDay;
      next5Days = cityWeatherData[i].next5Days;
      break;
    }
  }
};

/**
 * copyCurrentDay() makes and returns a deep copy of the current day weather data for a particular
 *   city.
 * @returns {Object} weather data
 */
var copyCurrentDay = function () {
  var cd = { "city": "", "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": "" };
  cd.city = currentDay.city;
  cd.date = currentDay.date;
  cd.icon = currentDay.icon;
  cd.temp = currentDay.temp;
  cd.wind = currentDay.wind;
  cd.humidity = currentDay.humidity;
  cd.UVidx = currentDay.UVidx;
  return cd;
};

/**
 * copyNext5Days() makes and returns a deep copy of the 5-day weather forecast data for a particular
 *   city. 
 * @returns {object} a copy of the 5 day weather forecast 
 */
var copyNext5Days = function () {
  var n5d = [
    { "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": "" },
    { "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": "" },
    { "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": "" },
    { "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": "" },
    { "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": "" }
  ];

  for (var i = 0; i < n5d.length; i++) {
    n5d[i].date = next5Days[i].date;
    n5d[i].icon = next5Days[i].icon;
    n5d[i].temp = next5Days[i].temp;
    n5d[i].wind = next5Days[i].wind;
    n5d[i].humidity = next5Days[i].humidity;
  }
  return n5d;
};

/**
 * setHistory() copies the current day weather and weather forecast for a particular city
 *   to a storage array that maintains a list of all weather results for a accumulated
 *   in this particular session.  This storage is copied to localStorage to persist across
 *   sessions.  
 */
var setHistory = function () {
  //if not already there...add it in
  if (!foundCityWeatherData(cityName)) {
    let cd = copyCurrentDay();
    let n5d = copyNext5Days();
    cityWeatherData.push({ "city": cityName, "currentDate": currentDate, "currentDay": cd, "next5Days": n5d });
    setHistoryBtn(cityName);
    localStorage.setItem("cityWeatherData", JSON.stringify(cityWeatherData));
  }
};

/**
 * resetHistory() pulls localStorage city weather data into global storage, BUT only for 
 * cities that were last queried on the current day.  So weather history is only reset
 * per city if the last weather query for the city was dated on the current day.  So history
 * buttons can accumulate throughout the day, but will be cleared the following day.
 */
var resetHistory = function () {
  var storageCityWeatherData = JSON.parse(localStorage.getItem("cityWeatherData"));
  localStorage.clear();
  var filteredCityWeatherData = [];
  if (storageCityWeatherData) {
    for (var i = 0; i < storageCityWeatherData.length; i++) {
      if (storageCityWeatherData[i].currentDate === currentDate) {
        filteredCityWeatherData.push(storageCityWeatherData[i]);
      }
    }
  }
  cityWeatherData = filteredCityWeatherData;
  localStorage.setItem("cityWeatherData", JSON.stringify(cityWeatherData));
  for (var i = 0; i < cityWeatherData.length; i++) {
    console.log(cityWeatherData[i].city);
    setHistoryBtn(cityWeatherData[i].city);
  }
};

/**
 * setHistoryBtn() sets the name (textContent) and location of a button that is created and 
 *   positioned in the historical button list on the left of the page.  Used to retrieve the
 *   previously queried results for a particular city. 
 * @param {string - the city name} city 
 */
var setHistoryBtn = function (city) {
  var listItemEl = document.createElement("li");
  var historyBtnEl = document.createElement("button");
  historyBtnEl.textContent = city;
  historyBtnEl.className = "btn";
  listItemEl.appendChild(historyBtnEl);
  historyBtnListEl.appendChild(listItemEl);
};

/********************
 *                  *
 * STARTER FUNCTION *
 *                  *
 ********************/

/**
 * submitCity() is used with the event listener to retrieve and process data when the
 *   "Search" button is clicked to execute a weather data look-up for the city named in
 *   the form input element. The page is populated with the weather data retrieved. 
 * @param {Object} event 
 */
var submitCity = function (event) {
  // prevent page from refreshing
  event.preventDefault();

  // a silly little city name transformer function to capitalize first char...
  // this was a quick and dirty fix...should be improved
  var capitalizeFirstChar = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // get value from input element...
  // account for history button usage by checking for "Search" text
  if (event.target.textContent.toLowerCase() !== "search") {
    cityName = event.target.textContent;
    inputCityEl.value = cityName;
  } else {
    cityName = capitalizeFirstChar(inputCityEl.value.trim());
  }

  // go get the weather data for the named city
  if (cityName) {
    getCityWeather(cityName)
  } else {
    alert("Please enter a city name for weather data");
  }
};

/**
 * getAPIData() retrieve weather data from the API/URL provided in the parameter.
 *   Note the "async" and "await" keyword used to manage the asynchronousity of the
 *   API call.  
 * @param {Object - contains the API/URL for retrieving weather data} currentWeatherAPI 
 * @returns {JSON object} all the weather data for a particular city
 */
const getAPIData = async (currentWeatherAPI) => {
  const response = await fetch(currentWeatherAPI);
  if (!response.ok) {
    alert('Error: ' + response.statusText);
  }
  const json = await response.json();
  return json;
};

/**
 * assignCurrentDay() assigns the results from the API query to the global currentDay variable
 * @param {weather data query results} weatherData 
 */
var assignCurrentDay = function (weatherData) {
  const date = new Date(weatherData.current.dt * 1000);
  currentDay.city = cityName;
  currentDay.date = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
  currentDay.icon = weatherData.current.weather[0].icon + ".png";
  currentDay.temp = Math.round(((((weatherData.current.temp - 273.15) * (9 / 5) + 32) + Number.EPSILON) * 100) / 100);
  currentDay.wind = weatherData.current.wind_speed;
  currentDay.humidity = weatherData.current.humidity;
  currentDay.UVidx = weatherData.current.uvi;
};

/**
 * assignNext5Days() assigns the results from the API query to the global next5Days variable
 * @param {weather data query results} weatherData 
 */
var assignNext5Days = function (weatherData) {
  for (var i = 0; i < next5Days.length; i++) {
    var date = new Date(weatherData.daily[i + 1].dt * 1000);
    next5Days[i].date = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
    next5Days[i].icon = weatherData.daily[i + 1].weather[0].icon + ".png";
    next5Days[i].temp = Math.round(((((weatherData.daily[i + 1].temp.day - 273.15) * (9 / 5) + 32) + Number.EPSILON) * 100) / 100);
    next5Days[i].wind = weatherData.daily[i + 1].wind_speed;
    next5Days[i].humidity = weatherData.daily[i + 1].humidity;
  }
};

/**
 * getCityWeather() retrieves the city weather data.  First looks up city lat and lon...
 *   then gets all the necessary weather data in the "onecall" call using lat and lon as
 *   parameters
 * @param {String - yea...city name} city 
 * @returns 
 */
const getCityWeather = async function (city) {
  if (foundCityWeatherData(city)) {
    reuseCityWeatherData(city)
    fillInWeatherNow();
    fillInNext5Days();
    return false;
  }

  // Fetch city lat and lon from the current weather api
  var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=58ff076f4d76d50b2538a2f8d97c8d59";
  const latLonJson = await getAPIData(apiUrl);

  var lat = latLonJson.coord.lat;
  var lon = latLonJson.coord.lon;

  // Use lat and lon to retrieve all the weather data needed
  var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly,alerts&appid=58ff076f4d76d50b2538a2f8d97c8d59"
  const weatherDataJson = await getAPIData(apiUrl);

  // Fetch all pertinent weather data for the chosen city
  assignCurrentDay(weatherDataJson);
  assignNext5Days(weatherDataJson);
  fillInWeatherNow();
  fillInNext5Days();
  setHistory();
  return true;
};

/**
 * fillInWeatherNow() copies all the pertinent weather data from the currentDay variable
 *   to the Web page
 */
var fillInWeatherNow = function () {
  var weatherNowEl = document.querySelector("#currentDay");
  var weatherAttrs = weatherNowEl.getElementsByTagName("li");
  for (var i = 0; i < weatherAttrs.length; i++) {
    switch (i) {
      case 0:
        weatherAttrs[i].textContent = currentDay.city + " (" + currentDay.date + ") ";
        weatherAttrs[i].style.fontSize = "x-large";
        weatherAttrs[i].style.fontWeight = "900";
        weatherAttrs[i].style.textTransform = "capitalize";
        var iconUrl = "http://openweathermap.org/img/w/" + currentDay.icon;
        var imgEl = document.createElement("img");
        imgEl.setAttribute("src", iconUrl);
        imgEl.setAttribute("height", "30");
        weatherAttrs[i].appendChild(imgEl);
        break;
      case 1:
        weatherAttrs[i].textContent = "Temp: " + currentDay.temp + "\xB0F.";
        break;
      case 2:
        weatherAttrs[i].textContent = "Wind: " + currentDay.wind + " MPH";
        break;
      case 3:
        weatherAttrs[i].textContent = "Humidity: " + currentDay.humidity + " %";
        break;
      case 4:
        //weatherAttrs[i].textContent = "UV Index: " + currentDay.UVidx;
        weatherAttrs[i].textContent = "UV Index: ";
        var uvEl = document.createElement("p");
        uvEl.style.display = "inline";
        uvEl.style.color = "white";
        if (currentDay.UVidx < 2) {
          uvEl.style.backgroundColor = "green";
        } else if (currentDay.UVidx < 4.5) {
          uvEl.style.backgroundColor = "#ffff00";
          uvEl.style.color = "black";
        } else if (currentDay.UVidx < 8) {
          uvEl.style.backgroundColor = "#ffa500";
          uvEl.style.color = "black";
        } else if (currentDay.UVidx >= 8) {
          uvEl.style.color = "black";
          uvEl.style.backgroundColor = "#ff0000";
        }
        uvEl.textContent = currentDay.UVidx;
        weatherAttrs[i].appendChild(uvEl);
        break;
    }
  }
};

/**
 * removeAllChildNodes() removes all child nodes from parent node...
 *   self-evident I think
 * @param {HTML element} parent 
 */
var removeAllChildNodes = function (parent) {
  if (parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }
};

/**
 * fillInNext5Days() retrieves the weather forecast data from the next5Days variable
 *   and populates the proper elements in the Web page
 */
var fillInNext5Days = function () {
  var weatherNext5DaysEl = document.querySelector("#next5Days");
  var days = weatherNext5DaysEl.getElementsByTagName("li");
  //console.log("filling in forecast");
  for (var i = 0; i < days.length; i++) {
    if (days[i].getElementsByTagName("p")) {
      removeAllChildNodes(days[i]);
    }
    for (var j = 0; j < 5; j++) {
      var weatherAttrEl = document.createElement("p");
      switch (j) {
        case 0:
          weatherAttrEl.textContent = next5Days[i].date;
          weatherAttrEl.style.fontSize = "large";
          weatherAttrEl.style.fontWeight = "700";
          break;
        case 1:
          var iconUrl = "http://openweathermap.org/img/w/" + next5Days[i].icon;
          var imgEl = document.createElement("img");
          imgEl.setAttribute("src", iconUrl);
          imgEl.setAttribute("height", "30");
          weatherAttrEl.appendChild(imgEl);
          break;
        case 2:
          weatherAttrEl.textContent = "Temp: " + next5Days[i].temp + "\xB0F.";
          break;
        case 3:
          weatherAttrEl.textContent = "Wind: " + next5Days[i].wind + " MPH";
          break;
        case 4:
          weatherAttrEl.textContent = "Humidity: " + next5Days[i].humidity + " %";
          break;
      }
      days[i].appendChild(weatherAttrEl);
    }
  }
};

resetHistory();
// "Search" button retrieves city name from the input form
inputCityBtnEl.addEventListener('click', submitCity);
// Historical search buttons use city name in button textContent to re-populate
// the Web page with city weather previously pulled in this session
historyBtnListEl.addEventListener('click', submitCity);
