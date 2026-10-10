import { WEATHER_API_KEY, NEWS_API_KEY } from "./config.js";

const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("searchBtn");

const loading = document.getElementById("loading");
const error = document.getElementById("error");

const weatherCard = document.getElementById("weather-card");
const newsContainer = document.getElementById("news-container");

// Get weather and news
async function getDashboard(city) {
  loading.textContent = "Loading weather and news...";
  loading.style.display = "block";
  error.textContent = "";

  try {
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;

    const newsURL = `https://newsdata.io/api/1/latest?apikey=${NEWS_API_KEY}&q=${encodeURIComponent(city)}&language=en`;

    const [weatherResponse, newsResponse] = await Promise.all([
      fetch(weatherURL),
      fetch(newsURL),
    ]);

    if (!weatherResponse.ok) {
      error.textContent = "City not found. Please enter a valid city name.";
      return;
    }

    if (!newsResponse.ok) {
      error.textContent = "News data could not be loaded.";
      return;
    }

    const weatherData = await weatherResponse.json();
    const newsData = await newsResponse.json();

    showWeather(weatherData);
    showNews(newsData);
  } catch (err) {
    console.log(err);
    error.textContent =
      "Unable to load data. Please check your internet connection.";
  } finally {
    loading.style.display = "none";
  }
}

//  weather information
function showWeather(weatherData) {
  document.getElementById("city_name").textContent = weatherData.name;

  document.getElementById("temp").textContent =
    Math.round(weatherData.main.temp) + "°C";

  document.getElementById("weather").textContent =
    weatherData.weather[0].description;

  document.getElementById("humidity").textContent =
    weatherData.main.humidity + "%";

  document.getElementById("wind").textContent = weatherData.wind.speed + " m/s";

  document.getElementById("feels_like").textContent =
    Math.round(weatherData.main.feels_like) + "°C";

  document.getElementById("pressure").textContent = weatherData.main.pressure;

  const condition = weatherData.weather[0].main;
  let icon = "☁️";

  if (condition === "Clear") {
    icon = "☀️";
  } else if (condition === "Rain" || condition === "Drizzle") {
    icon = "🌧️";
  } else if (condition === "Thunderstorm") {
    icon = "⛈️";
  } else if (condition === "Snow") {
    icon = "❄️";
  }

  document.getElementById("weather-icon").textContent = icon;
  weatherCard.style.display = "block";
}

// news articles
function showNews(newsData) {
  newsContainer.innerHTML = "";

  if (!newsData.results || newsData.results.length === 0) {
    newsContainer.innerHTML = "<p>No news found for this city.</p>";
    return;
  }

  newsData.results.slice(0, 8).forEach((article) => {
    let description = article.description || "";

    if (description.length > 140) {
      description = description.substring(0, 140) + "...";
    }

    newsContainer.innerHTML += `
      <div class="news-card">
      
     <img
      src="${article.image_url || "https://placehold.co/600x400"}"
      alt="News image"
      >

        <div class="news-content">
          <span class="news-source">
            ${article.source_id || "News"}
          </span>

          <h3>${article.title || "No title available"}</h3>

          <p>${description}</p>

          <div class="news-bottom">
            <span class="news-date">
              ${article.pubDate || ""}
            </span>

            <a href="${article.link || "#"}" >
              Read More →
            </a>
          </div>
        </div>
      </div>
    `;
  });
}

// Get the user's current location
function getLocation() {
  if (!navigator.geolocation) {
    error.textContent = "Location is not supported. Please search for a city.";
       loading.style.display = "none";
    return;
  }

  loading.textContent = "Getting your location...";
  loading.style.display = "block";
  error.textContent = "";

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      try {
        const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
          error.textContent = "Unable to get weather for your location.";
          loading.style.display = "none";
          return;
        }

        const weatherData = await weatherResponse.json();
        const city = weatherData.name;

        const newsURL = `https://newsdata.io/api/1/latest?apikey=${NEWS_API_KEY}&q=${encodeURIComponent(city)}&language=en`;

        const newsResponse = await fetch(newsURL);

        if (!newsResponse.ok) {
          loading.style.display = "none";
          showWeather(weatherData);
          error.textContent = "Weather loaded, but news could not be loaded.";
          return;
        }

        const newsData = await newsResponse.json();

        showWeather(weatherData);
        showNews(newsData);
        loading.style.display = "none";
      } catch (err) {
        console.log(err);
        error.textContent =
          "Unable to load location data. Please search manually.";
        loading.style.display = "none";
      }
    },

    () => {
      loading.style.display = "none";
      error.textContent =
        "Location access was denied. Please search for a city manually.";
    },
  );
}

// Search button
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (city === "") {
    error.textContent = "Please enter a city name.";
    return;
  }

  getDashboard(city);
  cityInput.value = "";
});

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchBtn.click();
  }
});

getLocation();
