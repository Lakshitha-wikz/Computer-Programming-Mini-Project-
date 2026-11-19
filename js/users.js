// User Management Module (Admin Only)
let systemUsers = [];

async function loadUsers() {
  try {
    const data = await API.get('/api/users');
    systemUsers = data.users || [];
    renderUsersTable();
  } catch (err) {
    toast('Failed to load users: ' + err.message, true);
  }
}

function renderUsersTable() {
  const tbody = document.getElementById('usersTable');
  if (!tbody) return;

  if (systemUsers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--ink-soft);">No users registered.</td></tr>';
    return;
  }

  tbody.innerHTML = systemUsers.map(u => {
    let statusClass = 'paid';
    let statusText = 'Active';
    if (u.status === 'invited') {
      statusClass = 'pending';
      statusText = 'Invited';
    } else if (u.status === 'inactive') {
      statusClass = 'inactive';
      statusText = 'Inactive';
    }

    const roleName = u.role === 'admin' ? 'Admin' : 'Sales Staff';
    const isSelf = currentUser && currentUser.id === u.id;

    return `
      <tr>
        <td><strong>${escapeHtml(u.name)}</strong>${isSelf ? ' <small style="color:var(--copper);">(You)</small>' : ''}</td>
        <td class="mono">${escapeHtml(u.email)}</td>
        <td>${roleName}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td style="white-space:nowrap;">
          <button class="icon-btn" onclick="openEditUserModal(${u.id})" title="Edit User">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
          </button>
          ${!isSelf ? `
            <button class="icon-btn danger" onclick="deactivateUser(${u.id}, '${escapeHtml(u.name)}')" title="Deactivate User">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

async function saveNewUser() {
  const name = document.getElementById('inviteUserName').value.trim();
  const email = document.getElementById('inviteUserEmail').value.trim();
  const role = document.getElementById('inviteUserRole').value;
  const password = document.getElementById('inviteUserPass').value;

  if (!name || !email) {
    toast('Name and email are required', true);
    return;
  }

  try {
    await API.post('/api/users', { name, email, role, password, status: 'active' });
    closeModal('inviteUserModal');
    toast(`User ${name} added successfully`);

    document.getElementById('inviteUserName').value = '';
    document.getElementById('inviteUserEmail').value = '';
    document.getElementById('inviteUserPass').value = '';

    loadUsers();
  } catch (err) {
    toast(err.message, true);
  }
}

function openEditUserModal(userId) {
  const u = systemUsers.find(user => user.id === userId);
  if (!u) return;

  document.getElementById('editUserId').value = u.id;
  document.getElementById('editUserName').value = u.name;
  document.getElementById('editUserEmail').value = u.email;
  document.getElementById('editUserRole').value = u.role;
  document.getElementById('editUserStatus').value = u.status;
  document.getElementById('editUserPass').value = '';

  openModal('editUserModal');
}

async function saveEditUser() {
  const id = document.getElementById('editUserId').value;
  const name = document.getElementById('editUserName').value.trim();
  const role = document.getElementById('editUserRole').value;
  const status = document.getElementById('editUserStatus').value;
  const password = document.getElementById('editUserPass').value.trim();

  if (!name) {
    toast('Name is required', true);
    return;
  }

  try {
    await API.put(`/api/users/${id}`, {
      name,
      role,
      status,
      password: password || undefined
    });

    closeModal('editUserModal');
    toast('User updated successfully');
    loadUsers();
  } catch (err) {
    toast(err.message, true);
  }
}

async function deactivateUser(userId, name) {
  if (!confirm(`Are you sure you want to deactivate user "${name}"?`)) {
    return;
  }

  try {
    await API.del(`/api/users/${userId}`);
    toast(`User "${name}" has been deactivated`);
    loadUsers();
  } catch (err) {
    toast(err.message, true);
  }
}
