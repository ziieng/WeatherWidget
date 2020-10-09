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
            newResult.id = response.id
            if (cityList.filter(e => e.id === newResult.id).length > 0) {
                alert("City already in list.")
                $("#searchText").val("")
                return false
            }
            $("#searchText").val()
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
// II. Display list of all cities used
function popList() {
    let sidebar = $("#cityBar")
    //clear old list
    sidebar.html("")
    //populate sidebar list of cities
    for (i = 0; i < cityList.length; i++) {
        let next = $("<a>").text(cityList[i].name);
        next.addClass("list-group-item list-group-item-action bg-light city-btn");
        next.attr("data-index", i)
        next.attr("href", "#")
        sidebar.append(next)
    }
}
    //listener for clicks in city list
$(document).on("click", ".city-btn", function () {
    $(".city-btn[data-index='" + lastCity + "']").removeClass("bg-primary text-white")
    $(".city-btn[data-index='" + lastCity + "']").addClass("bg-light")
    //update active and stored variables for index
    lastCity = $(this).attr("data-index");
    $(".city-btn[data-index='" + lastCity + "']").addClass("bg-primary text-white")
    $(".city-btn[data-index='" + lastCity + "']").removeClass("bg-light")
    localStorage.setItem("lastCity", lastCity)
    //call function to display weather in city
    displayWeather(lastCity)
})
// III. Display current weather on city click
function displayWeather(index) {
    //clear existing weather 
    $("#curStatus").html('<h2 id="cityName"></h2>')
    $("#foreDeck").html('')
    //call OW for current and future weather in city of index
    let city = cityList[index]
    $.ajax({
            url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + city.lat + "&lon=" + city.lon + "&exclude=minutely,hourly&units=imperial&appid=197e1ec7af271c40c8f36f27ca2585b9",
            method: "GET"
        })
        .fail(function () {
            alert("Something went wrong; try again.")
        })
        .then(function (response) {
            let result = response;
            console.log(result)
            //Make body visible
            $("#curStatus").removeClass("invisible")
            //Update city name
            $("#cityName").html(city.name + ' <span class="h3" id="curDate"></span> <img id="curIcon" />');
            //Add current date
            $("#curDate").text("(" + Intl.DateTimeFormat(navigator.language).format(result.current.dt * 1000) + ")")
            //Add status icon indicated by API
            $("#curIcon").attr("src", "http://openweathermap.org/img/wn/" + result.current.weather[0].icon + "@2x.png")
            $("#curIcon").attr("alt", result.current.weather[0].description)
            //Add current temperature, in Fahrenheit
            let temp = $("<p>").text("Temperature: " + result.current.temp + "\xB0F")
            $("#curStatus").append(temp)
            //Add current humidity
            let humd = $("<p>").text("Humidity: " + result.current.humidity + "%")
            $("#curStatus").append(humd)
            //Add current wind speed
            let wind = $("<p>").text("Wind Speed: " + result.current.wind_speed + " MPH")
            $("#curStatus").append(wind)
            //Add current UV Index, color coded
            let uvi = parseFloat(result.current.uvi)
            let uv = $("<p>").html('UV Index: <span id="uvInd">' + uvi + '</span>')
            $("#curStatus").append(uv)
            if (uvi < 3) {
                $("#uvInd").addClass("badge badge-success")
            } else if (uvi < 8) {
                $("#uvInd").addClass("badge badge-warning")
            } else if (uvi >= 8) {
                $("#uvInd").addClass("badge badge-danger")
            }
        //Five-day section
        //Make body visible
        $("#fiveDay").removeClass("invisible")
        //Add cards to #foreDeck
        for (i = 0; i < 5; i++) {
            let newCard = $("<div>").addClass("card text-white bg-primary mb-3 forecast")
            let newBody = $("<div>").addClass("card-body")
            let newTitle = $("<h5>").addClass("card-title")
            newTitle.text(Intl.DateTimeFormat(navigator.language).format(result.daily[i].dt * 1000))
            newBody.append(newTitle)
            //Add status icon indicated by API
            let newIcon = $("<img>").addClass("foreIcon")
            newIcon.attr("src", "http://openweathermap.org/img/wn/" + result.daily[i].weather[0].icon + "@2x.png")
            $("#curIcon").attr("alt", result.daily[i].weather[0].description)
            newBody.append(newIcon)
            let newHi = $("<p>").addClass("card-text mb-0 mt-2")
            newHi.text("Hi: " + result.daily[i].temp.max + "\xB0F")
            newBody.append(newHi)
            let newLo = $("<p>").addClass("card-text my-0")
            newLo.text("Lo: " + result.daily[i].temp.min + "\xB0F")
            newBody.append(newLo)
            let newHum = $("<p>").addClass("card-text")
            newHum.text("Humidity: " + result.daily[i].humidity + "%")
            newBody.append(newHum)
            newCard.append(newBody)
            $("#foreDeck").append(newCard)
        }
        // <div class="card text-white bg-info mb-3" style="max-width: 15rem;">
        //     <div class="card-body">
        //         <h5 class="card-title">Info card title</h5>
        //         <p class="card-text">Some quick example text to build on the card title and make up the bulk of the
        //             card's content.</p>
        //     </div>
        // </div>
        })
}
//   a. query OW for current data
//   b. parse and display: Temp in F, humidity, wind, UV index(, AQI?)
// IV. Display 5-day forecast
//   a. query OW for 5-day
//   b. display on cards
//      (check documentation, they may have a widget already for this)