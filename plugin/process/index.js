import os from "os";

export default {
	id: "test",
	type: "function",
	main(cat) {
		/**
		 * 获取当前进程的性能信息，返回格式化的多行字符串（中文）
		 * @returns {string} 包含各项性能指标的中文文本
		 */
		function getProcessPerformanceInfo() {
			const pid = process.pid;
			const uptime = process.uptime(); // 秒
			const memUsage = process.memoryUsage();
			const cpuUsage = process.cpuUsage(); // 微秒
			const cpuCores = os.cpus().length;
			const loadAvg = os.loadavg(); // 仅在类Unix系统有效，Windows返回[0,0,0]

			// 字节数转换为可读格式 (B, KB, MB, GB)
			const formatBytes = (bytes) => {
				if (bytes === 0) return '0 B';
				const units = ['B', 'KB', 'MB', 'GB'];
				const i = Math.floor(Math.log(bytes) / Math.log(1024));
				return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
			};

			// 秒数转换为可读格式 (毫秒, 秒, 分钟)
			const formatSeconds = (seconds) => {
				if (seconds < 0.001) return '< 1 毫秒';
				if (seconds < 1) return (seconds * 1000).toFixed(0) + ' 毫秒';
				if (seconds < 60) return seconds.toFixed(2) + ' 秒';
				const minutes = Math.floor(seconds / 60);
				const remainingSeconds = (seconds % 60).toFixed(0);
				return minutes + ' 分 ' + remainingSeconds + ' 秒';
			};

			// 内存信息
			const memStr = `常驻内存: ${formatBytes(memUsage.rss)}, ` +
				`堆总量: ${formatBytes(memUsage.heapTotal)}, ` +
				`已用堆: ${formatBytes(memUsage.heapUsed)}, ` +
				`外部内存: ${formatBytes(memUsage.external || 0)}`; // external 在 Node < 6 可能不存在

			// CPU 耗时（累积值）
			const cpuStr = `用户态: ${formatSeconds(cpuUsage.user / 1e6)}, ` +
				`系统态: ${formatSeconds(cpuUsage.system / 1e6)}`;

			// 系统负载平均值
			const loadStr = `${loadAvg[0].toFixed(2)}, ${loadAvg[1].toFixed(2)}, ${loadAvg[2].toFixed(2)} (1, 5, 15 分钟平均)`;

			// 组装最终字符串
			return [
				`进程ID: ${pid}`,
				`运行时间: ${formatSeconds(uptime)}`,
				`内存使用: ${memStr}`,
				`CPU耗时: ${cpuStr}`,
				`CPU核心数: ${cpuCores}`,
				`系统负载: ${loadStr}`
			].join('\n');
		}

		cat.onCommand("process").then(msg => {
			msg.reply(getProcessPerformanceInfo())
		})
	}
}