package com.example.lsh_community.dto;

public record PasswordChangeRequest(
        String currentPassword,
        String newPassword
) {}