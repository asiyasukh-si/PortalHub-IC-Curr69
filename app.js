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
   ANNOUNCEMENTS_PUBLISHED_CSV_URL:
    'https://docs.google.com/spreadsheets/d/1dQ4_BVdwlscYQ80WlqG-7TX2v1IlBjMx5wOriYZ9VvI/gviz/tq?tqx=out:csv&sheet=Announcements',
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
    APP08:
      'https://script.google.com/macros/s/AKfycbzbSjPT0MugBN6-3fmSIjg4T6S6gUQVPuLcvTHCej8fNC2hs2ocBHpZFZxx8_9QQR4/exec',
    APP10:
      'https://script.google.com/macros/s/AKfycbzWNaHhLod7SUm6sq23Aub34z3AJk5Jsh2yNH6oxr-r82Br8qcmmDHmr-wyerJEqnr3FA/exec',
  },
  APP10_API_URL:
    'https://script.google.com/macros/s/AKfycbzWNaHhLod7SUm6sq23Aub34z3AJk5Jsh2yNH6oxr-r82Br8qcmmDHmr-wyerJEqnr3FA/exec',
  FACULTY_SESSION_KEY: 'ic2569_portal_faculty_session_v1',
  CACHE_KEY: 'ic2569_portal_hub_cache_v1',
  USER_THEME_PREF_KEY: 'ic2569_portal_user_theme_pref_v1',
  ADMIN_OVERRIDE_KEY: 'ic2569_portal_admin_override_v1',
  ADMIN_OVERRIDE_TTL_MS: 10 * 60 * 1000, // ยึดค่าที่ Admin เพิ่งบันทึกไว้เป็นหลักนาน 10 นาที เพื่อป้องกัน Google CSV Cache ดีเลย์
  ADMIN_SESSION_KEY: 'ic2569_portal_admin_session_token',
  ADMIN_API_URL:
    'https://script.google.com/macros/s/AKfycbwswqLG3Zm0T1B2YZbw9Or6zWNr1bfxqGMk38Fw7nbv2RjNMlhOlExMEJbYyKYxcAlD/exec',
  ADMIN_API_FALLBACK_URL:
    'https://script.google.com/macros/s/AKfycbxNtprN88p1cucvKF09WW6GwM3Is2VHOI0b7hzyvvWKIeZAqnzoJWzTN7drZ1naJlQU/exec',
  LEGACY_NAVY_OVERLAY: '#0f2942',
  LEGACY_NAVY_PRIMARY: '#1e3a5f',
};

// สถานะข้อมูลในหน้าเว็บ
let allApps = [];
let rawPortalApps = [];
let rawExternalLinks = [];
let settings = {};
let activeCategory = 'ทั้งหมด';
let activeRole = 'ALL'; // 'ALL' | 'STUDENT' | 'FACULTY'
let searchQuery = '';
let activeThemeMode = 'hybrid'; // 'hybrid' | 'modern'
let activeLayoutMode = 'cards'; // 'cards' | 'table'
let adminState = {
  token: '',
  user: null,
  facultyLoaded: false,
  apps: [],
  settings: [],
  externalLinks: [],
};

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
  flask: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg>`,
  microscope: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18h8"></path><path d="M3 22h18"></path><path d="M14 22a7 7 0 1 0 0-14h-1"></path><path d="M9 14h2"></path><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"></path><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"></path></svg>`,
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

function escapeJsStr(str) {
  return escapeHtml(
    String(str !== undefined && str !== null ? str : '')
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
  );
}

