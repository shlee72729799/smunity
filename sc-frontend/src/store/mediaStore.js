// src/store/mediaStore.js

// 아주 단순한 메모리 스토어 (새로고침하면 초기화됨)
let mediaPosts = [];

/** 현재 저장된 미디어 게시글 전체 반환 */
export const getMediaPosts = () => mediaPosts;

/** 미디어 게시글 전체를 통째로 교체 */
export const setMediaPostsStore = (nextPosts) => {
  mediaPosts = Array.isArray(nextPosts) ? nextPosts : [];
};
