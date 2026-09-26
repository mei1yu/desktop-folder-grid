// High-definition SVG icons accurately representing modern apps and the user screenshot
const BUILTIN_ICONS = {
  // Edge
  edge: `<svg viewBox="0 0 48 48" fill="none">
    <path d="M43.6 29.8C42.8 37 36.8 42.6 29.4 43.4C21.7 44.2 14.5 39.8 11.5 33C14.7 34.6 18.5 35.1 22.3 34.1C16.8 32.7 12.6 28.5 11 23C13.8 24.3 17 24.7 20.2 24.1C13.8 22.1 9.4 16.5 9 9.8C5.2 14.9 3.5 21.6 4.7 28.2C6.7 39 16.6 46.8 27.6 45.6C37.5 44.5 45.3 36.8 46.4 27C45.6 27.9 44.6 28.9 43.6 29.8Z" fill="url(#edge_grad1)"/>
    <path d="M22.3 34.1C28.2 32.5 32.5 27.2 32.8 21.1H18.9C19.7 15.6 23.9 11.2 29.4 10.3C35.5 9.3 41.2 13 42.7 18.9C43.3 14.6 42 10.2 39 6.8C33.6 0.7 24.5-1.3 16.8 1.9C9.1 5.1 4.2 12.8 4.7 21.2C9.4 16.5 13.8 22.1 20.2 24.1C17 24.7 13.8 24.3 11 23C12.6 28.5 16.8 32.7 22.3 34.1Z" fill="url(#edge_grad2)"/>
    <defs>
      <linearGradient id="edge_grad1" x1="12" y1="45" x2="45" y2="25" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0078D7"/>
        <stop offset="0.5" stop-color="#00BCF2"/>
        <stop offset="1" stop-color="#2D7D9A"/>
      </linearGradient>
      <linearGradient id="edge_grad2" x1="5" y1="5" x2="40" y2="30" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0CB8C8"/>
        <stop offset="0.6" stop-color="#3CD52E"/>
        <stop offset="1" stop-color="#9DE743"/>
      </linearGradient>
    </defs>
  </svg>`,

  // Chrome / Browser 360
  chrome: `<svg viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="21" fill="#FFFFFF"/>
    <circle cx="24" cy="24" r="20" fill="url(#chrome_bg)"/>
    <path d="M24 14C29.5228 14 34 18.4772 34 24C34 29.5228 29.5228 34 24 34C18.4772 34 14 29.5228 14 24C14 18.4772 18.4772 14 24 14Z" fill="#FFFFFF"/>
    <circle cx="24" cy="24" r="7.5" fill="#1A73E8"/>
    <circle cx="24" cy="24" r="2" fill="#FFFFFF"/>
    <defs>
      <linearGradient id="chrome_bg" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop stop-color="#2563EB"/>
        <stop offset="1" stop-color="#38BDF8"/>
      </linearGradient>
    </defs>
  </svg>`,

  // Paint (系统画图)
  paint: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="#EBF3FE"/>
    <path d="M12 28C12 22 17 15 25 15C33 15 37 20 37 26C37 31 33 35 28 35C26 35 25 34 24 32C23 30 22 30 20 30C16 30 12 33 12 28Z" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5"/>
    <circle cx="19" cy="21" r="2.5" fill="#EF4444"/>
    <circle cx="25" cy="19" r="2.5" fill="#EAB308"/>
    <circle cx="31" cy="22" r="2.5" fill="#3B82F6"/>
    <path d="M26 12L36 22L33 25L23 15L26 12Z" fill="#F59E0B"/>
    <path d="M22 16L18 20L21 23L25 19L22 16Z" fill="#D97706"/>
    <path d="M16 22C14 24 14 26 15 27C16 28 18 28 20 26L16 22Z" fill="#3B82F6"/>
  </svg>`,

  // Snipping tool (截图工具)
  snipping: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="#FFF1F2"/>
    <!-- Scissor -->
    <circle cx="18" cy="30" r="4" stroke="#0284C7" stroke-width="2.5"/>
    <circle cx="30" cy="30" r="4" stroke="#0284C7" stroke-width="2.5"/>
    <path d="M20 27L29 16" stroke="#0284C7" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M28 27L19 16" stroke="#0284C7" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Red Crop Box -->
    <path d="M26 10H38V22" stroke="#E11D48" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 3"/>
  </svg>`,

  // Photos (照片)
  photos: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="url(#photos_bg)"/>
    <circle cx="18" cy="18" r="4" fill="#FDE047"/>
    <path d="M10 38L21 26L28 32L34 25L42 34V36C42 38.2 40.2 40 38 40H14C11.8 40 10 38.2 10 36V38Z" fill="#FFFFFF" fill-opacity="0.9"/>
    <path d="M27 33L33 26L41 35H12L21 26L27 33Z" fill="#E2E8F0" fill-opacity="0.8"/>
    <defs>
      <linearGradient id="photos_bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stop-color="#38BDF8"/>
        <stop offset="1" stop-color="#0284C7"/>
      </linearGradient>
    </defs>
  </svg>`,

  // Settings (系统设置)
  settings: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="#E2E8F0"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M24 16C19.58 16 16 19.58 16 24C16 28.42 19.58 32 24 32C28.42 32 32 28.42 32 24C32 19.58 28.42 16 24 16ZM24 20C21.79 20 20 21.79 20 24C20 26.21 21.79 28 24 28C26.21 28 28 26.21 28 24C28 21.79 26.21 20 24 20Z" fill="#475569"/>
    <path d="M26.2 10H21.8L21.2 13.5C20.3 13.9 19.5 14.4 18.7 15L15.4 13.7L12.3 16.8L13.6 20.1C13 20.9 12.5 21.7 12.1 22.6L8.6 23.2V27.6L12.1 28.2C12.5 29.1 13 29.9 13.6 30.7L12.3 34L15.4 37.1L18.7 35.8C19.5 36.4 20.3 36.9 21.2 37.3L21.8 40.8H26.2L26.8 37.3C27.7 36.9 28.5 36.4 29.3 35.8L32.6 37.1L35.7 34L34.4 30.7C35 29.9 35.5 29.1 35.9 28.2L39.4 27.6V23.2L35.9 22.6C35.5 21.7 35 20.9 34.4 20.1L35.7 16.8L32.6 13.7L29.3 15C28.5 14.4 27.7 13.9 26.8 13.5L26.2 10Z" stroke="#475569" stroke-width="2" stroke-linejoin="round"/>
  </svg>`,

  // Notepad (记事本)
  notepad: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="#E0F2FE"/>
    <rect x="11" y="10" width="26" height="30" rx="3" fill="#FFFFFF" stroke="#0284C7" stroke-width="2"/>
    <line x1="16" y1="18" x2="32" y2="18" stroke="#0284C7" stroke-width="2" stroke-linecap="round"/>
    <line x1="16" y1="24" x2="32" y2="24" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
    <line x1="16" y1="30" x2="26" y2="30" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
    <circle cx="16" cy="10" r="1.5" fill="#0284C7"/>
    <circle cx="24" cy="10" r="1.5" fill="#0284C7"/>
    <circle cx="32" cy="10" r="1.5" fill="#0284C7"/>
  </svg>`,

  // Obsidian (黑曜石)
  obsidian: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="#2E1065"/>
    <path d="M24 7L35 15L31 37L24 43L17 37L13 15L24 7Z" fill="#8B5CF6"/>
    <path d="M24 7L35 15L29 25L24 43V7Z" fill="#A78BFA"/>
    <path d="M24 7L13 15L19 25L24 43V7Z" fill="#7C3AED"/>
    <path d="M19 25L24 43L29 25L24 18L19 25Z" fill="#C4B5FD"/>
  </svg>`,

  // OneNote
  onenote: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="url(#onenote_bg)"/>
    <rect x="10" y="12" width="22" height="24" rx="3" fill="#A21CAF"/>
    <text x="15" y="30" font-family="Arial, sans-serif" font-weight="900" font-size="18" fill="#FFFFFF">N</text>
    <path d="M26 12H38V36H26V12Z" fill="#E879F9" fill-opacity="0.85"/>
    <defs>
      <linearGradient id="onenote_bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stop-color="#86198F"/>
        <stop offset="1" stop-color="#C026D3"/>
      </linearGradient>
    </defs>
  </svg>`,

  // Books / Reader
  books: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="#CCFBF1"/>
    <path d="M12 14C16 12 21 13 24 16C27 13 32 12 36 14V34C32 32 27 33 24 36C21 33 16 32 12 34V14Z" fill="#14B8A6"/>
    <path d="M24 16V36" stroke="#0D9488" stroke-width="2"/>
    <path d="M14 16C17 15 21 15 24 18M14 21C17 20 21 20 24 23" stroke="#F0FDFA" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  // ChatGPT
  chatgpt: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="#10A37F"/>
    <path d="M37 22.8C36.6 18.2 33 14.6 28.4 14.2V12C28.4 10.9 27.5 10 26.4 10H21.6C20.5 10 19.6 10.9 19.6 12V14.2C15 14.6 11.4 18.2 11 22.8C9.9 23.3 9 24.5 9 25.8V29.2C9 30.5 9.9 31.7 11 32.2C11.4 36.8 15 40.4 19.6 40.8V42C19.6 43.1 20.5 44 21.6 44H26.4C27.5 44 28.4 43.1 28.4 42V40.8C33 40.4 36.6 36.8 37 32.2C38.1 31.7 39 30.5 39 29.2V25.8C39 24.5 38.1 23.3 37 22.8Z" fill="#FFFFFF"/>
    <circle cx="19" cy="27" r="3" fill="#10A37F"/>
    <circle cx="29" cy="27" r="3" fill="#10A37F"/>
  </svg>`,

  // Copilot / AI Avatar
  copilot: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="#FDE047"/>
    <circle cx="24" cy="22" r="11" fill="#FBCFE8"/>
    <path d="M15 19C15 14 19 12 24 12C29 12 33 14 33 19V24H15V19Z" fill="#7C2D12"/>
    <circle cx="20" cy="22" r="2" fill="#1E293B"/>
    <circle cx="28" cy="22" r="2" fill="#1E293B"/>
    <path d="M21 27C22 28.5 26 28.5 27 27" stroke="#EA580C" stroke-width="1.5" stroke-linecap="round"/>
    <rect x="14" y="32" width="20" height="10" rx="5" fill="#3B82F6"/>
  </svg>`,

  // DeepSeek / Claude / Whale
  deepseek: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="#1E293B"/>
    <path d="M13 26C13 18 19 13 27 13C33 13 36 17 36 21C36 26 31 29 25 29C22 29 19 30 17 33L15 36C14 36 13 33 13 26Z" fill="#38BDF8"/>
    <circle cx="22" cy="20" r="2" fill="#FFFFFF"/>
    <path d="M34 22C36 21 39 21 40 23" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  // GitHub
  github: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="#181717"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M24 10C16.27 10 10 16.27 10 24C10 30.19 14.02 35.43 19.59 37.28C20.29 37.41 20.55 36.98 20.55 36.61C20.55 36.28 20.53 35.21 20.53 33.88C17 34.52 16.14 32.84 15.86 32.06C15.7 31.66 15.01 30.41 14.41 30.08C13.91 29.81 13.2 29.15 14.39 29.13C15.51 29.11 16.31 30.16 16.57 30.58C17.85 32.74 19.9 32.14 20.72 31.77C20.85 30.84 21.22 30.21 21.63 29.85C18.47 29.49 15.15 28.27 15.15 22.83C15.15 21.28 15.7 20 16.61 19.01C16.46 18.65 15.97 17.18 16.75 15.23C16.75 15.23 17.94 14.85 20.65 16.68C21.78 16.37 22.99 16.21 24.2 16.21C25.41 16.21 26.62 16.37 27.75 16.68C30.46 14.83 31.65 15.23 31.65 15.23C32.43 17.18 31.94 18.65 31.79 19.01C32.7 20 33.24 21.26 33.24 22.83C33.24 28.29 29.9 29.49 26.74 29.85C27.25 30.29 27.69 31.14 27.69 32.47C27.69 34.38 27.67 35.91 27.67 36.61C27.67 36.98 27.93 37.43 28.64 37.28C34.2 35.43 38.22 30.17 38.22 24C38.22 16.27 31.95 10 24 10Z" fill="#FFFFFF"/>
  </svg>`,

  // Proxy tool 1 (Clash/Lines)
  proxy1: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="url(#p1_bg)"/>
    <rect x="12" y="16" width="24" height="4" rx="2" fill="#FFFFFF"/>
    <rect x="12" y="24" width="16" height="4" rx="2" fill="#FFFFFF"/>
    <rect x="12" y="32" width="20" height="4" rx="2" fill="#FFFFFF"/>
    <defs>
      <linearGradient id="p1_bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stop-color="#6366F1"/>
        <stop offset="1" stop-color="#4F46E5"/>
      </linearGradient>
    </defs>
  </svg>`,

  // Proxy tool 2 (Colorful Starburst)
  proxy2: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="#0F172A"/>
    <path d="M24 12V36M12 24H36M15.5 15.5L32.5 32.5M15.5 32.5L32.5 15.5" stroke="url(#star_bg)" stroke-width="4" stroke-linecap="round"/>
    <defs>
      <linearGradient id="star_bg" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stop-color="#F59E0B"/>
        <stop offset="0.5" stop-color="#EC4899"/>
        <stop offset="1" stop-color="#06B6D4"/>
      </linearGradient>
    </defs>
  </svg>`,

  // Proxy tool 3 (Shadowrocket / Red Knot)
  proxy3: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="url(#p3_bg)"/>
    <path d="M24 16C21 16 19 18 19 21C19 25 24 28 24 28C24 28 29 25 29 21C29 18 27 16 24 16Z" fill="#FFFFFF"/>
    <path d="M18 25C15 25 13 27 13 29C13 32 17 34 18 34" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M30 25C33 25 35 27 35 29C35 32 31 34 30 34" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    <defs>
      <linearGradient id="p3_bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stop-color="#EF4444"/>
        <stop offset="1" stop-color="#F43F5E"/>
      </linearGradient>
    </defs>
  </svg>`,

  // VS Code
  vscode: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="#007ACC"/>
    <path d="M36 12L28 18.5V29.5L36 36L40 33.5V14.5L36 12Z" fill="#0065A9"/>
    <path d="M36 12L18 26L13 22L10 24L16 29L10 34L13 36L18 32L36 46V12Z" fill="#1F9CF0"/>
    <path d="M36 36L18 22L28 13.5L36 20.5V36Z" fill="#007ACC"/>
  </svg>`,

  // Calculator
  calculator: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="url(#calc_bg)"/>
    <rect x="12" y="10" width="24" height="8" rx="2" fill="#FFFFFF" fill-opacity="0.9"/>
    <circle cx="16" cy="24" r="2.5" fill="#FFFFFF"/>
    <circle cx="24" cy="24" r="2.5" fill="#FFFFFF"/>
    <circle cx="32" cy="24" r="2.5" fill="#FED7AA"/>
    <circle cx="16" cy="32" r="2.5" fill="#FFFFFF"/>
    <circle cx="24" cy="32" r="2.5" fill="#FFFFFF"/>
    <rect x="29.5" y="29.5" width="5" height="5" rx="1.5" fill="#FED7AA"/>
    <defs>
      <linearGradient id="calc_bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stop-color="#F97316"/>
        <stop offset="1" stop-color="#EA580C"/>
      </linearGradient>
    </defs>
  </svg>`,

  // Terminal
  terminal: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="#0F172A"/>
    <path d="M14 18L22 24L14 30" stroke="#4ADE80" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="24" y1="30" x2="34" y2="30" stroke="#F8FAFC" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  // WeChat (微信)
  wechat: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="#07C160"/>
    <ellipse cx="20" cy="22" rx="11" ry="9" fill="#FFFFFF"/>
    <circle cx="16" cy="20" r="1.5" fill="#07C160"/>
    <circle cx="23" cy="20" r="1.5" fill="#07C160"/>
    <path d="M15 28L13 32L18 30" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="30" cy="28" rx="9" ry="7.5" fill="#E8F8F0"/>
    <circle cx="27" cy="27" r="1.2" fill="#07C160"/>
    <circle cx="33" cy="27" r="1.2" fill="#07C160"/>
  </svg>`,

  // QQ
  qq: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="#12B7F5"/>
    <ellipse cx="24" cy="24" rx="12" ry="14" fill="#FFFFFF"/>
    <ellipse cx="24" cy="23" rx="10" ry="12" fill="#1E293B"/>
    <ellipse cx="24" cy="27" rx="8" ry="9" fill="#FFFFFF"/>
    <circle cx="20" cy="18" r="1.8" fill="#FFFFFF"/>
    <circle cx="28" cy="18" r="1.8" fill="#FFFFFF"/>
    <circle cx="20.5" cy="18" r="1" fill="#000000"/>
    <circle cx="27.5" cy="18" r="1" fill="#000000"/>
    <ellipse cx="24" cy="22" rx="3.5" ry="2" fill="#F59E0B"/>
    <path d="M16 25C16 25 18 29 24 29C30 29 32 25 32 25" stroke="#EF4444" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  // Discord
  discord: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="#5865F2"/>
    <path d="M33 16C31 15 28.5 14.5 28.5 14.5L28 15.5C31 16.5 32.5 18 32.5 18C29.5 16.5 26.5 16 24 16C21.5 16 18.5 16.5 15.5 18C15.5 18 17 16.5 20 15.5L19.5 14.5C19.5 14.5 17 15 15 16C11 22 10 28 10 28C12 30 15 30 17 30L18 28.5C15.5 27.8 14.5 26 14.5 26C14.5 26 15 26.5 16.5 27.2C19 28.5 21.5 29 24 29C26.5 29 29 28.5 31.5 27.2C33 26.5 33.5 26 33.5 26C33.5 26 32.5 27.8 30 28.5L31 30C33 30 36 30 38 28C38 28 37 22 33 16ZM19 25C17.9 25 17 24.1 17 23C17 21.9 17.9 21 19 21C20.1 21 21 21.9 21 23C21 24.1 20.1 25 19 25ZM29 25C27.9 25 27 24.1 27 23C27 21.9 27.9 21 29 21C30.1 21 31 21.9 31 23C31 24.1 30.1 25 29 25Z" fill="#FFFFFF"/>
  </svg>`,

  // Docker
  docker: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="#1D63ED"/>
    <path d="M12 28C14 28 20 28 26 25C32 22 34 16 34 16C34 16 37 17 38 20C39 24 37 28 34 30C30 33 22 34 16 32C13 31 12 28 12 28Z" fill="#FFFFFF"/>
    <rect x="15" y="22" width="3" height="3" rx="0.5" fill="#FFFFFF"/>
    <rect x="19" y="22" width="3" height="3" rx="0.5" fill="#FFFFFF"/>
    <rect x="23" y="22" width="3" height="3" rx="0.5" fill="#FFFFFF"/>
    <rect x="19" y="18" width="3" height="3" rx="0.5" fill="#FFFFFF"/>
    <rect x="23" y="18" width="3" height="3" rx="0.5" fill="#FFFFFF"/>
  </svg>`,

  // Music
  music: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="url(#music_bg)"/>
    <path d="M28 14V27C27 26.4 25.5 26 24 26C20.7 26 18 28.2 18 31C18 33.8 20.7 36 24 36C27.3 36 30 33.8 30 31V18H36V14H28Z" fill="#FFFFFF"/>
    <defs>
      <linearGradient id="music_bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stop-color="#EC4899"/>
        <stop offset="1" stop-color="#8B5CF6"/>
      </linearGradient>
    </defs>
  </svg>`,

  // Folder icon
  folder: `<svg viewBox="0 0 48 48" fill="none">
    <path d="M8 14C8 12.3 9.3 11 11 11H20L24 15H37C38.7 15 40 16.3 40 18V36C40 37.7 38.7 39 37 39H11C9.3 39 8 37.7 8 36V14Z" fill="#38BDF8"/>
    <path d="M8 18C8 16.3 9.3 15 11 15H37C38.7 15 40 16.3 40 18V36C40 37.7 38.7 39 37 39H11C9.3 39 8 37.7 8 36V18Z" fill="#0284C7"/>
  </svg>`,

  // Security / CTF / Recon
  security: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="url(#sec_bg)"/>
    <path d="M24 10L36 15V24C36 31.5 30.9 38.3 24 40C17.1 38.3 12 31.5 12 24V15L24 10Z" fill="#FFFFFF" fill-opacity="0.2"/>
    <path d="M24 12.5L34 16.7V24C34 30.2 29.8 35.8 24 37.3C18.2 35.8 14 30.2 14 24V16.7L24 12.5Z" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="24" cy="23" r="3.5" fill="#FFFFFF"/>
    <path d="M24 26.5V31" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    <defs>
      <linearGradient id="sec_bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0EA5E9"/>
        <stop offset="1" stop-color="#2563EB"/>
      </linearGradient>
    </defs>
  </svg>`,

  // Markdown / Prompt / Skill / Note
  markdown: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="url(#md_bg)"/>
    <path d="M11 16V32H16V23L20 28L24 23V32H29V16H24L20 22L16 16H11ZM37 24V16H32V24H28L34.5 32L41 24H37Z" fill="#FFFFFF"/>
    <defs>
      <linearGradient id="md_bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stop-color="#4F46E5"/>
        <stop offset="1" stop-color="#7C3AED"/>
      </linearGradient>
    </defs>
  </svg>`,

  // Python
  python: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#0F172A"/>
    <path d="M23.6 10C17.2 10 17.6 12.8 17.6 12.8L17.7 15.7H23.8V16.6H15.1C8.8 16.6 8.3 22.2 8.3 22.2C8.3 22.2 7.7 28.5 14.1 28.5H16.2V25.6C16.2 22.2 19 22.4 19 22.4H25.1C28.2 22.4 28.2 19.3 28.2 19.3V14.6C28.2 11.2 23.6 10 23.6 10ZM20.8 12.4C21.6 12.4 22.2 13 22.2 13.8C22.2 14.6 21.6 15.2 20.8 15.2C20 15.2 19.4 14.6 19.4 13.8C19.4 13 20 12.4 20.8 12.4Z" fill="#38BDF8"/>
    <path d="M24.4 38C30.8 38 30.4 35.2 30.4 35.2L30.3 32.3H24.2V31.4H32.9C39.2 31.4 39.7 25.8 39.7 25.8C39.7 25.8 40.3 19.5 33.9 19.5H31.8V22.4C31.8 25.8 29 25.6 29 25.6H22.9C19.8 25.6 19.8 28.7 19.8 28.7V33.4C19.8 36.8 24.4 38 24.4 38ZM27.2 35.6C26.4 35.6 25.8 35 25.8 34.2C25.8 33.4 26.4 32.8 27.2 32.8C28 32.8 28.6 33.4 28.6 34.2C28.6 35 28 35.6 27.2 35.6Z" fill="#FACC15"/>
  </svg>`,

  // Word (.doc / .docx)
  word: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#185ABD"/>
    <path d="M12 14C12 12.9 12.9 12 14 12H34C35.1 12 36 12.9 36 14V34C36 35.1 35.1 36 34 36H14C12.9 36 12 35.1 12 34V14Z" fill="#2B7CD3" fill-opacity="0.5"/>
    <path d="M16 17H21.5L24 27L26.5 17H32L28 32H24.5L22 23L19.5 32H16L12 17H16Z" fill="#FFFFFF"/>
  </svg>`,

  // Excel (.xls / .xlsx / .csv)
  excel: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#107C41"/>
    <path d="M14 14H34V34H14V14Z" fill="#185C37" fill-opacity="0.4"/>
    <path d="M17 17L22 24.5L17 32H21.5L24 28L26.5 32H31L26 24.5L31 17H26.5L24 21L21.5 17H17Z" fill="#FFFFFF"/>
  </svg>`,

  // PPT (.ppt / .pptx)
  ppt: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#D24726"/>
    <path d="M18 16H27C29.8 16 32 18.2 32 21C32 23.8 29.8 26 27 26H22V32H18V16ZM22 22.5H26.5C27.3 22.5 28 21.8 28 21C28 20.2 27.3 19.5 26.5 19.5H22V22.5Z" fill="#FFFFFF"/>
  </svg>`,

  // Archive (.zip / .rar / .7z / .tar)
  archive: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#7C3AED"/>
    <rect x="12" y="10" width="24" height="28" rx="4" fill="#8B5CF6"/>
    <line x1="24" y1="12" x2="24" y2="28" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="3 3"/>
    <rect x="20" y="28" width="8" height="7" rx="2" fill="#FACC15"/>
    <circle cx="24" cy="31.5" r="1.5" fill="#7C3AED"/>
  </svg>`,

  // Video (.mp4 / .mkv / .avi / .mov)
  video: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#E11D48"/>
    <circle cx="24" cy="24" r="14" fill="#FFFFFF" fill-opacity="0.25"/>
    <polygon points="21,17 31,24 21,31" fill="#FFFFFF"/>
  </svg>`,

  // Web Link (.url / website)
  link: `<svg viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#0284C7"/>
    <path d="M22 26C20 28 17 28 15 26C13 24 13 21 15 19L19 15C21 13 24 13 26 15" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
    <path d="M26 22C28 20 31 20 33 22C35 24 35 27 33 29L29 33C27 35 24 35 22 33" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
    <line x1="20" y1="28" x2="28" y2="20" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  </svg>`
};

function getIconHTML(iconIdOrUrl, title = '') {
  const t = (title || '').toLowerCase();

  // 1. If it's a real native image (Base64 data URI, HTTP URL, or local file), ALWAYS render the real icon!
  if (iconIdOrUrl && (iconIdOrUrl.startsWith('data:image/') || iconIdOrUrl.startsWith('http://') || iconIdOrUrl.startsWith('https://') || iconIdOrUrl.startsWith('file://'))) {
    return `<img src="${iconIdOrUrl}" alt="${title}" class="native-img-icon" draggable="false" />`;
  }

  // 2. If iconId matches BUILTIN_ICONS directly (and is not generic 'folder')
  if (iconIdOrUrl && BUILTIN_ICONS[iconIdOrUrl] && iconIdOrUrl !== 'folder') {
    return BUILTIN_ICONS[iconIdOrUrl];
  }

  // 3. Smart fallback detect by app title ONLY when native icon is missing
  if (t.includes('ctf') || t.includes('recon') || t.includes('security')) return BUILTIN_ICONS.security;
  if (t.includes('prompt') || t.includes('skill') || t.endsWith('.md')) return BUILTIN_ICONS.markdown;
  if (t.includes('python') || t.endsWith('.py')) return BUILTIN_ICONS.python;
  if (t.endsWith('.xlsx') || t.endsWith('.xls') || t.endsWith('.csv') || t.includes('excel') || t.includes('表格') || t.includes('清单')) return BUILTIN_ICONS.excel;
  if (t.endsWith('.docx') || t.endsWith('.doc') || t.includes('word') || t.includes('文档')) return BUILTIN_ICONS.word;
  if (t.endsWith('.pptx') || t.endsWith('.ppt') || t.includes('powerpoint') || t.includes('幻灯片')) return BUILTIN_ICONS.ppt;
  if (t.endsWith('.zip') || t.endsWith('.rar') || t.endsWith('.7z') || t.endsWith('.tar') || t.endsWith('.gz')) return BUILTIN_ICONS.archive;
  if (t.endsWith('.mp4') || t.endsWith('.mkv') || t.endsWith('.avi') || t.endsWith('.mov') || t.includes('video') || t.includes('视频')) return BUILTIN_ICONS.video;
  if (t.endsWith('.url') || t.startsWith('http') || t.includes('web') || t.includes('网页')) return BUILTIN_ICONS.link;
  if (t.includes('edge')) return BUILTIN_ICONS.edge;
  if (t.includes('chrome') || t.includes('browser') || t.includes('360')) return BUILTIN_ICONS.chrome;
  if (t.includes('画图') || t.includes('paint')) return BUILTIN_ICONS.paint;
  if (t.includes('截图') || t.includes('snip')) return BUILTIN_ICONS.snipping;
  if (t.includes('照片') || t.includes('photo')) return BUILTIN_ICONS.photos;
  if (t.includes('设置') || t.includes('setting')) return BUILTIN_ICONS.settings;
  if (t.includes('记事本') || t.includes('notepad')) return BUILTIN_ICONS.notepad;
  if (t.includes('obsidian')) return BUILTIN_ICONS.obsidian;
  if (t.includes('onenote')) return BUILTIN_ICONS.onenote;
  if (t.includes('阅读') || t.includes('book') || t.endsWith('.pdf')) return BUILTIN_ICONS.books;
  if (t.includes('chatgpt') || t.includes('gpt')) return BUILTIN_ICONS.chatgpt;
  if (t.includes('copilot')) return BUILTIN_ICONS.copilot;
  if (t.includes('deepseek') || t.includes('cherry')) return BUILTIN_ICONS.deepseek;
  if (t.includes('github') || t.includes('git')) return BUILTIN_ICONS.github;
  if (t.includes('clash') || t.includes('proxy') || t.includes('switch') || t.includes('verge')) return BUILTIN_ICONS.proxy1;
  if (t.includes('calc') || t.includes('计算器')) return BUILTIN_ICONS.calculator;
  if (t.includes('code') || t.includes('cursor') || t.includes('idea') || t.includes('pycharm') || t.includes('hbuilder')) return BUILTIN_ICONS.vscode;
  if (t.includes('terminal') || t.includes('cmd') || t.includes('shell') || t.includes('powershell') || t.includes('xshell')) return BUILTIN_ICONS.terminal;
  if (t.includes('微信') || t.includes('wechat')) return BUILTIN_ICONS.wechat;
  if (t.includes('qq')) return BUILTIN_ICONS.qq;
  if (t.includes('discord')) return BUILTIN_ICONS.discord;
  if (t.includes('docker')) return BUILTIN_ICONS.docker;
  if (t.includes('music') || t.includes('音乐')) return BUILTIN_ICONS.music;

  // Vibrant iOS-style color palette for letter avatar
  const colors = [
    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    'linear-gradient(135deg, #ec4899, #be185d)',
    'linear-gradient(135deg, #06b6d4, #0e7490)',
    'linear-gradient(135deg, #f43f5e, #e11d48)'
  ];
  let hash = 0;
  for (let i = 0; i < (title || '').length; i++) {
    hash = ((hash << 5) - hash) + title.charCodeAt(i);
  }
  const bg = colors[Math.abs(hash) % colors.length];
  const char = (title || 'A').charAt(0).toUpperCase();

  return `<div class="letter-avatar" style="background: ${bg}; border-radius: 12px; font-size: 18px; font-weight: 800; color: #ffffff; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">${char}</div>`;
}
