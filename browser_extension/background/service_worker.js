/**
 * 后台服务 Worker
 * 处理右键菜单、下载任务管理和通知
 */

// 配置
const CONFIG = {
  API_BASE_URL: 'http://127.0.0.1:8848/api/v1',
  WS_BASE_URL: 'ws://127.0.0.1:8848/ws',
};

// 存储活动的 WebSocket 连接
const activeWebSockets = new Map();

// 存储下载任务状态
const downloadTasks = new Map();

// ============== 扩展安装/启动 ==============

chrome.runtime.onInstalled.addListener(() => {
  console.log('[抖音下载器] 扩展已安装');

  // 创建右键菜单
  createContextMenus();

  // 检查本地服务状态
  checkServiceStatus();
});

// ============== 右键菜单 ==============

function createContextMenus() {
  // 移除旧菜单
  chrome.contextMenus.removeAll(() => {
    // 创建视频下载菜单
    chrome.contextMenus.create({
      id: 'downloadVideo',
      title: '下载此视频',
      contexts: ['link', 'selection'],
      documentUrlPatterns: ['*://*.douyin.com/*'],
    });

    // 创建用户作品下载菜单
    chrome.contextMenus.create({
      id: 'downloadUserPosts',
      title: '下载用户作品',
      contexts: ['page'],
      documentUrlPatterns: ['*://*.douyin.com/user/*'],
    });

    // 创建当前页下载菜单
    chrome.contextMenus.create({
      id: 'downloadCurrentPage',
      title: '下载当前页面',
      contexts: ['page', 'link'],
      documentUrlPatterns: ['*://*.douyin.com/*'],
    });

    console.log('[抖音下载器] 右键菜单已创建');
  });
}

// 右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const { menuItemId, linkUrl, pageUrl, selectionText } = info;

  switch (menuItemId) {
    case 'downloadVideo':
      const videoUrl = linkUrl || selectionText || pageUrl;
      if (videoUrl) {
        handleDownloadRequest({ url: videoUrl, type: 'video' });
      }
      break;

    case 'downloadUserPosts':
      if (pageUrl) {
        handleDownloadRequest({ url: pageUrl, type: 'user', mode: 'post' });
      }
      break;

    case 'downloadCurrentPage':
      const url = linkUrl || pageUrl;
      if (url) {
        handleDownloadRequest({ url: url });
      }
      break;
  }
});

// ============== 消息监听 ==============

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[抖音下载器] 收到消息:', request);

  switch (request.action) {
    case 'showNotification':
      showNotification(request.message, request.type);
      break;

    case 'download':
      handleDownloadRequest(request);
      sendResponse({ success: true });
      return true;

    case 'getTaskStatus':
      const task = downloadTasks.get(request.taskId);
      sendResponse(task || { error: '任务不存在' });
      return true;

    case 'getAllTasks':
      const tasks = Array.from(downloadTasks.entries()).map(([id, task]) => ({
        task_id: id,
        ...task
      }));
      sendResponse({ tasks });
      return true;

    case 'checkService':
      checkServiceStatus().then(status => {
        sendResponse(status);
      });
      return true;

    case 'getHistory':
      fetchHistory().then(history => {
        sendResponse(history);
      }).catch(error => {
        sendResponse({ error: error.message });
      });
      return true;
  }

  return false;
});

// ============== 下载请求处理 ==============

async function handleDownloadRequest(request) {
  const { url, type = 'auto', mode = null, savePath = null } = request;

  try {
    // 检查服务状态
    const serviceStatus = await checkServiceStatus();
    if (!serviceStatus.available) {
      showNotification('本地服务未启动，请先启动下载服务', 'error');
      return;
    }

    // 发送下载请求
    showNotification('正在创建下载任务...', 'info');

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

    const result = await response.json();
    const { task_id, status, url_type } = result;

    // 保存任务信息
    downloadTasks.set(task_id, {
      task_id,
      url,
      type: url_type || type,
      mode,
      status,
      created_at: Date.now(),
    });

    // 连接 WebSocket 监听进度
    connectWebSocket(task_id);

    showNotification('下载任务已创建', 'success');

    // 更新徽章计数
    updateBadge();

  } catch (error) {
    console.error('[抖音下载器] 下载请求失败:', error);
    showNotification('下载失败: ' + error.message, 'error');
  }
}

