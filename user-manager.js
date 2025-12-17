// ========================================
// USER MANAGER - BANK SULSELBAR
// Role-Based Access Control System
// ========================================

console.log('ðŸ‘¥ Loading User Manager Bank Sulselbar...');

// ========================================
// INTEGRASI DENGAN SISTEM LAMA
// Kompatibel dengan sessionStorage isLoggedIn
// ========================================

// ========================================
// ROLE DEFINITIONS
// ========================================

const USER_ROLES = {
    ADMIN: {
        id: 'ADMIN',
        label: 'Administrator',
        icon: 'ðŸ‘‘',
        color: '#dc2626',
        level: 100,
        permissions: [
            'manage_users', 'manage_offices', 'set_targets', 'view_all',
            'input_realization', 'approve_data', 'export_reports', 'view_dashboard',
            'view_ratios', 'manage_pipeline', 'delete_data'
        ]
    },
    PINCAB: {
        id: 'PINCAB',
        label: 'Pimpinan Cabang',
        icon: 'ðŸ‘”',
        color: '#7c3aed',
        level: 70,
        permissions: [
            'view_branch', 'approve_data', 'view_ratios', 'view_dashboard',
            'view_pipeline', 'export_reports'
        ]
    },
    OPERATOR: {
        id: 'OPERATOR',
        label: 'Operator',
        icon: 'ðŸ’¼',
        color: '#059669',
        level: 30,
        permissions: [
            'input_realization', 'upload_excel', 'view_own_data', 'edit_draft'
        ]
    },
    VIEWER: {
        id: 'VIEWER',
        label: 'Viewer',
        icon: 'ðŸ‘ï¸',
        color: '#6b7280',
        level: 10,
        permissions: [
            'view_dashboard', 'view_reports'
        ]
    }
};

// ========================================
// DEFAULT USERS
// ========================================

const DEFAULT_USERS = {
    'ADMIN_PUSAT': {
        username: 'ADMIN_PUSAT',
        password: 'admin123', // Harus di-hash di production!
        name: 'Administrator Pusat',
        role: 'ADMIN',
        officeCode: '000',
        officeName: 'Kantor Pusat',
        email: 'admin@banksulselbar.co.id',
        phone: '08xxxxxxxxxx',
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00Z',
        lastLogin: null
    },
    'PIN_MAROS': {
        username: 'PIN_MAROS',
        password: 'pincab123',
        name: 'Pimpinan Cabang Maros',
        role: 'PINCAB',
        officeCode: '10',
        officeName: 'Cabang Maros',
        email: 'pincab.maros@banksulselbar.co.id',
        phone: '08xxxxxxxxxx',
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00Z',
        lastLogin: null
    },
    'PIN_BONE': {
        username: 'PIN_BONE',
        password: 'pincab123',
        name: 'Pimpinan Cabang Bone',
        role: 'PINCAB',
        officeCode: '80',
        officeName: 'Cabang Utama Bone',
        email: 'pincab.bone@banksulselbar.co.id',
        phone: '08xxxxxxxxxx',
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00Z',
        lastLogin: null
    },
    'PIN_MAKASSAR': {
        username: 'PIN_MAKASSAR',
        password: 'pincab123',
        name: 'Pimpinan Cabang Makassar',
        role: 'PINCAB',
        officeCode: '130',
        officeName: 'Cabang Utama Makassar',
        email: 'pincab.makassar@banksulselbar.co.id',
        phone: '08xxxxxxxxxx',
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00Z',
        lastLogin: null
    },
    'OPR_010_01': {
        username: 'OPR_010_01',
        password: 'operator123',
        name: 'Operator 1 Cabang Maros',
        role: 'OPERATOR',
        officeCode: '10',
        officeName: 'Cabang Maros',
        email: 'operator1.maros@banksulselbar.co.id',
        phone: '08xxxxxxxxxx',
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00Z',
        lastLogin: null
    },
    'OPR_010_02': {
        username: 'OPR_010_02',
        password: 'operator123',
        name: 'Operator 2 Cabang Maros',
        role: 'OPERATOR',
        officeCode: '10',
        officeName: 'Cabang Maros',
        email: 'operator2.maros@banksulselbar.co.id',
        phone: '08xxxxxxxxxx',
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00Z',
        lastLogin: null
    },
    'OPR_080_01': {
        username: 'OPR_080_01',
        password: 'operator123',
        name: 'Operator 1 Cabang Bone',
        role: 'OPERATOR',
        officeCode: '80',
        officeName: 'Cabang Utama Bone',
        email: 'operator1.bone@banksulselbar.co.id',
        phone: '08xxxxxxxxxx',
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00Z',
        lastLogin: null
    },
    'VIEW_PUSAT': {
        username: 'VIEW_PUSAT',
        password: 'viewer123',
        name: 'Viewer Kantor Pusat',
        role: 'VIEWER',
        officeCode: '000',
        officeName: 'Kantor Pusat',
        email: 'viewer@banksulselbar.co.id',
        phone: '08xxxxxxxxxx',
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00Z',
        lastLogin: null
    }
};

