/**
 * Admin CMS Controller
 * Full CRUD for Schedule & Roadmap, General Settings, Export/Import, and Auth.
 */

document.addEventListener('DOMContentLoaded', () => {
  const SESSION_AUTH_KEY = 'parrticipant_admin_logged_in';

  // Auth Elements
  const authOverlay = document.getElementById('authOverlay');
  const authForm = document.getElementById('authForm');
  const adminPassInput = document.getElementById('adminPassInput');
  const authError = document.getElementById('authError');
  const btnLogout = document.getElementById('btnLogout');

  // Sidebar & Tabs
  const sidebarTabBtns = document.querySelectorAll('.sidebar-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // Schedule Elements
  const adminScheduleTableBody = document.getElementById('adminScheduleTableBody');
  const adminScheduleSearch = document.getElementById('adminScheduleSearch');
  const adminScheduleCategoryFilter = document.getElementById('adminScheduleCategoryFilter');
  const btnAddNewSchedule = document.getElementById('btnAddNewSchedule');

  // Schedule Modal
  const scheduleModal = document.getElementById('scheduleModal');
  const scheduleModalTitle = document.getElementById('scheduleModalTitle');
  const scheduleForm = document.getElementById('scheduleForm');
  const btnCloseScheduleModal = document.getElementById('btnCloseScheduleModal');
  const btnCancelScheduleModal = document.getElementById('btnCancelScheduleModal');
  const editScheduleId = document.getElementById('editScheduleId');
  const modalScheduleTime = document.getElementById('modalScheduleTime');
  const modalScheduleRawTime = document.getElementById('modalScheduleRawTime');
  const modalScheduleTitle = document.getElementById('modalScheduleTitle');
  const modalScheduleCategory = document.getElementById('modalScheduleCategory');
  const modalScheduleStatus = document.getElementById('modalScheduleStatus');
  const modalScheduleVenue = document.getElementById('modalScheduleVenue');
  const modalScheduleSpeaker = document.getElementById('modalScheduleSpeaker');
  const modalScheduleDescription = document.getElementById('modalScheduleDescription');
  const modalScheduleHighlight = document.getElementById('modalScheduleHighlight');

  // Roadmap Elements
  const adminRoadmapTableBody = document.getElementById('adminRoadmapTableBody');
  const btnAddRoadmapPhase = document.getElementById('btnAddRoadmapPhase');

  // Roadmap Modal
  const roadmapModal = document.getElementById('roadmapModal');
  const roadmapModalTitle = document.getElementById('roadmapModalTitle');
  const roadmapForm = document.getElementById('roadmapForm');
  const btnCloseRoadmapModal = document.getElementById('btnCloseRoadmapModal');
  const btnCancelRoadmapModal = document.getElementById('btnCancelRoadmapModal');
  const editRoadmapId = document.getElementById('editRoadmapId');
  const modalRoadmapPhase = document.getElementById('modalRoadmapPhase');
  const modalRoadmapBadge = document.getElementById('modalRoadmapBadge');
  const modalRoadmapTitle = document.getElementById('modalRoadmapTitle');
  const modalRoadmapTimeRange = document.getElementById('modalRoadmapTimeRange');
  const modalRoadmapSummary = document.getElementById('modalRoadmapSummary');
  const modalRoadmapDeliverables = document.getElementById('modalRoadmapDeliverables');

  // Settings Elements
  const btnSaveGeneralSettings = document.getElementById('btnSaveGeneralSettings');
  const settingTitle = document.getElementById('settingTitle');
  const settingOrg = document.getElementById('settingOrg');
  const settingTagline = document.getElementById('settingTagline');
  const settingDate = document.getElementById('settingDate');
  const settingStartTime = document.getElementById('settingStartTime');
  const settingEndTime = document.getElementById('settingEndTime');
  const settingVenue = document.getElementById('settingVenue');
  const settingAnnouncement = document.getElementById('settingAnnouncement');
  const settingAnnouncementActive = document.getElementById('settingAnnouncementActive');

  // Backup Elements
  const btnExportJSON = document.getElementById('btnExportJSON');
  const importFileInput = document.getElementById('importFileInput');
  const btnResetDefault = document.getElementById('btnResetDefault');
  const newPasscodeInput = document.getElementById('newPasscodeInput');
  const btnChangePassword = document.getElementById('btnChangePassword');

  // Toast Container
  const toastContainer = document.getElementById('toastContainer');

  // 1. Authentication
  function checkAuth() {
    const isLoggedIn = sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
    if (isLoggedIn) {
      authOverlay.classList.add('hidden');
    } else {
      authOverlay.classList.remove('hidden');
      if (adminPassInput) adminPassInput.focus();
    }
  }

  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPass = adminPassInput.value;
      if (window.EventData.verifyAdminPassword(enteredPass)) {
        sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
        authOverlay.classList.add('hidden');
        authError.classList.remove('visible');
        showToast('Authentication successful. Welcome, Organizer!', 'success');
        loadAllAdminData();
      } else {
        authError.classList.add('visible');
        adminPassInput.select();
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
      authOverlay.classList.remove('hidden');
      if (adminPassInput) {
        adminPassInput.value = '';
        adminPassInput.focus();
      }
      showToast('Admin console locked.', 'success');
    });
  }

  // 2. Tab Navigation
  sidebarTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      sidebarTabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePane = document.getElementById(targetTab);
      if (activePane) activePane.classList.add('active');

      if (targetTab === 'tabSchedule') renderScheduleTable();
      if (targetTab === 'tabRoadmap') renderRoadmapTable();
      if (targetTab === 'tabSettings') populateSettingsForm();
    });
  });

  // 3. Load All Data
  function loadAllAdminData() {
    renderScheduleTable();
    renderRoadmapTable();
    populateSettingsForm();
  }

  // 4. Render Schedule Datatable
  function renderScheduleTable() {
    if (!adminScheduleTableBody) return;
    const schedule = window.EventData.getSchedule();
    const categories = window.EventData.getAll().categories || [];
    const catMap = categories.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});

    const query = (adminScheduleSearch ? adminScheduleSearch.value : '').toLowerCase().trim();
    const catFilter = adminScheduleCategoryFilter ? adminScheduleCategoryFilter.value : 'all';

    const filtered = schedule.filter(item => {
      if (catFilter !== 'all' && item.category !== catFilter) return false;
      if (query) {
        const titleMatch = (item.title || '').toLowerCase().includes(query);
        const venueMatch = (item.venue || '').toLowerCase().includes(query);
        const timeMatch = (item.time || '').toLowerCase().includes(query);
        if (!titleMatch && !venueMatch && !timeMatch) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      adminScheduleTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 30px; color: var(--admin-text-muted);">
            No schedule sessions found.
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    filtered.forEach(item => {
      const cat = catMap[item.category] || { name: 'General', color: '#64748b' };
      
      let statusBadge = '';
      if (item.status === 'live') {
        statusBadge = `<span class="table-badge" style="background: rgba(239, 68, 68, 0.2); color: #f87171;">● Live</span>`;
      } else if (item.status === 'completed') {
        statusBadge = `<span class="table-badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">✓ Done</span>`;
      } else {
        statusBadge = `<span class="table-badge" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa;">Scheduled</span>`;
      }

      rowsHtml += `
        <tr>
          <td class="table-time">${escapeHTML(item.time)}</td>
          <td class="table-title-cell">
            <strong>${escapeHTML(item.title)}</strong>
            <span>${escapeHTML(item.description || 'No description provided')}</span>
          </td>
          <td>
            <span class="table-badge" style="background: ${cat.color}22; color: ${cat.color}; border: 1px solid ${cat.color}44;">
              ${escapeHTML(cat.name)}
            </span>
          </td>
          <td>${escapeHTML(item.venue || '—')}</td>
          <td>${statusBadge}</td>
          <td>
            <div class="table-actions" style="justify-content: flex-end;">
              <button class="btn-table-action edit-schedule-btn" data-id="${item.id}" title="Edit Session">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
              <button class="btn-table-action delete delete-schedule-btn" data-id="${item.id}" data-title="${escapeHTML(item.title)}" title="Delete Session">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    adminScheduleTableBody.innerHTML = rowsHtml;

    // Attach actions
    adminScheduleTableBody.querySelectorAll('.edit-schedule-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditScheduleModal(id);
      });
    });

    adminScheduleTableBody.querySelectorAll('.delete-schedule-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const title = btn.getAttribute('data-title');
        handleDeleteSchedule(id, title);
      });
    });
  }

  // Filter Event Listeners
  if (adminScheduleSearch) adminScheduleSearch.addEventListener('input', renderScheduleTable);
  if (adminScheduleCategoryFilter) adminScheduleCategoryFilter.addEventListener('change', renderScheduleTable);

  // 5. Schedule Modal Handlers
  function openAddScheduleModal() {
    scheduleForm.reset();
    editScheduleId.value = '';
    scheduleModalTitle.textContent = 'Add New Event Session';
    modalScheduleRawTime.value = '11:30';
    modalScheduleTime.value = '11:30 AM';
    modalScheduleStatus.value = 'scheduled';
    scheduleModal.classList.add('active');
  }

  function openEditScheduleModal(id) {
    const item = window.EventData.getSchedule().find(s => s.id === id);
    if (!item) return;

    editScheduleId.value = item.id;
    scheduleModalTitle.textContent = 'Edit Event Session';
    modalScheduleTime.value = item.time || '';
    modalScheduleRawTime.value = item.rawTime || '12:00';
    modalScheduleTitle.value = item.title || '';
    modalScheduleCategory.value = item.category || 'ceremony';
    modalScheduleStatus.value = item.status || 'scheduled';
    modalScheduleVenue.value = item.venue || '';
    modalScheduleSpeaker.value = item.speaker || '';
    modalScheduleDescription.value = item.description || '';
    modalScheduleHighlight.checked = !!item.isHighlight;

    scheduleModal.classList.add('active');
  }

  function closeScheduleModal() {
    scheduleModal.classList.remove('active');
  }

  if (btnAddNewSchedule) btnAddNewSchedule.addEventListener('click', openAddScheduleModal);
  if (btnCloseScheduleModal) btnCloseScheduleModal.addEventListener('click', closeScheduleModal);
  if (btnCancelScheduleModal) btnCancelScheduleModal.addEventListener('click', closeScheduleModal);

  // Auto-sync 24h raw time to 12h display time
  if (modalScheduleRawTime) {
    modalScheduleRawTime.addEventListener('input', (e) => {
      const val = e.target.value;
      if (!val) return;
      const [h, m] = val.split(':');
      let hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      modalScheduleTime.value = `${String(hour).padStart(2, '0')}:${m} ${ampm}`;
    });
  }

  // Schedule Form Submit (Add / Edit)
  if (scheduleForm) {
    scheduleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = editScheduleId.value;
      const payload = {
        time: modalScheduleTime.value.trim(),
        rawTime: modalScheduleRawTime.value.trim(),
        title: modalScheduleTitle.value.trim(),
        category: modalScheduleCategory.value,
        status: modalScheduleStatus.value,
        venue: modalScheduleVenue.value.trim(),
        speaker: modalScheduleSpeaker.value.trim(),
        description: modalScheduleDescription.value.trim(),
        isHighlight: modalScheduleHighlight.checked
      };

      if (id) {
        window.EventData.updateScheduleItem(id, payload);
        showToast(`Updated session: "${payload.title}"`, 'success');
      } else {
        window.EventData.addScheduleItem(payload);
        showToast(`Created new session: "${payload.title}"`, 'success');
      }

      closeScheduleModal();
      renderScheduleTable();
    });
  }

  // Delete Schedule
  function handleDeleteSchedule(id, title) {
    if (confirm(`Are you sure you want to delete session:\n"${title}"?\nThis action cannot be undone.`)) {
      const ok = window.EventData.deleteScheduleItem(id);
      if (ok) {
        showToast(`Deleted: "${title}"`, 'danger');
        renderScheduleTable();
      } else {
        showToast('Error deleting item', 'danger');
      }
    }
  }

  // 6. Roadmap Datatable & CRUD
  function renderRoadmapTable() {
    if (!adminRoadmapTableBody) return;
    const roadmap = window.EventData.getRoadmap();

    if (roadmap.length === 0) {
      adminRoadmapTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 30px; color: var(--admin-text-muted);">
            No roadmap phases found.
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    roadmap.forEach(rm => {
      const delivSummary = (rm.deliverables || []).map(d => `• ${escapeHTML(d)}`).join('<br>');

      rowsHtml += `
        <tr>
          <td style="font-family: var(--font-code); font-weight: 700; color: var(--admin-gold);">
            ${escapeHTML(rm.phaseNumber)}
          </td>
          <td>
            <strong style="color: #fff; font-size: 0.95rem;">${escapeHTML(rm.title)}</strong>
            <p style="font-size: 0.82rem; color: var(--admin-text-muted); margin: 4px 0;">${escapeHTML(rm.summary)}</p>
            ${delivSummary ? `<div style="font-size: 0.78rem; color: var(--admin-text-dim); margin-top: 6px;">${delivSummary}</div>` : ''}
          </td>
          <td style="font-family: var(--font-code);">${escapeHTML(rm.timeRange)}</td>
          <td>
            <span class="table-badge" style="background: rgba(234, 179, 8, 0.15); color: var(--admin-gold);">
              ${escapeHTML(rm.badge)}
            </span>
          </td>
          <td>
            <div class="table-actions" style="justify-content: flex-end;">
              <button class="btn-table-action edit-roadmap-btn" data-id="${rm.id}" title="Edit Phase">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
              <button class="btn-table-action delete delete-roadmap-btn" data-id="${rm.id}" data-title="${escapeHTML(rm.title)}" title="Delete Phase">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    adminRoadmapTableBody.innerHTML = rowsHtml;

    // Attach actions
    adminRoadmapTableBody.querySelectorAll('.edit-roadmap-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditRoadmapModal(id);
      });
    });

    adminRoadmapTableBody.querySelectorAll('.delete-roadmap-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const title = btn.getAttribute('data-title');
        handleDeleteRoadmap(id, title);
      });
    });
  }

  function openAddRoadmapModal() {
    roadmapForm.reset();
    editRoadmapId.value = '';
    roadmapModalTitle.textContent = 'Add Milestone Phase';
    modalRoadmapPhase.value = `Phase 0${window.EventData.getRoadmap().length + 1}`;
    modalRoadmapBadge.value = 'Sprint';
    roadmapModal.classList.add('active');
  }

  function openEditRoadmapModal(id) {
    const item = window.EventData.getRoadmap().find(r => r.id === id);
    if (!item) return;

    editRoadmapId.value = item.id;
    roadmapModalTitle.textContent = 'Edit Milestone Phase';
    modalRoadmapPhase.value = item.phaseNumber || '';
    modalRoadmapBadge.value = item.badge || '';
    modalRoadmapTitle.value = item.title || '';
    modalRoadmapTimeRange.value = item.timeRange || '';
    modalRoadmapSummary.value = item.summary || '';
    modalRoadmapDeliverables.value = (item.deliverables || []).join('\n');

    roadmapModal.classList.add('active');
  }

  function closeRoadmapModal() {
    roadmapModal.classList.remove('active');
  }

  if (btnAddRoadmapPhase) btnAddRoadmapPhase.addEventListener('click', openAddRoadmapModal);
  if (btnCloseRoadmapModal) btnCloseRoadmapModal.addEventListener('click', closeRoadmapModal);
  if (btnCancelRoadmapModal) btnCancelRoadmapModal.addEventListener('click', closeRoadmapModal);

  if (roadmapForm) {
    roadmapForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = editRoadmapId.value;
      const deliverables = modalRoadmapDeliverables.value
        .split('\n')
        .map(d => d.trim())
        .filter(d => d.length > 0);

      const payload = {
        phaseNumber: modalRoadmapPhase.value.trim(),
        badge: modalRoadmapBadge.value.trim(),
        title: modalRoadmapTitle.value.trim(),
        timeRange: modalRoadmapTimeRange.value.trim(),
        summary: modalRoadmapSummary.value.trim(),
        deliverables: deliverables
      };

      if (id) {
        window.EventData.updateRoadmapItem(id, payload);
        showToast(`Updated phase: "${payload.title}"`, 'success');
      } else {
        window.EventData.addRoadmapItem(payload);
        showToast(`Added phase: "${payload.title}"`, 'success');
      }

      closeRoadmapModal();
      renderRoadmapTable();
    });
  }

  function handleDeleteRoadmap(id, title) {
    if (confirm(`Delete milestone phase: "${title}"?`)) {
      window.EventData.deleteRoadmapItem(id);
      showToast(`Deleted roadmap phase: "${title}"`, 'danger');
      renderRoadmapTable();
    }
  }

  // 7. General Settings & Live Notice
  function populateSettingsForm() {
    const general = window.EventData.getAll().general || {};
    if (settingTitle) settingTitle.value = general.title || '';
    if (settingOrg) settingOrg.value = general.organization || '';
    if (settingTagline) settingTagline.value = general.tagline || '';
    if (settingDate) settingDate.value = general.eventDate || '';
    if (settingStartTime) settingStartTime.value = general.startTime || '';
    if (settingEndTime) settingEndTime.value = general.endTime || '';
    if (settingVenue) settingVenue.value = general.venue || '';
    if (settingAnnouncement) settingAnnouncement.value = general.announcement || '';
    if (settingAnnouncementActive) settingAnnouncementActive.value = String(!!general.announcementActive);
  }

  if (btnSaveGeneralSettings) {
    btnSaveGeneralSettings.addEventListener('click', () => {
      const payload = {
        title: settingTitle.value.trim(),
        organization: settingOrg.value.trim(),
        tagline: settingTagline.value.trim(),
        eventDate: settingDate.value,
        startTime: settingStartTime.value.trim(),
        endTime: settingEndTime.value.trim(),
        venue: settingVenue.value.trim(),
        announcement: settingAnnouncement.value.trim(),
        announcementActive: settingAnnouncementActive.value === 'true'
      };

      window.EventData.updateGeneralSettings(payload);
      showToast('Event settings and notice ticker saved & broadcasted!', 'success');
    });
  }

  // 8. Backup & Restore Handlers
  if (btnExportJSON) {
    btnExportJSON.addEventListener('click', () => {
      const json = window.EventData.exportJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event-schedule-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('JSON backup exported successfully.', 'success');
    });
  }

  if (importFileInput) {
    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const res = window.EventData.importJSON(content);
        if (res.success) {
          showToast('Backup restored successfully!', 'success');
          loadAllAdminData();
          importFileInput.value = '';
        } else {
          showToast('Import failed: ' + res.error, 'danger');
        }
      };
      reader.readAsText(file);
    });
  }

  if (btnResetDefault) {
    btnResetDefault.addEventListener('click', () => {
      if (confirm('CAUTION: Reverting will overwrite your changes and restore all 15 events from the Inauguration Poster.\n\nContinue?')) {
        window.EventData.resetToDefault();
        showToast('Restored original Inauguration Poster schedule!', 'success');
        loadAllAdminData();
      }
    });
  }

  if (btnChangePassword) {
    btnChangePassword.addEventListener('click', () => {
      const newPass = (newPasscodeInput ? newPasscodeInput.value : '').trim();
      if (newPass.length < 4) {
        showToast('Passcode must be at least 4 characters long.', 'danger');
        return;
      }
      const ok = window.EventData.setAdminPassword(newPass);
      if (ok) {
        showToast('Admin passcode updated successfully!', 'success');
        newPasscodeInput.value = '';
      }
    });
  }

  // 9. Toast Helper
  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'danger') icon = '⚠️';

    toast.innerHTML = `
      <span style="font-weight: bold; font-size: 1.1rem;">${icon}</span>
      <span>${escapeHTML(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // 10. Multi-tab sync inside admin
  window.addEventListener('storage', (e) => {
    if (e.key === 'parrticipant_event_data_v1') {
      loadAllAdminData();
    }
  });

  // String escape
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial check
  checkAuth();
  loadAllAdminData();
});
