package com.example.lsh_community.controller;

import com.example.lsh_community.dto.WeatherDto;
import com.example.lsh_community.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    @GetMapping("/current")
    public ResponseEntity<WeatherDto> getCurrentWeather() {
        WeatherDto dto = weatherService.getCurrentWeather();
        return ResponseEntity.ok(dto);
    }
}