// ========================================
// STORAGE KEYS
// ========================================

const USER_STORAGE_KEY = 'bank_sulselbar_users';
const SESSION_KEY = 'bank_sulselbar_session';
const LOGIN_HISTORY_KEY = 'bank_sulselbar_login_history';

// ========================================
// USER DATABASE
// ========================================

let USERS = {};

function loadUsers() {
    try {
        const saved = localStorage.getItem(USER_STORAGE_KEY);
        if (saved) {
            USERS = JSON.parse(saved);
        } else {
            USERS = { ...DEFAULT_USERS };
            saveUsers();
        }
    } catch (e) {
        console.error('Error loading users:', e);
        USERS = { ...DEFAULT_USERS };
    }
}

function saveUsers() {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(USERS));
}

function resetToDefaultUsers() {
    USERS = { ...DEFAULT_USERS };
    saveUsers();
    return true;
}

// ========================================
// AUTHENTICATION
// ========================================

function login(username, password) {
    const user = USERS[username.toUpperCase()];
    
    if (!user) {
        return { success: false, error: 'Username tidak ditemukan' };
    }
    
    if (user.status !== 'ACTIVE') {
        return { success: false, error: 'Akun tidak aktif. Hubungi Administrator.' };
    }
    
    if (user.password !== password) {
        return { success: false, error: 'Password salah' };
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    saveUsers();
    
    // Create session
    const session = {
        username: user.username,
        name: user.name,
        role: user.role,
        roleInfo: USER_ROLES[user.role],
        officeCode: user.officeCode,
        officeName: user.officeName,
        permissions: USER_ROLES[user.role].permissions,
        loginAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 jam
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    // Log login history
    logLoginHistory(user.username, 'LOGIN', true);
    
    return { success: true, session };
}

function logout() {
    const session = getCurrentSession();
    if (session) {
        logLoginHistory(session.username, 'LOGOUT', true);
    }
    localStorage.removeItem(SESSION_KEY);
    return true;
}

function getCurrentSession() {
    try {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY));
        if (!session) return null;
        
        // Check expiry
        if (new Date(session.expiresAt) < new Date()) {
            logout();
            return null;
        }
        
        return session;
    } catch (e) {
        return null;
    }
}

function isLoggedIn() {
    return getCurrentSession() !== null;
}

function getCurrentUser() {
    const session = getCurrentSession();
    if (!session) return null;
    return USERS[session.username] || null;
}

function hasPermission(permission) {
    const session = getCurrentSession();
    if (!session) return false;
    return session.permissions.includes(permission);
}

function hasAnyPermission(permissions) {
    return permissions.some(p => hasPermission(p));
}

function hasAllPermissions(permissions) {
    return permissions.every(p => hasPermission(p));
}

