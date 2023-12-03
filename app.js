const express = require('express');
const axios = require('axios');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/getWeather', async (req, res) => {
    try {
        const { cities } = req.body;
        const weatherData = await getWeatherData(cities);
        res.json({ weather: weatherData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function getWeatherData(cities) {
    if (!cities || !Array.isArray(cities)) {
        throw new Error('Invalid input. "cities" should be an array.');
    }

    const apiKey = process.env.OPENWEATHERMAP_API_KEY; 

    const weatherDataPromises = cities.map(async city => {
        try {
            const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
            const temperatureCelsius = kelvinToCelsius(response.data.main.temp);
            return { [city]: temperatureCelsius + 'C' };
        } catch (error) {
            console.error(`Error fetching weather for ${city}:`, error.response?.data || error.message);
            return { [city]: 'N/A' };
        }
    });

    try {
        const weatherData = await Promise.all(weatherDataPromises);
        return Object.assign({}, ...weatherData);
    } catch (error) {
        console.error('Error in Promise.all:', error);
        throw error;
    }
}

function kelvinToCelsius(kelvin) {
    return (kelvin - 273.15).toFixed(2);
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
