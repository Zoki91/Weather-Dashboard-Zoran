//API Key from OpenWeatherTeam.
const apiKey = "a2b00ae197d50ecfce106ec9f82fbb26";

//Today's current Time and Date at City.
const today = moment().format('LLL');

//List of Searched Cities.
const listHistorySearch = [];

// The function for the weather currently condition.
function weatherCurrently(city) {

  const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

  $.ajax({
    url: apiURL,
    method: "GET"
  }).then(function (weatherInCityResponse) {
    console.log(weatherInCityResponse);

    $("#weatherContent").css("display", "block");
    $("#detailofCity").empty();

    const iconCode = weatherInCityResponse.weather[0].icon;
    const iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;

    let currentCity = $(`
        <h2 id="currentCity">
            ${weatherInCityResponse.name} ${today} <img src="${iconURL}" alt="${weatherInCityResponse.weather[0].description}" />
        </h2>
        <p>Temperature: ${weatherInCityResponse.main.temp} °F</p>
        <p>Humidity: ${weatherInCityResponse.main.humidity}\%</p>
        <p>Wind Speed: ${weatherInCityResponse.wind.speed} MPH</p>
    `);

    $("#detailofCity").append(currentCity);

    // This displays the current UV Index of City.
    let lat = weatherInCityResponse.coord.lat;
    let lon = weatherInCityResponse.coord.lon;
    let uvIndexURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    $.ajax({
      url: uvIndexURL,
      method: "GET"
    }).then(function (uvIndexRes) {
      console.log(uvIndexRes);

      const uvIndex = uvIndexRes.value;
      const uvIndexP = $(`
            <p>UV Index: 
                <span id="indexUvColour" class="px-2 py-2 rounded">${uvIndex}</span>
            </p>
        `);

      $("#detailofCity").append(uvIndexP);

      forcastFiveCondition(lat, lon);

      // This catergorises the colours based on the UV Index.
      if (uvIndex >= 0 && uvIndex <= 2) {
        $("#indexUvColour").css("background-color", "#3EA72D").css("color", "white");
      } else if (uvIndex >= 3 && uvIndex <= 5) {
        $("#indexUvColour").css("background-color", "#FFF300");
      } else if (uvIndex >= 6 && uvIndex <= 7) {
        $("#indexUvColour").css("background-color", "#F18B00");
      } else if (uvIndex >= 8 && uvIndex <= 10) {
        $("#indexUvColour").css("background-color", "#E53210").css("color", "white");
      } else {
        $("#indexUvColour").css("background-color", "#B567A4").css("color", "white");
      };
    });
  });
}

// This function is for the Five Day forcast Condition
function forcastFiveCondition(lat, lon) {

  // THEN I am presented with a 5-day forecast
  var futureURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;

  $.ajax({
    url: futureURL,
    method: "GET"
  }).then(function (fiveDayResponse) {
    console.log(fiveDayResponse);
    $("#fiveDayForcast").empty();

    for (let i = 2; i < 7; i++) {
      const cityInfo = {
        date: fiveDayResponse.daily[i].dt,
        icon: fiveDayResponse.daily[i].weather[0].icon,
        temp: fiveDayResponse.daily[i].temp.day,
        humidity: fiveDayResponse.daily[i].humidity
      };

      const currDate = moment.unix(cityInfo.date).format("MM/DD/YYYY");
      const iconURL = `<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png" alt="${fiveDayResponse.daily[i].weather[0].main}" />`;

      // This is where we append all of the information into.
      const showWeatherCard = $(`
            <div class="pl-3">
                <div class="card pl-3 pt-3 mb-3 bg-primary text-light" style="width: 12rem;>
                    <div class="card-body">
                        <h5>${currDate}</h5>
                        <p>${iconURL}</p>
                        <p>Temp: ${cityInfo.temp} °F</p>
                        <p>Humidity: ${cityInfo.humidity}\%</p>
                    </div>
                </div>
            <div>
        `);

      $("#fiveDayForcast").append(showWeatherCard);
    }
  });
}


$("#searchBtn").on("click", function (event) {
  event.preventDefault();

  let city = $("#enterCity").val().trim();
  weatherCurrently(city);
  if (!listHistorySearch.includes(city)) {
    listHistorySearch.push(city);
    var citySearchedList = $(`
        <li class="list-group-item">${city}</li>
        `);
    $("#searchHistory").append(citySearchedList);
  };

  localStorage.setItem("city", JSON.stringify(citySearchedList));
  console.log(citySearchedList);
});


$(document).on("click", ".list-group-item", function () {
  const listCity = $(this).text();
  weatherCurrently(listCity);
});

// This saves the last searched Cities.
$(document).ready(function () {
  let searchHistoryArr = JSON.parse(localStorage.getItem("city"));

  if (searchHistoryArr !== null) {
    weatherCurrently(lastcitySearchedList);
    console.log(`Last searched city: ${lastcitySearchedList}`);
  }
});