function logLoginHistory(username, action, success) {
    try {
        let history = JSON.parse(localStorage.getItem(LOGIN_HISTORY_KEY) || '[]');
        history.unshift({
            username,
            action,
            success,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        // Keep last 100 entries
        history = history.slice(0, 100);
        localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {}
}

// ========================================
// USER MANAGEMENT (ADMIN ONLY)
// ========================================

function createUser(userData) {
    if (!hasPermission('manage_users')) {
        return { success: false, error: 'Tidak memiliki izin' };
    }
    
    const username = userData.username.toUpperCase();
    
    if (USERS[username]) {
        return { success: false, error: 'Username sudah ada' };
    }
    
    if (!USER_ROLES[userData.role]) {
        return { success: false, error: 'Role tidak valid' };
    }
    
    USERS[username] = {
        username: username,
        password: userData.password || 'changeme123',
        name: userData.name,
        role: userData.role,
        officeCode: userData.officeCode,
        officeName: userData.officeName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        createdBy: getCurrentSession()?.username || 'SYSTEM',
        lastLogin: null
    };
    
    saveUsers();
    return { success: true, user: USERS[username] };
}

function updateUser(username, updates) {
    if (!hasPermission('manage_users')) {
        return { success: false, error: 'Tidak memiliki izin' };
    }
    
    username = username.toUpperCase();
    
    if (!USERS[username]) {
        return { success: false, error: 'User tidak ditemukan' };
    }
    
    // Prevent changing ADMIN_PUSAT role
    if (username === 'ADMIN_PUSAT' && updates.role && updates.role !== 'ADMIN') {
        return { success: false, error: 'Tidak dapat mengubah role ADMIN_PUSAT' };
    }
    
    Object.assign(USERS[username], updates, {
        updatedAt: new Date().toISOString(),
        updatedBy: getCurrentSession()?.username || 'SYSTEM'
    });
    
    saveUsers();
    return { success: true, user: USERS[username] };
}

function deleteUser(username) {
    if (!hasPermission('manage_users')) {
        return { success: false, error: 'Tidak memiliki izin' };
    }
    
    username = username.toUpperCase();
    
    if (username === 'ADMIN_PUSAT') {
        return { success: false, error: 'Tidak dapat menghapus ADMIN_PUSAT' };
    }
    
    if (!USERS[username]) {
        return { success: false, error: 'User tidak ditemukan' };
    }
    
    delete USERS[username];
    saveUsers();
    return { success: true };
}

function changePassword(username, oldPassword, newPassword) {
    username = username.toUpperCase();
    const user = USERS[username];
    
    if (!user) {
        return { success: false, error: 'User tidak ditemukan' };
    }
    
    // Admin can change anyone's password
    const session = getCurrentSession();
    if (session?.role !== 'ADMIN') {
        if (session?.username !== username) {
            return { success: false, error: 'Tidak dapat mengubah password user lain' };
        }
        if (user.password !== oldPassword) {
            return { success: false, error: 'Password lama salah' };
        }
    }
    
    user.password = newPassword;
    user.passwordChangedAt = new Date().toISOString();
    saveUsers();
    
    return { success: true };
}

function getAllUsers() {
    return Object.values(USERS).map(u => ({
        ...u,
        password: '********' // Hide password
    }));
}

function getUsersByRole(role) {
    return getAllUsers().filter(u => u.role === role);
}

function getUsersByOffice(officeCode) {
    return getAllUsers().filter(u => u.officeCode === officeCode);
}

// ========================================
// USERNAME GENERATOR
// ========================================

function generateUsername(role, officeCode, sequence = 1) {
    const office = window.getOffice ? window.getOffice(officeCode) : null;
    
    switch (role) {
        case 'PINCAB':
            // PIN_MAROS, PIN_BONE, etc
            if (office) {
                const name = office.name.replace(/^Cabang\s*(Utama\s*)?/i, '').toUpperCase().replace(/\s+/g, '_');
                return `PIN_${name}`;
            }
            return `PIN_${officeCode}`;
            
        case 'OPERATOR':
            // OPR_010_01, OPR_080_02
            const paddedCode = officeCode.toString().padStart(3, '0');
            const paddedSeq = sequence.toString().padStart(2, '0');
            return `OPR_${paddedCode}_${paddedSeq}`;
            
        case 'VIEWER':
            if (office) {
                const vname = office.name.replace(/^Cabang\s*(Utama\s*)?/i, '').toUpperCase().replace(/\s+/g, '_');
                return `VIEW_${vname}`;
            }
            return `VIEW_${officeCode}`;
            
        default:
            return `USER_${officeCode}_${sequence}`;
    }
}

function getNextOperatorSequence(officeCode) {
    const paddedCode = officeCode.toString().padStart(3, '0');
    const existing = Object.keys(USERS).filter(u => u.startsWith(`OPR_${paddedCode}_`));
    return existing.length + 1;
}

// ========================================
// LOGIN MODAL
// ========================================

function showLoginModal(onSuccess) {
    document.getElementById('loginModal')?.remove();
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="loginModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,#1e3a5f 0%,#0d1b2a 100%);display:flex;align-items:center;justify-content:center;z-index:999999;">
            <div style="background:white;border-radius:20px;width:100%;max-width:420px;box-shadow:0 25px 50px rgba(0,0,0,0.4);overflow:hidden;">
                <!-- Header -->
                <div style="padding:30px;background:linear-gradient(135deg,#0066cc,#004499);text-align:center;">
                    <img src="logobanksulselbar.png" alt="Logo" style="height:60px;margin-bottom:15px;" onerror="this.style.display='none'">
                    <h2 style="margin:0;color:white;font-size:22px;">Bank Sulselbar</h2>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Dashboard Keuangan & Operasional</p>
                </div>
                
                <!-- Form -->
                <div style="padding:30px;">
                    <div id="loginError" style="display:none;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;padding:12px;border-radius:8px;margin-bottom:20px;font-size:13px;">
                        <i class="fas fa-exclamation-circle"></i> <span id="loginErrorText"></span>
                    </div>
                    
                    <div style="margin-bottom:20px;">
                        <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:8px;">
                            <i class="fas fa-user" style="color:#0066cc;"></i> Username
                        </label>
                        <input type="text" id="loginUsername" placeholder="Contoh: ADMIN_PUSAT" 
                            style="width:100%;padding:14px 16px;border:2px solid #e5e7eb;border-radius:10px;font-size:15px;transition:border-color 0.2s;"
                            onfocus="this.style.borderColor='#0066cc'" onblur="this.style.borderColor='#e5e7eb'">
                    </div>
                    
                    <div style="margin-bottom:24px;">
                        <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:8px;">
                            <i class="fas fa-lock" style="color:#0066cc;"></i> Password
                        </label>
                        <div style="position:relative;">
                            <input type="password" id="loginPassword" placeholder="Masukkan password"
                                style="width:100%;padding:14px 16px;padding-right:45px;border:2px solid #e5e7eb;border-radius:10px;font-size:15px;transition:border-color 0.2s;"
                                onfocus="this.style.borderColor='#0066cc'" onblur="this.style.borderColor='#e5e7eb'"
                                onkeypress="if(event.key==='Enter')doLogin()">
                            <button type="button" onclick="togglePasswordVisibility()" 
                                style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:#6b7280;cursor:pointer;padding:5px;">
                                <i class="fas fa-eye" id="togglePwdIcon"></i>
                            </button>
                        </div>
                    </div>
                    
                    <button onclick="doLogin()" id="loginBtn"
                        style="width:100%;padding:14px;background:linear-gradient(135deg,#0066cc,#0052a3);color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;transition:transform 0.1s,box-shadow 0.2s;"
                        onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 4px 12px rgba(0,102,204,0.4)'"
                        onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
                        <i class="fas fa-sign-in-alt"></i> Masuk
                    </button>
                </div>
                
                <!-- Footer -->
                <div style="padding:20px 30px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                    <details style="font-size:12px;color:#6b7280;">
                        <summary style="cursor:pointer;font-weight:500;">Demo Accounts</summary>
                        <div style="margin-top:10px;display:grid;gap:6px;font-family:monospace;font-size:11px;">
                            <div><strong>ADMIN_PUSAT</strong> / admin123</div>
                            <div><strong>PIN_MAROS</strong> / pincab123</div>
                            <div><strong>OPR_010_01</strong> / operator123</div>
                            <div><strong>VIEW_PUSAT</strong> / viewer123</div>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    `);
    
    window._loginSuccessCallback = onSuccess;
    document.getElementById('loginUsername').focus();
}

function togglePasswordVisibility() {
    const pwd = document.getElementById('loginPassword');
    const icon = document.getElementById('togglePwdIcon');
    if (pwd.type === 'password') {
        pwd.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        pwd.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function doLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    const errorText = document.getElementById('loginErrorText');
    const btn = document.getElementById('loginBtn');
    
    if (!username || !password) {
        errorDiv.style.display = 'block';
        errorText.textContent = 'Username dan password harus diisi';
        return;
    }
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    
    setTimeout(() => {
        const result = login(username, password);
        
        if (result.success) {
            document.getElementById('loginModal').remove();
            if (window._loginSuccessCallback) {
                window._loginSuccessCallback(result.session);
            }
        } else {
            errorDiv.style.display = 'block';
            errorText.textContent = result.error;
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Masuk';
            document.getElementById('loginPassword').value = '';
            document.getElementById('loginPassword').focus();
        }
    }, 500);
}

// ========================================
// USER MANAGEMENT MODAL (ADMIN)
// ========================================

function showUserManagementModal() {
    if (!hasPermission('manage_users')) {
        alert('âš ï¸ Anda tidak memiliki izin untuk mengelola user');
        return;
    }
    
    document.getElementById('userMgmtModal')?.remove();
    
    const users = getAllUsers();
    let rows = '';
    
    users.forEach(u => {
        const role = USER_ROLES[u.role];
        const statusColor = u.status === 'ACTIVE' ? '#059669' : '#dc2626';
        const statusBg = u.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2';
        
        rows += `
            <tr style="border-bottom:1px solid #f3f4f6;">
                <td style="padding:12px;font-family:monospace;font-weight:600;">${u.username}</td>
                <td style="padding:12px;">${u.name}</td>
                <td style="padding:12px;">
                    <span style="background:${role.color}22;color:${role.color};padding:4px 10px;border-radius:20px;font-size:12px;font-weight:500;">
                        ${role.icon} ${role.label}
                    </span>
                </td>
                <td style="padding:12px;font-size:13px;">${u.officeCode} - ${u.officeName}</td>
                <td style="padding:12px;">
                    <span style="background:${statusBg};color:${statusColor};padding:4px 10px;border-radius:20px;font-size:11px;font-weight:500;">
                        ${u.status}
                    </span>
                </td>
                <td style="padding:12px;">
                    <button onclick="showEditUserModal('${u.username}')" style="padding:6px 10px;border:1px solid #d1d5db;background:white;border-radius:6px;cursor:pointer;margin-right:4px;" title="Edit">
                        <i class="fas fa-edit" style="color:#0066cc;"></i>
                    </button>
                    ${u.username !== 'ADMIN_PUSAT' ? `
                    <button onclick="confirmDeleteUser('${u.username}')" style="padding:6px 10px;border:1px solid #fecaca;background:#fef2f2;border-radius:6px;cursor:pointer;" title="Hapus">
                        <i class="fas fa-trash" style="color:#dc2626;"></i>
                    </button>
                    ` : ''}
                </td>
            </tr>
        `;
    });
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="userMgmtModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">
            <div style="background:white;border-radius:16px;width:100%;max-width:1000px;max-height:85vh;display:flex;flex-direction:column;">
                <div style="padding:20px 24px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:white;border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center;">
                    <h3 style="margin:0;"><i class="fas fa-users-cog"></i> Manajemen User</h3>
                    <button onclick="showAddUserModal()" style="padding:8px 16px;background:white;color:#dc2626;border:none;border-radius:8px;cursor:pointer;font-weight:500;">
                        <i class="fas fa-user-plus"></i> Tambah User
                    </button>
                </div>
                <div style="flex:1;overflow-y:auto;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead style="position:sticky;top:0;background:#f9fafb;z-index:5;">
                            <tr style="border-bottom:2px solid #e5e7eb;">
                                <th style="padding:12px;text-align:left;font-size:12px;color:#6b7280;">USERNAME</th>
                                <th style="padding:12px;text-align:left;font-size:12px;color:#6b7280;">NAMA</th>
                                <th style="padding:12px;text-align:left;font-size:12px;color:#6b7280;">ROLE</th>
                                <th style="padding:12px;text-align:left;font-size:12px;color:#6b7280;">KANTOR</th>
                                <th style="padding:12px;text-align:left;font-size:12px;color:#6b7280;">STATUS</th>
                                <th style="padding:12px;text-align:left;font-size:12px;color:#6b7280;">AKSI</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
                <div style="padding:16px 24px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;background:#f9fafb;border-radius:0 0 16px 16px;">
                    <span style="font-size:13px;color:#6b7280;">Total: <strong>${users.length}</strong> users</span>
                    <button onclick="document.getElementById('userMgmtModal').remove()" style="padding:10px 20px;border:1px solid #d1d5db;background:white;border-radius:8px;cursor:pointer;">Tutup</button>
                </div>
            </div>
        </div>
    `);
}

function showAddUserModal() {
    document.getElementById('addUserModal')?.remove();
    
    const officeOpts = window.generateOfficeOptions ? window.generateOfficeOptions() : '<option value="000">000 - Kantor Pusat</option>';
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="addUserModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:999999;padding:20px;">
            <div style="background:white;border-radius:16px;width:100%;max-width:500px;">
                <div style="padding:20px 24px;background:linear-gradient(135deg,#059669,#047857);color:white;border-radius:16px 16px 0 0;">
                    <h3 style="margin:0;"><i class="fas fa-user-plus"></i> Tambah User Baru</h3>
                </div>
                <div style="padding:24px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
                        <div>
                            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Role <span style="color:#ef4444;">*</span></label>
                            <select id="addUserRole" onchange="onAddUserRoleChange()" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;">
                                <option value="">-- Pilih Role --</option>
                                <option value="PINCAB">ðŸ‘” Pimpinan Cabang</option>
                                <option value="OPERATOR">ðŸ’¼ Operator</option>
                                <option value="VIEWER">ðŸ‘ï¸ Viewer</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Kantor <span style="color:#ef4444;">*</span></label>
                            <select id="addUserOffice" onchange="onAddUserOfficeChange()" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;">
                                <option value="">-- Pilih --</option>
                                ${officeOpts}
                            </select>
                        </div>
                    </div>
                    
                    <div style="margin-bottom:16px;">
                        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Username <span style="color:#ef4444;">*</span></label>
                        <input type="text" id="addUserUsername" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;font-family:monospace;font-weight:600;" placeholder="Auto-generate atau ketik manual">
                    </div>
                    
                    <div style="margin-bottom:16px;">
                        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Nama Lengkap <span style="color:#ef4444;">*</span></label>
                        <input type="text" id="addUserName" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;" placeholder="Nama lengkap user">
                    </div>
                    
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
                        <div>
                            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Password</label>
                            <input type="text" id="addUserPassword" value="changeme123" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;font-family:monospace;">
                        </div>
                        <div>
                            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Email</label>
                            <input type="email" id="addUserEmail" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;" placeholder="email@domain.com">
                        </div>
                    </div>
                </div>
                <div style="padding:16px 24px;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end;gap:12px;background:#f9fafb;border-radius:0 0 16px 16px;">
                    <button onclick="document.getElementById('addUserModal').remove()" style="padding:10px 20px;border:1px solid #d1d5db;background:white;border-radius:8px;cursor:pointer;">Batal</button>
                    <button onclick="saveNewUser()" style="padding:10px 20px;border:none;background:#059669;color:white;border-radius:8px;cursor:pointer;"><i class="fas fa-save"></i> Simpan</button>
                </div>
            </div>
        </div>
    `);
}

function onAddUserRoleChange() {
    updateGeneratedUsername();
}

function onAddUserOfficeChange() {
    updateGeneratedUsername();
}

function updateGeneratedUsername() {
    const role = document.getElementById('addUserRole').value;
    const officeCode = document.getElementById('addUserOffice').value;
    
    if (role && officeCode) {
        let seq = 1;
        if (role === 'OPERATOR') {
            seq = getNextOperatorSequence(officeCode);
        }
        const username = generateUsername(role, officeCode, seq);
        document.getElementById('addUserUsername').value = username;
    }
}

function saveNewUser() {
    const role = document.getElementById('addUserRole').value;
    const officeSelect = document.getElementById('addUserOffice');
    const officeCode = officeSelect.value;
    const officeName = officeSelect.options[officeSelect.selectedIndex]?.text?.split(' - ')[1] || '';
    const username = document.getElementById('addUserUsername').value.trim();
    const name = document.getElementById('addUserName').value.trim();
    const password = document.getElementById('addUserPassword').value;
    const email = document.getElementById('addUserEmail').value.trim();
    
    if (!role || !officeCode || !username || !name) {
        alert('âš ï¸ Lengkapi semua field wajib!');
        return;
    }
    
    const result = createUser({
        username, password, name, role, officeCode, officeName, email
    });
    
    if (result.success) {
        alert(`âœ… User ${username} berhasil dibuat!`);
        document.getElementById('addUserModal').remove();
        showUserManagementModal(); // Refresh list
    } else {
        alert(`âš ï¸ Error: ${result.error}`);
    }
}

function showEditUserModal(username) {
    const user = USERS[username];
    if (!user) return;
    
    document.getElementById('editUserModal')?.remove();
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="editUserModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:999999;padding:20px;">
            <div style="background:white;border-radius:16px;width:100%;max-width:450px;">
                <div style="padding:20px 24px;background:linear-gradient(135deg,#0066cc,#0052a3);color:white;border-radius:16px 16px 0 0;">
                    <h3 style="margin:0;"><i class="fas fa-user-edit"></i> Edit User: ${username}</h3>
                </div>
                <div style="padding:24px;">
                    <div style="margin-bottom:16px;">
                        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Nama</label>
                        <input type="text" id="editUserName" value="${user.name}" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;">
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
                        <div>
                            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Status</label>
                            <select id="editUserStatus" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;">
                                <option value="ACTIVE" ${user.status === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option>
                                <option value="INACTIVE" ${user.status === 'INACTIVE' ? 'selected' : ''}>INACTIVE</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Role</label>
                            <select id="editUserRole" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;" ${username === 'ADMIN_PUSAT' ? 'disabled' : ''}>
                                <option value="ADMIN" ${user.role === 'ADMIN' ? 'selected' : ''}>Administrator</option>
                                <option value="PINCAB" ${user.role === 'PINCAB' ? 'selected' : ''}>Pimpinan Cabang</option>
                                <option value="OPERATOR" ${user.role === 'OPERATOR' ? 'selected' : ''}>Operator</option>
                                <option value="VIEWER" ${user.role === 'VIEWER' ? 'selected' : ''}>Viewer</option>
                            </select>
                        </div>
                    </div>
                    <div style="margin-bottom:16px;">
                        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Reset Password</label>
                        <input type="text" id="editUserPassword" placeholder="Kosongkan jika tidak ingin reset" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;font-family:monospace;">
                    </div>
                </div>
                <div style="padding:16px 24px;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end;gap:12px;background:#f9fafb;border-radius:0 0 16px 16px;">
                    <button onclick="document.getElementById('editUserModal').remove()" style="padding:10px 20px;border:1px solid #d1d5db;background:white;border-radius:8px;cursor:pointer;">Batal</button>
                    <button onclick="saveEditUser('${username}')" style="padding:10px 20px;border:none;background:#0066cc;color:white;border-radius:8px;cursor:pointer;"><i class="fas fa-save"></i> Simpan</button>
                </div>
            </div>
        </div>
    `);
}

function saveEditUser(username) {
    const updates = {
        name: document.getElementById('editUserName').value.trim(),
        status: document.getElementById('editUserStatus').value,
        role: document.getElementById('editUserRole').value
    };
    
    const newPassword = document.getElementById('editUserPassword').value.trim();
    if (newPassword) {
        updates.password = newPassword;
    }
    
    const result = updateUser(username, updates);
    
    if (result.success) {
        alert(`âœ… User ${username} berhasil diupdate!`);
        document.getElementById('editUserModal').remove();
        showUserManagementModal();
    } else {
        alert(`âš ï¸ Error: ${result.error}`);
    }
}

function confirmDeleteUser(username) {
    if (confirm(`Hapus user ${username}?`)) {
        const result = deleteUser(username);
        if (result.success) {
            alert(`âœ… User ${username} dihapus!`);
            showUserManagementModal();
        } else {
            alert(`âš ï¸ Error: ${result.error}`);
        }
    }
}

// ========================================
// SESSION INFO COMPONENT
// ========================================

function renderSessionInfo() {
    const session = getCurrentSession();
    if (!session) return '';
    
    const role = USER_ROLES[session.role];
    
    return `
        <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f9fafb;border-radius:10px;margin-bottom:20px;">
            <div style="width:45px;height:45px;background:${role.color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;">
                ${role.icon}
            </div>
            <div style="flex:1;">
                <div style="font-weight:600;color:#1f2937;">${session.name}</div>
                <div style="font-size:12px;color:#6b7280;">${session.officeName} â€¢ ${role.label}</div>
            </div>
            <button onclick="logout();location.reload();" style="padding:8px 12px;border:1px solid #fecaca;background:#fef2f2;color:#dc2626;border-radius:6px;cursor:pointer;font-size:12px;">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>
    `;
}

// ========================================
// INIT
// ========================================

loadUsers();

// ========================================
// EXPORTS
// ========================================

window.USER_ROLES = USER_ROLES;
window.USERS = USERS;
window.login = login;
window.logout = logout;
window.getCurrentSession = getCurrentSession;
window.getCurrentUser = getCurrentUser;
window.isLoggedIn = isLoggedIn;
window.hasPermission = hasPermission;
window.hasAnyPermission = hasAnyPermission;
window.hasAllPermissions = hasAllPermissions;
window.createUser = createUser;
window.updateUser = updateUser;
window.deleteUser = deleteUser;
window.changePassword = changePassword;
window.getAllUsers = getAllUsers;
window.getUsersByRole = getUsersByRole;
window.getUsersByOffice = getUsersByOffice;
window.generateUsername = generateUsername;
window.showLoginModal = showLoginModal;
window.showUserManagementModal = showUserManagementModal;
window.showAddUserModal = showAddUserModal;
window.showEditUserModal = showEditUserModal;
window.renderSessionInfo = renderSessionInfo;
window.doLogin = doLogin;
window.togglePasswordVisibility = togglePasswordVisibility;
window.onAddUserRoleChange = onAddUserRoleChange;
window.onAddUserOfficeChange = onAddUserOfficeChange;
window.saveNewUser = saveNewUser;
window.saveEditUser = saveEditUser;
window.confirmDeleteUser = confirmDeleteUser;

console.log('âœ… User Manager loaded - ' + Object.keys(USERS).length + ' users');
