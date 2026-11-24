// =========================================================
// ตั้งค่าลิงก์ฐานข้อมูล CSV จาก Google Sheets
// =========================================================
const CONFIG = {
  APPS_CSV_URL:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSiN8jIgT62ylOypdPgsYaEskjC6MF7LeZH3d7J0e2BWJSkZ_ZrE2hoGgNqUJtLeUvkfMzx4bXBenJZ/pub?gid=0&single=true&output=csv',
  SETTINGS_CSV_URL:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSiN8jIgT62ylOypdPgsYaEskjC6MF7LeZH3d7J0e2BWJSkZ_ZrE2hoGgNqUJtLeUvkfMzx4bXBenJZ/pub?gid=2&single=true&output=csv',
  EXTERNAL_LINKS_CSV_URL:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSiN8jIgT62ylOypdPgsYaEskjC6MF7LeZH3d7J0e2BWJSkZ_ZrE2hoGgNqUJtLeUvkfMzx4bXBenJZ/pub?gid=1362478614&single=true&output=csv',
  DEFAULT_TEACHING_LOAD_URL:
    'https://script.google.com/macros/s/AKfycbxNtprN88p1cucvKF09WW6GwM3Is2VHOI0b7hzyvvWKIeZAqnzoJWzTN7drZ1naJlQU/exec',
  DEFAULT_PASSCODE_URL:
    'https://script.google.com/macros/s/AKfycbwAzVUsVLGp9aemQVINA87zt-A-c2BNekHNu-tTZHs6JjSKYrSsGKd3X-iVgBNKwiv_jg/exec',
  FALLBACK_APP_URLS: {
    APP03:
      'https://script.google.com/macros/s/AKfycbxNtprN88p1cucvKF09WW6GwM3Is2VHOI0b7hzyvvWKIeZAqnzoJWzTN7drZ1naJlQU/exec',
    APP04:
      'https://script.google.com/macros/s/AKfycbwAzVUsVLGp9aemQVINA87zt-A-c2BNekHNu-tTZHs6JjSKYrSsGKd3X-iVgBNKwiv_jg/exec',
    APP05:
      'https://script.google.com/macros/s/AKfycbzhULNRtnleMSXnq83ANydLPLFYcjXt5puFc6xNvnwBnric6LgY1gD0zUDaI84cFc9-Pg/exec',
    APP06:
      'https://script.google.com/macros/s/AKfycbxdSjpQ5uw1Q0dFq4X-bJVcAf2covmn4ZjE4x3FGpuBQDglbEs2cNe8a2yWpBMH5ngR/exec',
    APP07:
      'https://script.google.com/macros/s/AKfycbyJe-6iZZ7BBZKwEE59XAUsJYRwPyFJ0KEJXFHvFqY9H1qB0akGjjrzbfaYrfeYN0SE5Q/exec',
  },
  CACHE_KEY: 'ic2569_portal_hub_cache_v1',
  LEGACY_NAVY_OVERLAY: '#0f2942',
  LEGACY_NAVY_PRIMARY: '#1e3a5f',
};

// สถานะข้อมูลในหน้าเว็บ
let allApps = [];
let settings = {};
let activeCategory = 'ทั้งหมด';
let searchQuery = '';