function isTruthyFlag(val) {
  const s = String(val !== undefined && val !== null ? val : '').trim().toUpperCase();
  return s === 'TRUE' || s === '1' || s === 'YES';
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
    let cleanSiteTitle = settings.site_title.trim();
    if (
      cleanSiteTitle.includes('ฉบับปรับปรุง พ.ศ. 2569') ||
      cleanSiteTitle.includes('(พ.ศ. 2569)') ||
      cleanSiteTitle === 'ระบบสารสนเทศหลักสูตรเคมีอุตสาหกรรม'
    ) {
      cleanSiteTitle = 'ระบบสารสนเทศหลักภาควิชาเคมีอุตสาหกรรม';
    }
    document.title = cleanSiteTitle;
    document.getElementById('site-title').textContent = cleanSiteTitle;
  }
  if (settings.site_subtitle) {
    let cleanSubtitle = settings.site_subtitle
      .replace(/\s*\(รองรับหลักสูตร[^)]*\)/g, '')
      .trim();
    if (!cleanSubtitle.includes('นักศึกษา')) {
      cleanSubtitle =
        'ศูนย์รวมระบบงานออนไลน์สำหรับนักศึกษาและคณาจารย์ ภาควิชาเคมีอุตสาหกรรม คณะวิทยาศาสตร์ มหาวิทยาลัยเชียงใหม่';
    }
    document.getElementById('site-subtitle').textContent = cleanSubtitle;
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
  const showNotice = isTruthyFlag(settings.show_notice);
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

  // รูปแบบหน้าตาเว็บหลักที่ Admin เลือกไว้ (portal_theme_mode: 'modern' | 'hybrid_cards' | 'hybrid_table')
  // หากผู้ใช้ยังไม่เคยกดเลือกมุมมองเองในเซสชันนี้ ให้ยึดค่าที่ Admin ตั้งไว้ในชีตเป็นหลัก
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has('theme') && !urlParams.has('layout') && !window._userManuallySwitchedTheme) {
    const savedThemeSetting = String(settings.portal_theme_mode || '').trim().toLowerCase();
    if (savedThemeSetting === 'modern') {
      activeThemeMode = 'modern';
      activeLayoutMode = 'cards';
    } else if (savedThemeSetting === 'hybrid_table') {
      activeThemeMode = 'hybrid';
      activeLayoutMode = 'table';
    } else if (savedThemeSetting === 'hybrid_cards' || savedThemeSetting === 'hybrid') {
      activeThemeMode = 'hybrid';
      activeLayoutMode = 'cards';
    }
    applyHybridThemeClasses();
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

function renderAppActionButtons(app, isDisabled, btnLabel) {
  if (isDisabled) {
    return `<span class="app-btn btn-disabled" aria-disabled="true">${escapeHtml(btnLabel)}</span>`;
  }
  const appId = String(app.app_id || '').trim().toUpperCase();
  const baseUrl = app.app_url.trim();
  const badgeType = String(app.badge_type || 'active').trim().toLowerCase();
  const sep = baseUrl.includes('?') ? '&' : '?';

  if (appId === 'APP01') {
    return `
      <div class="app-dual-btns">
        <a class="app-btn" href="${escapeHtml(baseUrl)}${sep}curr=2569" target="_blank" rel="noopener noreferrer" title="วางแผนการเรียนหลักสูตร 2569 สำหรับนักศึกษารหัส 69 เป็นต้นไป">หลักสูตร 2569 (รหัส 69+)</a>
        <a class="app-btn app-btn-secondary" href="${escapeHtml(baseUrl)}${sep}curr=2564" target="_blank" rel="noopener noreferrer" title="วางแผนการเรียนหลักสูตร 2564 สำหรับนักศึกษารหัส 64-68 (แผน 1 และแผน 2)">หลักสูตร 2564 (รหัส 64-68)</a>
      </div>
    `;
  }

  if (appId === 'APP05') {
    const isOffSeason = badgeType === 'advisor_only';
    const studentUrl = isOffSeason ? `${baseUrl}${sep}page=Research&mode=offseason` : baseUrl;
    const studentLabel = isOffSeason ? 'ดูหัวข้อวิจัย (นอกรอบยื่น)' : 'นักศึกษายื่นคำร้อง / ดูผล';
    const studentTitle = isOffSeason
      ? 'ขณะนี้อยู่นอกรอบยื่นคำร้อง นักศึกษาสามารถคลิกเพื่อสำรวจหัวข้องานวิจัยและข้อมูลอาจารย์ที่ปรึกษาได้'
      : 'เข้าสู่ระบบยื่นคำร้องเลือกอาจารย์ที่ปรึกษา สำรวจหัวข้อวิจัย และดูบอร์ดประกาศผล';
    const advisorUrl = `${baseUrl}${sep}page=Advisor`;
    const advisorLabel = 'อาจารย์อัปเดตโปรไฟล์';
    const advisorTitle = 'สำหรับอาจารย์ที่ปรึกษา: เข้าไปอัปเดตหัวข้อวิจัย รูปโปรไฟล์ โควตา หรือพิจารณาคำร้องได้ตลอดเวลา';

    if (activeRole === 'STUDENT') {
      return `<a class="app-btn ${isOffSeason ? 'app-btn-secondary' : ''}" href="${escapeHtml(studentUrl)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(studentTitle)}">${escapeHtml(
        isOffSeason ? 'สำรวจหัวข้อวิจัยอาจารย์ (นอกรอบยื่นคำร้อง) →' : 'เข้าสู่ระบบเลือกอาจารย์ที่ปรึกษา →'
      )}</a>`;
    }
    if (activeRole === 'FACULTY') {
      return `<a class="app-btn" href="${escapeHtml(advisorUrl)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(advisorTitle)}">จัดการโปรไฟล์ & พิจารณาคำร้อง (อาจารย์) →</a>`;
    }

    return `
      <div class="app-dual-btns">
        <a class="app-btn ${isOffSeason ? 'app-btn-secondary' : ''}" href="${escapeHtml(studentUrl)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(studentTitle)}">${escapeHtml(studentLabel)}</a>
        <a class="app-btn ${isOffSeason ? '' : 'app-btn-secondary'}" href="${escapeHtml(advisorUrl)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(advisorTitle)}">${escapeHtml(advisorLabel)}</a>
      </div>
    `;
  }

  return `<a class="app-btn" href="${escapeHtml(baseUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(btnLabel)}</a>`;
}

function isAppUnderMaintenance(badgeType) {
  const t = String(badgeType || '').trim().toLowerCase();
  return t === 'maintenance';
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
      const isMaint = isAppUnderMaintenance(badgeType);
      const isDisabled = badgeType === 'coming_soon' || isMaint || !validUrl;
      const iconSvg = ICONS[(app.icon_name || '').trim().toLowerCase()] || ICONS.default;
      const badgeLabel = isMaint ? (app.badge_text || 'ปิดปรับปรุงชั่วคราว') : app.badge_text;
      const badgeHtml = badgeLabel
        ? `<span class="app-badge quick-card-badge badge-${escapeHtml(badgeType)}">${escapeHtml(badgeLabel)}</span>`
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

function updateFullMaintenanceView() {
  const isFullMaint = isTruthyFlag(settings.maintenance_mode);
  const isAdminLoggedIn = !!(adminState && adminState.user);
  const maintScreen = document.getElementById('maintenance-screen');
  const adminBanner = document.getElementById('admin-maintenance-banner');
  const toolbarEl = document.querySelector('.toolbar');

  if (maintScreen) {
    const descEl = document.getElementById('maintenance-desc');
    if (descEl) {
      descEl.textContent =
        settings.maintenance_text ||
        'ขออภัยในความไม่สะดวก ผู้ดูแลระบบกำลังอัปเดตข้อมูลหลักสูตรและระบบงาน กรุณากลับมาใช้งานอีกครั้งในภายหลัง';
    }
    const etaBox = document.getElementById('maintenance-eta-box');
    const etaText = document.getElementById('maintenance-eta-text');
    if (etaBox && etaText) {
      const eta = (settings.maintenance_eta || '').trim();
      if (eta) {
        etaText.textContent = eta;
        etaBox.classList.remove('hidden');
      } else {
        etaBox.classList.add('hidden');
      }
    }
  }

  if (isFullMaint && !isAdminLoggedIn) {
    maintScreen?.classList.remove('hidden');
    adminBanner?.classList.add('hidden');
    toolbarEl?.classList.add('hidden');
    document.getElementById('top-bar-section')?.classList.add('hidden');
    document.getElementById('apps-container').innerHTML = '';
    document.getElementById('status-message')?.classList.add('hidden');
    return true;
  }

  maintScreen?.classList.add('hidden');
  toolbarEl?.classList.remove('hidden');
  if (isFullMaint && isAdminLoggedIn) {
    adminBanner?.classList.remove('hidden');
  } else {
    adminBanner?.classList.add('hidden');
  }
  return false;
}

function matchesRoleFilter(app) {
  if (!activeRole || activeRole === 'ALL') return true;
  const appId = String(app.app_id || '').trim().toUpperCase();
  const badgeType = String(app.badge_type || '').trim().toLowerCase();
  const usersText = String(app.target_users || '').toLowerCase();

  if (activeRole === 'STUDENT') {
    if (appId === 'APP03' || appId === 'APP04') return false;
    if (badgeType === 'restricted' && !usersText.includes('นักศึกษา')) return false;
    return true;
  }
  if (activeRole === 'FACULTY') {
    return true;
  }
  return true;
}

function renderApps() {
  const container = document.getElementById('apps-container');
  const statusEl = document.getElementById('status-message');

  if (updateFullMaintenanceView()) {
    return;
  }

  const query = searchQuery.trim().toLowerCase();
  const filtered = allApps.filter((app) => {
    if (!matchesRoleFilter(app)) return false;
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
  const maintBtnText = '🔧 ปิดปรับปรุงชั่วคราว';

  let html = '';
  let seqIndex = 1;
  const isAdminLoggedIn = !!(adminState && adminState.user);
  grouped.forEach((apps, categoryName) => {
    if (activeThemeMode === 'hybrid' && activeLayoutMode === 'table') {
      html += `
        <section class="category-section hybrid-panel-box">
          <div class="hybrid-panel-header">
            <h2 class="category-heading">${escapeHtml(categoryName)}</h2>
            <span class="hybrid-panel-count">จำนวน ${apps.length} ระบบงาน</span>
          </div>
          <div class="hybrid-table-wrap">
            <table class="hybrid-directory-table">
              <thead>
                <tr>
                  <th style="width:72px;text-align:center;">${isAdminLoggedIn ? 'รหัสระบบ' : 'ลำดับ'}</th>
                  <th style="width:270px;">ชื่อระบบสารสนเทศ</th>
                  <th>รายละเอียดและการใช้งาน</th>
                  <th style="width:170px;">กลุ่มผู้ใช้งาน</th>
                  <th style="width:125px;text-align:center;">สถานะ</th>
                  <th style="width:250px;text-align:center;">เข้าสู่ระบบงาน</th>
                </tr>
              </thead>
              <tbody>
                ${apps
                  .map((app) => {
                    const badgeType = (app.badge_type || 'active').trim().toLowerCase();
                    const validUrl = isValidHttpUrl(app.app_url);
                    const isMaint = isAppUnderMaintenance(badgeType);
                    const isDisabled = badgeType === 'coming_soon' || isMaint || !validUrl;
                    const iconSvg = ICONS[(app.icon_name || '').trim().toLowerCase()] || ICONS.default;
                    const badgeLabel = isMaint ? (app.badge_text || 'ปิดปรับปรุงชั่วคราว') : (app.badge_text || 'เปิดใช้งาน');
                    const btnLabel = isDisabled
                      ? isMaint
                        ? maintBtnText
                        : badgeType === 'coming_soon'
                          ? disabledText
                          : 'รอระบุลิงก์ในฐานข้อมูล'
                      : openText;
                    const rowOrderNum = seqIndex++;
                    const codeTag = isAdminLoggedIn
                      ? escapeHtml(app.app_id || `#${rowOrderNum}`)
                      : `${rowOrderNum}`;

                    return `
                      <tr class="${isDisabled ? 'is-disabled-row' : ''}">
                        <td style="text-align:center;">
                          <span class="hybrid-code-badge">${codeTag}</span>
                        </td>
                        <td>
                          <div class="hybrid-table-title-cell">
                            <span class="hybrid-mini-icon" aria-hidden="true">${iconSvg}</span>
                            <strong>${escapeHtml(app.app_title)}</strong>
                          </div>
                        </td>
                        <td class="hybrid-table-desc">${escapeHtml(app.description)}</td>
                        <td class="hybrid-table-users">${escapeHtml(app.target_users || '-')}</td>
                        <td style="text-align:center;">
                          <span class="app-badge badge-${escapeHtml(badgeType)}">${escapeHtml(badgeLabel)}</span>
                        </td>
                        <td class="hybrid-table-action">
                          ${renderAppActionButtons(app, isDisabled, btnLabel)}
                        </td>
                      </tr>
                    `;
                  })
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>
      `;
    } else {
      const countClass =
        apps.length === 1
          ? 'grid-count-1'
          : apps.length === 2
            ? 'grid-count-2'
            : apps.length === 4
              ? 'grid-count-4'
              : 'grid-count-many';
      html += `
        <section class="category-section ${activeThemeMode === 'hybrid' ? 'hybrid-panel-box' : ''}">
          <div class="${activeThemeMode === 'hybrid' ? 'hybrid-panel-header' : ''}">
            <h2 class="category-heading">${escapeHtml(categoryName)}</h2>
            ${activeThemeMode === 'hybrid' ? `<span class="hybrid-panel-count">หมวดงานภาควิชา (${apps.length} ระบบ)</span>` : ''}
          </div>
          <div class="apps-grid ${countClass}" data-app-count="${apps.length}">
            ${apps
              .map((app) => {
                const badgeType = (app.badge_type || 'active').trim().toLowerCase();
                const validUrl = isValidHttpUrl(app.app_url);
                const isMaint = isAppUnderMaintenance(badgeType);
                const isDisabled = badgeType === 'coming_soon' || isMaint || !validUrl;
                const iconSvg = ICONS[(app.icon_name || '').trim().toLowerCase()] || ICONS.default;
                const badgeLabel = isMaint ? (app.badge_text || 'ปิดปรับปรุงชั่วคราว') : app.badge_text;
                const codeTag = escapeHtml(app.app_id || `SYS0${seqIndex++}`);

                const btnLabel = isDisabled
                  ? isMaint
                    ? maintBtnText
                    : badgeType === 'coming_soon'
                      ? disabledText
                      : 'รอระบุลิงก์ในฐานข้อมูล'
                  : openText;

                return `
                  <article class="app-card ${isDisabled ? 'is-disabled' : ''}">
                    <div class="card-top">
                      <div style="display:flex;align-items:center;gap:10px;">
                        <div class="app-icon-wrap" aria-hidden="true">${iconSvg}</div>
                        ${isAdminLoggedIn && activeThemeMode === 'hybrid' ? `<span class="hybrid-code-badge">${codeTag}</span>` : ''}
                      </div>
                      ${
                        badgeLabel
                          ? `<span class="app-badge badge-${escapeHtml(badgeType)}">${escapeHtml(badgeLabel)}</span>`
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
                        <span><strong>ผู้ใช้งาน:</strong> ${escapeHtml(app.target_users)}</span>
                      </div>
                    `
                        : ''
                    }
                    ${renderAppActionButtons(app, isDisabled, btnLabel)}
                  </article>
                `;
              })
              .join('')}
          </div>
        </section>
      `;
    }
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
        isTruthyFlag(item.is_visible) &&
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

function applyPortalObjects(settingsRows, appsRows, extLinksRows) {
  applySettings(settingsRows || []);

  const parsedApps = (appsRows || []).map((app) => {
    const appId = (app.app_id || '').trim().toUpperCase();
    const rawUrl = (app.app_url || '').trim();
    const fallbackUrl = CONFIG.FALLBACK_APP_URLS[appId] || '';
    let iconName = (app.icon_name || '').trim().toLowerCase();
    let badgeType = (app.badge_type || 'active').trim().toLowerCase();
    let appTitle = (app.app_title || '').trim();
    let description = (app.description || '').trim();

    if (appId === 'APP01') {
      if (appTitle.includes('หลักสูตร 2569')) {
        appTitle = 'ระบบวางแผนการลงทะเบียนเรียน (Study Plan 2564 & 2569)';
      }
      if (!description.includes('2564')) {
        description =
          'จำลองแผนการเรียน 4 ปี ตรวจสอบหน่วยกิตและวิชาบังคับก่อน รองรับทั้งหลักสูตร พ.ศ. 2564 (รหัส 64-68 แผน 1/แผน 2) และ พ.ศ. 2569 (รหัส 69+)';
      }
    } else if (appId === 'APP02') {
      if (!appTitle.includes('มคอ.3') && !appTitle.includes('OBE')) {
        appTitle = 'ระบบสืบค้นข้อกำหนดกระบวนวิชา (มคอ.3 / OBE)';
      }
    } else if (appId === 'APP05') {
      // หากเดิมตั้งเป็น coming_soon แต่มี URL ระบบจริงแล้ว ให้เปลี่ยนเป็นโหมด advisor_only (นอกรอบยื่นคำร้อง แต่อาจารย์เข้าอัปเดตโปรไฟล์และนักศึกษาดูหัวข้อวิจัยได้)
      if (badgeType === 'coming_soon' && (isValidHttpUrl(rawUrl) || isValidHttpUrl(fallbackUrl))) {
        badgeType = 'advisor_only';
        if (!app.badge_text || app.badge_text === 'เปิดใช้งาน') {
          app.badge_text = 'นอกรอบยื่น (อ.อัปเดตข้อมูลได้)';
        }
      }
    } else if (appId === 'APP06') {
      if (!iconName || iconName === 'sparkles' || iconName === 'default') iconName = 'clipboard';
      if (badgeType === 'restricted') badgeType = 'active';
      if (appTitle === 'ระบบยื่นคำร้อง') appTitle = 'ระบบยื่นคำร้องและเอกสารนักศึกษา';
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

  rawPortalApps = parsedApps;
  rawExternalLinks = extLinksRows || [];

  // เสริมรายการมาตรฐาน APP08, APP09 (หมวดห้องปฏิบัติการฯ) และ APP10 (โซนบริการด่วน TOP_BAR) กรณีที่ Google CSV Cache ยังไม่อัปเดต
  const defaultUpcomingLabApps = [
    {
      app_id: 'APP08',
      display_order: '8',
      category: 'ห้องปฏิบัติการและเครื่องมือวิเคราะห์',
      app_title: 'ระบบคลังและเบิก-จ่ายสารเคมีและวัสดุอุปกรณ์วิทยาศาสตร์',
      description: 'สืบค้นรายการสารเคมี เครื่องแก้ว และวัสดุวิทยาศาสตร์ในห้องปฏิบัติการ ยื่นคำขอเบิก-จ่ายหรือยืม-คืนอุปกรณ์ และติดตามสถานะคงเหลือ',
      target_users: 'นักศึกษา อาจารย์ และเจ้าหน้าที่ห้องปฏิบัติการ',
      badge_text: 'เปิดใช้งาน',
      badge_type: 'active',
      icon_name: 'flask',
      app_url: 'https://script.google.com/macros/s/AKfycbzbSjPT0MugBN6-3fmSIjg4T6S6gUQVPuLcvTHCej8fNC2hs2ocBHpZFZxx8_9QQR4/exec',
      is_visible: 'TRUE',
      display_zone: 'MAIN_GRID',
    },
    {
      app_id: 'APP09',
      display_order: '9',
      category: 'ห้องปฏิบัติการและเครื่องมือวิเคราะห์',
      app_title: 'ระบบจองเวลาใช้บริการและเครื่องมือวิเคราะห์',
      description: 'ตรวจสอบตารางคิวและสถานะความพร้อมของเครื่องมือวิเคราะห์ประจำภาควิชา จองช่วงเวลาเข้าใช้งาน และบันทึกประวัติการใช้เครื่องมือ',
      target_users: 'นักศึกษา อาจารย์ และเจ้าหน้าที่วิทยาศาสตร์',
      badge_text: 'อยู่ระหว่างพัฒนา',
      badge_type: 'coming_soon',
      icon_name: 'microscope',
      app_url: '',
      is_visible: 'TRUE',
      display_zone: 'MAIN_GRID',
    },
    {
      app_id: 'APP10',
      display_order: '10',
      category: 'บริหารจัดการหลักสูตร',
      app_title: 'ระบบจองห้องเรียนและห้องประชุม',
      description: 'ตรวจสอบห้องว่าง จองห้องเรียนหรือห้องประชุม และติดตามสถานะคำร้องออนไลน์',
      target_users: 'นักศึกษา อาจารย์ และเจ้าหน้าที่ภาควิชา',
      badge_text: 'เปิดใช้งาน',
      badge_type: 'active',
      icon_name: 'calendar',
      app_url: 'https://script.google.com/macros/s/AKfycbzWNaHhLod7SUm6sq23Aub34z3AJk5Jsh2yNH6oxr-r82Br8qcmmDHmr-wyerJEqnr3FA/exec',
      is_visible: 'TRUE',
      display_zone: 'TOP_BAR',
    },
  ];
  defaultUpcomingLabApps.forEach((defApp) => {
    const existingIdx = parsedApps.findIndex((x) => (x.app_id || '').trim().toUpperCase() === defApp.app_id);
    if (existingIdx === -1) {
      parsedApps.push(defApp);
    } else if (defApp.app_id === 'APP10') {
      parsedApps[existingIdx] = {
        ...parsedApps[existingIdx],
        app_title: parsedApps[existingIdx].app_title || defApp.app_title,
        description: parsedApps[existingIdx].description || defApp.description,
        badge_text: parsedApps[existingIdx].badge_text || defApp.badge_text,
        badge_type: parsedApps[existingIdx].badge_type || defApp.badge_type,
        icon_name: parsedApps[existingIdx].icon_name || defApp.icon_name,
        app_url: isValidHttpUrl(parsedApps[existingIdx].app_url) ? parsedApps[existingIdx].app_url : defApp.app_url,
        display_zone: 'TOP_BAR',
        is_visible: 'TRUE',
      };
    }
  });

  const app10Entry = parsedApps.find((app) => (app.app_id || '').trim().toUpperCase() === 'APP10');
  if (app10Entry && isValidHttpUrl(app10Entry.app_url)) {
    CONFIG.APP10_API_URL = app10Entry.app_url.trim();
  }

  // ดึงลิงก์ระบบจัดการรหัสผ่าน (APP04) และระบบจัดการโหลดสอน/API (APP03) อัตโนมัติ
  const app03Entry = parsedApps.find(
    (app) => (app.app_id || '').trim().toUpperCase() === 'APP03'
  );
  if (app03Entry && isValidHttpUrl(app03Entry.app_url)) {
    CONFIG.ADMIN_API_URL = app03Entry.app_url.trim();
  }

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
    .filter((app) => isTruthyFlag(app.is_visible))
    .sort((a, b) => (parseFloat(a.display_order) || 999) - (parseFloat(b.display_order) || 999));

  renderCategoryFilters();
  renderApps();

  if (extLinksRows) {
    renderExternalLinks(extLinksRows);
  }
}

function processPortalData(settingsCsv, appsCsv, extLinksCsv) {
  applyPortalObjects(
    parseCSV(settingsCsv),
    parseCSV(appsCsv),
    extLinksCsv ? parseCSV(extLinksCsv) : []
  );
}

function getRecentAdminOverride() {
  try {
    const raw = localStorage.getItem(CONFIG.ADMIN_OVERRIDE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.updatedAt &&
      Date.now() - parsed.updatedAt < CONFIG.ADMIN_OVERRIDE_TTL_MS &&
      Array.isArray(parsed.apps) &&
      Array.isArray(parsed.settings)
    ) {
      return parsed;
    }
  } catch (e) {}
  return null;
}

function saveAdminOverrideSnapshot() {
  try {
    localStorage.setItem(
      CONFIG.ADMIN_OVERRIDE_KEY,
      JSON.stringify({
        apps: adminState.apps,
        settings: adminState.settings,
        externalLinks: adminState.externalLinks,
        updatedAt: Date.now(),
      })
    );
  } catch (e) {}
}

// =========================================================
// เริ่มต้นโหลดข้อมูลจาก Google Sheets (พร้อมระบบ Instant Cache & Admin Override)
// =========================================================
async function initPortal() {
  const statusEl = document.getElementById('status-message');
  let renderedFromCache = false;

  const recentOverride = getRecentAdminOverride();
  if (recentOverride) {
    applyPortalObjects(recentOverride.settings, recentOverride.apps, recentOverride.externalLinks || []);
    renderedFromCache = true;
  }

  if (!renderedFromCache) {
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
  }

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

    // หากเพิ่งมีการบันทึกผ่านหน้า Admin ไม่เกิน 10 นาที ให้คงค่าล่าสุดของ Admin ไว้เพื่อไม่ให้ Google CSV Cache ตัวเก่าทับ
    if (!getRecentAdminOverride()) {
      processPortalData(settingsCsv, appsCsv, extLinksCsv);
    }

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

// =========================================================
// ระบบจัดการข้อมูลหน้า Portal Hub สำหรับผู้ดูแลระบบ (Admin UI)
// =========================================================
function showPortalToast(msg) {
  const el = document.getElementById('portal-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(showPortalToast._timer);
  showPortalToast._timer = setTimeout(() => el.classList.add('hidden'), 3400);
}

function getCandidateAdminApiUrls() {
  const urls = [CONFIG.ADMIN_API_URL, CONFIG.ADMIN_API_FALLBACK_URL].filter(
    (u, idx, arr) => isValidHttpUrl(u) && arr.indexOf(u) === idx
  );
  return urls;
}

async function callPortalAdminPost(payload) {
  const urls = getCandidateAdminApiUrls();
  let lastErr = null;
  for (const apiUrl of urls) {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      CONFIG.ADMIN_API_URL = apiUrl;
      return json;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('ไม่สามารถเชื่อมต่อ GAS API ได้');
}

async function loadPortalAdminFacultyList() {
  if (adminState.facultyLoaded) return;
  const sel = document.getElementById('portal-admin-faculty');
  if (!sel) return;
  const urls = getCandidateAdminApiUrls();
  for (const apiUrl of urls) {
    try {
      const res = await fetch(`${apiUrl}?action=portal_faculty`, { cache: 'no-store' });
      const data = await res.json();
      if (data && data.success && Array.isArray(data.faculty)) {
        CONFIG.ADMIN_API_URL = apiUrl;
        sel.innerHTML =
          '<option value="">-- เลือกชื่อผู้ดูแลระบบ --</option>' +
          data.faculty
            .map(
              (f) =>
                `<option value="${escapeHtml(f.id)}">${escapeHtml(f.name)}</option>`
            )
            .join('');
        adminState.facultyLoaded = true;
        return;
      }
    } catch (err) {}
  }
  sel.innerHTML = '<option value="">รออัปเดตโค้ด GAS APP03 เป็นเวอร์ชันใหม่ (Manage Deployments > New version)</option>';
}

function setAdminSyncStatus(mode, text) {
  const el = document.getElementById('portal-admin-sync-status');
  if (!el) return;
  clearTimeout(setAdminSyncStatus._timer);
  if (!mode) {
    el.classList.add('hidden');
    return;
  }
  el.className = `admin-sync-badge ${mode === 'saving' ? 'admin-sync-saving' : 'admin-sync-saved'}`;
  el.textContent = text;
  el.classList.remove('hidden');
  if (mode === 'saved') {
    setAdminSyncStatus._timer = setTimeout(() => el.classList.add('hidden'), 3200);
  }
}

function applyAdminWorkspaceData(data, persistOverride = false) {
  adminState.apps = Array.isArray(data.apps) ? data.apps : [];
  adminState.settings = Array.isArray(data.settings) ? data.settings : [];
  adminState.externalLinks = Array.isArray(data.externalLinks) ? data.externalLinks : [];

  if (persistOverride) {
    saveAdminOverrideSnapshot();
  }

  // อัปเดตหน้าเว็บ Portal Hub ทันทีโดยไม่ต้องรอ CSV Cache
  applyPortalObjects(adminState.settings, adminState.apps, adminState.externalLinks);

  renderAdminAppsTable();
  populateAdminSettingsForm();
  renderAdminLinksTable();
}

function showAdminWorkspace(user, token, data) {
  adminState.user = user;
  adminState.token = token;
  try {
    localStorage.setItem(CONFIG.ADMIN_SESSION_KEY, token);
  } catch (e) {}

  document.getElementById('portal-admin-login-box').classList.add('hidden');
  document.getElementById('portal-admin-workspace').classList.remove('hidden');
  const badge = document.getElementById('portal-admin-user-badge');
  if (badge) {
    badge.textContent = user.name;
    badge.classList.remove('hidden');
  }
  document.getElementById('btn-portal-admin-logout').classList.remove('hidden');
  applyAdminWorkspaceData(data);
}

function showAdminLoginBox(errMsg) {
  adminState.user = null;
  adminState.token = '';
  try {
    localStorage.removeItem(CONFIG.ADMIN_SESSION_KEY);
  } catch (e) {}

  document.getElementById('portal-admin-workspace').classList.add('hidden');
  document.getElementById('portal-admin-login-box').classList.remove('hidden');
  document.getElementById('portal-admin-user-badge').classList.add('hidden');
  document.getElementById('btn-portal-admin-logout').classList.add('hidden');
  renderApps();
  const errEl = document.getElementById('portal-admin-login-error');
  if (errMsg) {
    errEl.textContent = errMsg;
    errEl.classList.remove('hidden');
  } else {
    errEl.classList.add('hidden');
  }
}

async function openPortalAdminModal() {
  document.getElementById('portal-admin-modal').classList.remove('hidden');
  loadPortalAdminFacultyList();

  let savedToken = '';
  try {
    savedToken = localStorage.getItem(CONFIG.ADMIN_SESSION_KEY) || '';
  } catch (e) {}

  if (savedToken && !adminState.user) {
    try {
      const res = await callPortalAdminPost({ action: 'portal_resume', auth_token: savedToken });
      if (res && res.success) {
        showAdminWorkspace(res.user, res.sessionToken, res.data);
        return;
      }
    } catch (e) {}
    showAdminLoginBox('');
  }
}

function closePortalAdminModal() {
  document.getElementById('portal-admin-modal').classList.add('hidden');
}

function renderAdminAppsTable() {
  const tbody = document.getElementById('admin-apps-tbody');
  if (!tbody) return;
  const sorted = [...adminState.apps].sort(
    (a, b) => (parseFloat(a.display_order) || 999) - (parseFloat(b.display_order) || 999)
  );

  if (sorted.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" style="text-align:center;padding:18px;color:#64577a;">ยังไม่มีรายการระบบงาน</td></tr>';
    return;
  }

  tbody.innerHTML = sorted
    .map((app) => {
      const isVis = isTruthyFlag(app.is_visible);
      const appIdUpper = String(app.app_id || '').trim().toUpperCase();
      const bType = (app.badge_type || 'active').toLowerCase();
      const isMaint = isAppUnderMaintenance(bType);
      const isAdvisorOnly = bType === 'advisor_only';
      const zone = getDisplayZone(app);
      const zoneLabel =
        zone === 'TOP_BAR'
          ? '<span class="app-badge badge-restricted">TOP_BAR (ปุ่มด่วน)</span>'
          : '<span class="app-badge badge-active">MAIN_GRID (การ์ด)</span>';
      const visLabel = isVis
        ? '<span style="color:#166534;font-weight:700;">แสดง</span>'
        : '<span style="color:#b91c1c;">ซ่อน</span>';
      const seasonBtn =
        appIdUpper === 'APP05'
          ? `<button type="button" class="admin-btn-outline admin-btn-sm" style="background:#eef2ff;color:#3730a3;border-color:#a5b4fc;" onclick="toggleApp05Season('${escapeJsStr(app.app_id)}')" title="สลับระหว่าง เปิดรับคำร้องนักศึกษา กับ นอกรอบยื่นคำร้อง (อาจารย์เข้าอัปเดตโปรไฟล์ได้ตลอด)">${
              isAdvisorOnly ? '🎓 เปิดรอบ นศ. ยื่น' : '👩‍🏫 ตั้งเป็นนอกรอบ นศ.'
            }</button>`
          : '';
      const maintToggleBtn = `<button type="button" class="admin-btn-outline admin-btn-sm" style="${
        isMaint ? 'background:#e5f6ed;color:#166534;border-color:#bce4cf;' : 'background:#fff7ed;color:#9a3412;border-color:#fdba74;'
      }" onclick="toggleAppMaintenance('${escapeJsStr(app.app_id)}')">${
        isMaint ? '🟢 เปิดใช้งาน' : '🔧 ปิดปรับปรุง'
      }</button>`;

      return `
        <tr>
          <td><strong>${escapeHtml(app.app_id)}</strong></td>
          <td style="text-align:center;">${escapeHtml(app.display_order)}</td>
          <td>${zoneLabel}</td>
          <td class="admin-col-title">
            <div style="font-weight:700;">${escapeHtml(app.app_title)}</div>
            <div style="font-size:0.78rem;color:#64577a;">หมวด: ${escapeHtml(app.category || '-')}</div>
          </td>
          <td><span class="app-badge badge-${escapeHtml(bType)}">${escapeHtml(app.badge_text || '-')}</span></td>
          <td style="text-align:center;">${visLabel}</td>
          <td style="text-align:center;white-space:nowrap;">
            ${seasonBtn}
            ${maintToggleBtn}
            <button type="button" class="admin-btn-outline admin-btn-sm" onclick="openAdminAppEditor('${escapeJsStr(app.app_id)}')">แก้ไข</button>
            <button type="button" class="admin-btn-danger admin-btn-sm" onclick="deleteAdminApp('${escapeJsStr(app.app_id)}')">ลบ</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

window.openAdminAppEditor = function (appId) {
  const box = document.getElementById('admin-app-editor');
  const existing = appId
    ? adminState.apps.find((a) => String(a.app_id || '').toUpperCase() === String(appId).toUpperCase())
    : null;

  document.getElementById('admin-app-editor-title').textContent = existing
    ? `แก้ไขระบบงาน ${existing.app_id}`
    : 'เพิ่มระบบงาน / ปุ่มลัดใหม่';

  if (existing) {
    document.getElementById('edit-app-id').value = existing.app_id || '';
    document.getElementById('edit-app-id').readOnly = true;
    document.getElementById('edit-app-zone').value = getDisplayZone(existing);
    document.getElementById('edit-app-order').value = parseFloat(existing.display_order) || 1;
    document.getElementById('edit-app-title').value = existing.app_title || '';
    document.getElementById('edit-app-category').value = existing.category || 'หลักสูตรและการเรียนการสอน';
    document.getElementById('edit-app-desc').value = existing.description || '';
    document.getElementById('edit-app-users').value = existing.target_users || '';
    document.getElementById('edit-app-url').value = existing.app_url || '';
    document.getElementById('edit-app-badge-text').value = existing.badge_text || 'เปิดใช้งาน';
    document.getElementById('edit-app-badge-type').value = (existing.badge_type || 'active').toLowerCase();
    document.getElementById('edit-app-icon').value = (existing.icon_name || 'default').toLowerCase();
    document.getElementById('edit-app-visible').value = isTruthyFlag(existing.is_visible) ? 'TRUE' : 'FALSE';
  } else {
    const nextNum = adminState.apps.length + 1;
    document.getElementById('edit-app-id').value = `APP0${nextNum}`;
    document.getElementById('edit-app-id').readOnly = false;
    document.getElementById('edit-app-zone').value = 'MAIN_GRID';
    document.getElementById('edit-app-order').value = nextNum;
    document.getElementById('edit-app-title').value = '';
    document.getElementById('edit-app-category').value = 'หลักสูตรและการเรียนการสอน';
    document.getElementById('edit-app-desc').value = '';
    document.getElementById('edit-app-users').value = 'นักศึกษา และคณาจารย์';
    document.getElementById('edit-app-url').value = '';
    document.getElementById('edit-app-badge-text').value = 'เปิดใช้งาน';
    document.getElementById('edit-app-badge-type').value = 'active';
    document.getElementById('edit-app-icon').value = 'calendar';
    document.getElementById('edit-app-visible').value = 'TRUE';
  }

  box.classList.remove('hidden');
};

window.deleteAdminApp = async function (appId) {
  if (!confirm(`ต้องการลบรายการระบบงาน ${appId} ออกจากหน้า Portal Hub หรือไม่?`)) return;
  try {
    const res = await callPortalAdminPost({
      action: 'portal_delete_app',
      auth_token: adminState.token,
      app_id: appId,
    });
    if (!res.success) {
      if (res.expired) showAdminLoginBox(res.message);
      else showPortalToast(res.message);
      return;
    }
    applyAdminWorkspaceData(res.data);
    showPortalToast(res.message);
  } catch (err) {
    showPortalToast('ลบไม่สำเร็จ: ' + err.message);
  }
};

window.toggleApp05Season = async function (appId) {
  const existing = adminState.apps.find(
    (a) => String(a.app_id || '').toUpperCase() === String(appId).toUpperCase()
  );
  if (!existing) return;
  const prevType = existing.badge_type;
  const prevText = existing.badge_text;
  const isCurrentlyOffSeason = String(existing.badge_type || '').toLowerCase() === 'advisor_only';
  const nextType = isCurrentlyOffSeason ? 'active' : 'advisor_only';
  const nextText = isCurrentlyOffSeason ? 'เปิดรับคำร้อง นศ.' : 'นอกรอบยื่น (อ.อัปเดตข้อมูลได้)';

  // 1) เปลี่ยนสถานะบนหน้าจอทันที (Optimistic UI Update ใน 0.1 วินาที)
  existing.badge_type = nextType;
  existing.badge_text = nextText;
  applyAdminWorkspaceData(adminState, true);
  setAdminSyncStatus('saving', '⏳ กำลังซิงก์ลง Google Sheet...');
  showPortalToast(
    isCurrentlyOffSeason
      ? '🎓 เปลี่ยนเป็น "เปิดรับคำร้อง นศ." แล้ว (กำลังบันทึก...)'
      : '👩‍🏫 เปลี่ยนเป็น "นอกรอบยื่นคำร้อง" แล้ว (กำลังบันทึก...)'
  );

  try {
    const res = await callPortalAdminPost({
      action: 'portal_save_app',
      auth_token: adminState.token,
      app: {
        ...existing,
        badge_type: nextType,
        badge_text: nextText,
        is_visible: isTruthyFlag(existing.is_visible) ? 'TRUE' : 'FALSE',
        display_zone: getDisplayZone(existing),
      },
    });
    if (!res.success) {
      existing.badge_type = prevType;
      existing.badge_text = prevText;
      applyAdminWorkspaceData(adminState, true);
      setAdminSyncStatus('', '');
      if (res.expired) showAdminLoginBox(res.message);
      else showPortalToast(res.message);
      return;
    }
    applyAdminWorkspaceData(res.data, true);
    setAdminSyncStatus('saved', '✅ ซิงก์ลง Google Sheet เรียบร้อย');
  } catch (err) {
    existing.badge_type = prevType;
    existing.badge_text = prevText;
    applyAdminWorkspaceData(adminState, true);
    setAdminSyncStatus('', '');
    showPortalToast('เปลี่ยนสถานะไม่สำเร็จ: ' + err.message);
  }
};

window.toggleAppMaintenance = async function (appId) {
  const existing = adminState.apps.find(
    (a) => String(a.app_id || '').toUpperCase() === String(appId).toUpperCase()
  );
  if (!existing) return;
  const prevType = existing.badge_type;
  const prevText = existing.badge_text;
  const currentlyMaint = isAppUnderMaintenance(existing.badge_type);
  const nextType = currentlyMaint ? 'active' : 'maintenance';
  const nextText = currentlyMaint ? 'เปิดใช้งาน' : 'ปิดปรับปรุงชั่วคราว';

  // 1) เปลี่ยนสถานะบนหน้าจอทันที (Optimistic UI Update ใน 0.1 วินาที)
  existing.badge_type = nextType;
  existing.badge_text = nextText;
  applyAdminWorkspaceData(adminState, true);
  setAdminSyncStatus('saving', '⏳ กำลังซิงก์ลง Google Sheet...');
  showPortalToast(
    currentlyMaint
      ? `🟢 เปิดใช้งานระบบ ${existing.app_id} แล้ว (กำลังบันทึก...)`
      : `🔧 ตั้งค่า ${existing.app_id} เป็น "ปิดปรับปรุงชั่วคราว" แล้ว (กำลังบันทึก...)`
  );

  try {
    const res = await callPortalAdminPost({
      action: 'portal_save_app',
      auth_token: adminState.token,
      app: {
        ...existing,
        badge_type: nextType,
        badge_text: nextText,
        is_visible: isTruthyFlag(existing.is_visible) ? 'TRUE' : 'FALSE',
        display_zone: getDisplayZone(existing),
      },
    });
    if (!res.success) {
      existing.badge_type = prevType;
      existing.badge_text = prevText;
      applyAdminWorkspaceData(adminState, true);
      setAdminSyncStatus('', '');
      if (res.expired) showAdminLoginBox(res.message);
      else showPortalToast(res.message);
      return;
    }
    applyAdminWorkspaceData(res.data, true);
    setAdminSyncStatus('saved', '✅ ซิงก์ลง Google Sheet เรียบร้อย');
  } catch (err) {
    existing.badge_type = prevType;
    existing.badge_text = prevText;
    applyAdminWorkspaceData(adminState, true);
    setAdminSyncStatus('', '');
    showPortalToast('เปลี่ยนสถานะไม่สำเร็จ: ' + err.message);
  }
};

function getCombinedPortalThemeCode() {
  if (activeThemeMode === 'modern') return 'modern';
  return activeLayoutMode === 'table' ? 'hybrid_table' : 'hybrid_cards';
}

function highlightAdminThemeButtons(themeCode) {
  const hiddenInput = document.getElementById('set-portal-theme-mode');
  if (hiddenInput) hiddenInput.value = themeCode;
  document.querySelectorAll('[data-admin-theme-select]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-admin-theme-select') === themeCode);
  });
}

function upsertAdminSettingRow(key, value) {
  if (!Array.isArray(adminState.settings)) adminState.settings = [];
  const existing = adminState.settings.find((r) => String(r.setting_key || '').trim() === key);
  if (existing) {
    existing.setting_value = value;
  } else {
    adminState.settings.push({ setting_key: key, setting_value: value });
  }
}

window.quickSwitchPortalThemeAdmin = async function (themeCode) {
  const normalized = ['modern', 'hybrid_cards', 'hybrid_table'].includes(themeCode) ? themeCode : 'hybrid_cards';
  const prevCode = getCombinedPortalThemeCode();

  // 1) เปลี่ยนธีมหน้าเว็บทันทีใน 0.1 วินาที (Optimistic UI Update)
  if (normalized === 'modern') {
    activeThemeMode = 'modern';
    activeLayoutMode = 'cards';
  } else if (normalized === 'hybrid_table') {
    activeThemeMode = 'hybrid';
    activeLayoutMode = 'table';
  } else {
    activeThemeMode = 'hybrid';
    activeLayoutMode = 'cards';
  }
  applyHybridThemeClasses();
  renderApps();
  highlightAdminThemeButtons(normalized);
  upsertAdminSettingRow('portal_theme_mode', normalized);
  saveAdminOverrideSnapshot();

  if (!adminState.token) {
    showPortalToast('เปลี่ยนรูปแบบหน้าเว็บแล้วครับ');
    return;
  }

  setAdminSyncStatus('saving', '⏳ กำลังซิงก์รูปแบบหน้าเว็บลง Google Sheet...');
  const labelMap = {
    modern: '✨ การ์ดพาสเทลสมัยใหม่ (Modern Pastel)',
    hybrid_cards: '🏛️ ลูกผสมพาสเทล (กล่องการ์ดมีกรอบ)',
    hybrid_table: '📋 ลูกผสมพาสเทล (ตารางสารบัญ)',
  };
  showPortalToast(`🎨 เปลี่ยนหน้าเว็บเป็น "${labelMap[normalized]}" แล้ว (กำลังบันทึก...)`);

  try {
    const res = await callPortalAdminPost({
      action: 'portal_save_settings',
      auth_token: adminState.token,
      settings: { portal_theme_mode: normalized },
    });
    if (!res.success) {
      upsertAdminSettingRow('portal_theme_mode', prevCode);
      setAdminSyncStatus('', '');
      if (res.expired) showAdminLoginBox(res.message);
      else showPortalToast(res.message);
      return;
    }
    applyAdminWorkspaceData(res.data, true);
    setAdminSyncStatus('saved', '✅ ซิงก์ลง Google Sheet เรียบร้อย');
  } catch (err) {
    setAdminSyncStatus('', '');
    showPortalToast('บันทึกรูปแบบหน้าเว็บไม่สำเร็จ: ' + err.message);
  }
};

function populateAdminSettingsForm() {
  const map = {};
  (adminState.settings || []).forEach((r) => {
    if (r.setting_key) map[r.setting_key.trim()] = r.setting_value || '';
  });
  const savedTheme = String(map.portal_theme_mode || '').trim().toLowerCase();
  const activeThemeCode = ['modern', 'hybrid_cards', 'hybrid_table'].includes(savedTheme)
    ? savedTheme
    : getCombinedPortalThemeCode();
  highlightAdminThemeButtons(activeThemeCode);

  if (document.getElementById('set-maintenance-mode')) {
    document.getElementById('set-maintenance-mode').value = isTruthyFlag(map.maintenance_mode) ? 'TRUE' : 'FALSE';
  }
  if (document.getElementById('set-maintenance-eta')) {
    document.getElementById('set-maintenance-eta').value = map.maintenance_eta || '';
  }
  if (document.getElementById('set-maintenance-text')) {
    document.getElementById('set-maintenance-text').value =
      map.maintenance_text ||
      'ขออภัยในความไม่สะดวก ผู้ดูแลระบบกำลังอัปเดตข้อมูลหลักสูตรและระบบงาน กรุณากลับมาใช้งานอีกครั้งในภายหลัง';
  }
  document.getElementById('set-show-notice').value = isTruthyFlag(map.show_notice) ? 'TRUE' : 'FALSE';
  document.getElementById('set-notice-text').value = map.notice_text || '';
  document.getElementById('set-site-title').value = map.site_title || document.getElementById('site-title').textContent;
  document.getElementById('set-dept-badge').value = map.dept_badge || document.getElementById('dept-badge').textContent;
  document.getElementById('set-site-subtitle').value =
    map.site_subtitle || document.getElementById('site-subtitle').textContent;
  document.getElementById('set-footer-text').value =
    map.footer_text || document.getElementById('footer-text').textContent;
  document.getElementById('set-contact-info').value =
    map.contact_info || document.getElementById('contact-info').textContent;
}

function renderAdminLinksTable() {
  const tbody = document.getElementById('admin-links-tbody');
  if (!tbody) return;
  const sorted = [...adminState.externalLinks].sort(
    (a, b) => (parseFloat(a.display_order) || 999) - (parseFloat(b.display_order) || 999)
  );
  if (sorted.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center;padding:18px;color:#64577a;">ยังไม่มีรายการลิงก์หน่วยงาน</td></tr>';
    return;
  }

  tbody.innerHTML = sorted
    .map((item) => {
      const isVis = isTruthyFlag(item.is_visible);
      return `
        <tr>
          <td><strong>${escapeHtml(item.link_id)}</strong></td>
          <td style="text-align:center;">${escapeHtml(item.display_order)}</td>
          <td>
            <div style="font-weight:700;">${escapeHtml(item.link_title)}</div>
            <div style="font-size:0.78rem;color:#64577a;word-break:break-all;">${escapeHtml(item.link_url)}</div>
          </td>
          <td style="text-align:center;">${
            isVis
              ? '<span style="color:#166534;font-weight:700;">แสดง</span>'
              : '<span style="color:#b91c1c;">ซ่อน</span>'
          }</td>
          <td style="text-align:center;">
            <button type="button" class="admin-btn-outline admin-btn-sm" onclick="openAdminLinkEditor('${escapeJsStr(item.link_id)}')">แก้ไข</button>
            <button type="button" class="admin-btn-danger admin-btn-sm" onclick="deleteAdminLink('${escapeJsStr(item.link_id)}')">ลบ</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

window.openAdminLinkEditor = function (linkId) {
  const box = document.getElementById('admin-link-editor');
  const existing = linkId
    ? adminState.externalLinks.find((l) => String(l.link_id || '').toUpperCase() === String(linkId).toUpperCase())
    : null;

  document.getElementById('admin-link-editor-title').textContent = existing
    ? `แก้ไขลิงก์หน่วยงาน ${existing.link_id}`
    : 'เพิ่มลิงก์หน่วยงานภายนอกใหม่';

  if (existing) {
    document.getElementById('edit-link-id').value = existing.link_id || '';
    document.getElementById('edit-link-id').readOnly = true;
    document.getElementById('edit-link-order').value = parseFloat(existing.display_order) || 1;
    document.getElementById('edit-link-visible').value = isTruthyFlag(existing.is_visible) ? 'TRUE' : 'FALSE';
    document.getElementById('edit-link-title').value = existing.link_title || '';
    document.getElementById('edit-link-url').value = existing.link_url || '';
    document.getElementById('edit-link-tooltip').value = existing.tooltip || '';
  } else {
    const nextNum = adminState.externalLinks.length + 1;
    document.getElementById('edit-link-id').value = `EXT0${nextNum}`;
    document.getElementById('edit-link-id').readOnly = false;
    document.getElementById('edit-link-order').value = nextNum;
    document.getElementById('edit-link-visible').value = 'TRUE';
    document.getElementById('edit-link-title').value = '';
    document.getElementById('edit-link-url').value = '';
    document.getElementById('edit-link-tooltip').value = '';
  }
  box.classList.remove('hidden');
};

window.deleteAdminLink = async function (linkId) {
  if (!confirm(`ต้องการลบลิงก์หน่วยงาน ${linkId} หรือไม่?`)) return;
  try {
    const res = await callPortalAdminPost({
      action: 'portal_delete_link',
      auth_token: adminState.token,
      link_id: linkId,
    });
    if (!res.success) {
      if (res.expired) showAdminLoginBox(res.message);
      else showPortalToast(res.message);
      return;
    }
    applyAdminWorkspaceData(res.data);
    showPortalToast(res.message);
  } catch (err) {
    showPortalToast('ลบไม่สำเร็จ: ' + err.message);
  }
};

function setupPortalAdminEvents() {
  const btnOpen = document.getElementById('btn-portal-admin');
  if (btnOpen) btnOpen.addEventListener('click', openPortalAdminModal);

  const btnClose = document.getElementById('btn-portal-admin-close');
  if (btnClose) btnClose.addEventListener('click', closePortalAdminModal);

  const btnLogout = document.getElementById('btn-portal-admin-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      showAdminLoginBox('');
      showPortalToast('ออกจากระบบจัดการ Portal แล้วครับ');
    });
  }

  const btnLogin = document.getElementById('btn-portal-admin-login');
  if (btnLogin) {
    btnLogin.addEventListener('click', async () => {
      const facId = document.getElementById('portal-admin-faculty').value;
      const pass = document.getElementById('portal-admin-passcode').value.trim();
      if (!facId || !pass) {
        showAdminLoginBox('กรุณาเลือกชื่อผู้ดูแลระบบและกรอกรหัสผ่านครับ');
        return;
      }
      btnLogin.disabled = true;
      btnLogin.textContent = 'กำลังตรวจสอบสิทธิ์...';
      try {
        const res = await callPortalAdminPost({
          action: 'portal_login',
          faculty_id: facId,
          passcode: pass,
        });
        btnLogin.disabled = false;
        btnLogin.textContent = 'เข้าสู่ระบบจัดการ Portal';
        if (!res.success) {
          showAdminLoginBox(res.message || 'เข้าสู่ระบบไม่สำเร็จ');
          return;
        }
        document.getElementById('portal-admin-passcode').value = '';
        showAdminWorkspace(res.user, res.sessionToken, res.data);
        showPortalToast('เข้าสู่ระบบจัดการ Portal Hub สำเร็จ');
        checkAndShowAdvisorPendingPopup(res.user);
      } catch (err) {
        btnLogin.disabled = false;
        btnLogin.textContent = 'เข้าสู่ระบบจัดการ Portal';
        showAdminLoginBox('ไม่สามารถเชื่อมต่อ API ได้ (กรุณาตรวจสอบว่าอัปเดตโค้ด GAS APP03 เป็นเวอร์ชันล่าสุดแล้ว)');
      }
    });
  }

  document.querySelectorAll('[data-admin-tab]').forEach((tabBtn) => {
    tabBtn.addEventListener('click', () => {
      const target = tabBtn.getAttribute('data-admin-tab');
      document.querySelectorAll('[data-admin-tab]').forEach((b) => b.classList.toggle('active', b === tabBtn));
      document.getElementById('admin-tab-apps').classList.toggle('hidden', target !== 'apps');
      document.getElementById('admin-tab-settings').classList.toggle('hidden', target !== 'settings');
      document.getElementById('admin-tab-links').classList.toggle('hidden', target !== 'links');
    });
  });

  document.getElementById('btn-admin-add-app')?.addEventListener('click', () => window.openAdminAppEditor(''));
  document.getElementById('btn-cancel-edit-app')?.addEventListener('click', () => {
    document.getElementById('admin-app-editor').classList.add('hidden');
  });

  document.getElementById('btn-save-edit-app')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-edit-app');
    btn.disabled = true;
    btn.textContent = 'กำลังบันทึก...';
    try {
      const appPayload = {
        app_id: document.getElementById('edit-app-id').value.trim(),
        display_zone: document.getElementById('edit-app-zone').value,
        display_order: document.getElementById('edit-app-order').value,
        app_title: document.getElementById('edit-app-title').value.trim(),
        category: document.getElementById('edit-app-category').value.trim(),
        description: document.getElementById('edit-app-desc').value.trim(),
        target_users: document.getElementById('edit-app-users').value.trim(),
        app_url: document.getElementById('edit-app-url').value.trim(),
        badge_text: document.getElementById('edit-app-badge-text').value.trim(),
        badge_type: document.getElementById('edit-app-badge-type').value,
        icon_name: document.getElementById('edit-app-icon').value,
        is_visible: document.getElementById('edit-app-visible').value,
      };
      const res = await callPortalAdminPost({
        action: 'portal_save_app',
        auth_token: adminState.token,
        app: appPayload,
      });
      btn.disabled = false;
      btn.textContent = 'บันทึกระบบงาน';
      if (!res.success) {
        if (res.expired) showAdminLoginBox(res.message);
        else showPortalToast(res.message);
        return;
      }
      document.getElementById('admin-app-editor').classList.add('hidden');
      applyAdminWorkspaceData(res.data, true);
      setAdminSyncStatus('saved', '✅ ซิงก์ลง Google Sheet เรียบร้อย');
      showPortalToast(res.message);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'บันทึกระบบงาน';
      showPortalToast('บันทึกไม่สำเร็จ: ' + err.message);
    }
  });

  document.getElementById('btn-save-portal-settings')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-portal-settings');
    btn.disabled = true;
    btn.textContent = 'กำลังบันทึก...';
    try {
      const settingsPayload = {
        portal_theme_mode: document.getElementById('set-portal-theme-mode')?.value || getCombinedPortalThemeCode(),
        maintenance_mode: document.getElementById('set-maintenance-mode')?.value || 'FALSE',
        maintenance_eta: (document.getElementById('set-maintenance-eta')?.value || '').trim(),
        maintenance_text: (document.getElementById('set-maintenance-text')?.value || '').trim(),
        show_notice: document.getElementById('set-show-notice').value,
        notice_text: document.getElementById('set-notice-text').value.trim(),
        site_title: document.getElementById('set-site-title').value.trim(),
        dept_badge: document.getElementById('set-dept-badge').value.trim(),
        site_subtitle: document.getElementById('set-site-subtitle').value.trim(),
        footer_text: document.getElementById('set-footer-text').value.trim(),
        contact_info: document.getElementById('set-contact-info').value.trim(),
      };
      const res = await callPortalAdminPost({
        action: 'portal_save_settings',
        auth_token: adminState.token,
        settings: settingsPayload,
      });
      btn.disabled = false;
      btn.textContent = 'บันทึกการตั้งค่าหน้าเว็บ';
      if (!res.success) {
        if (res.expired) showAdminLoginBox(res.message);
        else showPortalToast(res.message);
        return;
      }
      applyAdminWorkspaceData(res.data, true);
      setAdminSyncStatus('saved', '✅ ซิงก์ลง Google Sheet เรียบร้อย');
      showPortalToast(res.message);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'บันทึกการตั้งค่าหน้าเว็บ';
      showPortalToast('บันทึกไม่สำเร็จ: ' + err.message);
    }
  });

  document.getElementById('btn-admin-add-link')?.addEventListener('click', () => window.openAdminLinkEditor(''));
  document.getElementById('btn-cancel-edit-link')?.addEventListener('click', () => {
    document.getElementById('admin-link-editor').classList.add('hidden');
  });

  document.getElementById('btn-save-edit-link')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-edit-link');
    btn.disabled = true;
    btn.textContent = 'กำลังบันทึก...';
    try {
      const linkPayload = {
        link_id: document.getElementById('edit-link-id').value.trim(),
        display_order: document.getElementById('edit-link-order').value,
        is_visible: document.getElementById('edit-link-visible').value,
        link_title: document.getElementById('edit-link-title').value.trim(),
        link_url: document.getElementById('edit-link-url').value.trim(),
        tooltip: document.getElementById('edit-link-tooltip').value.trim(),
      };
      const res = await callPortalAdminPost({
        action: 'portal_save_link',
        auth_token: adminState.token,
        link: linkPayload,
      });
      btn.disabled = false;
      btn.textContent = 'บันทึกลิงก์';
      if (!res.success) {
        if (res.expired) showAdminLoginBox(res.message);
        else showPortalToast(res.message);
        return;
      }
      document.getElementById('admin-link-editor').classList.add('hidden');
      applyAdminWorkspaceData(res.data, true);
      setAdminSyncStatus('saved', '✅ ซิงก์ลง Google Sheet เรียบร้อย');
      showPortalToast(res.message);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'บันทึกลิงก์';
      showPortalToast('บันทึกไม่สำเร็จ: ' + err.message);
    }
  });
}

function getApp07LiveUrl() {
  const app07 = (rawPortalApps || []).find((a) => String(a.app_id || '').toUpperCase() === 'APP07');
  if (app07 && isValidHttpUrl(app07.app_url)) return app07.app_url.trim();
  return CONFIG.FALLBACK_APP_URLS.APP07;
}

function renderLiveAnnouncementsTicker(items) {
  const bar = document.getElementById('live-announcements-bar');
  const listEl = document.getElementById('live-announcements-list');
  const moreEl = document.getElementById('live-announcements-more');
  if (!bar || !listEl) return;

  if (!Array.isArray(items) || items.length === 0) {
    bar.classList.add('hidden');
    return;
  }

  const app07Url = getApp07LiveUrl();
  if (moreEl) moreEl.href = app07Url;

  listEl.innerHTML = items
    .slice(0, 3)
    .map((it) => {
      const pinBadge = it.is_pinned ? '<span class="live-ann-pin">ปักหมุด</span>' : '';
      const orgTag = it.source_org ? `<span class="live-ann-org">[${escapeHtml(it.source_org)}]</span>` : '';
      return `
        <a class="live-ann-item" href="${escapeHtml(app07Url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(it.title_th)}">
          ${pinBadge}
          ${orgTag}
          <span class="live-ann-title">${escapeHtml(it.title_th)}</span>
        </a>
      `;
    })
    .join('');

  bar.classList.remove('hidden');
}

async function loadLiveAnnouncementsTicker() {
  // 1) ลองดึงจากชีตประกาศสำคัญ (APP07) ผ่าน Google Visualization CSV ก่อน
  try {
    const res = await fetch(CONFIG.ANNOUNCEMENTS_PUBLISHED_CSV_URL, { cache: 'no-store' });
    if (res.ok) {
      const csvText = await res.text();
      const rows = parseCSV(csvText);
      const today = new Date().toISOString().slice(0, 10);
      const valid = rows
        .filter((r) => {
          const aid = (r.announce_id || '').trim();
          const title = (r.title_th || '').trim();
          const stat = (r.status || 'PUBLISHED').trim().toUpperCase();
          const exp = (r.expire_date || '').trim();
          if (!aid || !title) return false;
          if (stat && stat !== 'PUBLISHED') return false;
          if (exp && exp < today) return false;
          return true;
        })
        .map((r) => ({
          announce_id: r.announce_id,
          published_at: r.published_at || '',
          source_org: r.source_org || '',
          title_th: r.title_th,
          is_pinned: isTruthyFlag(r.is_pinned),
        }))
        .sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
          return String(b.published_at).localeCompare(String(a.published_at));
        });
      if (valid.length > 0) {
        renderLiveAnnouncementsTicker(valid.slice(0, 3));
        return;
      }
    }
  } catch (e) {}

  // 2) หากชีต APP07 เป็น Private ให้ดึงผ่าน GAS API (action=portal_announcements)
  const urls = getCandidateAdminApiUrls();
  for (const apiUrl of urls) {
    try {
      const res = await fetch(`${apiUrl}?action=portal_announcements`, { cache: 'no-store' });
      const data = await res.json();
      if (data && data.success && Array.isArray(data.items) && data.items.length > 0) {
        renderLiveAnnouncementsTicker(data.items);
        return;
      }
    } catch (e) {}
  }
}

function setupRoleSwitcherEvents() {
  const wrap = document.getElementById('role-switcher');
  if (!wrap) return;
  wrap.querySelectorAll('.role-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeRole = btn.getAttribute('data-role') || 'ALL';
      wrap.querySelectorAll('.role-pill').forEach((b) => b.classList.toggle('active', b === btn));
      renderApps();
    });
  });
}

function setPortalThemeAndLayoutByCode(themeCode, isUserClick = false) {
  const normalized = ['modern', 'hybrid_cards', 'hybrid_table'].includes(themeCode) ? themeCode : 'hybrid_cards';
  if (normalized === 'modern') {
    activeThemeMode = 'modern';
    activeLayoutMode = 'cards';
  } else if (normalized === 'hybrid_table') {
    activeThemeMode = 'hybrid';
    activeLayoutMode = 'table';
  } else {
    activeThemeMode = 'hybrid';
    activeLayoutMode = 'cards';
  }
  if (isUserClick) {
    window._userManuallySwitchedTheme = true;
    try {
      sessionStorage.setItem(CONFIG.USER_THEME_PREF_KEY, normalized);
    } catch (e) {}
  }
  applyHybridThemeClasses();
  renderApps();
}

function applyHybridThemeClasses() {
  const combinedCode = getCombinedPortalThemeCode();
  document.body.classList.toggle('theme-hybrid', activeThemeMode === 'hybrid');
  document.body.classList.toggle('layout-table', activeThemeMode === 'hybrid' && activeLayoutMode === 'table');

  document.querySelectorAll('[data-user-theme]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-user-theme') === combinedCode);
  });
  highlightAdminThemeButtons(combinedCode);
}

