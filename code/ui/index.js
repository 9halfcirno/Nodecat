// index.js - 主入口文件
import blessed from 'blessed';

// 创建屏幕对象
const screen = blessed.screen({
  smartCSR: true,
  title: 'Bot Control Panel',
  fullUnicode: true
});

// 配置信息
const NodecatConfig = {
  Bot: {
    QQ: '123456789',
    name: 'Nodecat Bot'
  }
};

// 指令回调数组
let commandCallbacks = [];

// 创建顶部信息栏
const infoBox = blessed.box({
  top: 0,
  left: 0,
  width: '100%',
  height: 3,
  content: `QQ: ${NodecatConfig.Bot.QQ} | Name: ${NodecatConfig.Bot.name}`,
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'blue',
    border: {
      fg: '#ffffff'
    }
  }
});

// 创建中间日志显示区域（使用滚动列表模拟日志）
const logList = blessed.list({
  top: 3,
  left: 0,
  width: '100%',
  height: '100%-6', // 减去顶部和底部的高度
  keys: true,
  mouse: true,
  scrollable: true,
  scrollbar: {
    ch: ' ',
    style: {
      bg: 'yellow'
    }
  },
  alwaysScroll: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'green',
    bg: 'black',
    border: {
      fg: '#ffffff'
    },
    selected: {
      bg: 'blue',
      fg: 'white'
    }
  }
});

// 创建底部指令输入框
const commandInput = blessed.textbox({
  bottom: 0,
  left: 0,
  width: '100%',
  height: 3,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: '#ffffff'
    },
    focus: {
      bg: 'gray',
      fg: 'white'
    }
  },
  inputOnFocus: true
});

// 添加组件到屏幕
screen.append(infoBox);
screen.append(logList);
screen.append(commandInput);

// 存储日志条目的数组
const logEntries = [];
const MAX_LOG_ENTRIES = 1000;

// 添加日志到列表的函数
function addLogEntry(message) {
  // 解析标签
  const text = blessed.helpers.parseTags(message);
  
  // 添加到数组
  logEntries.push(text);
  
  // 限制日志条数
  if (logEntries.length > MAX_LOG_ENTRIES) {
    logEntries.shift();
  }
  
  // 更新列表
  logList.setItems(logEntries);
  
  // 滚动到底部
  logList.select(logEntries.length - 1);
  logList.scrollTo(logEntries.length - 1);
}

// 指令框对象
const commandBox = {
  // 注册指令回调
  onCommand: (callback) => {
    if (typeof callback === 'function') {
      commandCallbacks.push(callback);
    }
  },
  
  // 清空指令框
  clear: () => {
    commandInput.clearValue();
    screen.render();
  },
  
  // 设置指令框内容
  setValue: (text) => {
    commandInput.setValue(text);
    screen.render();
  },
  
  // 获取指令框内容
  getValue: () => {
    return commandInput.getValue();
  },
  
  // 聚焦指令框
  focus: () => {
    commandInput.focus();
    screen.render();
  },
  
  // 输出日志到中间区域
  log: (message) => {
    const timestamp = new Date().toLocaleTimeString();
    addLogEntry(`{gray-fg}[${timestamp}]{/gray-fg} ${message}`);
    screen.render();
  },
  
  // 输出错误日志
  error: (message) => {
    const timestamp = new Date().toLocaleTimeString();
    addLogEntry(`{gray-fg}[${timestamp}]{/gray-fg} {red-fg}ERROR:{/red-fg} ${message}`);
    screen.render();
  },
  
  // 输出成功日志
  success: (message) => {
    const timestamp = new Date().toLocaleTimeString();
    addLogEntry(`{gray-fg}[${timestamp}]{/gray-fg} {green-fg}SUCCESS:{/green-fg} ${message}`);
    screen.render();
  },
  
  // 输出警告日志
  warn: (message) => {
    const timestamp = new Date().toLocaleTimeString();
    addLogEntry(`{gray-fg}[${timestamp}]{/gray-fg} {yellow-fg}WARNING:{/yellow-fg} ${message}`);
    screen.render();
  },
  
  // 清空日志
  clearLog: () => {
    logEntries.length = 0;
    logList.clearItems();
    screen.render();
  },
  
  // 获取日志条目数量
  getLogCount: () => {
    return logEntries.length;
  }
};

// 处理指令提交
commandInput.on('submit', (value) => {
  commandBox.log(`> ${value}`);
  
  // 触发所有注册的回调
  commandCallbacks.forEach(callback => {
    try {
      callback(value);
    } catch (error) {
      commandBox.error(`Command callback error: ${error.message}`);
      console.error(error);
    }
  });
  
  // 清空输入框并重新聚焦
  commandInput.clearValue();
  commandInput.focus();
  screen.render();
});

// 处理输入框取消事件
commandInput.on('cancel', () => {
  commandInput.clearValue();
  screen.render();
});

// 设置全局键盘事件
screen.key(['escape', 'q', 'C-c'], () => {
  commandBox.log('Exiting...');
  setTimeout(() => {
    process.exit(0);
  }, 100);
});

// 按tab键聚焦到输入框
screen.key(['tab'], () => {
  commandInput.focus();
  screen.render();
});

// 按Ctrl+L清空日志
screen.key(['C-l'], () => {
  commandBox.clearLog();
  commandBox.log('Log cleared');
});

// 初始化日志列表
addLogEntry(`{cyan-fg}=== Bot Control Panel ==={/cyan-fg}`);
addLogEntry(`Bot: ${NodecatConfig.Bot.name} (QQ: ${NodecatConfig.Bot.QQ})`);
addLogEntry('Type commands in the input box below.');
addLogEntry('Press Tab to focus input, Ctrl+L to clear log, ESC to exit.');

// 初始渲染
screen.render();

// 自动聚焦到输入框
setTimeout(() => {
  commandInput.focus();
  screen.render();
}, 100);

// 导出指令框对象
export default commandBox;