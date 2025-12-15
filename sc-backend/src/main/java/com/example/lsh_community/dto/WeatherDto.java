package com.example.lsh_community.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeatherDto {
    private String description;  // 날씨 설명 (ex. 맑음)
    private double temp;         // 현재 기온
    private double feelsLike;    // 체감 온도
    private int humidity;        // 습도
}
