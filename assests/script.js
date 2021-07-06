var city = "";
var citySearch = $("#city-search");
var searchBtn = $("#search-button");
var clearBtn = $("#clear-history");
var currentCity = $("#curr-city");
var currentTemp = $("#temp");
var currentHumidty = $("#humid");
var currentWindSpd = $("#wind-spd");
var currentUV = $("#uv-ind");
var searchHistory = [];
var apiKey = "286873ff341dff6af85b7d4328e31106";

function find(c) {
    for (var i = 0; i < searchHistory.length; i++) {
        if (c.toUpperCase() === searchHistory[i]) {
            return -1;
        }
    }
    return 1;
}

function getWeather(e) {
    e.preventDefault();
    if (citySearch.val().trim() !== "") {
        cityName = citySearch.val().trim();
        currentWeather(cityName);
    }
}

function currentWeather(cityName) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apiKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    })
        .then(function (res) {
            console.log(res);

            //var results = res.data;
            var icon = res.weather[0].icon;
            var iconURL="https://openweathermap.org/img/wn/"+icon+"@2x.png";

            var date = new Date(res.dt * 1000).toLocaleDateString();
            $(currentCity).html(res.name +"("+date+")" + "<img src="+iconURL+">");

            var tempDegF = (res.main.temp - 273.15) * 1.80 + 32;
            $(currentTemp).html((tempDegF).toFixed(2) + "&#8457");
            $(currentHumidty).html(res.main.humidity + "%");
            var wsMPH = (res.wind.speed * 2.237).toFixed(1);
            $(currentWindSpd).html(wsMPH + "MPH");

            getUV(res.coord.lon, res.coord.lat);
            fiveDay(res.id);

            if (res.cod == 200) {
                searchHistory = JSON.parse(localStorage.getItem("cityname"));
                console.log(searchHistory);
                if (searchHistory == null) {
                    searchHistory = [];
                    searchHistory.push(cityName.toUpperCase()
                    );
                    localStorage.setItem("cityname", JSON.stringify(searchHistory));
                    addList(cityName);
                }
                else {
                    if (find(cityName) > 0) {
                        searchHistory.push(cityName.toUpperCase());
                        localStorage.setItem("cityname", JSON.stringify(searchHistory));
                        addList(cityName);
                    }
                }
            }






        });
}

function getUV(ln, lt) {
    var uvURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lt + "&lon=" + ln + "&appid=" + apiKey;
    $.ajax({
        url: uvURL,
        method: "GET"
    })
        .then(function (res) {
            console.log(res);
            $(currentUV).html(res.current.uvi);

        });
}

function fiveDay(cityID) {

    var fivedayURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + apiKey;

    $.ajax({
        url: fivedayURL,
        method: "GET"
    })
        .then(function (res) {
            console.log(res);

            for (i = 0; i < 5; i++) {
                var date = new Date((res.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
                var icon = res.list[((i + 1) * 8) - 1].weather[0].icon;
                var iconUrl = "https://openweathermap.org/img/wn/"+icon+".png";
                var tempK = res.list[((i + 1) * 8) - 1].main.temp;
                var tempFar = (((tempK - 273.5) * 1.80) + 32).toFixed(2);
                var humdiTY = res.list[((i + 1) * 8) - 1].main.humidity;

                $("#date" + i).html(date);
                $("#img" + i).html("<img src="+iconUrl+">");
                $("#temp" + i).html(tempFar + "&#8457");
                $("#humid" + i).html(humdiTY + "%");


            }
        });


}
function addList(c) {
    var listItem = $("<li>" + c.toUpperCase() + "</li>");
    $(listItem).attr("class", "list-group-item");
    $(listItem).attr("data-value", c.toUpperCase());
    $(".list-group").append(listItem)
}

function pastSearch(e) {
    var liItem = e.target;
    if (e.target.matches("li")) {
        cityName = liItem.textContent.trim();
        currentWeather(cityName);
    }
}

function lastCity() {
    $("ul").empty();
    var searchHistory = JSON.parse(localStorage.getItem("cityname"));
    if (searchHistory !== null) {
        searchHistory = JSON.parse(localStorage.getItem("cityname"));
        for (i = 0; i < searchHistory.length; i++) {
            addList(searchHistory[i]);
        }
        cityName = searchHistory[i - 1];
        currentWeather(cityName);
    }

}
//Clear the search history from the page
function clearHistory(e) {
    e.preventDefault();
    searchHistory = [];
    localStorage.removeItem("cityname");
    document.location.reload();

}
//Click Handlers
$("#search-button").on("click", getWeather);
$(document).on("click", pastSearch);
$(window).on("load", lastCity);
$("#clear-history").on("click", clearHistory);



