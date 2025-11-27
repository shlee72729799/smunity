const BASE_URL = 'http://localhost:8080';

// [추가] 인증 헤더 생성 헬퍼 함수
// 로그인 시 localStorage에 저장된 'token'을 꺼내서 HTTP 헤더 형식으로 반환합니다.
function getAuthHeader() {
    const token = localStorage.getItem('token');
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
}

// 공용: 안전 JSON 파서
async function safeJson(res) {
    if (res.status === 204) return null;       // No Content
    const text = await res.text();             // 우선 텍스트로
    if (!text) return null;                    // 비어있으면 null
    try { return JSON.parse(text); }           // JSON이면 파싱
    catch { return null; }                     // JSON이 아니면 null
}

// (선택) Location 헤더에서 id 뽑기
function idFromLocation(res) {
    const loc = res.headers.get('Location');
    if (!loc) return null;
    const m = loc.match(/\/(\d+)(?:$|[?#])/);
    return m ? Number(m[1]) : null;
}

// ==========================================
// 게시글 관련 API (인증 필요하도록 수정됨)
// ==========================================

export async function createCommunityPost(payload) {
    try {
        console.log('Creating post with payload:', payload);
        const res = await fetch(`${BASE_URL}/Community`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader() // [수정] 인증 토큰 추가
            },
            body: JSON.stringify(payload),
        });

        console.log('Response status:', res.status);

        const responseText = await res.text();
        console.log('Response body:', responseText);

        if (!res.ok) {
            // [추가] 인증 실패 처리
            if (res.status === 403 || res.status === 401) {
                throw new Error('로그인이 필요합니다.');
            }

            let errorData = null;
            try {
                errorData = responseText ? JSON.parse(responseText) : null;
            } catch (e) {
                console.error('Error parsing error response:', e);
            }
            const errorMsg = errorData?.message || errorData?.error || errorData?.detail || responseText || `Failed to create post: ${res.status}`;
            throw new Error(errorMsg);
        }

        let data = null;
        try {
            data = responseText ? JSON.parse(responseText) : null;
        } catch (e) {
            console.warn('Failed to parse response as JSON:', e);
        }

        const id = data?.id ?? data?.postId ?? data?.data?.id ?? idFromLocation(res);
        return { ...data, id };
    } catch (err) {
        console.error('createCommunityPost error:', err);
        if (err.message === 'Failed to fetch' || err.message.includes('Load failed') || err.message.includes('NetworkError')) {
            throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
        }
        throw err;
    }
}

export async function fetchCommunityList() {
    // [수정] GET 요청에도 헤더 추가
    const res = await fetch(`${BASE_URL}/Community`, {
        headers: {
            ...getAuthHeader()
        }
    });

    if (res.status === 403 || res.status === 401) {
        throw new Error('로그인이 필요합니다.');
    }

    if (!res.ok) throw new Error(`Failed to fetch list: ${res.status}`);
    return await safeJson(res);
}

export async function fetchCommunityPost(id) {
    // [수정] GET 요청에도 헤더 추가
    const res = await fetch(`${BASE_URL}/Community/${id}`, {
        headers: {
            ...getAuthHeader()
        }
    });

    if (res.status === 403 || res.status === 401) {
        throw new Error('로그인이 필요합니다.');
    }

    if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
    return await safeJson(res);
}

export async function updateCommunityPost(id, payload) {
    const res = await fetch(`${BASE_URL}/Community/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader() // [수정] 인증 토큰 추가
        },
        body: JSON.stringify(payload),
    });

    if (res.status === 403 || res.status === 401) {
        throw new Error('로그인이 필요합니다.');
    }

    if (!res.ok) throw new Error(`Failed to update post: ${res.status}`);
    return await safeJson(res);
}

export async function deleteCommunityPost(id) {
    const res = await fetch(`${BASE_URL}/Community/${id}`, {
        method: 'DELETE',
        headers: {
            ...getAuthHeader() // [수정] 인증 토큰 추가
        }
    });

    if (res.status === 403 || res.status === 401) {
        throw new Error('로그인이 필요합니다.');
    }

    if (!res.ok) throw new Error(`Failed to delete post: ${res.status}`);
    return true;
}

// ==========================================
// 인증(Auth) 관련 API
// (로그인/회원가입은 토큰이 필요 없으므로 그대로 둡니다)
// ==========================================

// 이메일 인증 메일 발송
export async function sendVerificationEmail(email) {
    try {
        const res = await fetch(`${BASE_URL}/api/auth/send-verification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorMsg = errorText;
            try {
                const json = JSON.parse(errorText);
                errorMsg = json.message || json.error || errorText;
            } catch {}

            throw new Error(errorMsg || `발송 실패: ${res.status}`);
        }

        const text = await res.text();
        try { return JSON.parse(text); } catch { return text; }
    } catch (err) {
        console.error('Email verification error:', err);
        if (err.message === 'Failed to fetch' || err.message.includes('Load failed')) {
            throw new Error('서버에 연결할 수 없습니다.');
        }
        throw err;
    }
}

// 회원가입
export async function signup(payload) {
    try {
        console.log('Signup payload:', payload);
        const res = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const responseText = await res.text();

        if (!res.ok) {
            let errorData = null;
            try {
                errorData = responseText ? JSON.parse(responseText) : null;
            } catch (e) {
                console.error('Error parsing error response:', e);
            }
            const errorMsg = errorData?.message || errorData?.error || errorData?.detail || responseText || `회원가입 실패: ${res.status}`;
            throw new Error(errorMsg);
        }

        return responseText ? JSON.parse(responseText) : null;
    } catch (err) {
        console.error('signup error:', err);
        if (err.message === 'Failed to fetch' || err.message.includes('Load failed') || err.message.includes('NetworkError')) {
            throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
        }
        throw err;
    }
}

// 로그인
export async function login(payload) {
    try {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const responseText = await res.text();

        if (!res.ok) {
            let errorData = null;
            try {
                errorData = responseText ? JSON.parse(responseText) : null;
            } catch (e) {
                console.error('Error parsing error response:', e);
            }
            const errorMsg = errorData?.message || errorData?.error || errorData?.detail || responseText || `로그인 실패: ${res.status}`;
            throw new Error(errorMsg);
        }

        return responseText ? JSON.parse(responseText) : null;
    } catch (err) {
        console.error('login error:', err);
        if (err.message === 'Failed to fetch' || err.message.includes('Load failed') || err.message.includes('NetworkError')) {
            throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
        }
        throw err;
    }
}