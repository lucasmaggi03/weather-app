import axios from "axios";
import { useState, useMemo } from "react";
import { z } from "zod";
import type { SearchType } from "../types";

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

export type Weather = z.infer<typeof Weather>;

//valibot
{
  /*const WeatherSchema = object({
    name: string(),
    main: object({
        temp: number(),
        temp_max: number(),
        temp_min: number()
    })
})*/
}

const initialState = {
  name: "",
  main: {
    temp: 0,
    temp_max: 0,
    temp_min: 0,
  },
};
export default function useWeather() {
  const [weather, setWeather] = useState<Weather>(initialState);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (search: SearchType) => {
    const appId = import.meta.env.VITE_API_KEY;
    setLoading(true);
    setWeather(initialState);
    try {
      const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${search.city},${search.country}&appid=${appId}`;
      const { data: geoData } = await axios.get(geoUrl);
      if (!geoData[0]) {
        setNotFound(true)
        return;
      }
      const lat = geoData[0].lat;
      const lon = geoData[0].lon;

      //comprobar si existe la data

      const apiCall = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`;
      const { data: weatherData } = await axios.get(apiCall);
      const result = Weather.safeParse(weatherData);
      if (result.success) {
        setWeather(result.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const hasWeatherData = useMemo(() => weather.name, [weather]);

  return {
    hasWeatherData,
    loading,
    weather,
    fetchWeather,
    notFound
  };
}
