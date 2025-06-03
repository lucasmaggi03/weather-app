import axios from "axios";
import { z } from "zod";
import type { SearchType, Weather } from "../types";

// Type Guards
{
  /*function isWeatherResponse(weather: unknown): weather is Weather {
return (
    Boolean(weather) &&
    typeof weather === "object" &&
    typeof (weather as Weather).name === "string" &&
    typeof (weather as Weather).main.temp === "number" &&
    typeof (weather as Weather).main.temp_max === "number" &&
    typeof (weather as Weather).main.temp_min === "number"
  );
}*/
}

// ZOD
const Weather = z.object({
  name: z.string(),
  main: z.object({
    temp: z.number(),
    temp_max: z.number(),
    temp_min: z.number(),
  }),
});

type WeatherZod = z.infer<typeof Weather>;

export default function useWeather() {
  const fetchWeather = async (search: SearchType) => {
    const appId = import.meta.env.VITE_API_KEY;

    try {
      const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${search.city},${search.country}&appid=${appId}`;
      const { data: geoData } = await axios.get(geoUrl);
      const lat = geoData[0].lat;
      const lon = geoData[0].lon;
      const apiCall = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`;
      const { data: weatherData } = await axios.get<WeatherZod>(apiCall);
      const result = Weather.safeParse(weatherData);
      console.log(result.data?.main);
    } catch (error) {
      console.log(error);
    }
  };

  return {
    fetchWeather,
  };
}
