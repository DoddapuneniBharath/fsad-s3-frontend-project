// API base URL — uses relative path so Vite proxy forwards to Spring Boot on :8080
const BASE_URL = '/api';

// ── Helper ────────────────────────────────────────────────────────────────────

function getHeaders(includeAuth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (includeAuth) {
        let token = localStorage.getItem('coursecloud_token');
        // Token is persisted by AppContext via JSON.stringify, so it may be quoted.
        // Ensure we send a raw JWT without surrounding quotes.
        if (token) {
            try { token = JSON.parse(token); } catch { /* keep raw */ }
            if (typeof token === 'string' && token.trim()) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
    }
    return headers;
}

async function handleResponse(res) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
    return data;
}

// ── AUTH ──────────────────────────────────────────────────────────────────────

export const authApi = {
    register: async ({ name, email, password, role }) => {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST', headers: getHeaders(false),
            body: JSON.stringify({ name, email, password, role }),
        });
        return handleResponse(res);
    },
    login: async ({ email, password }) => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST', headers: getHeaders(false),
            body: JSON.stringify({ email, password }),
        });
        return handleResponse(res);
    },
    verifyOtp: async (email, otp) => {
        const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
            method: 'POST', headers: getHeaders(false),
            body: JSON.stringify({ email, otp }),
        });
        return handleResponse(res);
    },
    resendOtp: async (email) => {
        const res = await fetch(`${BASE_URL}/auth/resend-otp`, {
            method: 'POST', headers: getHeaders(false),
            body: JSON.stringify({ email }),
        });
        return handleResponse(res);
    },
    verifyEmail: async (token) => {
        const res = await fetch(`${BASE_URL}/auth/verify-email?token=${token}`, {
            headers: getHeaders(false),
        });
        return handleResponse(res);
    },
    resendVerification: async (email) => {
        const res = await fetch(`${BASE_URL}/auth/resend-verification`, {
            method: 'POST', headers: getHeaders(false),
            body: JSON.stringify({ email }),
        });
        return handleResponse(res);
    },
};

// ── USERS ─────────────────────────────────────────────────────────────────────

export const usersApi = {
    getAll:       async ()        => handleResponse(await fetch(`${BASE_URL}/users`, { headers: getHeaders() })),
    getMe:        async ()        => handleResponse(await fetch(`${BASE_URL}/users/me`, { headers: getHeaders() })),
    update:       async (id, dto) => handleResponse(await fetch(`${BASE_URL}/users/${id}`, { method: 'PUT',   headers: getHeaders(), body: JSON.stringify(dto) })),
    delete:       async (id)      => handleResponse(await fetch(`${BASE_URL}/users/${id}`, { method: 'DELETE', headers: getHeaders() })),
    toggleStatus: async (id)      => handleResponse(await fetch(`${BASE_URL}/users/${id}/toggle-status`, { method: 'PATCH', headers: getHeaders() })),
};

// ── COURSES ───────────────────────────────────────────────────────────────────

export const coursesApi = {
    getAll:      async ()            => handleResponse(await fetch(`${BASE_URL}/courses`,              { headers: getHeaders() })),
    getPublished:async ()            => handleResponse(await fetch(`${BASE_URL}/courses/published`,    { headers: getHeaders() })),
    getMyLearning:async()            => handleResponse(await fetch(`${BASE_URL}/courses/my-learning`,  { headers: getHeaders() })),
    getById:     async (id)          => handleResponse(await fetch(`${BASE_URL}/courses/${id}`,         { headers: getHeaders() })),
    create:      async (data)        => handleResponse(await fetch(`${BASE_URL}/courses`,              { method: 'POST',   headers: getHeaders(), body: JSON.stringify(data) })),
    update:      async (id, data)    => handleResponse(await fetch(`${BASE_URL}/courses/${id}`,         { method: 'PUT',    headers: getHeaders(), body: JSON.stringify(data) })),
    delete:      async (id)          => handleResponse(await fetch(`${BASE_URL}/courses/${id}`,         { method: 'DELETE', headers: getHeaders() })),
    enroll:      async (courseId)    => handleResponse(await fetch(`${BASE_URL}/courses/${courseId}/enroll`,      { method: 'POST', headers: getHeaders() })),
    isEnrolled:  async (courseId)    => handleResponse(await fetch(`${BASE_URL}/courses/${courseId}/is-enrolled`, { headers: getHeaders() })),
};

// ── ASSIGNMENTS ───────────────────────────────────────────────────────────────

export const assignmentsApi = {
    getAll:         async ()                     => handleResponse(await fetch(`${BASE_URL}/assignments`,                              { headers: getHeaders() })),
    getByCourse:    async (courseId)             => handleResponse(await fetch(`${BASE_URL}/assignments/course/${courseId}`,            { headers: getHeaders() })),
    create:         async (data)                 => handleResponse(await fetch(`${BASE_URL}/assignments`,                              { method: 'POST',   headers: getHeaders(), body: JSON.stringify(data) })),
    delete:         async (id)                   => handleResponse(await fetch(`${BASE_URL}/assignments/${id}`,                        { method: 'DELETE', headers: getHeaders() })),
    submit:         async (id, answer)           => handleResponse(await fetch(`${BASE_URL}/assignments/${id}/submit`,                 { method: 'POST',   headers: getHeaders(), body: JSON.stringify({ answer }) })),
    getSubmissions: async ()                     => handleResponse(await fetch(`${BASE_URL}/assignments/submissions`,                  { headers: getHeaders() })),
    grade:          async (subId, score, feedback) => handleResponse(await fetch(`${BASE_URL}/assignments/submissions/${subId}/grade`, { method: 'PUT',  headers: getHeaders(), body: JSON.stringify({ score, feedback }) })),
};

// ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────

export const announcementsApi = {
    getAll:  async ()     => handleResponse(await fetch(`${BASE_URL}/announcements`,      { headers: getHeaders() })),
    create:  async (data) => handleResponse(await fetch(`${BASE_URL}/announcements`,      { method: 'POST',   headers: getHeaders(), body: JSON.stringify(data) })),
    delete:  async (id)   => handleResponse(await fetch(`${BASE_URL}/announcements/${id}`,{ method: 'DELETE', headers: getHeaders() })),
};
