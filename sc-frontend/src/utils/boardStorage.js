const STORAGE_PREFIX = 'boardPosts:';
export const BOARD_EVENT = 'board-posts-updated';

const isBrowser = typeof window !== 'undefined';

const safeParse = (value) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to parse board posts from storage', e);
    return [];
  }
};

const emitUpdate = (boardType) => {
  if (!isBrowser) return;
  window.dispatchEvent(
    new CustomEvent(BOARD_EVENT, { detail: { boardType } })
  );
};

const storageKey = (boardType) => `${STORAGE_PREFIX}${boardType}`;

const setLocalBoardPosts = (boardType, posts) => {
  if (!isBrowser || !boardType) return;
  window.localStorage.setItem(storageKey(boardType), JSON.stringify(posts));
  emitUpdate(boardType);
};

export const getLocalBoardPosts = (boardType) => {
  if (!isBrowser || !boardType) return [];
  const raw = window.localStorage.getItem(storageKey(boardType));
  return safeParse(raw);
};

export const findLocalBoardPost = (boardType, localId) => {
  if (!boardType || !localId) return null;
  return getLocalBoardPosts(boardType).find((post) => post.localId === localId) ?? null;
};

export const addLocalBoardPost = (boardType, post) => {
  if (!isBrowser || !boardType) return null;
  const existing = getLocalBoardPosts(boardType);
  const payload = {
    ...post,
    boardType,
    localId: post?.localId ?? `local-${Date.now()}`,
    createdAt: post?.createdAt ?? Date.now(),
  };
  setLocalBoardPosts(boardType, [payload, ...existing]);
  return payload;
};

export const updateLocalBoardPost = (boardType, localId, updates) => {
  if (!isBrowser || !boardType || !localId) return null;
  const updated = getLocalBoardPosts(boardType).map((post) =>
    post.localId === localId ? { ...post, ...updates } : post
  );
  setLocalBoardPosts(boardType, updated);
  return updated.find((post) => post.localId === localId) ?? null;
};

export const deleteLocalBoardPost = (boardType, localId) => {
  if (!isBrowser || !boardType || !localId) return;
  const filtered = getLocalBoardPosts(boardType).filter((post) => post.localId !== localId);
  setLocalBoardPosts(boardType, filtered);
};
