var cityName = "";
var currentDate = "";
var currentDay = {"city": "", "date": "", "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": ""};
var next5Days = [
  {"date": "",  "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": ""},
  {"date": "",  "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": ""},
  {"date": "",  "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": ""},
  {"date": "",  "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": ""},
  {"date": "",  "icon": "", "temp": "", "wind": "", "humidity": "", "UVidx": ""}
];
var inputCityEl = document.querySelector("#city-input")
var inputCityBtnEl = document.querySelector("#search-button")

var submitCity = function (event) {
  // prevent page from refreshing
  event.preventDefault();

  // get value from input element
  console.log(inputCityEl.value.trim());
  cityName = inputCityEl.value.trim();

  if (cityName) {
    getCityWeather(cityName);

    // clear old content
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
  console.log(json);
  return await json;
};

var assignCurrentDay = function (weatherData) {
  const date = new Date();
  currentDay.city = cityName;
  currentDay.date = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() ;
  currentDay.icon = weatherData.current.weather[0].icon + ".png";
  currentDay.temp = Math.round(((((weatherData.current.temp - 273.15) * (9/5) + 32) + Number.EPSILON) * 100) / 100);
  currentDay.wind = weatherData.current.wind_speed;
  currentDay.humidity = weatherData.current.humidity;
  currentDay.UVidx = weatherData.current.uvi;
  console.log(currentDay);
};

var assignNext5Days = function(weatherData) {
  for (var i = 0; i < next5Days.length; i++) {
    var date = new Date(weatherData.daily[i].dt * 1000);
    next5Days[i].date = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
    next5Days[i].icon = weatherData.daily[i].weather[0].icon;
    next5Days[i].temp = Math.round(((((weatherData.daily[i].temp.day - 273.15) * (9/5) + 32) + Number.EPSILON) * 100) / 100);
    next5Days[i].wind = weatherData.daily[i].wind_speed;
    next5Days[i].humidity = weatherData.daily[i].humidity;
  }
  console.log(next5Days);
};

var getCityWeather = async function (cityName) {
  var apiUrl = "http://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=58ff076f4d76d50b2538a2f8d97c8d59";
  var latLonJson = await getAPIData(apiUrl);

  // Fetch city lat and lon from the current weather api
  var lat = latLonJson.coord.lat;
  var lon = latLonJson.coord.lon;

  // Get all weather data from the onecallAPI
  apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=28.5383&lon=-81.379&exclude=minutely,hourly,alerts&appid=58ff076f4d76d50b2538a2f8d97c8d59";
  weatherDataJson = await getAPIData(apiUrl);
  
  // Fetch all pertinent weather data for the chosen city
  console.log(JSON.stringify(weatherDataJson));
  assignCurrentDay(weatherDataJson);
  assignNext5Days(weatherDataJson);
  fillInWeatherNow();
};

var fillInWeatherNow = function () {
  var weatherNowEl = document.querySelector("#currentDay");
  var weatherAttrs = weatherNowEl.getElementsByTagName("li");
  console.log("filling in weather");
  console.log(currentDay);
  for (var i = 0; i < weatherAttrs.length; i++) {
    switch(i) {
      case 0:
        weatherAttrs[i].textContent = currentDay.city + " (" + currentDay.date + ") ";
        var iconUrl = "http://openweathermap.org/img/w/" + currentDay.icon + ".png";
        var imgEl = document.createElement("img");
        imgEl.setAttribute("src", iconUrl);
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
}

inputCityBtnEl.addEventListener('click', submitCity);

