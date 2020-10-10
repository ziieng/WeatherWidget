// Declare global variables for city array and active index
let cityList = []
let lastCity = 0
// Populate cityList with list from localStorage
if (localStorage.getItem("cityStorage")) {
    // parse stored array
    cityList = JSON.parse(localStorage.getItem("cityStorage"))
    // display stored cities
    popList()
    // pull last city used from storage, if saved
    if (localStorage.getItem("lastCity")) {
        lastCity = parseInt(localStorage.getItem("lastCity"))
    }
    // display weather for last city, or for index 0 if last index isn't saved
    displayWeather(lastCity)
}

// Create listener for clicks in city list sidebar
// because buttons are destroyed and remade, listener has to go on document
$(document).on("click", ".city-btn", function () {
    // reset format of previously active button (added in displayWeather)
    $(".city-btn[data-index='" + lastCity + "']").removeClass("bg-primary text-white")
    $(".city-btn[data-index='" + lastCity + "']").addClass("bg-light")
    // update active and stored variables for index
    lastCity = $(this).attr("data-index");
    localStorage.setItem("lastCity", lastCity)
    //call function to display weather in city
    displayWeather(lastCity)
})

//Create click listener for search button - function inside to validate input and add to cityList
$("#searchBtn").on("click", function (event) {
    event.preventDefault();
    // pull text from search box
    let newCity = $("#searchText").val()
    // check it isn't blank - abort if it is
    if (newCity == "") {
        return false
    }
    // send new text in a "Current Weather" query to OW and check if it's a valid city.
    // this method means user can also put in city ID#'s, but it won't break anything if they do.
    $.ajax({
            url: "https://api.openweathermap.org/data/2.5/weather?q=" + newCity + "&appid=197e1ec7af271c40c8f36f27ca2585b9",
            method: "GET"
        })
        // error handling:
        .fail(function () {
            alert("City not found. Please verify spelling and try again.")
        })
        // on success:
        .then(function (response) {
            // create new object for city
            let newResult = {}
            // store name as given by OW - fixes any case problems or ID#s given by user
            newResult.name = response.name
            // store city ID#
            newResult.id = response.id
            // check if matching city ID# already in cityList
            if (cityList.filter(e => e.id === newResult.id).length > 0) {
                //tell user matching city ID# found
                alert("City already in list.")
                //empty input box
                $("#searchText").val("")
                //abort function
                return false
            }
            // empty input box
            $("#searchText").val("")
            // save city coordinates for displayWeather's AJAX query
            newResult.lat = response.coord.lat
            newResult.lon = response.coord.lon
            // add new city obect to cityList and save updated cityList to localStorage
            cityList.push(newResult)
            localStorage.setItem("cityStorage", JSON.stringify(cityList))
            // update active index and save updated index to localStorage
            lastCity = cityList.length - 1
            localStorage.setItem("lastCity", lastCity)
            // call function to populate city buttons
            popList()
            // call function to display weather in new city
            displayWeather(lastCity)
        })
})
// Display list of all cities used
function popList() {
    let sidebar = $("#cityBar")
    // clear old list
    sidebar.html("")
    // populate sidebar list of cities by loop
    for (i = 0; i < cityList.length; i++) {
        // create HTML object with city name and classes
        let next = $("<a>").text(cityList[i].name);
        next.addClass("list-group-item list-group-item-action bg-light city-btn");
        // note index in attributes
        next.attr("data-index", i)
        // add dead-end link to make animations work
        next.attr("href", "#")
        // append to city list on page
        sidebar.append(next)
    }
}
// Function to display weather information for active city
function displayWeather(index) {
    //clear existing weather for current and forecast
    $("#curStatus").html('<h2 id="cityName"></h2>')
    $("#foreDeck").html('')
    // set active formatting for active city's button
    $(".city-btn[data-index='" + index + "']").addClass("bg-primary text-white")
    $(".city-btn[data-index='" + index + "']").removeClass("bg-light")
    //call OW for current and future weather in city of index
    let city = cityList[index]
    $.ajax({
            url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + city.lat + "&lon=" + city.lon + "&exclude=minutely,hourly&units=imperial&appid=197e1ec7af271c40c8f36f27ca2585b9",
            method: "GET"
        })
        // error handling:
        .fail(function () {
            alert("Something went wrong; try again.")
        })
        // on success:
        .then(function (response) {
            let result = response;
            // update city name
            $("#cityName").html(city.name + ' <span class="h3" id="curDate"></span> <img id="curIcon" />');
            // add current date
            $("#curDate").text("(" + Intl.DateTimeFormat(navigator.language).format(result.current.dt * 1000) + ")")
            // add status icon indicated by API response
            $("#curIcon").attr("src", "http://openweathermap.org/img/wn/" + result.current.weather[0].icon + "@2x.png")
            $("#curIcon").attr("alt", result.current.weather[0].description)
            // add current temperature, API already gives it in Fahrenheit
            let temp = $("<p>").text("Temperature: " + result.current.temp + "\xB0F")
            $("#curStatus").append(temp)
            // add current humidity
            let humd = $("<p>").text("Humidity: " + result.current.humidity + "%")
            $("#curStatus").append(humd)
            // add current wind speed, API already gives in MPH
            let wind = $("<p>").text("Wind Speed: " + result.current.wind_speed + " MPH")
            $("#curStatus").append(wind)
            // add current UV Index
            let uvi = parseFloat(result.current.uvi)
            let uv = $("<p>").html('UV Index: <span id="uvInd">' + uvi + '</span>')
            $("#curStatus").append(uv)
            // add color coding for UV Index, based on https://wp02-media.cdn.ihealthspot.com/wp-content/uploads/sites/200/2018/08/03014643/UV-Index.png
            if (uvi < 3) {
                $("#uvInd").addClass("badge badge-success")
            } else if (uvi < 8) {
                $("#uvInd").addClass("badge badge-warning")
            } else if (uvi >= 8) {
                $("#uvInd").addClass("badge badge-danger")
            }

//!!!!
//Start five-day section
//!!!!

// Make body visible
        $("#fiveDay").removeClass("invisible")
        // Add 5 cards to #foreDeck using API response's daily forecast section
        for (i = 1; i < 6; i++) {
            // create card HTML objects
            let newCard = $("<div>").addClass("card text-white bg-primary mb-3 mx-1 float-left forecast")
            let newBody = $("<div>").addClass("card-body")
            let newTitle = $("<h5>").addClass("card-title")
            // format date for index's day, add to card
            newTitle.text(Intl.DateTimeFormat(navigator.language).format(result.daily[i].dt * 1000))
            newBody.append(newTitle)
            // add status icon indicated by API
            let newIcon = $("<img>").addClass("foreIcon")
            newIcon.attr("src", "https://openweathermap.org/img/wn/" + result.daily[i].weather[0].icon + "@2x.png")
            $("#curIcon").attr("alt", result.daily[i].weather[0].description)
            newBody.append(newIcon)
            // add max temp forecast for day
            let newHi = $("<p>").addClass("card-text mb-0 mt-2")
            newHi.text("High: " + result.daily[i].temp.max + "\xB0F")
            newBody.append(newHi)
            // add min temp forecast for day
            let newLo = $("<p>").addClass("card-text my-0")
            newLo.text("Low: " + result.daily[i].temp.min + "\xB0F")
            newBody.append(newLo)
            // add humidity forecast for day
            let newHum = $("<p>").addClass("card-text")
            newHum.text("Humidity: " + result.daily[i].humidity + "%")
            newBody.append(newHum)
            // add completed body object to card
            newCard.append(newBody)
            // add card to page
            $("#foreDeck").append(newCard)
        }
        })
}