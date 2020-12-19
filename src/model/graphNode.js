class GraphNode {
	constructor(op) {
		this.id = op.id;
		this.type = op.type;
		this.stType = op.stType;
		this.name = op.name;
		this.displayName = op.displayName;
		this.children = [];
		this.icon = op.icon;
	}
}
class RelationNode extends GraphNode {
	constructor(op) {
		super(op);
		this.sourceId = op.sourceId;
		this.targetId = op.targetId;
	}
}
class Shape {
	constructor(op) {
		this.id = op.id;
		this.box = op.box;
		this.isEdge = op.isEdge;
		this.style = op.style;
		this.isIcon = op.isIcon;
	}
}

const instancePool = {};