function setupHybridPreviewEvents() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('theme') === 'modern') {
    activeThemeMode = 'modern';
    window._userManuallySwitchedTheme = true;
  } else if (urlParams.get('layout') === 'table') {
    activeThemeMode = 'hybrid';
    activeLayoutMode = 'table';
    window._userManuallySwitchedTheme = true;
  } else {
    try {
      const savedSessionTheme = sessionStorage.getItem(CONFIG.USER_THEME_PREF_KEY);
      if (savedSessionTheme && ['modern', 'hybrid_cards', 'hybrid_table'].includes(savedSessionTheme)) {
        if (savedSessionTheme === 'modern') {
          activeThemeMode = 'modern';
          activeLayoutMode = 'cards';
        } else if (savedSessionTheme === 'hybrid_table') {
          activeThemeMode = 'hybrid';
          activeLayoutMode = 'table';
        } else {
          activeThemeMode = 'hybrid';
          activeLayoutMode = 'cards';
        }
      }
    } catch (e) {}
  }

  applyHybridThemeClasses();

  document.querySelectorAll('[data-user-theme]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetCode = btn.getAttribute('data-user-theme') || 'hybrid_cards';
      setPortalThemeAndLayoutByCode(targetCode, true);
    });
  });

  document.querySelectorAll('[data-classic-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-classic-nav');
      document.querySelectorAll('[data-classic-nav]').forEach((b) => b.classList.toggle('active', b === btn));
      if (target === 'EXT_LINKS') {
        document.getElementById('external-links-section')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      activeCategory = target === 'ALL' ? 'ทั้งหมด' : target;
      renderCategoryFilters();
      renderApps();
    });
  });
}

