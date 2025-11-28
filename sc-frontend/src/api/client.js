const BASE_URL = 'http://localhost:8080';

// [공용] 인증 헤더 생성 헬퍼
function getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// [공용] 안전 JSON 파서
async function safeJson(res) {
    if (res.status === 204) return null;
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); }
    catch { return null; }
}

// [공용] Location 헤더에서 ID 추출
function idFromLocation(res) {
    const loc = res.headers.get('Location');
    if (!loc) return null;
    const m = loc.match(/\/(\d+)(?:$|[?#])/);
    return m ? Number(m[1]) : null;
}

// ==========================================
// 1. 게시글(Board) 관련 API
// ==========================================

export async function createCommunityPost(payload) {
    try {
        const res = await fetch(`${BASE_URL}/Community`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(payload),
        });

        if (res.status === 403 || res.status === 401) {
            throw new Error('로그인이 필요합니다.');
        }

        const responseText = await res.text();
        if (!res.ok) {
            let errorData = null;
            try { errorData = JSON.parse(responseText); } catch {}
            const errorMsg = errorData?.message || responseText || `작성 실패: ${res.status}`;
            throw new Error(errorMsg);
        }

        let data = null;
        try { data = JSON.parse(responseText); } catch {}

        const id = data?.id ?? idFromLocation(res);
        return { ...data, id };
    } catch (err) {
        console.error('createCommunityPost error:', err);
        throw err;
    }
}

export async function fetchCommunityList() {
    const res = await fetch(`${BASE_URL}/Community`, {
        headers: { ...getAuthHeader() }
    });

    if (res.status === 403 || res.status === 401) {
        throw new Error('로그인이 필요합니다.');
    }
    if (!res.ok) throw new Error(`Failed to fetch list: ${res.status}`);
    return await safeJson(res);
}

export async function fetchCommunityPost(id) {
    const res = await fetch(`${BASE_URL}/Community/${id}`, {
        headers: { ...getAuthHeader() }
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
            ...getAuthHeader()
        },
        body: JSON.stringify(payload),
    });

    if (res.status === 403 || res.status === 401) throw new Error('로그인이 필요합니다.');
    if (!res.ok) throw new Error(`Failed to update post: ${res.status}`);
    return await safeJson(res);
}

export async function deleteCommunityPost(id) {
    const res = await fetch(`${BASE_URL}/Community/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() }
    });

    if (res.status === 403 || res.status === 401) throw new Error('로그인이 필요합니다.');
    if (!res.ok) throw new Error(`Failed to delete post: ${res.status}`);
    return true;
}

// ==========================================
// 2. 인증(Auth) 관련 API
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
        try { return JSON.parse(text); } catch { return {}; }
    } catch (err) {
        console.error('Email verification error:', err);
        throw err;
    }
}

// [추가됨] 인증 상태 확인 (Polling)
export async function checkVerificationStatus(email) {
    try {
        const res = await fetch(`${BASE_URL}/api/auth/check-status?email=${email}`);
        if (!res.ok) return null;
        return await safeJson(res);
    } catch (err) {
        return null;
    }
}

// 회원가입
export async function signup(payload) {
    try {
        const res = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const responseText = await res.text();
        if (!res.ok) {
            let errorData = null;
            try { errorData = JSON.parse(responseText); } catch {}
            const errorMsg = errorData?.message || responseText || `회원가입 실패`;
            throw new Error(errorMsg);
        }
        return responseText ? JSON.parse(responseText) : null;
    } catch (err) {
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
            try { errorData = JSON.parse(responseText); } catch {}
            const errorMsg = errorData?.message || responseText || `로그인 실패`;
            throw new Error(errorMsg);
        }
        return responseText ? JSON.parse(responseText) : null;
    } catch (err) {
        throw err;
    }
}