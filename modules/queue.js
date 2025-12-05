class Queue {
	constructor(array = [], handler) {
		this.isHandle = false;
		this.queueArray = [...array]; // 使用扩展运算符创建副本，避免修改原数组
		this.handler = handler; // 保存处理函数

		// 如果有初始数组且有处理函数，自动开始处理
		if (array.length > 0 && handler && typeof handler === 'function') {
			this.handleNext();
		}
	}

	// 处理下一个元素
	async handleNext() {
		if (this.isHandle || this.queueArray.length === 0) {
			return;
		}

		this.isHandle = true;

		try {
			const item = this.queueArray[0];
			if (this.handler && typeof this.handler === 'function') {
				await this.handler(item);
			}
			this.shift(); // 处理成功后移除
		} catch (error) {
			console.error('Queue handle error:', error);
			// 处理失败时不移除，可以重试
			this.shift();
		} finally {
			this.isHandle = false;

			// 如果队列中还有元素，继续处理下一个
			if (this.queueArray.length > 0) {
				this.handleNext();
			}
		}
	}

	// 添加一个或多个元素到队列
	add(...items) {
		this.queueArray.push(...items);
		// 如果没有在处理中，开始处理
		if (!this.isHandle) {
			this.handleNext();
		}

		return this.length;
	}

	// 移除第一个元素并返回
	shift() {
		return this.queueArray.shift();
	}

	// 清空队列
	clear() {
		this.queueArray = [];
		this.isHandle = false;
	}

	// 转为数组
	toArray() {
		return [...this.queueArray]; // 返回副本
	}

	// 获取当前未处理的数量
	get length() {
		return this.queueArray.length;
	}

	// 设置长度
	set length(newLength) {
		if (newLength < this.queueArray.length) {
			this.queueArray.length = newLength;
			// 如果截断后队列空了，重置处理状态
			if (newLength === 0) {
				this.isHandle = false;
			}
		}
		// 如果新长度大于当前长度，不做任何操作
	}

	// 静态方法：从数组创建队列实例
	static fromArray(array, handler) {
		return new Queue(array, handler);
	}

	// 可选：添加一些有用的方法
	isEmpty() {
		return this.queueArray.length === 0;
	}

	// 查看第一个元素但不移除
	peek() {
		return this.queueArray[0];
	}

	// 获取处理状态
	get isProcessing() {
		return this.isHandle;
	}
}
module.exports = Queue;