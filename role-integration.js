// ========================================
// ROLE INTEGRATION - BANK SULSELBAR
// Integrasi role-based access ke dashboard
// ========================================

console.log('ðŸ” Loading Role Integration...');

// ========================================
// GET CURRENT USER SESSION
// ========================================

function getCurrentUserSession() {
    // Try sessionStorage first
    try {
        const stored = sessionStorage.getItem('userSession');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {}
    
    // Try user-manager session
    if (typeof getCurrentSession === 'function') {
        return getCurrentSession();
    }
    
    // Fallback - legacy admin
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        return {
            username: sessionStorage.getItem('username') || 'SIMO',
            name: 'Administrator',
            role: 'ADMIN',
            roleInfo: { label: 'Administrator', icon: 'ðŸ‘‘', color: '#8ac01e' },
            officeCode: '000',
            officeName: 'Kantor Pusat',
            permissions: ['manage_users', 'manage_offices', 'set_targets', 'view_all', 'input_realization', 'approve_data', 'export_reports', 'view_dashboard', 'view_ratios', 'manage_pipeline', 'delete_data']
        };
    }
    
    return null;
}

// ========================================
// CHECK PERMISSION
// ========================================

function checkPermission(permission) {
    const session = getCurrentUserSession();
    if (!session) return false;
    
    // Admin has all permissions
    if (session.role === 'ADMIN') return true;
    
    return session.permissions?.includes(permission) || false;
}

function checkAnyPermission(permissions) {
    return permissions.some(p => checkPermission(p));
}

// ========================================
// UPDATE SIDEBAR BASED ON ROLE
// ========================================

function updateSidebarForRole() {
    const session = getCurrentUserSession();
    if (!session) return;
    
    const role = session.role;
    const sidebar = document.querySelector('.sidebar-nav');
    if (!sidebar) return;
    
    // Update user info in sidebar footer
    const userNameEl = document.querySelector('.user-name');
    const userRoleEl = document.querySelector('.user-role');
    
    if (userNameEl) {
        userNameEl.textContent = session.name || session.username;
    }
    if (userRoleEl) {
        const roleLabel = session.roleInfo?.label || role;
        const roleIcon = session.roleInfo?.icon || 'ðŸ‘¤';
        userRoleEl.innerHTML = `${roleIcon} ${roleLabel}`;
    }
    
    // Add role-specific menu items
    addRoleBasedMenuItems(role, sidebar);
    
    // Hide/disable items based on role
    applyRoleRestrictions(role);
}

