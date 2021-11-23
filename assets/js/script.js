var cityWeatherData = [];
var cityName = "";
var currentDate = "";
var currentDay = { "city": "", "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": "" };
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

var foundCityWeatherData = function (city) {
  for (var i = 0; i < cityWeatherData.length; i++) {
    if (cityWeatherData[i].city === city) {
      return true;
    }
  }
  return false;
};

var reuseCityWeatherData = function (city) {
  for (var i = 0; i < cityWeatherData.length; i++) {
    if (cityWeatherData[i].city === city) {
      currentDay = cityWeatherData[i].currentDay;
      next5Days = cityWeatherData[i].next5Days;
      break;
    }
  }
};

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

var copyNext5Days = function () {
  var n5d = [
    { "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": "" },
    { "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": "" },
    { "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": "" },
    { "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": "" },
    { "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": "" }
  ];

  for (var i = 0; i < n5d.length; i++) {
    n5d[i] = next5Days[i].date;
    n5d[i] = next5Days[i].icon;
    n5d[i] = next5Days[i].temp;
    n5d[i] = next5Days[i].wind;
    n5d[i] = next5Days[i].humidity;
  }
  return n5d;
};

var setHistory = function () {
  //if not already there...add it in
  if (!foundCityWeatherData(cityName)) {
    cd = copyCurrentDay();
    n5d = copyNext5Days();
    cityWeatherData.push({ "city": cityName, "currentDay": cd, "next5Days": n5d });
    console.log(cityWeatherData);
    setHistoryBtn(cityName);
  }
};

var setHistoryBtn = function (city) {
  var listItemEl = document.createElement("li");
  var historyBtnEl = document.createElement("button");
  historyBtnEl.textContent = city;
  historyBtnEl.className = "btn";
  listItemEl.appendChild(historyBtnEl);
  historyBtnListEl.appendChild(listItemEl);
};

var submitCity = function (event) {
  // prevent page from refreshing
  event.preventDefault();

  // account for history button usage
  if (event.target.textContent.toLowerCase() !== "search") {
    cityName = event.target.textContent;
    inputCityEl.value = cityName;
  } else {
    cityName = inputCityEl.value.trim();
  }

  // get value from input element
  //console.log(cityName);

  if (cityName) {
    if (getCityWeather(cityName)) {
      setHistory();
    }
  } else {
    alert("Please enter a city name for weather data");
  }
};

const getAPIData = async (currentWeatherAPI) => {
  const response = await fetch(currentWeatherAPI);
  if (!response.ok) {
    alert('Error: ' + response.statusText);
  }
  const json = await response.json();
  //console.log(json);
  return await json;
};

var assignCurrentDay = function (weatherData) {
  const date = new Date();
  currentDay.city = cityName;
  currentDay.date = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
  currentDay.icon = weatherData.current.weather[0].icon + ".png";
  currentDay.temp = Math.round(((((weatherData.current.temp - 273.15) * (9 / 5) + 32) + Number.EPSILON) * 100) / 100);
  currentDay.wind = weatherData.current.wind_speed;
  currentDay.humidity = weatherData.current.humidity;
  currentDay.UVidx = weatherData.current.uvi;
  //console.log(currentDay);
};

var assignNext5Days = function (weatherData) {
  for (var i = 0; i < next5Days.length; i++) {
    var date = new Date(weatherData.daily[i].dt * 1000);
    next5Days[i].date = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
    next5Days[i].icon = weatherData.daily[i].weather[0].icon + ".png";
    next5Days[i].temp = Math.round(((((weatherData.daily[i].temp.day - 273.15) * (9 / 5) + 32) + Number.EPSILON) * 100) / 100);
    next5Days[i].wind = weatherData.daily[i].wind_speed;
    next5Days[i].humidity = weatherData.daily[i].humidity;
  }
  //console.log(next5Days);
};

const getCityWeather = async function (cityName) {

  if (foundCityWeatherData(cityName)) {
    reuseCityWeatherData(cityName)
    fillInWeatherNow();
    fillInNext5Days();
    return false;
  }

  var apiUrl = "http://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=58ff076f4d76d50b2538a2f8d97c8d59";
  var latLonJson = await getAPIData(apiUrl);

  // Fetch city lat and lon from the current weather api
  var lat = latLonJson.coord.lat;
  var lon = latLonJson.coord.lon;

  var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly,alerts&appid=58ff076f4d76d50b2538a2f8d97c8d59"
  var weatherDataJson = await getAPIData(apiUrl);

  // Fetch all pertinent weather data for the chosen city
  //console.log(JSON.stringify(weatherDataJson));
  assignCurrentDay(weatherDataJson);
  assignNext5Days(weatherDataJson);
  fillInWeatherNow();
  fillInNext5Days();
  return true;
};

var fillInWeatherNow = function () {
  var weatherNowEl = document.querySelector("#currentDay");
  var weatherAttrs = weatherNowEl.getElementsByTagName("li");
  //console.log("filling in weather");
  //console.log(currentDay);
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
        weatherAttrs[i].textContent = "UV Index: " + currentDay.UVidx;
        break;
    }
  }
};

var removeAllChildNodes = function (parent) {
  //console.log("START OF removeAllChildNodes()");
  if (parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }
  //console.log("END OF removeAllChildNodes()");
};


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
    //console.log(days[i]);
  }
};

inputCityBtnEl.addEventListener('click', submitCity);
//document.querySelectorAll("#history-buttons").forEach(item => {
//  item.addEventListener("click", submitCity);
//});
historyBtnListEl.addEventListener('click', submitCity);
