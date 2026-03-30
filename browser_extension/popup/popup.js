/**
 * Popup 界面逻辑
 */

// 配置
const CONFIG = {
  API_BASE_URL: 'http://127.0.0.1:8848/api/v1',
};

// DOM 元素
const elements = {
  serviceStatus: null,
  urlInput: null,
  downloadBtn: null,
  taskList: null,
  taskCount: null,
  historyList: null,
  refreshHistory: null,
  openSettings: null,
  openHelp: null,
};

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  initElements();
  initEventListeners();
  await checkServiceStatus();
  await loadTasks();
  await loadHistory();

  // 定期刷新任务状态
  setInterval(loadTasks, 2000);
});

// 初始化 DOM 元素
function initElements() {
  elements.serviceStatus = document.getElementById('serviceStatus');
  elements.urlInput = document.getElementById('urlInput');
  elements.downloadBtn = document.getElementById('downloadBtn');
  elements.taskList = document.getElementById('taskList');
  elements.taskCount = document.getElementById('taskCount');
  elements.historyList = document.getElementById('historyList');
  elements.refreshHistory = document.getElementById('refreshHistory');
  elements.openSettings = document.getElementById('openSettings');
  elements.openHelp = document.getElementById('openHelp');
}

// 初始化事件监听
function initEventListeners() {
  // 下载按钮
  elements.downloadBtn.addEventListener('click', handleDownload);

  // URL 输入框回车
  elements.urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleDownload();
    }
  });

  // URL 输入框粘贴自动提取链接
  elements.urlInput.addEventListener('paste', (e) => {
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const extractedUrl = extractUrlFromText(pastedText);

    if (extractedUrl && extractedUrl !== pastedText.trim()) {
      // 如果提取到链接，自动填充
      setTimeout(() => {
        elements.urlInput.value = extractedUrl;
        showToast('已自动提取链接', 'success');
      }, 10);
    }
  });

  // 刷新历史
  elements.refreshHistory.addEventListener('click', loadHistory);

  // 设置按钮
  elements.openSettings.addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/?id=' + chrome.runtime.id });
  });

  // 帮助按钮
  elements.openHelp.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/your-repo/wiki' });
  });
}

// 检查服务状态
async function checkServiceStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'checkService' });
    updateServiceStatus(response);
  } catch (error) {
    updateServiceStatus({ available: false });
  }
}

// 更新服务状态显示
function updateServiceStatus(status) {
  const dot = elements.serviceStatus.querySelector('.status-dot');
  const text = elements.serviceStatus.querySelector('.status-text');

  if (status.available) {
    dot.classList.add('online');
    dot.classList.remove('offline');
    text.textContent = '服务在线';
    elements.downloadBtn.disabled = false;
  } else {
    dot.classList.add('offline');
    dot.classList.remove('online');
    text.textContent = '服务离线';
    elements.downloadBtn.disabled = true;
  }
}

// 处理下载请求
async function handleDownload() {
  const url = elements.urlInput.value.trim();

  if (!url) {
    showToast('请输入抖音链接', 'error');
    return;
  }

  // 验证 URL
  if (!isValidDouyinUrl(url)) {
    showToast('请输入有效的抖音链接', 'error');
    return;
  }

  // 发送下载请求
  try {
    elements.downloadBtn.disabled = true;
    elements.downloadBtn.textContent = '提交中...';

    await chrome.runtime.sendMessage({
      action: 'download',
      url: url,
    });

    showToast('下载任务已创建', 'success');
    elements.urlInput.value = '';

    // 刷新任务列表
    await loadTasks();

  } catch (error) {
    showToast('下载失败: ' + error.message, 'error');
  } finally {
    elements.downloadBtn.disabled = false;
    elements.downloadBtn.textContent = '下载';
  }
}

// 加载任务列表
async function loadTasks() {
  try {
    // 从 background 获取所有任务
    const tasks = await getAllTasks();
    const activeTasks = tasks.filter(t =>
      t.status === 'queued' || t.status === 'downloading'
    );

    elements.taskCount.textContent = activeTasks.length;

    if (activeTasks.length === 0) {
      elements.taskList.innerHTML = `
        <div class="empty-state">
          <p>暂无活动任务</p>
        </div>
      `;
      return;
    }

    // 渲染任务列表
    elements.taskList.innerHTML = activeTasks.map(task => `
      <div class="task-item" data-task-id="${task.task_id}">
        <div class="task-info">
          <div class="task-url">${truncateUrl(task.url)}</div>
          <div class="task-meta">
            <span class="task-status status-${task.status}">${getStatusText(task.status)}</span>
            ${task.total > 0 ? `<span class="task-progress">${task.downloaded || 0}/${task.total}</span>` : ''}
          </div>
        </div>
        ${task.message ? `<div class="task-message">${task.message}</div>` : ''}
        ${task.progress > 0 ? `
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${task.progress}%"></div>
          </div>
        ` : ''}
      </div>
    `).join('');

  } catch (error) {
    console.error('加载任务失败:', error);
  }
}

// 加载历史记录
async function loadHistory() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/history?limit=10`);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      elements.historyList.innerHTML = `
        <div class="empty-state">
          <p>暂无下载记录</p>
        </div>
      `;
      return;
    }

    elements.historyList.innerHTML = data.items.map(item => `
      <div class="history-item">
        <div class="history-title">${item.title || '未知标题'}</div>
        <div class="history-meta">
          <span>${item.author || '未知作者'}</span>
          <span>${formatDate(item.download_time)}</span>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('加载历史失败:', error);
    elements.historyList.innerHTML = `
      <div class="error-state">
        <p>加载历史记录失败</p>
      </div>
    `;
  }
}

// 获取所有任务
async function getAllTasks() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getAllTasks' }, (response) => {
      resolve(response?.tasks || []);
    });
  });
}

// 验证抖音 URL
function isValidDouyinUrl(url) {
  return url.includes('douyin.com') || url.includes('v.douyin.com');
}

// 从文本中提取抖音链接
function extractUrlFromText(text) {
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

  // 如果没有匹配到抖音链接，尝试匹配任何 http/https 链接
  const generalMatch = text.match(/(https?:\/\/[^\s\u4e00-\u9fa5]+)/);
  if (generalMatch) {
    return generalMatch[1];
  }

  return null;
}

// 截断 URL 显示
function truncateUrl(url) {
  if (url.length > 50) {
    return url.substring(0, 50) + '...';
  }
  return url;
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    queued: '队列中',
    downloading: '下载中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
  };
  return statusMap[status] || status;
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  // 小于 1 小时
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} 分钟前`;
  }

  // 小于 1 天
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} 小时前`;
  }

  // 大于 1 天
  return date.toLocaleDateString('zh-CN');
}

// 显示 Toast 提示
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
