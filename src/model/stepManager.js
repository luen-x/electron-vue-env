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
		this.updatingDeep++;
		console.log("beginUpdate", this.updatingDeep);
		if (this.updatingDeep === 1) {
			this.curStepChanges = [];
		}
	}
	addChange(change) {
		if (!this.updatingDeep) throw new Error("必须先beginUpdate");
		this.curStepChanges.push(change);
	}
	endUpdate() {
		console.log("endUpdate", this.updatingDeep);
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
		console.log("rollback success");
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

export class UpdateAttrChange extends Change {
	constructor(op) {
		super(op);
		const { model, attrKey, value } = op;
		this.attr = model.attrs.find(att => att.key === attrKey);
		if (!this.attr) throw new Error("attr not found: key= " + attrKey);
		this.model = model;
		this.attrKey = attrKey;
		this.newValue = value;
		this.oldValue = this.attr.value;
	}
	redo() {
		this.attr.value = this.newValue;
		if (this.attrKey === "name") {
			this.model.name = this.newValue;
		}
	}
	undo() {
		// debugger;
		this.attr.value = this.oldValue;
		if (this.attrKey === "name") {
			this.model.name = this.oldValue;
		}
	}
}

export class BoundsChange extends Change {
	constructor(op){
		super(op);
		const { shape, bounds } = op;
		const box = this.shape.box;

		this.shape = shape;
		this.oldBounds = { ...this.shape.bounds };
		this.newBounds = { ...bounds };
		this.oldBoxBounds = {
			boxX: this.shape.boxX,
			boxY: this.shape.boxY,
			boxWidth: this.shape.boxWidth,
			boxHeight: this.shape.boxHeight
		};
		this.newBoxBounds = {
			boxX: bounds.x - box.paddingLeft,
			boxY: bounds.y - box.paddingTop,
			boxWidth: bounds.width + box.paddingLeft + box.paddingRight,
			boxHeight: bounds.height + box.paddingTop + box.paddingBottom
		};
	}
	redo(){
		Object.assign(this.shape.bounds, this.newBounds);
		Object.assign(this.shape.box, this.newBoxBounds);
	
	}
	undo(){
		Object.assign(this.shape.bounds, this.oldBounds);
		Object.assign(this.shape.box, this.this.oldBoxBounds);
	}
}
