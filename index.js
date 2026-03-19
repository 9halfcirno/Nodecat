import WorkerManager from './worker.js';

const manager = new WorkerManager();

// manager.on('started', () => console.log('Event: started'));
// manager.on('stopped', (code) => console.log(`Event: stopped with code ${code}`));
// manager.on('error', (err) => console.error('Event: error', err));
let restart = false;
let tmp = {};

manager.on('message', async (msg) => {
	if (msg.cmd === "restart") {
		tmp = msg;
		await manager.stop();
		console.log(`\n\n`)
		restart = true;
		manager.start();

	} else if (msg.cmd === "notice") {
		if (msg.notice === "ok" && restart) {
			manager.worker.postMessage({
				cmd: "onebot:send_msg",
				content: `Nodecat 重载完成！`,
				group: tmp.group,
				user: tmp.user
			})
			restart = false;
			tmp = {};
		}
	}
});

// 启动
manager.start();

// 处理主进程退出，确保 worker 也被终止
process.on('SIGINT', async () => {
	// console.log('Received SIGINT, cleaning up...');
	if (manager.isRunning()) {
		await manager.stop();
	}
	process.exit(0);
});