// =========================================================
// ระบบล็อกอินอาจารย์ด้วย Passcode กลางมุมขวาบน & Pop-up แจ้งเตือนคำร้องค้าง (APP10)
// =========================================================
let facultyAuthState = {
  accountsLoaded: false,
  accounts: [],
  user: null,
  pendingCount: 0,
};

function getApp10ExecUrl() {
  const app10 = (rawPortalApps || []).find((a) => String(a.app_id || '').toUpperCase() === 'APP10');
  if (app10 && isValidHttpUrl(app10.app_url)) return app10.app_url.trim();
  return CONFIG.APP10_API_URL || CONFIG.FALLBACK_APP_URLS.APP10;
}

function stripFacultyTitlePrefix(rawName) {
  return String(rawName || '')
    .replace(/^(ศ\.ดร\.|รศ\.ดร\.|ผศ\.ดร\.|อ\.ดร\.|ศ\.|รศ\.|ผศ\.|อ\.|ดร\.|เจ้าหน้าที่)\s*/g, '')
    .trim();
}

async function loadFacultyLoginAccounts() {
  if (facultyAuthState.accountsLoaded && facultyAuthState.accounts.length > 0) return;
  const sel = document.getElementById('faculty-login-select');
  if (!sel) return;

  const app10Url = getApp10ExecUrl();
  try {
    const res = await fetch(`${app10Url}?action=getInitialAppData`, { cache: 'no-store' });
    const data = await res.json();
    if (data && data.success && data.payload && Array.isArray(data.payload.loginAccounts)) {
      facultyAuthState.accounts = data.payload.loginAccounts;
      facultyAuthState.accountsLoaded = true;
      sel.innerHTML =
        '<option value="">-- เลือกชื่อคณาจารย์ / บุคลากร --</option>' +
        facultyAuthState.accounts
          .map(
            (acc) =>
              `<option value="${escapeHtml(acc.id)}">${escapeHtml(stripFacultyTitlePrefix(acc.name || acc.displayName))}</option>`
          )
          .join('');
      return;
    }
  } catch (err) {
    console.warn('โหลดรายชื่ออาจารย์จาก APP10 ไม่สำเร็จ ลองดึงจาก APP03 แทน:', err);
  }

  // Fallback ดึงจาก APP03 API
  const urls = getCandidateAdminApiUrls();
  for (const apiUrl of urls) {
    try {
      const res = await fetch(`${apiUrl}?action=portal_faculty`, { cache: 'no-store' });
      const data = await res.json();
      if (data && data.success && Array.isArray(data.faculty)) {
        facultyAuthState.accounts = data.faculty;
        facultyAuthState.accountsLoaded = true;
        sel.innerHTML =
          '<option value="">-- เลือกชื่อคณาจารย์ / บุคลากร --</option>' +
          data.faculty
            .map(
              (f) =>
                `<option value="${escapeHtml(f.id)}">${escapeHtml(stripFacultyTitlePrefix(f.name))}</option>`
            )
            .join('');
        return;
      }
    } catch (e) {}
  }
}

