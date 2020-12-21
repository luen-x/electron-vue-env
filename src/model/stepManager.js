const { getUid } = require("../util/common");

// 计步器，计步器中的steps代表每一步用户操作，每一用户操作是由一个或多个change实例组成的，
// 每个change实例都必须实现redo，和undo
class Step {
	constructor(changes) {
		this.id = getUid();
		this.changes = changes || [];
	}
}

export class StepManager {
	constructor() {
		this.steps = [];
		this.curStepChanges = [];
		this.updatingDeep = 0;
		this.curStepIndex = -1; // 代表当前所在的步骤序号
	}
	beginUpdate() {
		console.log("begin");
		this.updatingDeep++;
		if (this.updatingDeep === 1) {
			this.curStepChanges = [];
		}
	}
	addChange(change) {
		if (!this.updatingDeep) throw new Error("必须先beginUpdate");
		this.curStepChanges.push(change);
	}
	endUpdate() {
		console.log("end");
		this.updatingDeep--;
		if (this.updatingDeep === 0) {
			const step = new Step(this.curStepChanges);
			this.steps.length = this.curStepIndex + 1;
			this.steps.push(step);
			this.curStepIndex++;
		}
	}
	rollBack() {
		for (let i = this.curStepChanges.length - 1; i >= 0; i--) {
			const change = this.curStepChanges[i];
			change.undo();
		}
		this.curStepChanges = [];
		this.updatingDeep = 0;
	}
	undo() {
		if (this.curStepIndex === -1) return;
		const step = this.steps[this.curStepIndex];
		if (!step) return;
		const changes = step.changes;
		for (let i = changes.length - 1; i >= 0; i--) {
			changes[i].undo();
		}
		this.curStepIndex--;
	}
	redo() {
		if (this.curStepIndex === this.steps.length - 1) return;
		const step = this.steps[this.curStepIndex + 1];
		if (!step) return;
		const changes = step.changes;
		changes.forEach(change => {
			change.redo();
		});
		this.curStepIndex++;
	}
}
class Change {
	constructor() {
		this.id = getUid();
	}
	undo() {}
	redo() {}
}
export class InsertPoolChange extends Change {
	/**
	 *
	 * @param {*} op pool,item
	 */
	constructor(op) {
		super(op);
		this.pool = op.pool;
		this.item = op.item;
	}
	redo() {
		this.pool[this.item.id] = this.item;
	}
	undo() {
		delete this.pool[this.item.id];
	}
}
export class RemovePoolChange extends Change {
	constructor(op) {
		super(op);
		this.pool = op.pool;
		this.item = op.item;
	}
	undo() {
		this.pool[this.item.id] = this.item;
	}
	redo() {
		delete this.pool[this.item.id];
	}
}
export class InsertTreeNodeChange extends Change {
	constructor(op) {
		super(op);
		this.parentNode = op.parent;
		this.node = op.node;
		this.index =
			op.index === undefined
				? op.parent.children.indexOf(op.node)
				: op.index;
	}
	redo() {
		this.parentNode.children.splice(this.index, 0, this.node);
	}
	undo() {
		this.parentNode.children.splice(this.index, 1);
	}
}
export class RemoveTreeNodeChange extends Change {
	/**
	 *
	 * @param {*} op
	 */
	constructor(op) {
		super(op);
		this.parentNode = op.parent;
		this.node = op.node;
		this.index = op.index;
	}
	undo() {
		this.parentNode.children.splice(this.index, 0, this.node);
	}
	redo() {
		this.parentNode.children.splice(this.index, 1);
	}
}
