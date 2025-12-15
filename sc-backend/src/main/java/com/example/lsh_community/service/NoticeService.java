package com.example.lsh_community.service;

import com.example.lsh_community.dto.NoticeDto;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class NoticeService {

    private static final String LIST_URL =
            "https://www.smu.ac.kr/kor/life/notice.do?srCampus=smu";

    public List<NoticeDto> fetchTopNotices(int limit) {
        List<NoticeDto> result = new ArrayList<>();
        Set<String> seenTitles = new LinkedHashSet<>();

        try {
            Document doc = Jsoup.connect(LIST_URL)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                            + "AppleWebKit/537.36 (KHTML, like Gecko) "
                            + "Chrome/120.0.0.0 Safari/537.36")
                    .timeout(8000)
                    .get();

            // 통합공지 리스트 영역(li 기준)
            // (board-list 클래스 안의 li 들)
            Elements liList = doc.select("div.board-list ul li");

            System.out.println("[NoticeService] li 개수 = " + liList.size());

            for (Element li : liList) {
                // 해당 li 내에서 공지 상세보기 링크들
                Elements links = li.select("a[href*=/kor/life/notice.do][href*=mode=view]");
                if (links.isEmpty()) {
                    continue;
                }

                // 보통 첫 번째 a는 "상명 [학사]" / "서울 [비교과]" 같은 카테고리,
                // 마지막 a가 실제 제목이므로 last() 사용
                Element titleAnchor = links.last();

                String title = titleAnchor.text().trim();
                if (title.isEmpty()) {
                    continue;
                }
                if (seenTitles.contains(title)) {
                    continue;
                }

                String href = titleAnchor.absUrl("href");

                System.out.println("[NoticeService] 파싱 제목 = " + title);
                System.out.println("[NoticeService] 링크 = " + href);

                seenTitles.add(title);
                result.add(new NoticeDto(title, href));

                if (result.size() >= limit) {
                    break;
                }
            }

            System.out.println("[NoticeService] 최종 공지 개수 = " + result.size());

        } catch (IOException e) {
            // 실제 문제가 있다면 여기에서 원인을 확인할 수 있음
            System.err.println("[NoticeService] Jsoup 통신/파싱 오류 발생");
            e.printStackTrace();
        }

        return result;
    }
}