function updateFacultyHeaderButtonUI() {
  const labelEl = document.getElementById('btn-faculty-login-label');
  const badgeEl = document.getElementById('faculty-pending-badge');
  const formBox = document.getElementById('faculty-login-form-box');
  const loggedBox = document.getElementById('faculty-logged-in-box');
  const nameEl = document.getElementById('faculty-logged-in-name');

  if (!facultyAuthState.user) {
    if (labelEl) labelEl.textContent = 'เข้าสู่ระบบ';
    if (badgeEl) badgeEl.classList.add('hidden');
    if (formBox) formBox.classList.remove('hidden');
    if (loggedBox) loggedBox.classList.add('hidden');
    return;
  }

  const displayName = stripFacultyTitlePrefix(facultyAuthState.user.name || facultyAuthState.user.displayName || 'อาจารย์');
  if (labelEl) labelEl.textContent = displayName;
  if (nameEl) nameEl.textContent = `👤 ${displayName}`;
  if (formBox) formBox.classList.add('hidden');
  if (loggedBox) loggedBox.classList.remove('hidden');

  if (badgeEl) {
    if (facultyAuthState.pendingCount > 0) {
      badgeEl.textContent = String(facultyAuthState.pendingCount);
      badgeEl.classList.remove('hidden');
    } else {
      badgeEl.classList.add('hidden');
    }
  }
}

