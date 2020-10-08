//NEEDS
// 1. text box to add a city
// 2. list of previous cities requested
let cityList = []
//      a. way to keep most recent between pages
let lastCity = 0
if (localStorage.getItem("cityStorage")) {
    //Parse stored array
    cityList = JSON.parse(localStorage.getItem("cityStorage"))
    //Display stored cities
    popList()
    //Pull last city used from storage, too
    if (localStorage.getItem("lastCity")) {
        lastCity = parseInt(localStorage.getItem("lastCity"))
    }
    //Display weather for last city, or for index 0 if last index didn't save somehow
    displayWeather(lastCity)
}
//      b. way to remove a city
// 3. current weather data for active city from list
//      a. handling for if the city wasn't found?

//TASKS
// I. Accept city from text input
//   a. check if valid city (test query OW?)

//click listener for search button
$("#searchBtn").on("click", function (event) {
    event.preventDefault();
    //take text from search box
    let newCity = $("#searchText").val()
    // console.log(newCity)
    //check there was new text
    if (newCity == "") {
        return false
    }
    // send new text in a "Current Weather" query to OW and check if it's a valid city.
    $.ajax({
            url: "https://api.openweathermap.org/data/2.5/weather?q=" + newCity + "&appid=197e1ec7af271c40c8f36f27ca2585b9",
            method: "GET"
        })
        .fail(function () {
            alert("City not found. Please verify spelling and try again.")
        })
        .then(function (response) {
            console.log(response)
            let newResult = {}
            newResult.name = response.name
            newResult.lat = response.coord.lat
            newResult.lon = response.coord.lon
            cityList.push(newResult)
            localStorage.setItem("cityStorage", JSON.stringify(cityList))
            lastCity = cityList.length - 1
            localStorage.setItem("lastCity", lastCity)
            popList()
            displayWeather(lastCity)
        })
})
//https://api.openweathermap.org/data/2.5/weather?q="+ city + "&appid=197e1ec7af271c40c8f36f27ca2585b9
//   b. store all cities requested
// II. Display list of all cities used
function popList() {
    let sidebar = $("#cityBar")
    //populate sidebar list of cities
    for (i = 0; i < cityList.length - 1; i++) {
        let next = $("<a>").text(cityList[i].name);
        next.addClass("list-group-item list-group-item-action bg-light city-btn");
        next.attr("data-index", i)
        next.attr("href", "#")
        sidebar.append(next)
    }
}

//listener for clicks in city list
$(".city-btn").on("click", function () {
    //update active and stored variables for index
    lastCity = this.attr("data-index");
    localStorage.setItem("lastCity", lastCity)
    //call function to display weather in city
    displayWeather(lastCity)
})

//   c. Make current visibly different, store most recent used in storage too
// III. Display current weather on city click
function displayWeather(index) {
    //call OW for current and future weather in city of index
    let city = cityList[index]
    $.ajax({
            url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + city.lat + "&lon=" + city.lon + "&exclude=minutely,hourly&appid=197e1ec7af271c40c8f36f27ca2585b9",
            method: "GET"
        })
        .fail(function () {
            alert("City not found. Please verify spelling and try again.")
        })
        .then(function (response) {
            console.log(response)

        })
}
//   a. query OW for current data
//   b. parse and display: Temp in F, humidity, wind, UV index(, AQI?)
// IV. Display 5-day forecast
//   a. query OW for 5-day
//   b. display on cards
//      (check documentation, they may have a widget already for this)