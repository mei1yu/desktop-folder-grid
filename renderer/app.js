// Modern Desktop Folder Grid - Zipper & Square Canvas Application Logic
(function () {
  'use strict';

  // Application State
  let state = {
    items: [],
    settings: {
      isCanvasExpanded: true,
      folderSize: 'medium', // 'small' (92px), 'medium' (122px), 'large' (160px)
      canvasTitle: '我的空间画布',
      alwaysOnTop: false,
      cardScale: 1.0,
      opacity: 0.9,
      blurStrength: 28,
      isLocked: false,
      theme: 'white', // Default to elegant translucent gray-white frosted glass
      widgetStyle: 'glass', // 'glass', 'island', 'edge', 'zipper'
      autoHide: true, // Stealth mode
      minimizeBehavior: 'stealth', // 'stealth' or 'tray'
      wallpaperPalette: null
    },
    activeFolderId: null,
    selectedPresetIcon: 'edge'
  };

  // DOM Elements
  const appRoot = document.getElementById('app');
  const zipperHandle = document.getElementById('zipperHandle');
  const zipperDragGrip = document.getElementById('zipperDragGrip');
  const zipperTriggerBtn = document.getElementById('zipperTriggerBtn');
  const zipperCount = document.getElementById('zipperCount');
  const capsuleBadgeGlass = document.getElementById('capsuleBadgeGlass');
  const capsuleBadgeIsland = document.getElementById('capsuleBadgeIsland');
  const capsuleBadgeEdge = document.getElementById('capsuleBadgeEdge');

  const curtainCanvas = document.getElementById('curtainCanvas');
  const btnRetractZipper = document.getElementById('btnRetractZipper');
  const canvasTitle = document.getElementById('canvasTitle');
  const btnEditCanvasTitle = document.getElementById('btnEditCanvasTitle');
  const dragZone = document.getElementById('dragZone');
  const gridContainer = document.getElementById('gridContainer');
  const btnAddNewFolder = document.getElementById('btnAddNewFolder');

  // Header Buttons
  const btnLock = document.getElementById('btnLock');
  const btnTop = document.getElementById('btnTop');
  const btnSettings = document.getElementById('btnSettings');
  const btnMinimize = document.getElementById('btnMinimize');

  // Theme & Form Styles Elements
  const btnTheme = document.getElementById('btnTheme');
  const themePopover = document.getElementById('themePopover');
  const stylePillsRow = document.getElementById('stylePillsRow');
  const themePillsRow = document.getElementById('themePillsRow');
  const btnRefreshWallpaper = document.getElementById('btnRefreshWallpaper');
  const themeStatusText = document.getElementById('themeStatusText');
  const settingsThemesGrid = document.getElementById('settingsThemesGrid');
  const widgetStylesGrid = document.getElementById('widgetStylesGrid');
  const settingAutoHide = document.getElementById('settingAutoHide');
  const settingAutoStart = document.getElementById('settingAutoStart');
  const selectMinimizeBehavior = document.getElementById('selectMinimizeBehavior');

  // Size Buttons
  const sizeBtns = document.querySelectorAll('.size-btn');

  // Toast
  const toastNotification = document.getElementById('toastNotification');
  let toastTimer = null;

  function showToast(message, duration = 2500) {
    if (!toastNotification) return;
    toastNotification.textContent = message;
    toastNotification.classList.add('active');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('active');
    }, duration);
  }

  // Modals
  const folderModal = document.getElementById('folderModal');
  const folderSpaceCard = document.getElementById('folderSpaceCard');
  const folderSpaceTitle = document.getElementById('folderSpaceTitle');
  const folderSpaceContent = document.getElementById('folderSpaceContent');
  const folderColorPicker = document.getElementById('folderColorPicker');
  const btnEditFolderTitle = document.getElementById('btnEditFolderTitle');
  const btnCloseFolderSpace = document.getElementById('btnCloseFolderSpace');
  const btnAddAppToFolder = document.getElementById('btnAddAppToFolder');
  const btnDisbandFolder = document.getElementById('btnDisbandFolder');

  const addModal = document.getElementById('addModal');
  const btnCloseAddModal = document.getElementById('btnCloseAddModal');
  const btnCancelAdd = document.getElementById('btnCancelAdd');
  const btnConfirmAdd = document.getElementById('btnConfirmAdd');
  const btnPickLocalFile = document.getElementById('btnPickLocalFile');
  const inputAppName = document.getElementById('inputAppName');
  const inputAppAction = document.getElementById('inputAppAction');
  const presetIconsGrid = document.getElementById('presetIconsGrid');

  const settingsModal = document.getElementById('settingsModal');
  const btnCloseSettingsModal = document.getElementById('btnCloseSettingsModal');
  const btnSaveSettings = document.getElementById('btnSaveSettings');
  const btnResetData = document.getElementById('btnResetData');
  const settingAlwaysOnTop = document.getElementById('settingAlwaysOnTop');
  const settingOpacity = document.getElementById('settingOpacity');
  const opacityValue = document.getElementById('opacityValue');
  const settingBlur = document.getElementById('settingBlur');
  const blurValue = document.getElementById('blurValue');
  const settingScale = document.getElementById('settingScale');
  const scaleValue = document.getElementById('scaleValue');

  // Rename Modal
  const renameModal = document.getElementById('renameModal');
  const renameModalTitle = document.getElementById('renameModalTitle');
  const renameModalLabel = document.getElementById('renameModalLabel');
  const inputRenameName = document.getElementById('inputRenameName');
  const btnCloseRenameModal = document.getElementById('btnCloseRenameModal');
  const btnCancelRename = document.getElementById('btnCancelRename');
  const btnConfirmRename = document.getElementById('btnConfirmRename');

  // Context Menu
  const contextMenu = document.getElementById('contextMenu');

  // Drag Ghost
  const dragGhost = document.getElementById('dragGhost');
  const dropIndicator = document.getElementById('dropIndicator');

  // Drag Tracking for Card Reordering / Merge
  let dragInfo = {
    isDragging: false,
    sourceIndex: -1,
    sourceItem: null,
    sourceElement: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    targetCard: null,
    targetAction: null,
    reorderIndex: -1
  };

  let addModalTargetFolderId = null;

  // ==========================================
  // INITIALIZATION
  // ==========================================
  async function init() {
    setupEventListeners();
    populatePresetIcons();

    try {
      if (window.electronAPI) {
        const savedSettings = await window.electronAPI.getSettings();
        if (savedSettings) {
          state.settings = { ...state.settings, ...savedSettings };
        }
        if (!state.settings.theme || state.settings.theme === 'auto') {
          state.settings.theme = 'white';
        }
        if (!state.settings.widgetStyle) state.settings.widgetStyle = 'glass';
        if (state.settings.autoHide === undefined) state.settings.autoHide = true;
        if (!state.settings.minimizeBehavior) state.settings.minimizeBehavior = 'stealth';

        const savedData = await window.electronAPI.getData();
        if (savedData && Array.isArray(savedData) && savedData.length > 0) {
          state.items = savedData;
          if (typeof window.electronAPI.refreshItemIcons === 'function') {
            try {
              state.items = await window.electronAPI.refreshItemIcons(state.items);
            } catch (e) {}
          }
        } else {
          // Clean initial starter folder
          state.items = JSON.parse(JSON.stringify(DEFAULT_ITEMS));
          await window.electronAPI.saveData(state.items);
        }
      } else {
        state.items = JSON.parse(JSON.stringify(DEFAULT_ITEMS));
      }
    } catch (e) {
      console.error('Init error:', e);
      state.items = JSON.parse(JSON.stringify(DEFAULT_ITEMS));
    }

    applySettings();
    if (state.settings.theme === 'wallpaper') {
      detectAndApplyWallpaperTheme(false);
    }
    updateCanvasModeUI(state.settings.isCanvasExpanded !== false);
    renderGrid();
    setupStealthListeners();
  }

  // Persistence helpers
  async function persistData() {
    if (window.electronAPI) {
      await window.electronAPI.saveData(state.items);
    }
    updateZipperBadge();
  }

  async function persistSettings() {
    if (window.electronAPI) {
      await window.electronAPI.saveSettings(state.settings);
    }
  }

  // ==========================================
  // STEALTH MODE & AUTO-HIDE HANDLERS
  // ==========================================
  let autoHideTimer = null;

  function enterStealthMode() {
    if (!state.settings.isCanvasExpanded && state.settings.autoHide) {
      appRoot.classList.add('stealth-active');
    }
  }

  function exitStealthMode() {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      autoHideTimer = null;
    }
    appRoot.classList.remove('stealth-active');
  }

  function setupStealthListeners() {
    // 1. Native Windows screen proximity tracker from Electron main process!
    if (window.electronAPI && typeof window.electronAPI.onStealthState === 'function') {
      window.electronAPI.onStealthState((isStealth) => {
        if (isStealth) {
          enterStealthMode();
        } else {
          exitStealthMode();
        }
      });
    }

    // 2. DOM event fallbacks
    window.addEventListener('mouseenter', () => exitStealthMode());
    window.addEventListener('mousemove', () => exitStealthMode());
  }

  // ==========================================
  // WIDGET STYLE SWITCHER
  // ==========================================
  const STYLE_NAMES = {
    glass: '极简灰白透光胶囊',
    island: '灵动岛微胶囊',
    edge: '边缘极隐拉条',
    zipper: '经典复古拉条滑块'
  };

  function getWidgetDimensions(style) {
    switch (style) {
      case 'island': return { width: 165, height: 44 };
      case 'edge': return { width: 150, height: 34 };
      case 'zipper': return { width: 220, height: 56 };
      case 'glass':
      default: return { width: 180, height: 48 };
    }
  }

  async function setWidgetStyle(styleId, shouldPersist = true) {
    if (!styleId) styleId = 'glass';
    state.settings.widgetStyle = styleId;

    if (zipperHandle) {
      zipperHandle.classList.remove('style-glass', 'style-island', 'style-edge', 'style-zipper');
      zipperHandle.classList.add(`style-${styleId}`);
    }

    if (stylePillsRow) {
      stylePillsRow.querySelectorAll('.style-pill').forEach(pill => {
        if (pill.dataset.style === styleId) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });
    }

    if (widgetStylesGrid) {
      widgetStylesGrid.querySelectorAll('.style-choice-card').forEach(card => {
        if (card.dataset.style === styleId) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    }

    const dim = getWidgetDimensions(styleId);

    if (shouldPersist) {
      await persistSettings();
      if (window.electronAPI && typeof window.electronAPI.setWidgetStyle === 'function') {
        await window.electronAPI.setWidgetStyle(styleId);
      }
      if (!state.settings.isCanvasExpanded && window.electronAPI && typeof window.electronAPI.collapseCanvas === 'function') {
        await window.electronAPI.collapseCanvas(dim);
      }
      if (state.settings.isCanvasExpanded) {
        showToast(`✨ 桌面形态已切换为：${STYLE_NAMES[styleId] || styleId}`);
      }
    }
  }

  // ==========================================
  // ZIPPER & CANVAS EXPANSION TRANSITION
  // ==========================================
  async function expandCanvas() {
    exitStealthMode();
    if (window.electronAPI && typeof window.electronAPI.expandCanvas === 'function') {
      await window.electronAPI.expandCanvas({ width: 640, height: 640 });
    }
    curtainCanvas.classList.remove('closing');
    appRoot.classList.remove('collapsed');
    appRoot.classList.add('expanded');
    state.settings.isCanvasExpanded = true;
    persistSettings();
    renderGrid();
    showToast('✨ 画布已拉开，可直接拖入应用');
  }

  async function collapseCanvas(shouldStealthImmediately = false) {
    // 1. Immediately close all open modals so they don't intercept handle clicks
    if (settingsModal) settingsModal.classList.remove('active');
    if (folderModal) folderModal.classList.remove('active');
    if (addModal) addModal.classList.remove('active');
    if (themePopover) themePopover.classList.remove('active');

    curtainCanvas.classList.add('closing');
    const targetDim = getWidgetDimensions(state.settings.widgetStyle || 'glass');

    setTimeout(async () => {
      if (window.electronAPI && typeof window.electronAPI.collapseCanvas === 'function') {
        await window.electronAPI.collapseCanvas(targetDim);
      }
      appRoot.classList.remove('expanded');
      appRoot.classList.add('collapsed');
      curtainCanvas.classList.remove('closing');
      state.settings.isCanvasExpanded = false;
      persistSettings();
      updateZipperBadge();

      if (shouldStealthImmediately) {
        enterStealthMode();
      }
    }, 200);
  }

  function updateCanvasModeUI(isExpanded) {
    if (isExpanded) {
      exitStealthMode();
      appRoot.classList.remove('collapsed');
      appRoot.classList.add('expanded');
    } else {
      appRoot.classList.remove('expanded');
      appRoot.classList.add('collapsed');
      if (state.settings.autoHide) {
        if (autoHideTimer) clearTimeout(autoHideTimer);
        autoHideTimer = setTimeout(enterStealthMode, 800);
      }
    }
    updateZipperBadge();
  }

  function updateZipperBadge() {
    const foldersCount = state.items.filter(it => it.type === 'folder').length;
    const appsCount = state.items.filter(it => it.type === 'app').length;
    const simpleCount = `${foldersCount}`;

    if (zipperCount) zipperCount.textContent = `${foldersCount}空间`;
    if (capsuleBadgeGlass) capsuleBadgeGlass.textContent = simpleCount;
    if (capsuleBadgeIsland) capsuleBadgeIsland.textContent = simpleCount;
    if (capsuleBadgeEdge) capsuleBadgeEdge.textContent = simpleCount;
  }

  // ==========================================
  // FOLDER SIZE SWITCHER & AUTO-REFLOW
  // ==========================================
  function setFolderSize(size) {
    state.settings.folderSize = size;
    applyFolderSize();
    persistSettings();

    const labelMap = { small: '紧凑小格子 (自适应容纳更多空间)', medium: '标准中格子', large: '大格子 (大图标展示)' };
    showToast(`📐 已切换为：${labelMap[size] || size}，自动重新排版`);
  }

  function applyFolderSize() {
    const size = state.settings.folderSize || 'medium';
    const root = document.documentElement;

    sizeBtns.forEach(btn => {
      if (btn.dataset.size === size) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (size === 'small') {
      root.style.setProperty('--folder-width', '92px');
    } else if (size === 'large') {
      root.style.setProperty('--folder-width', '160px');
    } else {
      root.style.setProperty('--folder-width', '122px');
    }
  }

  // ==========================================
  // THEME & COLOR BEAUTIFICATION
  // ==========================================
  const THEME_NAMES = {
    wallpaper: '壁纸自适应',
    pink: '樱花粉',
    blue: '冰川蓝',
    green: '薄荷绿',
    purple: '极光紫',
    orange: '暖阳橙',
    dark: '曜石黑',
    white: '珍珠白'
  };

  const FOLDER_COLOR_NAMES = {
    blue: '经典蓝',
    pink: '樱花粉',
    green: '薄荷绿',
    purple: '极光紫',
    orange: '暖阳橙',
    red: '玫瑰红',
    gray: '雅致灰'
  };

  async function applyTheme(themeId = 'wallpaper', customPalette = null) {
    if (!themeId || themeId === 'auto') themeId = 'wallpaper';
    state.settings.theme = themeId;
    const root = document.documentElement;
    root.setAttribute('data-theme', themeId);

    // Update active state in quick theme popover
    if (themePillsRow) {
      themePillsRow.querySelectorAll('.theme-pill').forEach(pill => {
        if (pill.dataset.theme === themeId) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });
    }

    // Update active state in settings modal
    if (settingsThemesGrid) {
      settingsThemesGrid.querySelectorAll('.settings-theme-card').forEach(card => {
        if (card.dataset.theme === themeId) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    }

    if (themeId === 'wallpaper') {
      const palette = customPalette || state.settings.wallpaperPalette;
      if (palette && palette.dominantHex) {
        applyWallpaperPaletteCSS(palette);
      } else {
        await detectAndApplyWallpaperTheme(false);
      }
    } else {
      clearWallpaperPaletteCSS();
      if (themeStatusText) {
        themeStatusText.textContent = `当前主题：${THEME_NAMES[themeId] || themeId}`;
      }
    }
  }

  function applyWallpaperPaletteCSS(palette) {
    const root = document.documentElement;
    if (!palette) return;

    // Apply color CSS variables matching the wallpaper dominant pastel/vibrant tone
    root.style.setProperty('--bg-card', palette.cardTint || 'rgba(253, 231, 231, 0.88)');
    root.style.setProperty('--border-card', palette.borderHighlight || 'rgba(250, 150, 130, 0.40)');
    root.style.setProperty('--accent-color', palette.accentHex || '#FA9682');
    root.style.setProperty('--accent-hover', palette.dominantHex || '#FA9682');
    root.style.setProperty('--bg-inner', palette.cardTint || 'rgba(254, 239, 239, 0.78)');
    root.style.setProperty('--bg-inner-border', palette.borderHighlight || 'rgba(250, 150, 130, 0.40)');
    root.style.setProperty('--zipper-bg', palette.zipperBg || 'rgba(253, 231, 231, 0.95)');

    if (themeStatusText) {
      themeStatusText.textContent = `智能识别壁纸色：${palette.dominantHex} (温润磨砂粉)`;
    }

    const wpPreview = document.querySelector('.preview-wallpaper');
    if (wpPreview && palette.accentHex) {
      wpPreview.style.background = `linear-gradient(135deg, ${palette.accentHex}, ${palette.dominantHex})`;
    }
  }

  function clearWallpaperPaletteCSS() {
    const root = document.documentElement;
    root.style.removeProperty('--bg-card');
    root.style.removeProperty('--border-card');
    root.style.removeProperty('--accent-color');
    root.style.removeProperty('--accent-hover');
    root.style.removeProperty('--bg-inner');
    root.style.removeProperty('--bg-inner-border');
    root.style.removeProperty('--zipper-bg');
  }

  async function detectAndApplyWallpaperTheme(forceRefresh = false) {
    if (!window.electronAPI || typeof window.electronAPI.getWallpaperPalette !== 'function') {
      return;
    }

    try {
      if (themeStatusText) {
        themeStatusText.textContent = '正在识别桌面壁纸色彩...';
      }

      const res = await window.electronAPI.getWallpaperPalette();
      if (res && res.success && res.dominantHex) {
        state.settings.wallpaperPalette = res;
        if (state.settings.theme === 'wallpaper') {
          applyWallpaperPaletteCSS(res);
        }
        await persistSettings();

        if (forceRefresh) {
          showToast(`🎨 桌面壁纸识别成功：${res.dominantHex}，已适配温润粉调磨砂`);
        }
      } else {
        if (forceRefresh) {
          showToast('⚠️ 未能读取到壁纸色彩，使用温润粉调预设');
        }
      }
    } catch (err) {
      console.error('Wallpaper extraction error:', err);
      if (forceRefresh) {
        showToast('⚠️ 识别壁纸色彩失败');
      }
    }
  }

  function setFolderModalColor(color) {
    if (!folderModal) return;
    const colorClasses = ['blue', 'pink', 'green', 'purple', 'orange', 'red', 'gray'].map(c => `folder-modal-${c}`);
    folderModal.classList.remove(...colorClasses);
    folderModal.classList.add(`folder-modal-${color}`);
    folderModal.classList.add('folder-modal-overlay');

    if (folderColorPicker) {
      folderColorPicker.querySelectorAll('.folder-color-dot').forEach(dot => {
        if (dot.dataset.color === color) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
  }

  // ==========================================
  // SETTINGS APPLICATION
  // ==========================================
  function applySettings() {
    const root = document.documentElement;
    const { cardScale, opacity, blurStrength, alwaysOnTop, isLocked, canvasTitle: title, theme } = state.settings;

    root.style.setProperty('--blur-strength', (blurStrength || 24) + 'px');

    if (canvasTitle) {
      canvasTitle.textContent = title || '桌面空间画布';
    }

    applyFolderSize();
    applyTheme(theme || 'wallpaper', state.settings.wallpaperPalette);

    // Lock drag
    if (isLocked) {
      if (dragZone) {
        dragZone.style.webkitAppRegion = 'no-drag';
        dragZone.style.cursor = 'default';
      }
      if (zipperDragGrip) {
        zipperDragGrip.style.webkitAppRegion = 'no-drag';
        zipperDragGrip.style.cursor = 'default';
        zipperDragGrip.title = '位置已锁定（点击顶部锁图标解锁）';
      }
      btnLock.classList.add('active');
      btnLock.title = '解锁窗口位置';
    } else {
      if (dragZone) {
        dragZone.style.webkitAppRegion = 'drag';
        dragZone.style.cursor = 'grab';
      }
      if (zipperDragGrip) {
        zipperDragGrip.style.webkitAppRegion = 'drag';
        zipperDragGrip.style.cursor = 'grab';
        zipperDragGrip.title = '按住拖动位置';
      }
      btnLock.classList.remove('active');
      btnLock.title = '锁定窗口位置';
    }

    // Top state
    if (alwaysOnTop) {
      btnTop.classList.add('active');
      btnTop.title = '当前：置顶悬浮模式 (点击切换为桌面模式，不遮挡其他窗口)';
    } else {
      btnTop.classList.remove('active');
      btnTop.title = '当前：桌面模式 (只在桌面显示，点击可切换为置顶悬浮)';
    }

    // Modal sync
    settingAlwaysOnTop.checked = !!alwaysOnTop;
    settingOpacity.value = Math.round((opacity || 0.9) * 100);
    opacityValue.textContent = settingOpacity.value + '%';
    settingBlur.value = blurStrength || 28;
    blurValue.textContent = (blurStrength || 28) + 'px';
    settingScale.value = Math.round((cardScale || 1.0) * 100);
    scaleValue.textContent = settingScale.value + '%';

    if (settingAutoHide) {
      settingAutoHide.checked = state.settings.autoHide !== false;
    }
    if (settingAutoStart) {
      settingAutoStart.checked = state.settings.autoStart !== false;
    }
    if (selectMinimizeBehavior) {
      selectMinimizeBehavior.value = state.settings.minimizeBehavior || 'stealth';
    }
    setWidgetStyle(state.settings.widgetStyle || 'glass', false);
  }

  // ==========================================
  // RENDER GRID (AUTO-LAYOUT REFLOW)
  // ==========================================
  function renderGrid() {
    gridContainer.innerHTML = '';

    state.items.forEach((item, index) => {
      const card = document.createElement('div');
      const folderColor = item.color || 'blue';
      card.className = `grid-card ${item.type === 'folder' ? `folder-card folder-color-${folderColor}` : 'app-card'}`;
      card.dataset.index = index;
      card.dataset.id = item.id;
      card.dataset.type = item.type;

      if (item.type === 'folder') {
        // Inner squircle with 2x2 or 3x3 mini preview icons
        const subItems = item.items || [];
        const gridClass = subItems.length > 4 ? 'grid-3x3' : 'grid-2x2';

        const thumbnail = document.createElement('div');
        thumbnail.className = `folder-thumbnail ${gridClass}`;

        const previewCount = subItems.length > 4 ? 9 : 4;
        const previewItems = subItems.slice(0, previewCount);

        previewItems.forEach(subItem => {
          const mini = document.createElement('div');
          mini.className = 'mini-icon';
          mini.innerHTML = getIconHTML(subItem.icon, subItem.name);
          thumbnail.appendChild(mini);
        });

        // Empty placeholder
        if (subItems.length === 0) {
          const empty = document.createElement('div');
          empty.className = 'empty-folder-box';
          empty.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="22" height="22">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span class="empty-tip">拖入应用</span>
          `;
          thumbnail.appendChild(empty);
        }

        const title = document.createElement('div');
        title.className = 'card-title';
        title.textContent = item.name || '文件夹';
        title.title = '双击重命名';

        // Prevent opening folder space when clicking title
        title.addEventListener('click', (e) => {
          e.stopPropagation();
        });

        // Inline rename on double click
        title.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          startInlineCardRename(item, title);
        });

        card.appendChild(thumbnail);
        card.appendChild(title);

        // Click opens folder space
        card.addEventListener('click', (e) => {
          if (dragInfo.isDragging) return;
          openFolderSpace(item.id);
        });

      } else {
        // Single App Card
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'app-icon-wrapper';
        iconWrapper.innerHTML = getIconHTML(item.icon, item.name);

        const title = document.createElement('div');
        title.className = 'card-title';
        title.textContent = item.name || '应用';
        title.title = '双击重命名';

        title.addEventListener('click', (e) => {
          e.stopPropagation();
        });

        title.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          startInlineCardRename(item, title);
        });

        card.appendChild(iconWrapper);
        card.appendChild(title);

        card.addEventListener('click', (e) => {
          if (dragInfo.isDragging) return;
          launchItem(item);
        });
      }

      // Pointer drag for reordering / merge inside grid
      card.addEventListener('pointerdown', (e) => onCardPointerDown(e, index, item, card));

      // Right-click context menu
      card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showCardContextMenu(e, item, index);
      });

      gridContainer.appendChild(card);
    });

    // "+ 新建空间" Card at the end of the canvas grid
    const addCard = document.createElement('div');
    addCard.className = 'grid-card add-folder-card';
    addCard.dataset.isAddCard = 'true';
    addCard.title = '点击新建文件夹空间，或直接把桌面应用拖到此处';

    const addThumbnail = document.createElement('div');
    addThumbnail.className = 'add-folder-thumbnail';
    addThumbnail.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="28" height="28">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    `;

    const addTitle = document.createElement('div');
    addTitle.className = 'card-title';
    addTitle.textContent = '+ 新建空间';

    addCard.appendChild(addThumbnail);
    addCard.appendChild(addTitle);

    addCard.addEventListener('click', () => {
      openRenameModal('new-folder');
    });

    gridContainer.appendChild(addCard);
    updateZipperBadge();
  }

  // ==========================================
  // RENAME MODAL & INLINE RENAMING
  // ==========================================
  let currentRenameContext = null;

  function openRenameModal(type, targetItem = null) {
    currentRenameContext = { type, targetItem };
    if (!renameModal || !inputRenameName) return;

    if (type === 'folder') {
      renameModalTitle.textContent = '重命名文件夹空间';
      renameModalLabel.textContent = '请输入文件夹空间的新名称：';
      inputRenameName.value = targetItem ? (targetItem.name || '') : '';
    } else if (type === 'app') {
      renameModalTitle.textContent = '重命名应用';
      renameModalLabel.textContent = '请输入应用的新名称：';
      inputRenameName.value = targetItem ? (targetItem.name || '') : '';
    } else if (type === 'new-folder') {
      const folderCount = state.items.filter(i => i.type === 'folder').length;
      renameModalTitle.textContent = '新建文件夹空间';
      renameModalLabel.textContent = '请输入新空间的名称：';
      inputRenameName.value = `空间 ${folderCount + 1}`;
    } else if (type === 'canvas-title') {
      renameModalTitle.textContent = '修改画布标题';
      renameModalLabel.textContent = '请输入桌面空间画布的标题：';
      inputRenameName.value = state.settings.canvasTitle || '桌面空间画布';
    }

    renameModal.classList.add('active');
    setTimeout(() => {
      inputRenameName.focus();
      inputRenameName.select();
    }, 60);
  }

  function closeRenameModal() {
    if (renameModal) renameModal.classList.remove('active');
    currentRenameContext = null;
  }

  async function confirmRename() {
    if (!currentRenameContext) return;
    const { type, targetItem } = currentRenameContext;
    const newName = inputRenameName.value.trim();
    if (!newName) {
      showToast('⚠️ 名称不能为空');
      inputRenameName.focus();
      return;
    }

    if (type === 'folder') {
      targetItem.name = newName;
      await persistData();
      renderGrid();
      if (state.activeFolderId === targetItem.id && folderSpaceTitle) {
        folderSpaceTitle.textContent = newName;
      }
      showToast(`✏️ 空间已重命名为「${newName}」`);
    } else if (type === 'app') {
      targetItem.name = newName;
      await persistData();
      renderGrid();
      if (state.activeFolderId) {
        const folder = state.items.find(it => it.id === state.activeFolderId);
        if (folder) renderFolderSpaceContent(folder);
      }
      showToast(`✏️ 应用已重命名为「${newName}」`);
    } else if (type === 'new-folder') {
      const colors = ['pink', 'blue', 'green', 'purple', 'orange', 'red', 'gray'];
      const chosenColor = colors[state.items.filter(i => i.type === 'folder').length % colors.length];
      const newFolder = {
        id: 'folder-' + Date.now(),
        type: 'folder',
        name: newName,
        color: chosenColor,
        items: []
      };
      state.items.push(newFolder);
      await persistData();
      renderGrid();
      showToast(`📁 已创建空间「${newFolder.name}」`);
    } else if (type === 'canvas-title') {
      state.settings.canvasTitle = newName;
      if (canvasTitle) canvasTitle.textContent = newName;
      await persistSettings();
      showToast(`✏️ 画布标题已修改为「${newName}」`);
    }

    closeRenameModal();
  }

  function startInlineCardRename(item, titleElement) {
    if (!titleElement || titleElement.querySelector('.card-title-input')) return;
    const oldName = item.name || '';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'card-title-input';
    input.value = oldName;
    input.maxLength = 30;

    let committed = false;
    const commit = async () => {
      if (committed) return;
      committed = true;
      const newName = input.value.trim();
      if (newName && newName !== oldName) {
        item.name = newName;
        await persistData();
        showToast(`✏️ 已重命名为「${newName}」`);
      }
      renderGrid();
    };

    const cancel = () => {
      if (committed) return;
      committed = true;
      renderGrid();
    };

    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('pointerdown', (e) => e.stopPropagation());
    input.addEventListener('dblclick', (e) => e.stopPropagation());

    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        commit();
      } else if (e.key === 'Escape') {
        cancel();
      }
    });

    input.addEventListener('blur', () => {
      commit();
    });

    titleElement.textContent = '';
    titleElement.appendChild(input);
    setTimeout(() => {
      input.focus();
      input.select();
    }, 20);
  }

  // ==========================================
  // CARD POINTER DRAG & MERGE
  // ==========================================
  function onCardPointerDown(e, index, item, card) {
    if (e.button !== 0) return;
    if (e.target.contentEditable === 'true') return;

    dragInfo.startX = e.clientX;
    dragInfo.startY = e.clientY;
    dragInfo.sourceIndex = index;
    dragInfo.sourceItem = item;
    dragInfo.sourceElement = card;
    dragInfo.isDragging = false;

    const rect = card.getBoundingClientRect();
    dragInfo.offsetX = e.clientX - rect.left;
    dragInfo.offsetY = e.clientY - rect.top;

    function onPointerMove(moveEvent) {
      const dx = moveEvent.clientX - dragInfo.startX;
      const dy = moveEvent.clientY - dragInfo.startY;

      if (!dragInfo.isDragging && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        dragInfo.isDragging = true;
        startDragging(moveEvent);
      }

      if (dragInfo.isDragging) {
        updateDragging(moveEvent);
      }
    }

    function onPointerUp(upEvent) {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (dragInfo.isDragging) {
        endDragging(upEvent);
      }
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  function startDragging(e) {
    dragInfo.sourceElement.style.opacity = '0.3';
    dragGhost.innerHTML = dragInfo.sourceElement.innerHTML;
    dragGhost.style.display = 'flex';
    dragGhost.style.width = dragInfo.sourceElement.offsetWidth + 'px';
    dragGhost.style.height = dragInfo.sourceElement.offsetHeight + 'px';
    updateGhostPosition(e.clientX, e.clientY);
  }

  function updateGhostPosition(x, y) {
    const gx = x - dragInfo.offsetX;
    const gy = y - dragInfo.offsetY;
    dragGhost.style.transform = `translate3d(${gx}px, ${gy}px, 0) scale(1.06) rotate(2deg)`;
  }

  function updateDragging(e) {
    updateGhostPosition(e.clientX, e.clientY);
    clearActiveTargetHighlights();

    const cards = Array.from(gridContainer.children);
    let hoveredCard = null;
    let hoveredIndex = -1;

    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      if (i === dragInfo.sourceIndex) continue;
      const rect = c.getBoundingClientRect();
      if (
        e.clientX >= rect.left - 4 &&
        e.clientX <= rect.right + 4 &&
        e.clientY >= rect.top - 4 &&
        e.clientY <= rect.bottom + 4
      ) {
        hoveredCard = c;
        hoveredIndex = i;
        break;
      }
    }

    if (hoveredCard) {
      if (hoveredCard.dataset.isAddCard === 'true') {
        hoveredCard.classList.add('folder-target-active');
        dragInfo.targetCard = hoveredCard;
        dragInfo.targetAction = 'drop_to_add_card';
        return;
      }

      const targetItem = state.items[hoveredIndex];
      if (targetItem) {
        if (targetItem.type === 'app') {
          hoveredCard.classList.add('merge-target-active');
          dragInfo.targetCard = hoveredCard;
          dragInfo.targetAction = 'merge';
          dragInfo.reorderIndex = hoveredIndex;
          return;
        } else if (targetItem.type === 'folder') {
          hoveredCard.classList.add('folder-target-active');
          dragInfo.targetCard = hoveredCard;
          dragInfo.targetAction = 'add_to_folder';
          dragInfo.reorderIndex = hoveredIndex;
          return;
        }
      }
    }

    dragInfo.targetCard = null;
    dragInfo.targetAction = null;
  }

  async function endDragging(e) {
    if (dragInfo.sourceElement) {
      dragInfo.sourceElement.style.opacity = '1';
    }
    dragGhost.style.display = 'none';
    clearActiveTargetHighlights();

    const { targetAction, sourceIndex, sourceItem, reorderIndex } = dragInfo;
    dragInfo.isDragging = false;

    if (!targetAction || sourceIndex === -1) return;

    if (targetAction === 'merge') {
      const targetItem = state.items[reorderIndex];
      const newFolder = {
        id: 'folder-' + Date.now(),
        type: 'folder',
        name: '新建空间',
        color: 'pink',
        items: [targetItem, sourceItem]
      };
      const higherIdx = Math.max(sourceIndex, reorderIndex);
      const lowerIdx = Math.min(sourceIndex, reorderIndex);
      state.items.splice(higherIdx, 1);
      state.items.splice(lowerIdx, 1, newFolder);
      await persistData();
      renderGrid();
      showToast(`🎉 成功合并为空间「${newFolder.name}」`);
      return;
    }

    if (targetAction === 'add_to_folder') {
      const folder = state.items[reorderIndex];
      folder.items = folder.items || [];
      folder.items.push(sourceItem);
      state.items.splice(sourceIndex, 1);
      await persistData();
      renderGrid();
      showToast(`📥 已将应用移入「${folder.name}」`);
      return;
    }

    if (targetAction === 'drop_to_add_card') {
      const newFolder = {
        id: 'folder-' + Date.now(),
        type: 'folder',
        name: '新建空间',
        color: 'pink',
        items: [sourceItem]
      };
      state.items.splice(sourceIndex, 1);
      state.items.push(newFolder);
      await persistData();
      renderGrid();
      showToast(`📁 已存入新空间`);
      return;
    }
  }

  function clearActiveTargetHighlights() {
    document.querySelectorAll('.merge-target-active').forEach(el => el.classList.remove('merge-target-active'));
    document.querySelectorAll('.folder-target-active').forEach(el => el.classList.remove('folder-target-active'));
  }

  // ==========================================
  // NATIVE OS DRAG & DROP (WINDOWS DESKTOP)
  // ==========================================
  function setupNativeDragDrop() {
    window.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';

      const targetCard = e.target.closest('.grid-card');
      clearActiveTargetHighlights();
      if (targetCard) {
        if (targetCard.dataset.isAddCard === 'true') {
          targetCard.classList.add('folder-target-active');
        } else {
          const type = targetCard.dataset.type;
          if (type === 'app') {
            targetCard.classList.add('merge-target-active');
          } else if (type === 'folder') {
            targetCard.classList.add('folder-target-active');
          }
        }
      }
    });

    window.addEventListener('dragleave', (e) => {
      if (!e.relatedTarget || e.relatedTarget === document.documentElement) {
        clearActiveTargetHighlights();
      }
    });

    window.addEventListener('drop', async (e) => {
      e.preventDefault();
      const targetCard = e.target.closest('.grid-card');
      clearActiveTargetHighlights();

      const files = e.dataTransfer.files;
      if (!files || files.length === 0) return;

      let folderToOpen = null;
      let targetFolderName = '';
      let addedItemsCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let filePath = '';
        if (window.electronAPI && typeof window.electronAPI.getPathForFile === 'function') {
          filePath = window.electronAPI.getPathForFile(file);
        } else {
          filePath = file.path || '';
        }

        if (!filePath) continue;

        let iconData = null;
        if (window.electronAPI && typeof window.electronAPI.extractIcon === 'function') {
          try {
            iconData = await window.electronAPI.extractIcon(filePath);
          } catch (err) {
            console.error('Extract icon error:', err);
          }
        }

        const fileName = file.name.replace(/\.[^/.]+$/, '');
        const newApp = {
          id: 'app-' + Date.now() + '-' + i,
          type: 'app',
          name: fileName,
          icon: iconData || '',
          action: filePath
        };
        addedItemsCount++;

        if (state.activeFolderId) {
          // Dropped into currently open folder modal
          const folder = state.items.find(it => it.id === state.activeFolderId);
          if (folder) {
            folder.items = folder.items || [];
            folder.items.push(newApp);
            renderFolderSpaceContent(folder);
            targetFolderName = folder.name;
          }
        } else if (targetCard) {
          if (targetCard.dataset.isAddCard === 'true') {
            // Dropped onto "+ 新建空间" card
            const newFolder = {
              id: 'folder-' + Date.now() + '-' + i,
              type: 'folder',
              name: '新建空间',
              color: 'pink',
              items: [newApp]
            };
            state.items.push(newFolder);
            folderToOpen = newFolder.id;
            targetFolderName = newFolder.name;
          } else {
            const targetIndex = parseInt(targetCard.dataset.index);
            const targetItem = state.items[targetIndex];
            if (targetItem) {
              if (targetItem.type === 'app') {
                // Merge into new folder
                const newFolder = {
                  id: 'folder-' + Date.now() + '-' + i,
                  type: 'folder',
                  name: '新建空间',
                  color: 'pink',
                  items: [targetItem, newApp]
                };
                state.items.splice(targetIndex, 1, newFolder);
                folderToOpen = newFolder.id;
                targetFolderName = newFolder.name;
              } else if (targetItem.type === 'folder') {
                // Drop directly into folder
                targetItem.items = targetItem.items || [];
                targetItem.items.push(newApp);
                targetFolderName = targetItem.name;
              }
            }
          }
        } else {
          // Dropped onto empty area of canvas -> add to first folder or root
          if (state.items.length > 0 && state.items[0].type === 'folder') {
            state.items[0].items = state.items[0].items || [];
            state.items[0].items.push(newApp);
            targetFolderName = state.items[0].name;
          } else {
            state.items.push(newApp);
          }
        }
      }

      await persistData();
      renderGrid();

      if (targetFolderName) {
        showToast(`📥 已将 ${addedItemsCount} 个应用存入「${targetFolderName}」`);
      } else if (addedItemsCount > 0) {
        showToast(`📌 已添加 ${addedItemsCount} 个应用`);
      }

      if (folderToOpen && !state.activeFolderId) {
        openFolderSpace(folderToOpen);
      }
    });
  }

  // ==========================================
  // FOLDER SPACE (文件空间) MODAL
  // ==========================================
  function openFolderSpace(folderId) {
    const folder = state.items.find(it => it.id === folderId);
    if (!folder) return;

    state.activeFolderId = folderId;
    folderSpaceTitle.textContent = folder.name || '文件夹';
    folderSpaceTitle.contentEditable = 'false';

    // Apply color styling to modal card and active color dot
    const folderColor = folder.color || 'blue';
    setFolderModalColor(folderColor);

    renderFolderSpaceContent(folder);
    folderModal.classList.add('active');
  }

  function closeFolderSpace() {
    folderModal.classList.remove('active');
    state.activeFolderId = null;
    folderSpaceTitle.contentEditable = 'false';
    renderGrid();
  }

  function renderFolderSpaceContent(folder) {
    folderSpaceContent.innerHTML = '';
    const items = folder.items || [];

    if (items.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.style.gridColumn = 'span 4';
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.color = '#64748b';
      emptyMsg.style.padding = '36px 0';
      emptyMsg.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 8px;">📁</div>
        <div>此空间暂无应用</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">可直接从电脑桌面拖拽应用到此处</div>
      `;
      folderSpaceContent.appendChild(emptyMsg);
      return;
    }

    items.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'folder-app-item';
      itemEl.dataset.index = index;

      const icon = document.createElement('div');
      icon.className = 'folder-app-icon';
      icon.innerHTML = getIconHTML(item.icon, item.name);

      const name = document.createElement('div');
      name.className = 'folder-app-name';
      name.textContent = item.name || '应用';

      itemEl.appendChild(icon);
      itemEl.appendChild(name);

      itemEl.addEventListener('click', () => {
        launchItem(item);
      });

      itemEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showFolderItemContextMenu(e, folder, item, index);
      });

      folderSpaceContent.appendChild(itemEl);
    });
  }

  async function launchItem(item) {
    if (!item) return;
    if (window.electronAPI) {
      await window.electronAPI.launchApp(item);
    } else {
      if (item.action && (item.action.startsWith('http://') || item.action.startsWith('https://'))) {
        window.open(item.action, '_blank');
      }
    }
  }

  // ==========================================
  // CONTEXT MENUS
  // ==========================================
  function showCardContextMenu(e, item, index) {
    contextMenu.innerHTML = '';

    if (item.type === 'folder') {
      contextMenu.appendChild(createMenuItem('📂 打开文件夹空间', () => openFolderSpace(item.id)));
      contextMenu.appendChild(createMenuItem('🎨 切换空间专属色彩', () => {
        openFolderSpace(item.id);
        showToast('💡 可以在标题旁的彩色圆点直接点选空间颜色');
      }));
      contextMenu.appendChild(createMenuItem('✏️ 重命名空间', () => openRenameModal('folder', item)));
      contextMenu.appendChild(createMenuItem('➕ 添加应用快捷方式', () => openAddModal(item.id)));
      contextMenu.appendChild(createMenuSeparator());
      contextMenu.appendChild(createMenuItem('💥 解散为独立应用', () => disbandFolder(item.id), true));
      contextMenu.appendChild(createMenuItem('🗑️ 删除空间', () => deleteRootItem(index), true));
    } else {
      contextMenu.appendChild(createMenuItem('🚀 启动应用', () => launchItem(item)));
      contextMenu.appendChild(createMenuItem('✏️ 重命名应用', () => openRenameModal('app', item)));
      contextMenu.appendChild(createMenuSeparator());
      contextMenu.appendChild(createMenuItem('🗑️ 从画布移除', () => deleteRootItem(index), true));
    }

    positionContextMenu(e.clientX, e.clientY);
  }

  function showFolderItemContextMenu(e, folder, item, index) {
    contextMenu.innerHTML = '';
    contextMenu.appendChild(createMenuItem('🚀 启动应用', () => launchItem(item)));
    contextMenu.appendChild(createMenuItem('✏️ 重命名', () => {
      openRenameModal('app', item);
    }));
    contextMenu.appendChild(createMenuItem('📤 移出到画布根目录', async () => {
      folder.items.splice(index, 1);
      state.items.push(item);
      await persistData();
      renderFolderSpaceContent(folder);
      renderGrid();
    }));
    contextMenu.appendChild(createMenuSeparator());
    contextMenu.appendChild(createMenuItem('🗑️ 从空间中删除', async () => {
      folder.items.splice(index, 1);
      await persistData();
      renderFolderSpaceContent(folder);
    }, true));

    positionContextMenu(e.clientX, e.clientY);
  }

  function createMenuItem(label, onClick, isDanger = false) {
    const item = document.createElement('div');
    item.className = `context-menu-item ${isDanger ? 'danger' : ''}`;
    item.textContent = label;
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      hideContextMenu();
      onClick();
    });
    return item;
  }

  function createMenuSeparator() {
    const sep = document.createElement('div');
    sep.className = 'context-menu-separator';
    return sep;
  }

  function positionContextMenu(x, y) {
    contextMenu.style.left = `${Math.min(x, window.innerWidth - 180)}px`;
    contextMenu.style.top = `${Math.min(y, window.innerHeight - 200)}px`;
    contextMenu.classList.add('active');
  }

  function hideContextMenu() {
    contextMenu.classList.remove('active');
  }

  function renameFolderPrompt(folder) {
    openRenameModal('folder', folder);
  }

  function renameAppPrompt(appItem) {
    openRenameModal('app', appItem);
  }

  async function deleteRootItem(index) {
    state.items.splice(index, 1);
    await persistData();
    renderGrid();
  }

  async function disbandFolder(folderId) {
    const idx = state.items.findIndex(it => it.id === folderId);
    if (idx === -1) return;
    const folder = state.items[idx];
    const items = folder.items || [];
    state.items.splice(idx, 1, ...items);
    await persistData();
    closeFolderSpace();
    renderGrid();
  }

  // ==========================================
  // ADD MODAL
  // ==========================================
  function openAddModal(targetFolderId = null) {
    addModalTargetFolderId = targetFolderId;
    inputAppName.value = '';
    inputAppAction.value = '';
    state.selectedPresetIcon = 'edge';
    updatePresetIconSelection();
    addModal.classList.add('active');
  }

  function closeAddModal() {
    addModal.classList.remove('active');
    addModalTargetFolderId = null;
  }

  function populatePresetIcons() {
    presetIconsGrid.innerHTML = '';
    const iconKeys = Object.keys(BUILTIN_ICONS);
    iconKeys.forEach(key => {
      const item = document.createElement('div');
      item.className = `preset-icon-item ${key === state.selectedPresetIcon ? 'selected' : ''}`;
      item.dataset.key = key;
      item.innerHTML = BUILTIN_ICONS[key];
      item.addEventListener('click', () => {
        state.selectedPresetIcon = key;
        updatePresetIconSelection();
      });
      presetIconsGrid.appendChild(item);
    });
  }

  function updatePresetIconSelection() {
    const items = presetIconsGrid.querySelectorAll('.preset-icon-item');
    items.forEach(el => {
      if (el.dataset.key === state.selectedPresetIcon) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });
  }

  async function confirmAddApp() {
    const name = inputAppName.value.trim() || '快捷方式';
    const action = inputAppAction.value.trim();
    if (!action) {
      alert('请输入启动目标 (本地路径、命令或网页网址)');
      return;
    }

    const newApp = {
      id: 'app-' + Date.now(),
      type: 'app',
      name: name,
      icon: state.selectedPresetIcon,
      action: action
    };

    if (addModalTargetFolderId) {
      const folder = state.items.find(it => it.id === addModalTargetFolderId);
      if (folder) {
        folder.items = folder.items || [];
        folder.items.push(newApp);
        renderFolderSpaceContent(folder);
      }
    } else {
      state.items.push(newApp);
    }

    await persistData();
    renderGrid();
    closeAddModal();
  }

  async function pickLocalFile() {
    if (!window.electronAPI) return;
    const fileInfo = await window.electronAPI.pickFile();
    if (fileInfo) {
      inputAppName.value = fileInfo.name || '';
      inputAppAction.value = fileInfo.path || '';
      if (fileInfo.icon) {
        state.selectedPresetIcon = fileInfo.icon;
      }
    }
  }

  // ==========================================
  // EVENT LISTENERS SETUP
  // ==========================================
  function setupEventListeners() {
    document.addEventListener('click', () => hideContextMenu());

    // Zipper handle click -> Expand canvas
    if (zipperTriggerBtn) {
      zipperTriggerBtn.addEventListener('click', (e) => {
        expandCanvas();
      });
    }

    // Retract zipper button -> Collapse canvas
    if (btnRetractZipper) {
      btnRetractZipper.addEventListener('click', (e) => {
        e.stopPropagation();
        collapseCanvas();
      });
    }

    // Canvas Title editing
    if (btnEditCanvasTitle && canvasTitle) {
      btnEditCanvasTitle.addEventListener('click', () => {
        openRenameModal('canvas-title');
      });

      canvasTitle.addEventListener('dblclick', () => {
        openRenameModal('canvas-title');
      });
    }

    // Folder Size Switcher Buttons
    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.dataset.size;
        if (size) setFolderSize(size);
      });
    });

    // Add new folder button in canvas header
    if (btnAddNewFolder) {
      btnAddNewFolder.addEventListener('click', () => {
        openRenameModal('new-folder');
      });
    }

    // Window lock
    btnLock.addEventListener('click', () => {
      state.settings.isLocked = !state.settings.isLocked;
      persistSettings();
      applySettings();
    });

    // Always on top toggle
    btnTop.addEventListener('click', () => {
      state.settings.alwaysOnTop = !state.settings.alwaysOnTop;
      persistSettings();
      applySettings();
      if (state.settings.alwaysOnTop) {
        showToast('📌 已切换为：置顶悬浮模式（显示在所有窗口上方）');
      } else {
        showToast('🖥️ 已切换为：桌面模式（只在桌面显示，不盖住打开的窗口）');
      }
    });

    // Minimize button action (Stealth mode vs Tray)
    btnMinimize.addEventListener('click', () => {
      const behavior = state.settings.minimizeBehavior || 'stealth';
      if (behavior === 'stealth') {
        collapseCanvas(true);
        showToast('👻 已折叠为智能隐身模式，鼠标靠近即可自动显形');
      } else {
        if (window.electronAPI) {
          window.electronAPI.minimizeWindow();
        }
      }
    });

    // Settings modal open
    btnSettings.addEventListener('click', () => {
      settingsModal.classList.add('active');
    });

    // Theme Popover toggle & quick switcher
    if (btnTheme && themePopover) {
      btnTheme.addEventListener('click', (e) => {
        e.stopPropagation();
        themePopover.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
        if (themePopover && !themePopover.contains(e.target) && e.target !== btnTheme && !btnTheme.contains(e.target)) {
          themePopover.classList.remove('active');
        }
      });
    }

    // Quick form style pills
    if (stylePillsRow) {
      stylePillsRow.querySelectorAll('.style-pill').forEach(pill => {
        pill.addEventListener('click', async (e) => {
          e.stopPropagation();
          const style = pill.dataset.style;
          if (style) {
            await setWidgetStyle(style);
          }
        });
      });
    }

    if (themePillsRow) {
      themePillsRow.querySelectorAll('.theme-pill').forEach(pill => {
        pill.addEventListener('click', async (e) => {
          e.stopPropagation();
          const theme = pill.dataset.theme;
          if (theme) {
            await applyTheme(theme);
            await persistSettings();
            showToast(`🎨 已切换主题：${THEME_NAMES[theme] || theme}`);
          }
        });
      });
    }

    if (btnRefreshWallpaper) {
      btnRefreshWallpaper.addEventListener('click', async (e) => {
        e.stopPropagation();
        await applyTheme('wallpaper');
        await detectAndApplyWallpaperTheme(true);
      });
    }

    if (settingsThemesGrid) {
      settingsThemesGrid.querySelectorAll('.settings-theme-card').forEach(card => {
        card.addEventListener('click', async () => {
          const theme = card.dataset.theme;
          if (theme) {
            await applyTheme(theme);
            await persistSettings();
            showToast(`🎨 全局主题已设为：${THEME_NAMES[theme] || theme}`);
          }
        });
      });
    }

    // Folder Color Dots in Folder Space Modal
    if (folderColorPicker) {
      folderColorPicker.querySelectorAll('.folder-color-dot').forEach(dot => {
        dot.addEventListener('click', async (e) => {
          e.stopPropagation();
          const newColor = dot.dataset.color;
          if (!newColor || !state.activeFolderId) return;

          const folder = state.items.find(it => it.id === state.activeFolderId);
          if (folder) {
            folder.color = newColor;
            setFolderModalColor(newColor);
            await persistData();
            renderGrid();
            showToast(`🎨 空间色彩已更新为：${FOLDER_COLOR_NAMES[newColor] || newColor}`);
          }
        });
      });
    }

    // Folder Space Modal actions
    btnCloseFolderSpace.addEventListener('click', closeFolderSpace);

    btnEditFolderTitle.addEventListener('click', () => {
      const folder = state.items.find(it => it.id === state.activeFolderId);
      if (folder) openRenameModal('folder', folder);
    });

    folderSpaceTitle.addEventListener('dblclick', () => {
      const folder = state.items.find(it => it.id === state.activeFolderId);
      if (folder) openRenameModal('folder', folder);
    });

    btnAddAppToFolder.addEventListener('click', () => {
      openAddModal(state.activeFolderId);
    });

    btnDisbandFolder.addEventListener('click', () => {
      if (state.activeFolderId) {
        disbandFolder(state.activeFolderId);
      }
    });

    // Rename Modal buttons
    if (btnCloseRenameModal) {
      btnCloseRenameModal.addEventListener('click', closeRenameModal);
    }
    if (btnCancelRename) {
      btnCancelRename.addEventListener('click', closeRenameModal);
    }
    if (btnConfirmRename) {
      btnConfirmRename.addEventListener('click', confirmRename);
    }
    if (inputRenameName) {
      inputRenameName.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          confirmRename();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeRenameModal();
        }
      });
    }
    if (renameModal) {
      renameModal.addEventListener('click', (e) => {
        if (e.target === renameModal) {
          closeRenameModal();
        }
      });
    }

    // Add Modal buttons
    btnCloseAddModal.addEventListener('click', closeAddModal);
    btnCancelAdd.addEventListener('click', closeAddModal);
    btnConfirmAdd.addEventListener('click', confirmAddApp);
    btnPickLocalFile.addEventListener('click', pickLocalFile);

    // Settings Modal buttons
    btnCloseSettingsModal.addEventListener('click', () => {
      settingsModal.classList.remove('active');
    });
    btnSaveSettings.addEventListener('click', () => {
      settingsModal.classList.remove('active');
    });

    // Widget style cards in Settings modal
    if (widgetStylesGrid) {
      widgetStylesGrid.querySelectorAll('.style-choice-card').forEach(card => {
        card.addEventListener('click', async () => {
          const style = card.dataset.style;
          if (style) {
            await setWidgetStyle(style);
          }
        });
      });
    }

    // Auto-hide (Stealth mode) toggle
    if (settingAutoHide) {
      settingAutoHide.addEventListener('change', () => {
        state.settings.autoHide = settingAutoHide.checked;
        persistSettings();
        if (state.settings.autoHide) {
          showToast('👻 已启用智能隐身（平时透明隐匿，鼠标靠近自动显形）');
        } else {
          exitStealthMode();
          showToast('👁️ 已关闭智能隐身（收起状态常显）');
        }
      });
    }

    // Minimize behavior select
    if (selectMinimizeBehavior) {
      selectMinimizeBehavior.addEventListener('change', () => {
        state.settings.minimizeBehavior = selectMinimizeBehavior.value;
        persistSettings();
        const label = selectMinimizeBehavior.value === 'stealth' ? '进入智能隐身（鼠标靠近即现形）' : '隐藏到系统托盘';
        showToast(`⚙️ 最小化行为已设为：${label}`);
      });
    }

    // Auto start on boot
    if (settingAutoStart) {
      settingAutoStart.addEventListener('change', async () => {
        const enabled = settingAutoStart.checked;
        state.settings.autoStart = enabled;
        await persistSettings();
        if (window.electronAPI && typeof window.electronAPI.setAutoStart === 'function') {
          await window.electronAPI.setAutoStart(enabled);
        }
        if (enabled) {
          showToast('🚀 已开启开机自启动（开机自动在后台运行）');
        } else {
          showToast('⏸️ 已关闭开机自启动');
        }
      });
    }

    settingAlwaysOnTop.addEventListener('change', () => {
      state.settings.alwaysOnTop = settingAlwaysOnTop.checked;
      persistSettings();
      applySettings();
      if (state.settings.alwaysOnTop) {
        showToast('📌 已切换为：置顶悬浮模式');
      } else {
        showToast('🖥️ 已切换为：桌面模式（不遮挡其他窗口）');
      }
    });

    settingOpacity.addEventListener('input', () => {
      state.settings.opacity = settingOpacity.value / 100;
      opacityValue.textContent = settingOpacity.value + '%';
      applySettings();
      persistSettings();
    });

    settingBlur.addEventListener('input', () => {
      state.settings.blurStrength = parseInt(settingBlur.value);
      blurValue.textContent = settingBlur.value + 'px';
      applySettings();
      persistSettings();
    });

    settingScale.addEventListener('input', () => {
      state.settings.cardScale = settingScale.value / 100;
      scaleValue.textContent = settingScale.value + '%';
      applySettings();
      persistSettings();
    });

    btnResetData.addEventListener('click', async () => {
      if (confirm('确定要恢复为初始单文件夹形态吗？')) {
        state.items = JSON.parse(JSON.stringify(DEFAULT_ITEMS));
        await persistData();
        renderGrid();
        settingsModal.classList.remove('active');
        showToast('🔄 已重置为初始空间形态');
      }
    });

    // Electron IPC broadcasts
    if (window.electronAPI) {
      window.electronAPI.onSettingsChanged((newSettings) => {
        state.settings = { ...state.settings, ...newSettings };
        applySettings();
      });

      window.electronAPI.onTriggerAddApp(() => {
        openAddModal();
      });

      window.electronAPI.onResetDefaultData(async () => {
        state.items = JSON.parse(JSON.stringify(DEFAULT_ITEMS));
        await persistData();
        renderGrid();
      });
    }

    // Keyboard ESC closes active modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (renameModal && renameModal.classList.contains('active')) closeRenameModal();
        if (folderModal.classList.contains('active')) closeFolderSpace();
        if (addModal.classList.contains('active')) closeAddModal();
        if (settingsModal.classList.contains('active')) settingsModal.classList.remove('active');
      }
    });

    setupNativeDragDrop();
  }

  // Expose controls for testing and IPC
  window.appControls = {
    expandCanvas,
    collapseCanvas,
    setFolderSize,
    openRenameModal,
    closeRenameModal,
    confirmRename,
    startInlineCardRename,
    applyTheme,
    detectAndApplyWallpaperTheme,
    setWidgetStyle,
    enterStealthMode,
    exitStealthMode,
    openFolderSpace,
    closeFolderSpace,
    getState: () => state
  };

  // Start app
  init();
})();
