import {
	Worker
} from 'worker_threads';
import path from 'path';
import EventEmitter from 'events';

class WorkerManager extends EventEmitter {
	/**
	 * @param {string} scriptPath - 工作线程脚本的路径，默认为 './boot/main.js'
	 */
	constructor(scriptPath = './boot/main.js') {
		super();
		this.scriptPath = path.resolve(scriptPath);
		this.worker = null;
	}

	/**
	 * 启动工作线程
	 * @throws 如果已有运行中的线程则抛出错误
	 */
	start() {
		if (this.worker) {
			throw new Error('Worker is already running');
		}

		this.worker = new Worker(this.scriptPath);

		// 监听 worker 事件
		this.worker.on('exit', (code) => {
			this.emit('exit', code);
			this.worker = null; // 清理引用
		});

		this.worker.on('error', (err) => {
			this.emit('error', err);
		});

		this.worker.on('message', (msg) => {
			this.emit('message', msg);
		});

		this.emit('started');
		// console.log(`Worker started: ${this.scriptPath}`);
	}

	/**
	 * 停止工作线程（优雅停止）
	 * @param {number} timeout - 等待正常退出的超时时间（毫秒），默认 5000
	 * @returns {Promise<void>}
	 */
	stop(timeout = 5000) {
		return new Promise((resolve, reject) => {
			if (!this.worker) {
				return resolve(); // 已经停止
			}

			let forceTerminateTimer = null;
			const workerRef = this.worker;

			// 监听 Worker 正常退出
			const onExit = (code) => {
				if (forceTerminateTimer) clearTimeout(forceTerminateTimer);
				this.worker = null;
				this.emit('stopped', code);
				resolve();
			};

			workerRef.once('exit', onExit);

			// 发送关闭消息
			try {
				workerRef.postMessage({
					cmd: 'shutdown'
				});
			} catch (err) {
				// 如果发送失败（例如 Worker 已退出），移除监听并 reject
				workerRef.removeListener('exit', onExit);
				return reject(err);
			}

			// 设置超时强制终止
			forceTerminateTimer = setTimeout(() => {
				// 移除之前的 exit 监听，避免重复 resolve
				workerRef.removeListener('exit', onExit);
				// 强制终止
				workerRef.terminate((err) => {
					if (err) reject(err);
					else {
						this.worker = null;
						this.emit('stopped', 'forced');
						resolve();
					}
				});
			}, timeout);
		});
	}

	/**
	 * 重启工作线程（先停止再启动）
	 * @returns {Promise<void>}
	 */
	async restart() {
		await this.stop();
		this.start();
	}

	/**
	 * 检查工作线程是否正在运行
	 */
	isRunning() {
		return this.worker !== null;
	}
}

export default WorkerManager;