function addRoleBasedMenuItems(role, sidebar) {
    // Find or create "MANAJEMEN DATA" section
    let managementSection = document.querySelector('.nav-section-management');
    
    if (!managementSection) {
        // Create new section after LAPORAN
        const laporanSection = Array.from(document.querySelectorAll('.nav-section')).find(
            s => s.querySelector('.nav-section-title')?.textContent?.includes('LAPORAN')
        );
        
        if (laporanSection) {
            managementSection = document.createElement('div');
            managementSection.className = 'nav-section nav-section-management';
            managementSection.innerHTML = `
                <p class="nav-section-title">MANAJEMEN DATA</p>
                <a href="#" class="nav-item" data-section="offices" data-permission="view_all" onclick="if(typeof showOfficeListModal==='function')showOfficeListModal();">
                    <i class="fas fa-building"></i>
                    <span>Kode Kantor</span>
                </a>
                <a href="#" class="nav-item" data-section="add-office" data-permission="manage_offices" onclick="if(typeof showAddOfficeModal==='function')showAddOfficeModal();">
                    <i class="fas fa-plus-circle"></i>
                    <span>Tambah Kantor</span>
                </a>
                <a href="#" class="nav-item" data-section="targets" data-permission="set_targets" onclick="if(typeof showTargetEntryModal==='function')showTargetEntryModal();">
                    <i class="fas fa-bullseye"></i>
                    <span>Input Target</span>
                </a>
                <a href="#" class="nav-item" data-section="import" data-permission="input_realization" onclick="if(typeof triggerImportFile==='function')triggerImportFile();">
                    <i class="fas fa-file-excel"></i>
                    <span>Import Realisasi</span>
                </a>
            `;
            laporanSection.after(managementSection);
        }
    }
    
    // Add User Management for ADMIN only
    if (role === 'ADMIN') {
        const pengaturanSection = Array.from(document.querySelectorAll('.nav-section')).find(
            s => s.querySelector('.nav-section-title')?.textContent?.includes('PENGATURAN')
        );
        
        if (pengaturanSection) {
            // Check if user management already exists
            if (!pengaturanSection.querySelector('[data-section="users"]')) {
                const usersLink = document.createElement('a');
                usersLink.href = '#';
                usersLink.className = 'nav-item';
                usersLink.dataset.section = 'users';
                usersLink.onclick = function() { 
                    if (typeof showUserManagementModal === 'function') {
                        showUserManagementModal();
                    } else {
                        alert('User Management module belum dimuat');
                    }
                };
                usersLink.innerHTML = '<i class="fas fa-users-cog"></i><span>Kelola User</span>';
                
                // Insert before Settings
                const settingsLink = pengaturanSection.querySelector('[data-section="settings"]');
                if (settingsLink) {
                    settingsLink.before(usersLink);
                } else {
                    pengaturanSection.appendChild(usersLink);
                }
            }
        }
    }
}

