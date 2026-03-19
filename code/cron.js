import schedule from 'node-schedule'
import onExit from "./on_exit.js"

const jobs = new Set();

class Cron {
	static Job = class Job {
		/**
		 * 创建一个定时任务
		 * @param {string|Date} cron - cron 表达式或 Date 对象
		 * @param {Function} callback - 任务执行的回调函数
		 * @param {Object} [options] - 配置项
		 * @param {boolean} [options.once=false] - 是否只执行一次
		 */
		constructor(cron, callback, options = {}) {
			// console.log(`[Cron] 已设置定时任务 ${cron}`)
			this.cron = cron;
			this.callback = callback;
			this.options = options;
			this.job = null;
			jobs.add(this);
			this.schedule();
		}

		// 调度任务
		schedule() {
			const {
				once = false
			} = this.options;

			// 如果 once 为 true，则包装回调，执行后自动取消任务
			const wrappedCallback = once ?
				() => {
					this.callback();
					if (this.job) {
						this.job.cancel();
						this.job = null;
					}
				} :
				this.callback;

			this.job = schedule.scheduleJob(this.cron, wrappedCallback);
		}

		// 手动取消任务
		cancel() {
			if (this.job) {
				this.job.cancel();
				this.job = null;
				jobs.delete(this)
			}
		}
	};
}

onExit(() => {
	console.log(`[Cron] 正在取消所有定时任务`)
	jobs.forEach(j => j.cancel());
})

export default Cron;