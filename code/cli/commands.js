// example.js - 使用示例
import commandBox from './index.js';

// 注册指令处理回调
commandBox.onCommand((command) => {
  const cmd = command.trim().toLowerCase();
  
  switch (cmd) {
    case 'help':
    case '?':
      commandBox.log('Available commands:');
      commandBox.log('  help/?    - Show this help message');
      commandBox.log('  status    - Show bot status');
      commandBox.log('  clear     - Clear console log');
      commandBox.log('  test      - Test command');
      commandBox.log('  count     - Show log count');
      commandBox.log('  echo <text> - Echo text back');
      break;
      
    case 'status':
      commandBox.success('Bot is running normally');
      commandBox.log(`Uptime: ${process.uptime().toFixed(2)} seconds`);
      commandBox.log(`Log entries: ${commandBox.getLogCount()}`);
      break;
      
    case 'clear':
      commandBox.clearLog();
      commandBox.success('Log cleared');
      break;
      
    case 'test':
      for (let i = 1; i <= 5; i++) {
        commandBox.log(`Test message ${i}`);
      }
      commandBox.success('Test command executed successfully');
      break;
      
    case 'count':
      commandBox.log(`Current log entries: ${commandBox.getLogCount()}`);
      break;
      
    case '':
      // 空命令，什么都不做
      break;
      
    default:
      if (cmd.startsWith('echo ')) {
        const text = command.substring(5);
        commandBox.log(`Echo: ${text}`);
      } else {
        commandBox.error(`Unknown command: ${command}`);
        commandBox.log('Type "help" for available commands');
      }
  }
});

// 模拟一些初始输出
setTimeout(() => {
  commandBox.success('Bot initialized successfully');
  commandBox.log('System ready');
  commandBox.warn('No plugins loaded');
}, 500);