function applyRoleRestrictions(role) {
    const session = getCurrentUserSession();
    if (!session) return;
    
    // Get all nav items with permission requirements
    document.querySelectorAll('.nav-item[data-permission]').forEach(item => {
        const requiredPermission = item.dataset.permission;
        
        if (!checkPermission(requiredPermission)) {
            item.classList.add('nav-item-disabled');
            item.style.opacity = '0.4';
            item.style.pointerEvents = 'none';
            item.title = 'Anda tidak memiliki akses untuk fitur ini';
        }
    });
    
    // Role-specific restrictions
    if (role === 'VIEWER') {
        // Hide all input-related items
        document.querySelectorAll('[data-section="targets"], [data-section="import"], [data-section="add-office"]').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    if (role === 'OPERATOR') {
        // Hide target input and office management
        document.querySelectorAll('[data-section="targets"], [data-section="add-office"]').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    if (role === 'PINCAB') {
        // Hide add office
        document.querySelectorAll('[data-section="add-office"]').forEach(el => {
            el.style.display = 'none';
        });
    }
}

// ========================================
// OFFICE FILTER BASED ON ROLE
// ========================================

function getAccessibleOffices() {
    const session = getCurrentUserSession();
    if (!session) return [];
    
    // Admin and Viewer can see all
    if (session.role === 'ADMIN' || session.role === 'VIEWER') {
        if (typeof getAllOfficesArray === 'function') {
            return getAllOfficesArray();
        }
        return [];
    }
    
    // Pincab and Operator can only see their office and children
    const officeCode = session.officeCode;
    const offices = [];
    
    if (typeof getOffice === 'function') {
        const mainOffice = getOffice(officeCode);
        if (mainOffice) {
            offices.push({ code: officeCode, ...mainOffice });
        }
    }
    
    if (typeof getChildOffices === 'function') {
        const children = getChildOffices(officeCode);
        offices.push(...children);
    }
    
    return offices;
}

// ========================================
// ADD USER INFO BANNER
// ========================================

function addUserInfoBanner() {
    const session = getCurrentUserSession();
    if (!session) return;
    
    // Check if banner already exists
    if (document.getElementById('userInfoBanner')) return;
    
    const header = document.querySelector('.top-header .header-right');
    if (!header) return;
    
    const roleInfo = session.roleInfo || { icon: 'ðŸ‘¤', color: '#6b7280', label: session.role };
    
    const banner = document.createElement('div');
    banner.id = 'userInfoBanner';
    banner.className = 'header-item user-info-banner';
    banner.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: ${roleInfo.color}15;
        border: 1px solid ${roleInfo.color}30;
        border-radius: 8px;
        cursor: pointer;
    `;
    banner.innerHTML = `
        <span style="font-size:16px;">${roleInfo.icon}</span>
        <div style="line-height:1.2;">
            <div style="font-size:12px;font-weight:600;color:#1f2937;">${session.name || session.username}</div>
            <div style="font-size:10px;color:#6b7280;">${session.officeName || 'Kantor Pusat'}</div>
        </div>
    `;
    banner.onclick = function() {
        showUserProfilePopup();
    };
    
    // Insert at beginning of header-right
    header.insertBefore(banner, header.firstChild);
}

function showUserProfilePopup() {
    const session = getCurrentUserSession();
    if (!session) return;
    
    // Remove existing popup
    document.getElementById('userProfilePopup')?.remove();
    
    const roleInfo = session.roleInfo || { icon: 'ðŸ‘¤', color: '#6b7280', label: session.role };
    
    const popup = document.createElement('div');
    popup.id = 'userProfilePopup';
    popup.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        width: 280px;
        z-index: 99999;
        overflow: hidden;
        animation: slideDown 0.2s ease;
    `;
    popup.innerHTML = `
        <style>
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>
        <div style="padding:20px;background:linear-gradient(135deg,${roleInfo.color},${roleInfo.color}dd);color:white;text-align:center;">
            <div style="font-size:40px;margin-bottom:8px;">${roleInfo.icon}</div>
            <div style="font-size:16px;font-weight:600;">${session.name || session.username}</div>
            <div style="font-size:12px;opacity:0.9;">${roleInfo.label}</div>
        </div>
        <div style="padding:16px;">
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;">
                <span style="color:#6b7280;font-size:13px;">Username</span>
                <span style="font-weight:600;font-size:13px;font-family:monospace;">${session.username}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;">
                <span style="color:#6b7280;font-size:13px;">Kantor</span>
                <span style="font-weight:500;font-size:13px;">${session.officeName || '-'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;">
                <span style="color:#6b7280;font-size:13px;">Kode</span>
                <span style="font-weight:600;font-size:13px;font-family:monospace;">${session.officeCode || '000'}</span>
            </div>
        </div>
        <div style="padding:12px 16px;background:#f9fafb;border-top:1px solid #e5e7eb;display:flex;gap:8px;">
            <button onclick="showChangePasswordModal();document.getElementById('userProfilePopup').remove();" style="flex:1;padding:8px;border:1px solid #d1d5db;background:white;border-radius:6px;cursor:pointer;font-size:12px;">
                <i class="fas fa-key"></i> Ganti Password
            </button>
            <button onclick="doLogoutFromDashboard()" style="flex:1;padding:8px;border:none;background:#dc2626;color:white;border-radius:6px;cursor:pointer;font-size:12px;">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Close on click outside
    setTimeout(() => {
        document.addEventListener('click', function closePopup(e) {
            if (!popup.contains(e.target) && !e.target.closest('#userInfoBanner')) {
                popup.remove();
                document.removeEventListener('click', closePopup);
            }
        });
    }, 100);
}

function showChangePasswordModal() {
    const session = getCurrentUserSession();
    if (!session) return;
    
    document.getElementById('changePwdModal')?.remove();
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="changePwdModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:999999;padding:20px;">
            <div style="background:white;border-radius:16px;width:100%;max-width:400px;">
                <div style="padding:20px 24px;background:linear-gradient(135deg,#f59e0b,#d97706);color:white;border-radius:16px 16px 0 0;">
                    <h3 style="margin:0;font-size:18px;"><i class="fas fa-key"></i> Ganti Password</h3>
                </div>
                <div style="padding:24px;">
                    <div style="margin-bottom:16px;">
                        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Password Lama</label>
                        <input type="password" id="oldPassword" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;">
                    </div>
                    <div style="margin-bottom:16px;">
                        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Password Baru</label>
                        <input type="password" id="newPassword" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;">
                    </div>
                    <div style="margin-bottom:16px;">
                        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Konfirmasi Password Baru</label>
                        <input type="password" id="confirmPassword" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;">
                    </div>
                </div>
                <div style="padding:16px 24px;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end;gap:12px;background:#f9fafb;border-radius:0 0 16px 16px;">
                    <button onclick="document.getElementById('changePwdModal').remove()" style="padding:10px 20px;border:1px solid #d1d5db;background:white;border-radius:8px;cursor:pointer;">Batal</button>
                    <button onclick="doChangePassword()" style="padding:10px 20px;border:none;background:#f59e0b;color:white;border-radius:8px;cursor:pointer;font-weight:500;"><i class="fas fa-save"></i> Simpan</button>
                </div>
            </div>
        </div>
    `);
}

function doChangePassword() {
    const oldPwd = document.getElementById('oldPassword').value;
    const newPwd = document.getElementById('newPassword').value;
    const confirmPwd = document.getElementById('confirmPassword').value;
    
    if (!oldPwd || !newPwd || !confirmPwd) {
        alert('âš ï¸ Lengkapi semua field!');
        return;
    }
    
    if (newPwd !== confirmPwd) {
        alert('âš ï¸ Password baru tidak cocok!');
        return;
    }
    
    if (newPwd.length < 6) {
        alert('âš ï¸ Password minimal 6 karakter!');
        return;
    }
    
    const session = getCurrentUserSession();
    
    // Try user-manager changePassword
    if (typeof changePassword === 'function') {
        const result = changePassword(session.username, oldPwd, newPwd);
        if (result.success) {
            alert('âœ… Password berhasil diubah!');
            document.getElementById('changePwdModal').remove();
        } else {
            alert('âš ï¸ ' + result.error);
        }
    } else {
        // Legacy - just show success
        alert('âœ… Password berhasil diubah! (Demo mode)');
        document.getElementById('changePwdModal').remove();
    }
}

function doLogoutFromDashboard() {
    if (!confirm('Logout dari sistem?')) return;
    
    // Clear all session data
    sessionStorage.clear();
    
    // Clear user-manager session
    if (typeof logout === 'function') {
        logout();
    }
    
    // Keep remember me data if needed
    const rememberLogin = localStorage.getItem('rememberLogin');
    if (rememberLogin !== 'true') {
        localStorage.removeItem('savedUsername');
    }
    
    // Redirect to login
    window.location.href = 'login.html';
}

// ========================================
// INITIALIZE ON LOAD
// ========================================

function initRoleIntegration() {
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRoleIntegration);
        return;
    }
    
    // Small delay to ensure other scripts loaded
    setTimeout(() => {
        const session = getCurrentUserSession();
        if (!session) {
            console.log('No session found, redirecting to login...');
            window.location.href = 'login.html';
            return;
        }
        
        console.log('âœ… User session:', session.username, '(' + session.role + ')');
        
        updateSidebarForRole();
        addUserInfoBanner();
    }, 100);
}

// Auto-init
initRoleIntegration();

// ========================================
// EXPORTS
// ========================================

window.getCurrentUserSession = getCurrentUserSession;
window.checkPermission = checkPermission;
window.checkAnyPermission = checkAnyPermission;
window.getAccessibleOffices = getAccessibleOffices;
window.updateSidebarForRole = updateSidebarForRole;
window.showChangePasswordModal = showChangePasswordModal;
window.doChangePassword = doChangePassword;
window.doLogoutFromDashboard = doLogoutFromDashboard;
window.showUserProfilePopup = showUserProfilePopup;

console.log('âœ… Role Integration loaded');
