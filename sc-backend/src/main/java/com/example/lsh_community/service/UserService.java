package com.example.lsh_community.service;

import com.example.lsh_community.dto.LoginRequest;
import com.example.lsh_community.dto.SignupRequest;
import com.example.lsh_community.dto.UserResponse;
import com.example.lsh_community.dto.MyPostDto;
import com.example.lsh_community.dto.MyCommentDto;

import java.util.List;

public interface UserService {
    UserResponse signup(SignupRequest req);
    UserResponse login(LoginRequest req);

    List<MyPostDto> getMyPosts(Long userId);
    List<MyCommentDto> getMyComments(Long userId);

    void changePassword(Long userId, String currentPassword, String newPassword);
}