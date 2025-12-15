package com.example.lsh_community.service;

import com.example.lsh_community.dto.WeatherDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WeatherService {

    @Value("${weather.openweather.api-key}")
    private String apiKey;

    @Value("${weather.openweather.lat}")
    private String lat;

    @Value("${weather.openweather.lon}")
    private String lon;

    // 그냥 내부에서 직접 생성해서 사용
    private final RestTemplate restTemplate = new RestTemplate();

    public WeatherDto getCurrentWeather() {
        String url = String.format(
                "https://api.openweathermap.org/data/2.5/weather?lat=%s&lon=%s&appid=%s&units=metric&lang=kr",
                lat, lon, apiKey
        );

        ResponseEntity<OpenWeatherResponse> response =
                restTemplate.getForEntity(url, OpenWeatherResponse.class);

        OpenWeatherResponse body = response.getBody();
        if (body == null) {
            return new WeatherDto("정보 없음", 0.0, 0.0, 0);
        }

        String description = (body.weather != null && !body.weather.isEmpty())
                ? body.weather.get(0).description
                : "정보 없음";

        double temp = body.main != null ? body.main.temp : 0.0;
        double feelsLike = body.main != null ? body.main.feels_like : 0.0;
        int humidity = body.main != null ? body.main.humidity : 0;

        return new WeatherDto(description, temp, feelsLike, humidity);
    }

    // OpenWeatherMap JSON 응답을 매핑하기 위한 내부 클래스들
    private static class OpenWeatherResponse {
        public java.util.List<WeatherItem> weather;
        public MainItem main;
    }

    private static class WeatherItem {
        public String description;
    }

    private static class MainItem {
        public double temp;
        public double feels_like;
        public int humidity;
    }
}
