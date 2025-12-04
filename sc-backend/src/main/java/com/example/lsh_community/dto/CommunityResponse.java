package com.example.lsh_community.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CommunityResponse {

    private Long id;
    private String title;
    private String content;
    private String name;
}
