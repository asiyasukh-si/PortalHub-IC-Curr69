// =========================================================
// ตั้งค่าลิงก์ฐานข้อมูล CSV จาก Google Sheets
// =========================================================
const CONFIG = {
  APPS_CSV_URL:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSiN8jIgT62ylOypdPgsYaEskjC6MF7LeZH3d7J0e2BWJSkZ_ZrE2hoGgNqUJtLeUvkfMzx4bXBenJZ/pub?gid=0&single=true&output=csv',
  SETTINGS_CSV_URL:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSiN8jIgT62ylOypdPgsYaEskjC6MF7LeZH3d7J0e2BWJSkZ_ZrE2hoGgNqUJtLeUvkfMzx4bXBenJZ/pub?gid=2&single=true&output=csv',
  // รหัสสีดัมมี่โทนกรมท่าเดิม (หากยังไม่ได้แก้ในชีต จะคงโทนม่วง-เหลืองพาสเทลไว้ให้โดยอัตโนมัติ)
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
  default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect></svg>`,
};

// =========================================================
// ตัวแปลง CSV เป็น Array of Objects (รองรับเครื่องหมายคำพูดและขึ้นบรรทัดใหม่)
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

// แปลงรหัสสี Hex เป็น RGBA สำหรับ Overlay
function hexToRgba(hex, alpha) {
  const cleaned = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ป้องกัน XSS เมื่อนำข้อความจากชีตไปแสดงผล
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

  // ข้อความส่วนหัวและส่วนท้าย
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

  // สีหลักของธีม (ใช้ค่าจากชีตเมื่อมีการเปลี่ยนจากค่าดัมมี่กรมท่าเดิม)
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

function isValidHttpUrl(url) {
  return /^https?:\/\/.+/i.test((url || '').trim());
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

  if (filtered.length === 0) {
    container.innerHTML = '';
    statusEl.innerHTML = `<p>ไม่พบระบบงานที่ตรงกับเงื่อนไขการค้นหา</p>`;
    statusEl.classList.remove('hidden');
    return;
  }

  statusEl.classList.add('hidden');

  // จัดกลุ่มตามหมวดหมู่
  const grouped = new Map();
  filtered.forEach((app) => {
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
// เริ่มต้นโหลดข้อมูลจาก Google Sheets ทั้ง 2 แท็บพร้อมกัน
// =========================================================
async function initPortal() {
  const statusEl = document.getElementById('status-message');

  try {
    const [settingsRes, appsRes] = await Promise.all([
      fetch(CONFIG.SETTINGS_CSV_URL, { cache: 'no-store' }),
      fetch(CONFIG.APPS_CSV_URL, { cache: 'no-store' }),
    ]);

    if (!settingsRes.ok || !appsRes.ok) {
      throw new Error('ไม่สามารถโหลดไฟล์ CSV จาก Google Sheets ได้');
    }

    const [settingsCsv, appsCsv] = await Promise.all([settingsRes.text(), appsRes.text()]);

    applySettings(parseCSV(settingsCsv));

    allApps = parseCSV(appsCsv)
      .filter((app) => String(app.is_visible || '').toUpperCase() === 'TRUE')
      .sort((a, b) => (parseFloat(a.display_order) || 999) - (parseFloat(b.display_order) || 999));

    renderCategoryFilters();
    renderApps();
  } catch (err) {
    console.error(err);
    statusEl.innerHTML = `
      <p><strong>ไม่สามารถโหลดข้อมูลจากฐานข้อมูลได้ในขณะนี้</strong></p>
      <p style="margin-top: 6px; font-size: 0.9rem;">กรุณาตรวจสอบการเผยแพร่ลิงก์ CSV ของแท็บ Portal_Apps และ Portal_Settings ใน Google Sheets แล้วลองรีเฟรชหน้าเว็บอีกครั้ง</p>
    `;
    statusEl.classList.remove('hidden');
  }
}

document.getElementById('search-input').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderApps();
});

document.addEventListener('DOMContentLoaded', initPortal);
