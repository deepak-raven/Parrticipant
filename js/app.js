/**
 * Attendee User Portal Script
 * Handles real-time schedule filtering, search, bookmarks, countdown,
 * roadmap rendering, poster modal, and multi-tab synchronization.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Agenda Bookmarks storage
  const BOOKMARKS_KEY = 'parrticipant_user_bookmarks';
  let userBookmarks = new Set(JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]'));

  // State
  let currentCategory = 'all';
  let searchQuery = '';
  let showOnlyBookmarked = false;

  // DOM Elements
  const heroMainTitle = document.getElementById('heroMainTitle');
  const heroSubtitleTag = document.getElementById('heroSubtitleTag');
  const heroTagline = document.getElementById('heroTagline');
  const heroDatePill = document.getElementById('heroDatePill');
  const heroTimePill = document.getElementById('heroTimePill');
  const heroVenuePill = document.getElementById('heroVenuePill');
  const topAnnouncement = document.getElementById('topAnnouncement');
  const announcementText = document.getElementById('announcementText');

  const scheduleListContainer = document.getElementById('scheduleList');
  const categoryPillsContainer = document.getElementById('categoryPills');
  const searchInput = document.getElementById('scheduleSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const bookmarkFilterBtn = document.getElementById('btnToggleBookmarks');
  const scheduleCountBadge = document.getElementById('scheduleCountBadge');

  const roadmapContainer = document.getElementById('roadmapGrid');
  const venuesContainer = document.getElementById('venuesGrid');

  // Poster Modal Elements
  const btnOpenPoster = document.getElementById('btnOpenPoster');
  const btnClosePoster = document.getElementById('btnClosePoster');
  const posterModal = document.getElementById('posterModal');
  const posterModalSchedule = document.getElementById('posterModalSchedule');
  const btnPrintPoster = document.getElementById('btnPrintPoster');

  // Countdown Elements
  const countDays = document.getElementById('countDays');
  const countHours = document.getElementById('countHours');
  const countMins = document.getElementById('countMins');
  const countSecs = document.getElementById('countSecs');

  // 1. Initial Load & Render
  function renderAll() {
    const data = window.EventData.getAll();
    renderGeneralInfo(data.general);
    renderCategoryFilters(data.categories);
    renderSchedule(data.schedule, data.categories);
    renderRoadmap(data.roadmap);
    renderVenues(data.venues);
    renderPosterModalContent(data.schedule, data.general);
  }

  // 2. Render General & Hero Details
  function renderGeneralInfo(general) {
    if (!general) return;
    if (heroMainTitle) heroMainTitle.textContent = general.title || "SCHEDULE-INAUGURATION";
    if (heroSubtitleTag) heroSubtitleTag.textContent = general.organization || "Department of Computer Science & Engineering";
    if (heroTagline) heroTagline.textContent = general.tagline || general.subtitle || "";

    if (heroDatePill) heroDatePill.innerHTML = `
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <span>${general.eventDate || "2026-09-23"}</span>
    `;

    if (heroTimePill) heroTimePill.innerHTML = `
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span>${general.startTime || "08:30 AM"} — ${general.endTime || "05:00 PM"}</span>
    `;

    if (heroVenuePill) heroVenuePill.innerHTML = `
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <span>${general.venue || "Campus Tech Hub & Main Auditorium"}</span>
    `;

    // Announcement bar
    if (topAnnouncement && announcementText) {
      if (general.announcementActive && general.announcement) {
        topAnnouncement.style.display = 'block';
        announcementText.textContent = general.announcement;
      } else {
        topAnnouncement.style.display = 'none';
      }
    }
  }

  // 3. Render Category Filters
  function renderCategoryFilters(categories) {
    if (!categoryPillsContainer) return;
    const cats = categories || [];
    
    let html = `
      <button class="cat-pill ${currentCategory === 'all' ? 'active' : ''}" data-cat="all">
        All Sessions (${window.EventData.getSchedule().length})
      </button>
    `;

    cats.forEach(cat => {
      const count = window.EventData.getSchedule().filter(s => s.category === cat.id).length;
      html += `
        <button class="cat-pill ${currentCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
          ${cat.name} (${count})
        </button>
      `;
    });

    categoryPillsContainer.innerHTML = html;

    // Attach click events
    categoryPillsContainer.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.getAttribute('data-cat');
        categoryPillsContainer.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderSchedule(window.EventData.getSchedule(), window.EventData.getAll().categories);
      });
    });
  }

  // 4. Render Schedule Items
  function renderSchedule(scheduleList, categories) {
    if (!scheduleListContainer) return;
    const catMap = (categories || []).reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {});

    // Filter by category
    let filtered = scheduleList.filter(item => {
      if (currentCategory !== 'all' && item.category !== currentCategory) return false;
      
      // Filter by search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = (item.title || '').toLowerCase().includes(query);
        const matchVenue = (item.venue || '').toLowerCase().includes(query);
        const matchDesc = (item.description || '').toLowerCase().includes(query);
        const matchSpeaker = (item.speaker || '').toLowerCase().includes(query);
        const matchTime = (item.time || '').toLowerCase().includes(query);
        if (!matchTitle && !matchVenue && !matchDesc && !matchSpeaker && !matchTime) return false;
      }

      // Filter by bookmarks
      if (showOnlyBookmarked && !userBookmarks.has(item.id)) {
        return false;
      }

      return true;
    });

    if (scheduleCountBadge) {
      scheduleCountBadge.textContent = `${filtered.length} session${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      scheduleListContainer.innerHTML = `
        <div class="empty-schedule">
          <h3>No events match your search or filter</h3>
          <p>Try clearing your search terms, changing the category, or disabling the bookmarks filter.</p>
        </div>
      `;
      return;
    }

    let cardsHtml = '';
    filtered.forEach(item => {
      const cat = catMap[item.category] || { name: 'General', color: '#64748b' };
      const isBookmarked = userBookmarks.has(item.id);
      const isHighlight = item.isHighlight;

      let statusBadge = '';
      if (item.status === 'live') {
        statusBadge = `<span class="time-status-badge status-live">● LIVE NOW</span>`;
      } else if (item.status === 'completed') {
        statusBadge = `<span class="time-status-badge status-completed">✓ Concluded</span>`;
      } else {
        statusBadge = `<span class="time-status-badge status-scheduled">Scheduled</span>`;
      }

      cardsHtml += `
        <div class="timeline-card ${isHighlight ? 'highlight' : ''}" data-id="${item.id}" style="border-left-color: ${cat.color};">
          <div class="timeline-time-block">
            <div class="time-display">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${item.time}</span>
            </div>
            ${statusBadge}
          </div>

          <div class="timeline-content-block">
            <div class="content-tags">
              <span class="cat-badge" style="background-color: ${cat.color};">${cat.name}</span>
              ${item.venue ? `
                <span class="venue-badge">
                  <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  ${item.venue}
                </span>
              ` : ''}
            </div>

            <h3 class="timeline-title">${escapeHTML(item.title)}</h3>
            
            ${item.description ? `<p class="timeline-desc">${escapeHTML(item.description)}</p>` : ''}

            ${item.speaker ? `
              <div class="timeline-speaker">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>Lead / Speaker: ${escapeHTML(item.speaker)}</span>
              </div>
            ` : ''}
          </div>

          <div class="timeline-actions">
            <button class="btn-star ${isBookmarked ? 'bookmarked' : ''}" data-id="${item.id}" title="${isBookmarked ? 'Remove from My Agenda' : 'Add to My Agenda'}">
              <svg width="18" height="18" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
          </div>
        </div>
      `;
    });

    scheduleListContainer.innerHTML = cardsHtml;

    // Attach bookmark toggle listeners
    scheduleListContainer.querySelectorAll('.btn-star').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        toggleBookmark(id);
      });
    });
  }

  // 5. Bookmark handling
  function toggleBookmark(id) {
    if (userBookmarks.has(id)) {
      userBookmarks.delete(id);
    } else {
      userBookmarks.add(id);
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(Array.from(userBookmarks)));
    renderSchedule(window.EventData.getSchedule(), window.EventData.getAll().categories);
  }

  // 6. Search & Bookmark Filter events
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (clearSearchBtn) {
        if (searchQuery.length > 0) {
          clearSearchBtn.classList.add('visible');
        } else {
          clearSearchBtn.classList.remove('visible');
        }
      }
      renderSchedule(window.EventData.getSchedule(), window.EventData.getAll().categories);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.classList.remove('visible');
      renderSchedule(window.EventData.getSchedule(), window.EventData.getAll().categories);
    });
  }

  if (bookmarkFilterBtn) {
    bookmarkFilterBtn.addEventListener('click', () => {
      showOnlyBookmarked = !showOnlyBookmarked;
      bookmarkFilterBtn.classList.toggle('active', showOnlyBookmarked);
      bookmarkFilterBtn.innerHTML = showOnlyBookmarked
        ? `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Showing Bookmarked`
        : `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> My Agenda`;
      renderSchedule(window.EventData.getSchedule(), window.EventData.getAll().categories);
    });
  }

  // 7. Render Roadmap
  function renderRoadmap(roadmap) {
    if (!roadmapContainer) return;
    const items = roadmap || [];
    let html = '';

    items.forEach(rm => {
      const deliverablesList = (rm.deliverables || []).map(d => `
        <li class="deliverable-item">
          <span class="deliverable-bullet">✦</span>
          <span>${escapeHTML(d)}</span>
        </li>
      `).join('');

      html += `
        <div class="roadmap-card" data-id="${rm.id}">
          <div class="roadmap-phase-header">
            <span class="phase-number">${escapeHTML(rm.phaseNumber)}</span>
            <span class="phase-badge">${escapeHTML(rm.badge || 'Milestone')}</span>
          </div>
          <h3>${escapeHTML(rm.title)}</h3>
          <div class="roadmap-time-window">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>${escapeHTML(rm.timeRange)}</span>
          </div>
          <p class="roadmap-summary">${escapeHTML(rm.summary)}</p>
          ${deliverablesList ? `<ul class="deliverables-list">${deliverablesList}</ul>` : ''}
        </div>
      `;
    });

    roadmapContainer.innerHTML = html;
  }

  // 8. Render Venues Directory
  function renderVenues(venues) {
    if (!venuesContainer) return;
    const items = venues || [];
    let html = '';

    items.forEach(v => {
      html += `
        <div class="venue-card">
          <div class="venue-card-header">
            <h3>${escapeHTML(v.name)}</h3>
            <span class="capacity-tag">${escapeHTML(v.capacity)}</span>
          </div>
          <p>${escapeHTML(v.description)}</p>
        </div>
      `;
    });

    venuesContainer.innerHTML = html;
  }

  // 9. Render Poster Replica Modal Content
  function renderPosterModalContent(schedule, general) {
    if (!posterModalSchedule) return;
    const items = schedule || [];
    let html = '';

    items.forEach(item => {
      html += `
        <li class="poster-item-row">
          <span class="poster-time-tag">${escapeHTML(item.time)}</span>
          <span class="poster-dash">—</span>
          <div class="poster-title-text">
            <span>${escapeHTML(item.title)}</span>
            ${item.venue ? `<span class="poster-venue-sub">${escapeHTML(item.venue)}</span>` : ''}
          </div>
        </li>
      `;
    });

    posterModalSchedule.innerHTML = html;
  }

  // 10. Poster Modal Open / Close handlers
  if (btnOpenPoster && posterModal) {
    btnOpenPoster.addEventListener('click', () => {
      posterModal.classList.add('active');
    });
  }

  if (btnClosePoster && posterModal) {
    btnClosePoster.addEventListener('click', () => {
      posterModal.classList.remove('active');
    });
  }

  if (posterModal) {
    posterModal.addEventListener('click', (e) => {
      if (e.target === posterModal) {
        posterModal.classList.remove('active');
      }
    });
  }

  if (btnPrintPoster) {
    btnPrintPoster.addEventListener('click', () => {
      window.print();
    });
  }

  // 11. Countdown Timer
  function updateCountdown() {
    const general = window.EventData.getAll().general || {};
    const targetDateStr = `${general.eventDate || "2026-09-23"} 08:30:00`;
    const targetTime = new Date(targetDateStr).getTime();
    const now = new Date().getTime();
    const diff = targetTime - now;

    if (diff <= 0) {
      if (countDays) countDays.textContent = "00";
      if (countHours) countHours.textContent = "00";
      if (countMins) countMins.textContent = "00";
      if (countSecs) countSecs.textContent = "00";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (countDays) countDays.textContent = String(days).padStart(2, '0');
    if (countHours) countHours.textContent = String(hours).padStart(2, '0');
    if (countMins) countMins.textContent = String(mins).padStart(2, '0');
    if (countSecs) countSecs.textContent = String(secs).padStart(2, '0');
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // 12. Multi-tab & Real-time Synchronization
  window.addEventListener('storage', (e) => {
    if (e.key === 'parrticipant_event_data_v1') {
      renderAll();
    }
  });

  window.addEventListener('parrticipant_data_updated', () => {
    renderAll();
  });

  // Helper escape
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial Execution
  renderAll();
});
