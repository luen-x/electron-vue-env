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
			this.curStepChanges = [];
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
	constructor(op) {
		this.id = getUid();
		this.userId = app.userId;
		this.onlyLocal = op.onlyLocal || false; // onlyLocal表示这个change只会在本地生效,不更改model和shape,不会修改服务器上的模型，不会影响其他用户操作的change
	}
	undo() {}
	redo() {}
}

// export class CustomChange extends Change {
// 	constructor(op){
// 		super(op);
// 		this.onlyLocal = true;
// 		this.undo = op.undo;
// 		this.redo = op.redo;
// 	}
// 	// undo(){

// 	// }
// }
export class OpenDiagramChange extends Change{
	constructor(op){
		super(op);
		this.diagramId = op.diagramId;
		this.onlyLocal = true;
		// this.type = op.type || "open"; // open / remove 
	}
	redo(){
		app.$bus.emit("diagram-open", this.diagramId);
	}
	undo(){
		app.$bus.emit("diagram-remove", this.diagramId);
	}
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
				? op.parent.children.length
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
export class ObjectChange extends Change {
	constructor(op){
		super(op);
		const { obj, key, val } = op;
		this.obj = obj;
		this.key = key;
		this.oldVal = obj[key];
		this.newVal = val;

	}
	redo(){
		this.obj[this.key] = this.newVal;
	}
	undo(){
		this.obj[this.key] = this.oldVal;
	}
}

export class ArrayInsertChange extends Change {
	constructor(op ) {
		super(op);
		const { arr, val, index = arr.length } = op;
		this.arr = arr;
		this.val = val;
		this.index = index;
			
	}
	redo() {
		this.arr.splice(this.index, 0, this.val);
	}
	undo() {
		this.arr.splice(this.index, 1);
	}
	
}
export class ArrayRemoveChange extends Change {
	constructor(op ) {
		super(op);
		const { arr, val } = op;
		this.arr = arr;
		this.val = val;
		this.index = arr.indexOf(val);
			
	}
	redo() {
		if (this.index === -1) return;
		this.arr.splice(this.index, 1);
	}
	undo() {
		if (this.index === -1) return;
		this.arr.splice(this.index, 0, this.val);
	}
}
