package com.example.lsh_community.dto;

import java.util.List;

public record MyWithMeResponse(
        List<PostDto> myHostedPosts,          // 1. 내가 주최한(작성한) 모임
        List<PostDto> myJoinedConfirmedPosts, // 2. 참여 & 확정된 모임 (마감 30분 전 지남)
        List<PostDto> myJoinedPendingPosts    // 3. 참여 & 대기 중인 모임 (아직 확정 전)
) {}