// ชุดไอคอน SVG สำเร็จรูป (รองรับค่าจากคอลัมน์ icon_name)
const ICONS = {
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
  sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"></path></svg>`,
  megaphone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
  clipboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
  default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect></svg>`,
};

function getDisplayZone(app) {
  const raw = String((app && app.display_zone) || '').trim().toUpperCase();
  return raw === 'TOP_BAR' ? 'TOP_BAR' : 'MAIN_GRID';
}

// =========================================================
// ตัวแปลง CSV เป็น Array of Objects
// =========================================================
function parseCSV(csvText) {
  const cleanText = csvText.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(cell.trim());
        cell = '';
      } else if (char === '\r' && nextChar === '\n') {
        row.push(cell.trim());
        rows.push(row);
        row = [];
        cell = '';
        i++;
      } else if (char === '\n' || char === '\r') {
        row.push(cell.trim());
        rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += char;
      }
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    rows.push(row);
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  return rows
    .slice(1)
    .filter((r) => r.some((val) => val !== ''))
    .map((r) => {
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header] = r[idx] !== undefined ? r[idx] : '';
      });
      return obj;
    });
}

function hexToRgba(hex, alpha) {
  const cleaned = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidHttpUrl(url) {
  return /^https?:\/\/.+/i.test((url || '').trim());
}

// =========================================================
// นำค่าตั้งค่าจากแท็บ Portal_Settings มาปรับใช้กับหน้าเว็บ
// =========================================================
function applySettings(settingsRows) {
  settings = {};
  settingsRows.forEach((row) => {
    if (row.setting_key) {
      settings[row.setting_key.trim()] = row.setting_value || '';
    }
  });

  const root = document.documentElement;

  if (settings.site_title) {
    document.title = settings.site_title;
    document.getElementById('site-title').textContent = settings.site_title;
  }
  if (settings.site_subtitle) {
    document.getElementById('site-subtitle').textContent = settings.site_subtitle;
  }
  if (settings.dept_badge) {
    document.getElementById('dept-badge').textContent = settings.dept_badge;
  }
  if (settings.search_placeholder) {
    document.getElementById('search-input').placeholder = settings.search_placeholder;
  }
  if (settings.footer_text) {
    document.getElementById('footer-text').textContent = settings.footer_text;
  }
  if (settings.contact_info) {
    document.getElementById('contact-info').textContent = settings.contact_info;
  }

  // แถบประกาศ
  const noticeBar = document.getElementById('notice-bar');
  const showNotice = String(settings.show_notice || '').toUpperCase() === 'TRUE';
  if (showNotice && settings.notice_text) {
    document.getElementById('notice-text').textContent = settings.notice_text;
    noticeBar.classList.remove('hidden');
  } else {
    noticeBar.classList.add('hidden');
  }

  // โลโก้ภาควิชา
  const logoEl = document.getElementById('dept-logo');
  if (settings.logo_url) {
    logoEl.onload = () => logoEl.classList.remove('hidden');
    logoEl.onerror = () => logoEl.classList.add('hidden');
    logoEl.src = settings.logo_url;
  }

  // ภาพพื้นหลังและระดับความเบลอ
  const bgEl = document.getElementById('bg-image');
  if (settings.bg_image_url) {
    bgEl.style.backgroundImage = `url('${settings.bg_image_url}')`;
  }

  if (settings.bg_blur_px !== undefined && settings.bg_blur_px !== '') {
    const blurVal = parseFloat(settings.bg_blur_px);
    if (!Number.isNaN(blurVal) && blurVal >= 0) {
      root.style.setProperty('--bg-blur', `${blurVal}px`);
    }
  }

  // ระดับความทึบแสงและสีแผ่นกรองพื้นหลัง
  let opacityVal = 0.84;
  if (settings.bg_overlay_opacity !== undefined && settings.bg_overlay_opacity !== '') {
    const parsedOpacity = parseFloat(settings.bg_overlay_opacity);
    if (!Number.isNaN(parsedOpacity) && parsedOpacity >= 0 && parsedOpacity <= 1) {
      opacityVal = parsedOpacity;
      root.style.setProperty('--bg-overlay-opacity', String(opacityVal));
    }
  }

  const overlayColor = (settings.bg_overlay_color || '').trim().toLowerCase();
  if (overlayColor && overlayColor !== CONFIG.LEGACY_NAVY_OVERLAY) {
    const rgba = hexToRgba(overlayColor, opacityVal);
    if (rgba) {
      document.getElementById('bg-overlay').style.background = rgba;
    }
  }

  // สีหลักของธีม
  const primaryColor = (settings.primary_color || '').trim().toLowerCase();
  if (primaryColor && primaryColor !== CONFIG.LEGACY_NAVY_PRIMARY && /^#[0-9a-f]{6}$/i.test(primaryColor)) {
    root.style.setProperty('--primary', primaryColor);
    root.style.setProperty('--primary-hover', primaryColor);
  }
}

// =========================================================
// สร้างตัวกรองหมวดหมู่และแสดงผลการ์ดระบบงาน
// =========================================================
function renderCategoryFilters() {
  const filterWrap = document.getElementById('category-filters');
  const categories = ['ทั้งหมด', ...new Set(allApps.map((app) => app.category || 'อื่นๆ'))];
  if (!categories.includes(activeCategory)) {
    activeCategory = 'ทั้งหมด';
  }

  filterWrap.innerHTML = categories
    .map(
      (cat) => `
      <button
        type="button"
        class="filter-pill ${cat === activeCategory ? 'active' : ''}"
        data-category="${escapeHtml(cat)}"
        role="tab"
        aria-selected="${cat === activeCategory}"
      >${escapeHtml(cat)}</button>
    `
    )
    .join('');

  filterWrap.querySelectorAll('.filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.category;
      renderCategoryFilters();
      renderApps();
    });
  });
}

function renderTopBar(topBarApps) {
  const section = document.getElementById('top-bar-section');
  const container = document.getElementById('top-bar-container');
  if (!section || !container) return;

  if (!topBarApps || topBarApps.length === 0) {
    container.innerHTML = '';
    section.classList.add('hidden');
    return;
  }

  const colCount = Math.min(Math.max(topBarApps.length, 1), 4);
  container.className = `top-bar-grid cols-${colCount}`;

  container.innerHTML = topBarApps
    .map((app) => {
      const badgeType = (app.badge_type || 'active').trim().toLowerCase();
      const validUrl = isValidHttpUrl(app.app_url);
      const isDisabled = badgeType === 'coming_soon' || !validUrl;
      const iconSvg = ICONS[(app.icon_name || '').trim().toLowerCase()] || ICONS.default;
      const badgeHtml = app.badge_text
        ? `<span class="app-badge quick-card-badge badge-${escapeHtml(badgeType)}">${escapeHtml(app.badge_text)}</span>`
        : '';
      const descText = (app.description || app.target_users || '').trim();
      const tooltipText = [app.app_title, descText].filter(Boolean).join(' — ');

      const innerHtml = `
        <div class="quick-card-icon" aria-hidden="true">${iconSvg}</div>
        <div class="quick-card-body">
          <div class="quick-card-top">
            <h3 class="quick-card-title">${escapeHtml(app.app_title)}</h3>
            ${badgeHtml}
          </div>
          ${descText ? `<p class="quick-card-desc">${escapeHtml(descText)}</p>` : ''}
        </div>
        ${
          !isDisabled
            ? `<svg class="quick-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>`
            : ''
        }
      `;

      if (isDisabled) {
        return `<div class="quick-card is-disabled" aria-disabled="true" title="${escapeHtml(tooltipText)}">${innerHtml}</div>`;
      }
      return `<a class="quick-card" href="${escapeHtml(app.app_url.trim())}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(tooltipText)}">${innerHtml}</a>`;
    })
    .join('');

  section.classList.remove('hidden');
}

function renderApps() {
  const container = document.getElementById('apps-container');
  const statusEl = document.getElementById('status-message');

  const query = searchQuery.trim().toLowerCase();
  const filtered = allApps.filter((app) => {
    const matchCategory = activeCategory === 'ทั้งหมด' || (app.category || 'อื่นๆ') === activeCategory;
    if (!matchCategory) return false;
    if (!query) return true;

    const haystack = [app.app_title, app.description, app.target_users, app.category, app.badge_text]
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  });

  const topBarApps = filtered.filter((app) => getDisplayZone(app) === 'TOP_BAR');
  const mainGridApps = filtered.filter((app) => getDisplayZone(app) !== 'TOP_BAR');

  renderTopBar(topBarApps);

  if (filtered.length === 0) {
    container.innerHTML = '';
    statusEl.innerHTML = `<p>ไม่พบระบบงานที่ตรงกับเงื่อนไขการค้นหา</p>`;
    statusEl.classList.remove('hidden');
    return;
  }

  statusEl.classList.add('hidden');

  if (mainGridApps.length === 0) {
    container.innerHTML = '';
    return;
  }

  const grouped = new Map();
  mainGridApps.forEach((app) => {
    const cat = app.category || 'อื่นๆ';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat).push(app);
  });

  const openText = settings.btn_open_text || 'เข้าสู่ระบบงาน →';
  const disabledText = settings.btn_disabled_text || 'อยู่ระหว่างพัฒนา';

  let html = '';
  grouped.forEach((apps, categoryName) => {
    html += `
      <section class="category-section">
        <h2 class="category-heading">${escapeHtml(categoryName)}</h2>
        <div class="apps-grid">
          ${apps
            .map((app) => {
              const badgeType = (app.badge_type || 'active').trim().toLowerCase();
              const validUrl = isValidHttpUrl(app.app_url);
              const isDisabled = badgeType === 'coming_soon' || !validUrl;
              const iconSvg = ICONS[(app.icon_name || '').trim().toLowerCase()] || ICONS.default;

              const btnLabel = isDisabled
                ? badgeType === 'coming_soon'
                  ? disabledText
                  : 'รอระบุลิงก์ในฐานข้อมูล'
                : openText;

              return `
                <article class="app-card ${isDisabled ? 'is-disabled' : ''}">
                  <div class="card-top">
                    <div class="app-icon-wrap" aria-hidden="true">${iconSvg}</div>
                    ${
                      app.badge_text
                        ? `<span class="app-badge badge-${escapeHtml(badgeType)}">${escapeHtml(app.badge_text)}</span>`
                        : ''
                    }
                  </div>
                  <h3 class="app-title">${escapeHtml(app.app_title)}</h3>
                  <p class="app-desc">${escapeHtml(app.description)}</p>
                  ${
                    app.target_users
                      ? `
                    <div class="app-meta">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>${escapeHtml(app.target_users)}</span>
                    </div>
                  `
                      : ''
                  }
                  ${
                    isDisabled
                      ? `<span class="app-btn btn-disabled" aria-disabled="true">${escapeHtml(btnLabel)}</span>`
                      : `<a class="app-btn" href="${escapeHtml(app.app_url.trim())}" target="_blank" rel="noopener noreferrer">${escapeHtml(btnLabel)}</a>`
                  }
                </article>
              `;
            })
            .join('')}
        </div>
      </section>
    `;
  });

  container.innerHTML = html;
}

// =========================================================
// แสดงแถบปุ่มลิงก์หน่วยงานภายนอกจากแท็บ External_Links
// =========================================================
function renderExternalLinks(linkRows) {
  const section = document.getElementById('external-links-section');
  const listEl = document.getElementById('external-links-list');
  if (!section || !listEl) return;

  const visibleLinks = (linkRows || [])
    .filter(
      (item) =>
        String(item.is_visible || '').toUpperCase() === 'TRUE' &&
        item.link_title &&
        isValidHttpUrl(item.link_url)
    )
    .sort((a, b) => (parseFloat(a.display_order) || 999) - (parseFloat(b.display_order) || 999));

  if (visibleLinks.length === 0) {
    section.classList.add('hidden');
    return;
  }

  listEl.innerHTML = visibleLinks
    .map(
      (item) => `
      <a
        class="external-link-btn"
        href="${escapeHtml(item.link_url.trim())}"
        target="_blank"
        rel="noopener noreferrer"
        title="${escapeHtml(item.tooltip || item.link_title)}"
      >
        <span>${escapeHtml(item.link_title)}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </a>
    `
    )
    .join('');

  section.classList.remove('hidden');
}

function processPortalData(settingsCsv, appsCsv, extLinksCsv) {
  applySettings(parseCSV(settingsCsv));

  const parsedApps = parseCSV(appsCsv).map((app) => {
    const appId = (app.app_id || '').trim().toUpperCase();
    const rawUrl = (app.app_url || '').trim();
    const fallbackUrl = CONFIG.FALLBACK_APP_URLS[appId] || '';
    let iconName = (app.icon_name || '').trim().toLowerCase();
    let badgeType = (app.badge_type || 'active').trim().toLowerCase();
    let appTitle = (app.app_title || '').trim();
    let description = (app.description || '').trim();

    if (appId === 'APP06') {
      if (!iconName || iconName === 'sparkles' || iconName === 'default') iconName = 'clipboard';
      if (badgeType === 'restricted') badgeType = 'active';
    } else if (appId === 'APP07') {
      if (!iconName || iconName === 'folder' || iconName === 'default') iconName = 'megaphone';
      if (appTitle === 'ประกาศ') appTitle = 'ประกาศสำคัญและข่าวสาร';
      if (description === 'สำหรับประกาศข่าว') {
        description = 'ศูนย์รวมประกาศภาควิชา คณะ และมหาวิทยาลัย สำหรับนักศึกษาและคณาจารย์';
      }
    }

    return {
      ...app,
      app_title: appTitle,
      description: description,
      icon_name: iconName,
      badge_type: badgeType,
      app_url: isValidHttpUrl(rawUrl) ? rawUrl : fallbackUrl,
    };
  });

  // ดึงลิงก์ระบบจัดการรหัสผ่าน (APP04) ไปผูกกับปุ่มมุมขวาบนอัตโนมัติ
  const passcodeApp = parsedApps.find(
    (app) => (app.app_id || '').trim().toUpperCase() === 'APP04'
  );
  const passcodeBtn = document.getElementById('btn-passcode-manager');
  if (passcodeBtn) {
    const targetUrl =
      (passcodeApp && isValidHttpUrl(passcodeApp.app_url) && passcodeApp.app_url.trim()) ||
      CONFIG.DEFAULT_PASSCODE_URL;
    passcodeBtn.href = targetUrl;
  }

  allApps = parsedApps
    .filter((app) => String(app.is_visible || '').toUpperCase() === 'TRUE')
    .sort((a, b) => (parseFloat(a.display_order) || 999) - (parseFloat(b.display_order) || 999));

  renderCategoryFilters();
  renderApps();

  if (extLinksCsv) {
    renderExternalLinks(parseCSV(extLinksCsv));
  }
}

// =========================================================
// เริ่มต้นโหลดข้อมูลจาก Google Sheets (พร้อมระบบ Instant Cache)
// =========================================================
async function initPortal() {
  const statusEl = document.getElementById('status-message');
  let renderedFromCache = false;

  try {
    const cachedRaw = localStorage.getItem(CONFIG.CACHE_KEY);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (cached && cached.settingsCsv && cached.appsCsv) {
        processPortalData(cached.settingsCsv, cached.appsCsv, cached.extLinksCsv || '');
        renderedFromCache = true;
      }
    }
  } catch (e) {}

  try {
    const [settingsRes, appsRes] = await Promise.all([
      fetch(CONFIG.SETTINGS_CSV_URL, { cache: 'no-store' }),
      fetch(CONFIG.APPS_CSV_URL, { cache: 'no-store' }),
    ]);

    if (!settingsRes.ok || !appsRes.ok) {
      throw new Error('ไม่สามารถโหลดไฟล์ CSV จาก Google Sheets ได้');
    }

    const [settingsCsv, appsCsv] = await Promise.all([settingsRes.text(), appsRes.text()]);
    let extLinksCsv = '';

    if (isValidHttpUrl(CONFIG.EXTERNAL_LINKS_CSV_URL)) {
      try {
        const extRes = await fetch(CONFIG.EXTERNAL_LINKS_CSV_URL, { cache: 'no-store' });
        if (extRes.ok) extLinksCsv = await extRes.text();
      } catch (err) {
        console.warn('โหลดแท็บ External_Links ไม่สำเร็จ:', err);
      }
    }

    processPortalData(settingsCsv, appsCsv, extLinksCsv);

    try {
      localStorage.setItem(
        CONFIG.CACHE_KEY,
        JSON.stringify({ settingsCsv, appsCsv, extLinksCsv, updatedAt: Date.now() })
      );
    } catch (e) {}
  } catch (err) {
    console.error(err);
    if (!renderedFromCache) {
      statusEl.innerHTML = `
        <p><strong>ไม่สามารถโหลดข้อมูลจากฐานข้อมูลได้ในขณะนี้</strong></p>
        <p style="margin-top: 6px; font-size: 0.9rem;">กรุณาตรวจสอบการเผยแพร่ลิงก์ CSV ของแท็บ Portal_Apps และ Portal_Settings ใน Google Sheets แล้วลองรีเฟรชหน้าเว็บอีกครั้ง</p>
      `;
      statusEl.classList.remove('hidden');
    }
  }
}

document.getElementById('search-input').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderApps();
});

document.addEventListener('DOMContentLoaded', initPortal);
