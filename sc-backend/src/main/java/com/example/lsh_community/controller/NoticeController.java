package com.example.lsh_community.controller;

import com.example.lsh_community.dto.NoticeDto;
import com.example.lsh_community.service.NoticeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/smu")
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    @GetMapping("/notices")
    public List<NoticeDto> getTopNotices() {
        // 상위 3개만
        return noticeService.fetchTopNotices(3);
    }
}