function showAdvisorPendingPopupModal(advisorDisplayName, count, items) {
  const modal = document.getElementById('advisor-pending-popup');
  if (!modal) return;

  const greetingEl = document.getElementById('advisor-popup-greeting');
  const countEl = document.getElementById('advisor-popup-count-num');
  const listEl = document.getElementById('advisor-popup-items-list');
  const gotoBtn = document.getElementById('btn-goto-app10-approval');

  if (greetingEl) {
    greetingEl.innerHTML = `เรียน <strong>${escapeHtml(advisorDisplayName)}</strong> มีคำร้องจองห้องเรียน/ห้องประชุมจากนักศึกษารอการอนุมัติ:`;
  }
  if (countEl) {
    countEl.textContent = `${count} รายการ`;
  }

  const app10Url = getApp10ExecUrl();
  const sep = app10Url.includes('?') ? '&' : '?';
  if (gotoBtn) {
    gotoBtn.href = `${app10Url}${sep}tab=advisor`;
  }

  if (listEl) {
    if (Array.isArray(items) && items.length > 0) {
      listEl.innerHTML = items
        .map(
          (it) => `
          <div class="advisor-popup-item">
            <div class="advisor-popup-item-top">
              <span>รหัสคำร้อง #${escapeHtml(it.Booking_ID || '-')} • ห้อง ${escapeHtml(it.Room_ID || '-')}</span>
              <span>📆 ${escapeHtml(it.Booking_Date || '')} (${escapeHtml(it.Start_Time || '')}-${escapeHtml(it.End_Time || '')} น.)</span>
            </div>
            <div>👤 <strong>ผู้จอง:</strong> ${escapeHtml(it.Booker_Name || '-')} • <strong>วัตถุประสงค์:</strong> ${escapeHtml(it.Purpose || '-')}</div>
          </div>
        `
        )
        .join('');
    } else {
      listEl.innerHTML = '';
    }
  }

  modal.classList.remove('hidden');
}

