/**
 * 抖音网站内容脚本
 * 在抖音页面上注入下载按钮和批量下载功能
 */

(function() {
  'use strict';

  // 配置
  const CONFIG = {
    API_BASE_URL: 'http://127.0.0.1:8848/api/v1',
    WS_BASE_URL: 'ws://127.0.0.1:8848/ws',
    AUTO_DOWNLOAD_POPUP: true, // 是否启用复制后弹窗下载
  };

  // 当前页面类型
  let pageType = null;
  let pageData = {};

  // 上次复制的链接（避免重复弹窗）
  let lastCopiedUrl = null;
  let popupCooldown = false;

  // 检测页面类型并初始化
  function init() {
    detectPageType();
    console.log('[抖音下载器] 页面类型:', pageType);

    switch (pageType) {
      case 'video':
        initVideoPage();
        break;
      case 'user':
        initUserPage();
        break;
      case 'collection':
        initCollectionPage();
        break;
      case 'favorite':
        initFavoritePage();
        break;
      default:
        console.log('[抖音下载器] 未识别的页面类型');
    }

    // 监听页面变化（SPA 路由切换）
    observePageChanges();

    // 监听复制事件（自动下载弹窗）
    if (CONFIG.AUTO_DOWNLOAD_POPUP) {
      initCopyListener();
    }
  }

  // 检测页面类型
  function detectPageType() {
    const path = window.location.pathname;

    if (path.includes('/video/')) {
      pageType = 'video';
      pageData.videoId = extractVideoId();
    } else if (path.includes('/user/')) {
      if (window.location.search.includes('showTab=favorite_collection') ||
          window.location.search.includes('showTab=post')) {
        // 用户主页的不同标签页
        const tab = getQueryString('showTab');
        pageType = tab === 'favorite_collection' ? 'favorite' : 'user';
      } else {
        pageType = 'user';
      }
      pageData.userId = extractUserId();
    } else if (path.includes('/collection/')) {
      pageType = 'collection';
      pageData.collectionId = extractCollectionId();
    } else {
      pageType = 'unknown';
    }
  }

  // 初始化视频页面
  function initVideoPage() {
    addDownloadButtonToVideo();
  }

  // 初始化用户主页
  function initUserPage() {
    addBatchDownloadButton();
  }

  // 初始化收藏页面
  function initFavoritePage() {
    addBatchDownloadButton();
  }

  // 初始化合集页面
  function initCollectionPage() {
    addBatchDownloadButton();
  }

  // 添加下载按钮到视频页面
  function addDownloadButtonToVideo() {
    // 等待页面加载完成
    const observer = new MutationObserver(() => {
      const container = findVideoActionContainer();
      if (container && !container.querySelector('.dy-download-btn')) {
        const button = createDownloadButton('下载视频', 'single');
        container.appendChild(button);
        console.log('[抖音下载器] 下载按钮已添加');
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 10秒后停止观察
    setTimeout(() => observer.disconnect(), 10000);
  }

  // 查找视频操作按钮容器
  function findVideoActionContainer() {
    // 尝试多种选择器
    const selectors = [
      '.xgplayer-share', // 分享按钮附近
      '[class*="action"]', // 操作按钮区域
      '[class*="toolbar"]', // 工具栏
      'section[class*="interaction"]', // 交互区域
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.parentElement || element;
      }
    }

    return null;
  }

  // 添加批量下载按钮到用户/收藏/合集页面
  function addBatchDownloadButton() {
    const observer = new MutationObserver(() => {
      const container = findPageHeader();
      if (container && !container.querySelector('.dy-batch-download-btn')) {
        const button = createBatchDownloadButton();
        container.appendChild(button);
        console.log('[抖音下载器] 批量下载按钮已添加');
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 10秒后停止观察
    setTimeout(() => observer.disconnect(), 10000);
  }

  // 查找页面头部区域
  function findPageHeader() {
    const selectors = [
      '.user-info',
      '[class*="header"]',
      '[class*="title"]',
      'h1',
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.parentElement) {
        return element.parentElement;
      }
    }

    return document.body;
  }

  // 创建单个下载按钮
  function createDownloadButton(text, type) {
    const button = document.createElement('button');
    button.className = 'dy-download-btn';
    button.textContent = text;
    button.dataset.type = type;

    // 添加样式
    Object.assign(button.style, {
      padding: '8px 16px',
      margin: '0 8px',
      background: '#FF2E63',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    });

    button.addEventListener('click', handleSingleDownload);
    return button;
  }

  // 创建批量下载按钮
  function createBatchDownloadButton() {
    const container = document.createElement('div');
    container.className = 'dy-batch-download-container';
    container.style.cssText = `
      margin: 12px 0;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    `;

    // 根据页面类型显示不同的按钮
    const buttons = [];

    if (pageType === 'user') {
      buttons.push(
        { text: '📥 下载作品', mode: 'post' },
        { text: '❤️ 下载喜欢', mode: 'like' },
      );
    } else if (pageType === 'collection') {
      buttons.push(
        { text: '📦 下载合集', mode: 'mix' },
      );
    } else if (pageType === 'favorite') {
      buttons.push(
        { text: '⭐ 下载收藏', mode: 'collection' },
      );
    }

    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.className = 'dy-batch-download-btn';
      button.textContent = btn.text;
      button.dataset.mode = btn.mode;

      Object.assign(button.style, {
        padding: '8px 16px',
        background: '#08F',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
      });

      button.addEventListener('click', () => handleBatchDownload(btn.mode));
      container.appendChild(button);
    });

    return container;
  }

  // 处理单个视频下载
  async function handleSingleDownload(e) {
    e.preventDefault();
    e.stopPropagation();

    const button = e.target;
    const url = window.location.href;

    setButtonLoading(button, true);

    try {
      const result = await sendDownloadRequest({ url });
      showNotification('下载任务已创建', 'success');
      button.textContent = '✓ 已提交';
      setTimeout(() => {
        button.textContent = '下载视频';
        setButtonLoading(button, false);
      }, 2000);
    } catch (error) {
      console.error('[抖音下载器] 下载失败:', error);
      showNotification('下载失败: ' + error.message, 'error');
      setButtonLoading(button, false);
    }
  }

  // 处理批量下载
  async function handleBatchDownload(mode) {
    const url = window.location.href;

    try {
      showNotification('正在创建下载任务...', 'info');
      const result = await sendDownloadRequest({ url, mode });
      showNotification(`批量下载任务已创建 (${mode})`, 'success');
    } catch (error) {
      console.error('[抖音下载器] 批量下载失败:', error);
      showNotification('批量下载失败: ' + error.message, 'error');
    }
  }

  // 发送下载请求到本地服务
  async function sendDownloadRequest({ url, mode = null, savePath = null }) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        mode,
        save_path: savePath,
        options: {},
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: '请求失败' }));
      throw new Error(error.detail || '请求失败');
    }

    return response.json();
  }

  // 设置按钮加载状态
  function setButtonLoading(button, loading) {
    if (loading) {
      button.dataset.originalText = button.textContent;
      button.disabled = true;
      button.style.opacity = '0.6';
    } else {
      button.disabled = false;
      button.style.opacity = '1';
      if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
      }
    }
  }

  // 显示通知
  function showNotification(message, type = 'info') {
    // 发送到 background 显示系统通知
    try {
      chrome.runtime.sendMessage({
        action: 'showNotification',
        message,
        type,
      });
    } catch (e) {
      console.log('[抖音下载器] 发送通知消息失败:', e);
    }

    // 也可以在页面上显示 toast
    showToast(message, type);
  }

  // 显示页面内 toast
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `dy-toast dy-toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'error' ? '#FF4444' : type === 'success' ? '#00C851' : '#33B5E5'};
      color: white;
      border-radius: 4px;
      z-index: 999999;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // 监听页面变化（SPA 路由切换）
  function observePageChanges() {
    let lastUrl = location.href;

    // 监听 URL 变化
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        // 重新检测页面类型
        detectPageType();
        console.log('[抖音下载器] 页面变化:', pageType);

        // 移除旧按钮
        document.querySelectorAll('.dy-download-btn, .dy-batch-download-btn, .dy-batch-download-container')
          .forEach(el => el.remove());

        // 重新初始化
        init();
      }
    }).observe(document, { subtree: true, childList: true });
  }

  // ==================== 复制自动下载功能 ====================

  // 初始化复制监听器
  function initCopyListener() {
    document.addEventListener('copy', handleCopyEvent);
    console.log('[抖音下载器] 复制监听已启用');
  }

  // 处理复制事件
  function handleCopyEvent(event) {
    // 冷却中，忽略
    if (popupCooldown) return;

    // 获取复制的文本
    const copiedText = window.getSelection().toString().trim();

    // 检查是否包含抖音链接
    const douyinUrl = extractDouyinUrl(copiedText);

    if (douyinUrl) {
      // 避免重复弹窗
      if (douyinUrl === lastCopiedUrl) return;
      lastCopiedUrl = douyinUrl;

      console.log('[抖音下载器] 检测到抖音链接:', douyinUrl);

      // 延迟弹出，给用户一点时间看到复制成功的效果
      setTimeout(() => {
        showDownloadPopup(douyinUrl);
      }, 300);

      // 设置冷却时间（3秒内不重复弹窗）
      popupCooldown = true;
      setTimeout(() => {
        popupCooldown = false;
      }, 3000);
    }
  }

  // 从文本中提取抖音链接
  function extractDouyinUrl(text) {
    if (!text) return null;

    // 匹配抖音链接（支持多种格式）
    const patterns = [
      /https?:\/\/[v\.]{0,1}douyin\.com\/[a-zA-Z0-9_-]+/g,  // v.douyin.com 或 douyin.com
      /https?:\/\/www\.douyin\.com\/(video|note|user|collection|music)\/[a-zA-Z0-9_-]+/g,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[0]) {
        return match[0];
      }
    }

    return null;
  }

  // 显示下载确认弹窗
  function showDownloadPopup(url) {
    // 移除已存在的弹窗
    const existingPopup = document.querySelector('.dy-auto-download-popup');
    if (existingPopup) existingPopup.remove();

    // 创建弹窗
    const popup = document.createElement('div');
    popup.className = 'dy-auto-download-popup';
    popup.innerHTML = `
      <div class="dy-popup-content">
        <div class="dy-popup-header">
          <span class="dy-popup-title">📥 下载视频</span>
          <button class="dy-popup-close" onclick="this.closest('.dy-auto-download-popup').remove()">✕</button>
        </div>
        <div class="dy-popup-body">
          <p class="dy-popup-message">检测到抖音视频链接</p>
          <p class="dy-popup-url">${truncateUrl(url, 60)}</p>
          <div class="dy-popup-actions">
            <button class="dy-popup-btn dy-btn-cancel">取消</button>
            <button class="dy-popup-btn dy-btn-confirm">立即下载</button>
          </div>
        </div>
      </div>
    `;

    // 添加样式
    popup.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: dyPopupFadeIn 0.2s ease;
    `;

    // 添加内部样式
    const style = document.createElement('style');
    style.textContent = `
      .dy-auto-download-popup .dy-popup-content {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
        overflow: hidden;
        animation: dyPopupSlideIn 0.3s ease;
      }
      .dy-auto-download-popup .dy-popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #eee;
      }
      .dy-auto-download-popup .dy-popup-title {
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }
      .dy-auto-download-popup .dy-popup-close {
        background: none;
        border: none;
        font-size: 20px;
        color: #999;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .dy-auto-download-popup .dy-popup-close:hover {
        color: #333;
      }
      .dy-auto-download-popup .dy-popup-body {
        padding: 20px;
      }
      .dy-auto-download-popup .dy-popup-message {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: #666;
      }
      .dy-auto-download-popup .dy-popup-url {
        margin: 0 0 20px 0;
        font-size: 12px;
        color: #08F;
        word-break: break-all;
        background: #f5f5f5;
        padding: 8px 12px;
        border-radius: 6px;
      }
      .dy-auto-download-popup .dy-popup-actions {
        display: flex;
        gap: 12px;
      }
      .dy-auto-download-popup .dy-popup-btn {
        flex: 1;
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      .dy-auto-download-popup .dy-btn-cancel {
        background: #f5f5f5;
        color: #666;
      }
      .dy-auto-download-popup .dy-btn-cancel:hover {
        background: #e8e8e8;
      }
      .dy-auto-download-popup .dy-btn-confirm {
        background: linear-gradient(135deg, #FF2E63, #FF1A4D);
        color: white;
      }
      .dy-auto-download-popup .dy-btn-confirm:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(255, 46, 99, 0.3);
      }
      .dy-auto-download-popup .dy-btn-confirm:active {
        transform: translateY(0);
      }
      @keyframes dyPopupFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes dyPopupSlideIn {
        from { transform: scale(0.9) translateY(-20px); opacity: 0; }
        to { transform: scale(1) translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    // 绑定按钮事件
    const cancelBtn = popup.querySelector('.dy-btn-cancel');
    const confirmBtn = popup.querySelector('.dy-btn-confirm');
    const closeBtn = popup.querySelector('.dy-popup-close');

    closeBtn.addEventListener('click', () => popup.remove());
    cancelBtn.addEventListener('click', () => popup.remove());

    confirmBtn.addEventListener('click', async () => {
      confirmBtn.textContent = '提交中...';
      confirmBtn.disabled = true;

      try {
        await sendDownloadRequest({ url });
        showNotification('下载任务已创建', 'success');
        popup.remove();
      } catch (error) {
        console.error('[抖音下载器] 下载失败:', error);
        showNotification('下载失败: ' + error.message, 'error');
        confirmBtn.textContent = '立即下载';
        confirmBtn.disabled = false;
      }
    });

    // 点击背景关闭
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.remove();
      }
    });

    // ESC 键关闭
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        popup.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // 自动移除样式（30秒后）
    setTimeout(() => {
      style.remove();
    }, 30000);

    document.body.appendChild(popup);
  }

  // 截断 URL 显示
  function truncateUrl(url, maxLength = 60) {
    if (url.length > maxLength) {
      return url.substring(0, maxLength) + '...';
    }
    return url;
  }

  // ==================== 原有功能 ====================

  // URL 提取辅助函数
  function extractVideoId() {
    const match = window.location.pathname.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
  }

  function extractUserId() {
    const match = window.location.pathname.match(/\/user\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  }

  function extractCollectionId() {
    const match = window.location.pathname.match(/\/collection\/(\d+)/);
    return match ? match[1] : null;
  }

  function getQueryString(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  // 添加动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    .dy-download-btn:hover {
      background: #E52550 !important;
    }
    .dy-batch-download-btn:hover {
      background: '#0077FF' !important;
    }
  `;
  document.head.appendChild(style);

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
