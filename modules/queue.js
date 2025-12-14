class Queue {
	constructor(array = [], handler) {
		this.isHandle = false;
		this.queueArray = [...array];
		this.handler = handler;

		if (array.length > 0 && typeof handler === 'function') {
			this._scheduleNext();
		}
	}

	// 使用微任务调度下一次处理，避免递归调用导致栈溢出
	_scheduleNext() {
		if (!this.isHandle && this.queueArray.length > 0) {
			Promise.resolve().then(() => this.handleNext());
		}
	}

	async handleNext() {
		if (this.isHandle || this.queueArray.length === 0) return;

		this.isHandle = true;

		try {
			const item = this.queueArray[0];
			if (typeof this.handler === 'function') {
				await this.handler(item);
			}
			this.shift();
		} catch (err) {
			console.error('Queue handle error:', err);
			this.shift(); // 出错也移除，避免卡死
		} finally {
			this.isHandle = false;
			this._scheduleNext(); // 改成调度而不是递归
		}
	}

	add(...items) {
		this.queueArray.push(...items);
		this._scheduleNext();
		return this.length;
	}

	shift() {
		return this.queueArray.shift();
	}

	clear() {
		this.queueArray = [];
		this.isHandle = false;
	}

	toArray() {
		return [...this.queueArray];
	}

	get length() {
		return this.queueArray.length;
	}

	set length(n) {
		if (n < this.queueArray.length) {
			this.queueArray.length = n;
			if (n === 0) this.isHandle = false;
		}
	}

	static fromArray(array, handler) {
		return new Queue(array, handler);
	}

	isEmpty() {
		return this.queueArray.length === 0;
	}

	peek() {
		return this.queueArray[0];
	}

	get isProcessing() {
		return this.isHandle;
	}
}

module.exports = Queue;