async function checkAndShowAdvisorPendingPopup(userObj) {
  if (!userObj) return;
  const rawName = String(userObj.name || userObj.displayName || '').trim();
  if (!rawName) return;

  // ตัดคำนำหน้าตำแหน่งทางวิชาการและวงเล็บชื่อเล่นออกเพื่อให้แมตช์กับชื่ออาจารย์ที่ปรึกษาในชีต APP10 ได้แม่นยำทุกรูปแบบ
  const cleanAdvisorQuery = rawName
    .replace(/\(.*?\)/g, '')
    .replace(/(ศ\.ดร\.|รศ\.ดร\.|ผศ\.ดร\.|อ\.ดร\.|ศ\.|รศ\.|ผศ\.|อ\.|ดร\.)/g, '')
    .trim() || rawName;

  const app10Url = getApp10ExecUrl();
  const statusEl = document.getElementById('faculty-logged-in-status');
  if (statusEl) statusEl.textContent = '⏳ กำลังตรวจสอบคำร้องรออนุมัติ...';

  try {
    const apiEndpoint = `${app10Url}?action=getPendingAdvisorCount&advisorName=${encodeURIComponent(cleanAdvisorQuery)}`;
    const res = await fetch(apiEndpoint, { cache: 'no-store' });
    const data = await res.json();

    const pendingCount = Number(data && data.pendingAdvisorCount) || 0;
    const items = (data && Array.isArray(data.items)) ? data.items : [];
    facultyAuthState.pendingCount = pendingCount;
    updateFacultyHeaderButtonUI();

    if (statusEl) {
      statusEl.innerHTML =
        pendingCount > 0
          ? `🔔 พบคำร้องจองห้องของนักศึกษารอท่านอนุมัติ <strong style="color:#b45309;">${pendingCount} รายการ</strong>`
          : '✅ ไม่มีคำร้องจองห้องของนักศึกษาค้างรออนุมัติในขณะนี้';
    }

    if (pendingCount > 0) {
      document.getElementById('faculty-login-modal')?.classList.add('hidden');
      showAdvisorPendingPopupModal(userObj.displayName || userObj.name, pendingCount, items);
    }
  } catch (err) {
    console.warn('เรียก API getPendingAdvisorCount ของ APP10 ไม่สำเร็จ:', err);
    if (statusEl) {
      statusEl.textContent = 'เชื่อมต่อระบบเรียบร้อยแล้ว';
    }
  }
}