// ============== WebSocket 连接 ==============

function connectWebSocket(taskId) {
  const wsUrl = `${CONFIG.WS_BASE_URL}/${taskId}`;

  console.log('[抖音下载器] 连接 WebSocket:', wsUrl);

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('[抖音下载器] WebSocket 已连接:', taskId);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('[抖音下载器] 收到进度更新:', data);

      // 更新任务状态
      downloadTasks.set(data.task_id, {
        ...downloadTasks.get(data.task_id),
        ...data,
        updated_at: Date.now(),
      });

      // 根据状态显示通知
      if (data.status === 'completed') {
        showNotification('下载完成！', 'success');
        ws.close();
      } else if (data.status === 'failed') {
        showNotification('下载失败: ' + (data.error || '未知错误'), 'error');
        ws.close();
      } else if (data.status === 'cancelled') {
        showNotification('下载已取消', 'info');
        ws.close();
      }

      // 更新徽章
      updateBadge();

    } catch (error) {
      console.error('[抖音下载器] 解析 WebSocket 消息失败:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('[抖音下载器] WebSocket 错误:', error);
  };

  ws.onclose = () => {
    console.log('[抖音下载器] WebSocket 已关闭:', taskId);
    activeWebSockets.delete(taskId);
  };

  activeWebSockets.set(taskId, ws);
}

// ============== 通知 ==============

function showNotification(message, type = 'info') {
  // 使用相对路径或 Chrome 默认图标
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon48.png'),
    title: '抖音下载器',
    message: message,
    priority: 2,
  }, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.log('[抖音下载器] 通知创建失败:', chrome.runtime.lastError.message);
      // 忽略通知错误，不影响功能
    }
  });
}

function getNotificationIcon(type) {
  // 返回对应的图标路径
  const icons = {
    success: '/icons/icon48.png',
    error: '/icons/icon48.png',
    info: '/icons/icon48.png',
  };
  return icons[type] || icons.info;
}

// ============== 徽章管理 ==============

function updateBadge() {
  // 计算活动任务数
  const activeCount = Array.from(downloadTasks.values())
    .filter(task => task.status === 'downloading' || task.status === 'queued')
    .length;

  if (activeCount > 0) {
    chrome.action.setBadgeText({ text: String(activeCount) });
    chrome.action.setBadgeBackgroundColor({ color: '#FF2E63' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// ============== 服务状态检查 ==============

async function checkServiceStatus() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL.replace('/api/v1', '')}/api/health`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      return { available: true, ...data };
    }

    return { available: false };
  } catch (error) {
    return { available: false, error: error.message };
  }
}

// ============== 历史记录 ==============

async function fetchHistory(limit = 20, offset = 0) {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/history?limit=${limit}&offset=${offset}`);

    if (!response.ok) {
      throw new Error('获取历史记录失败');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[抖音下载器] 获取历史记录失败:', error);
    throw error;
  }
}

// ============== 定期清理 ==============

// 每小时清理一次已完成的任务（保留最近100条）
setInterval(() => {
  const tasks = Array.from(downloadTasks.entries());

  // 按创建时间排序
  tasks.sort((a, b) => b[1].created_at - a[1].created_at);

  // 保留最近100条已完成/失败的任务
  const toKeep = tasks.filter(t =>
    t[1].status === 'downloading' ||
    t[1].status === 'queued' ||
    (tasks.indexOf(t) < 100)
  );

  // 清空并重新添加
  downloadTasks.clear();
  toKeep.forEach(([id, task]) => downloadTasks.set(id, task));

  console.log('[抖音下载器] 已清理旧任务，当前任务数:', downloadTasks.size);
}, 60 * 60 * 1000);

console.log('[抖音下载器] 后台服务已启动');
