const API_KEY = "99db4dd82955f38c755b19059d52f6a0";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?&units=metric&q=";
const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");



//here we have used a metric unit instead of standard default unit used
//this metric unit give the temperature in celsius

async function getForecast(cityName) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}`
    );
    const data = await response.json();

    // Optionally, get air quality data (fake value here)
    const aqiText = "Good";

    // Empty previous cards
    weatherCardsDiv.innerHTML = "";

    data.list.forEach((weatherItem, index) => {
        // Pick one entry per day (every 8th item for 3-hour intervals = 1 day)
        if (index % 8 === 0) {
            const cardHTML = createWeatherCard(cityName, weatherItem, index, aqiText);
            weatherCardsDiv.insertAdjacentHTML("beforeend", cardHTML);
        }
    });
}

async function checkWeather(city){
    const response = await fetch(apiUrl + city + `&appid=${API_KEY}`);
    await getForecast(city); // Add this line to fetch 5-day forecast

    if(response.status == 404){
        alert("Invalid City Name");
        document.querySelector(".error").style.display="block";
        document.querySelector(".weather").style.display="none";
    }else{
        var data = await response.json();

        // console.log(data);
        //NOW we are changing the inner HTML of the display using the API
        document.querySelector(".city").innerHTML=data.name;
        document.querySelector(".temp").innerHTML=Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML=data.main.humidity + "%";
        document.querySelector(".wind").innerHTML=data.wind.speed + "km/hr";
    
        if(data.weather[0].main === "Clouds"){
            weatherIcon.src = "images/clouds.png";
        }
        else if(data.weather[0].main === "Clear"){
            weatherIcon.src = "images/clear.png";
        }
        else if(data.weather[0].main === "Rain"){
            weatherIcon.src = "images/rain.png";
        }
        else if(data.weather[0].main === "Drizzle"){
            weatherIcon.src = "images/drizzle.png";
        }
        else if(data.weather[0].main === "Mist"){
            weatherIcon.src = "images/mist.png";
        }
    
        document.querySelector(".weather").style.display = "block"
        document.querySelector(".error").style.display = "none"
    }

    
}
searchBtn.addEventListener("click" , ()=>{
    checkWeather(searchBox.value);
})


// JavaScript file for the Weather Application 
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const weatherCardsDiv = document.querySelector(".weather-cards");
const currentWeatherDiv = document.querySelector(".current-weather");

locationButton.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
        const data = await response.json();
        checkWeather(data.name);
    });
});


// Function to create weather card HTML
const createWeatherCard = (cityName, weatherItem, index,aqiText) => {
    const tempCelsius = (weatherItem.main.temp - 273.15).toFixed(2);
    const weatherIcon = `https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png`;
    
    if (index === 0) {  // Main weather card
        return `
            <div class="card">
                <h2>${cityName}</h2>
                <h5>(${weatherItem.dt_txt.split(" ")[0]})</h5> 
                <img src="${weatherIcon}" alt="weather-icon">
                <h4>Temperature: ${tempCelsius}°C</h4>
                <h5>Wind Speed: ${weatherItem.wind.speed} M/s</h5>
                <h5>Humidity: ${weatherItem.main.humidity} %</h5>
                <h5>Air Quality: ${aqiText}</h5>
            </div>
            
            `;
    } else { // Forecast cards
        return `
            <li class="card">
                <h3>${cityName} </h3>
                 <h5>(${weatherItem.dt_txt.split(" ")[0]})</h5>
                <img src="${weatherIcon}" alt="weather-icon">
                
                <h4>Temperature: ${tempCelsius}°C</h4>
                <h5>Wind Speed: ${weatherItem.wind.speed} M/s</h5>
                <h5>Humidity: ${weatherItem.main.humidity} %</h5>
                <h5>Air Quality: ${aqiText}</h5>
            </li>`;
    }
};

// Function to get air quality index
const getAirQuality = (lat, lon) => {
    const AQI_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    
    return fetch(AQI_API_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            const aqi = data.list[0].main.aqi; // Get AQI value
            const aqiDescription = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
            const aqiText = aqiDescription[aqi - 1] || "Unknown";
            return aqiText;
           // currentWeatherDiv.insertAdjacentHTML("beforeend", `<h4>Air Quality: ${aqiText}</h4>`);
        })
        .catch(error => {
            console.error("Error fetching air quality data:", error);
            return "Unavailable";
        });
};

// Function to get weather details based on city coordinates
const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    console.log("Fetching weather data from:", WEATHER_API_URL);
    
    fetch(WEATHER_API_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Weather Data:", data); // Log the entire data object for debugging
            
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            // Clear previous data
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            // Create weather cards
            return getAirQuality(lat, lon)
            .then(aqiText => {
            fiveDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index,aqiText));
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index,aqiText));
                }
            });

            // Log lat and lon before updating the map
            console.log(`Updating map to: Latitude: ${lat}, Longitude: ${lon}`);
            updateMap(lat, lon);  // Ensure this is called after the weather cards are generated
            // Call the air quality function
           // Fetch AQI data
        });
    })
        .catch(error => {
            console.error("Error fetching weather forecast:", error);
            alert("An error occurred while fetching the weather forecast: " + error.message);
        });
};

// Function to get city coordinates
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    fetch(GEOCODING_API_URL)
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
        }
        return res.json();
    })
    .then(data => {
        console.log("Geocoding Data:", data); // Log the geocoding data
        if (!data || data.length === 0) {
            throw new Error("No weather data available for this location.");
        }

        const { lat, lon } = data[0];
        getWeatherDetails(cityName, lat, lon); // Call the weather details function
    })
    .catch(error => {
        console.error("Error fetching city coordinates:", error);
        alert("An error occurred while fetching city coordinates: " + error.message);
    });
};


// Function to get user's current coordinates
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            
            fetch(REVERSE_GEOCODING_URL)
                .then(res => res.json())
                .then(data => {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => alert("An error occurred while fetching the city!"));
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please allow location access.");
            }
        }
    );
};

// Event listeners
searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());

// Windy API setup
const options = {
    key: 'H3MzWInDcItupZcD6PvvOdQ92hG6mNKw', // Replace with your Windy API key
    lat: 19.0760, // Default latitude for Mumbai
    lon: 72.8777, // Default longitude for Mumbai
    zoom: 10,
};

let windyAPI;

// Initialize the Windy map
windyInit(options, (api) => {
    windyAPI = api;
});

// Function to update the Windy map with new coordinates
const updateMap = (lat, lon) => {
    console.log(`Updating map to: Latitude: ${lat}, Longitude: ${lon}`); // Log coordinates
    if (windyAPI) {
        // Check if the windyAPI has a method to set the view
        if (typeof windyAPI.map.setView === 'function') {
            windyAPI.map.setView([lat, lon], 12); // Update map view with zoom level
        } else {
            console.error("setView method not available on windyAPI.map");
        }
    } else {
        console.error("Windy API not initialized.");
    }
};



const darkModeToggle = document.querySelector('.dark-mode-toggle');
const body = document.body;
const icon = darkModeToggle.querySelector('i');

// Load saved dark mode preference
if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
}

// Toggle dark mode
darkModeToggle.addEventListener('click', function () {
    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('darkMode', 'disabled');
    }
});