function setupFacultyLoginAndAdvisorPopupEvents() {
  const triggerBtn = document.getElementById('btn-faculty-login-trigger');
  const modal = document.getElementById('faculty-login-modal');
  const closeBtn = document.getElementById('btn-faculty-login-close');
  const submitBtn = document.getElementById('btn-faculty-login-submit');
  const passInput = document.getElementById('faculty-login-passcode');
  const errBox = document.getElementById('faculty-login-error');
  const logoutBtn = document.getElementById('btn-faculty-logout');
  const recheckBtn = document.getElementById('btn-faculty-recheck-pending');
  const closePopupBtn = document.getElementById('btn-close-advisor-popup');

  triggerBtn?.addEventListener('click', () => {
    modal?.classList.remove('hidden');
    loadFacultyLoginAccounts();
    updateFacultyHeaderButtonUI();
  });

  closeBtn?.addEventListener('click', () => {
    modal?.classList.add('hidden');
  });

  closePopupBtn?.addEventListener('click', () => {
    document.getElementById('advisor-pending-popup')?.classList.add('hidden');
  });

  recheckBtn?.addEventListener('click', () => {
    if (facultyAuthState.user) {
      checkAndShowAdvisorPendingPopup(facultyAuthState.user);
    }
  });

  logoutBtn?.addEventListener('click', () => {
    facultyAuthState.user = null;
    facultyAuthState.pendingCount = 0;
    try {
      sessionStorage.removeItem(CONFIG.FACULTY_SESSION_KEY);
    } catch (e) {}
    updateFacultyHeaderButtonUI();
    showPortalToast('ออกจากระบบอาจารย์เรียบร้อยแล้ว');
  });

  const handleFacultyLoginSubmit = async () => {
    const accountId = document.getElementById('faculty-login-select')?.value || '';
    const passcode = (passInput?.value || '').trim();
    if (!accountId || !passcode) {
      if (errBox) {
        errBox.textContent = 'กรุณาเลือกชื่ออาจารย์และกรอกรหัสผ่าน (Passcode) ครับ';
        errBox.classList.remove('hidden');
      }
      return;
    }

    if (errBox) errBox.classList.add('hidden');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'กำลังเข้าสู่ระบบ...';
    }

    const app10Url = getApp10ExecUrl();
    try {
      const res = await fetch(app10Url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'authenticateStaffOrFaculty',
          accountId: accountId,
          passcode: passcode,
        }),
      });
      const data = await res.json();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'เข้าสู่ระบบ';
      }

      if (!data || !data.success) {
        if (errBox) {
          errBox.textContent = (data && data.message) || 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
          errBox.classList.remove('hidden');
        }
        return;
      }

      if (passInput) passInput.value = '';
      facultyAuthState.user = data.user;
      try {
        sessionStorage.setItem(CONFIG.FACULTY_SESSION_KEY, JSON.stringify(data.user));
      } catch (e) {}

      updateFacultyHeaderButtonUI();
      showPortalToast(`เข้าสู่ระบบสำเร็จ: ${data.user.displayName || data.user.name}`);
      await checkAndShowAdvisorPendingPopup(data.user);
    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'เข้าสู่ระบบ';
      }
      if (errBox) {
        errBox.textContent = 'ไม่สามารถเชื่อมต่อระบบได้ในขณะนี้';
        errBox.classList.remove('hidden');
      }
    }
  };

  submitBtn?.addEventListener('click', handleFacultyLoginSubmit);
  passInput?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleFacultyLoginSubmit();
  });

  // กู้คืนเซสชันอาจารย์ในแท็บปัจจุบัน (ถ้ามี)
  try {
    const saved = sessionStorage.getItem(CONFIG.FACULTY_SESSION_KEY);
    if (saved) {
      facultyAuthState.user = JSON.parse(saved);
      updateFacultyHeaderButtonUI();
    }
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  setupHybridPreviewEvents();
  initPortal();
  setupRoleSwitcherEvents();
  setupPortalAdminEvents();
  setupFacultyLoginAndAdvisorPopupEvents();
  loadLiveAnnouncementsTicker();
});
