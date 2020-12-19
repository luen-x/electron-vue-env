const { getUid } = require("../util/common");

// 元元模型定义，根据元元模型定义可以创建元模型，相当于模型的模型,元元模型定义实际上是json配置（op），此处只是定义json格式
class ModelDefine {
	constructor(op){
		this.id = op.id;
		this.typeName = op.typeName;
		this.parentModelDefineId = op.parentModelDefineId;
		this.attrs = op.attrs;
		this.allowedNestModelDefineIds = op.allowedNestModelDefineIds;
		this.icon = op.icon;
		this.isRelation = op.isRelation;
		this.isDiagram = op.isDiagram;

	}
}
// 元模型，元模型可以创建模型实例，op是保存的json数据,也就是model.getOption返回的数据
// children属性表达了模型之间的包含关系（除了relationGroup），这里是为了树渲染能够更快才放到的children里，除了relationGroup之外，所有children关系都应对应一条类型为contain的Relation
class Model {
	constructor(op) {
		this.id = op.id;
		this.paarentId = op.parentId;
		this.modelDefineId = op.modelDefineId;
		this.name = op.name;
		this.displayName = op.displayName;
		this.attrs = op.attrs;
		this.sourceId = op.sourceId;// 如果isRelation,则有sourceId和targetId
		this.targetId = op.targetId;
		this.diagramId = op.diagramId; // 如果是isDiagram,则会有diagramId,diagramId就是shape.id,他是model和shape之间的桥梁，双击画布元素时会去shapePool中
		// 查询是否有diagramId对应的shape,如果有则打开，如果没有则创建画布shape，然后打开
		this.children = [];
		this.shapeIds = [];
	}
	getOption(){
		return {
			id: this.id,
			parentId: this.parentId,
			modelDefineId: this.modelDefineId,
			name: this.name,
			displayName: this.displayName,
			childIds: this.children.map(i => i.id),
			attrs: this.attrs,
			sourceId: this.sourceId,
			targetId: this.targetId,
			diagramId: this.diagramId,
			shapeIds: this.shapeIds
		};
	}
	updateChildren(modelPool){
		this.children = op.childIds ? op.childIds.map(id => modelPool[id]) : [];

	}
	
}
// relationGroup是一种特殊的Model,是一个虚的模型，除了id，children之外其他属性均为空，专门用来容纳relation，relation的sourceId决定了该relation存储于那个模型的relationGroup下
// 
class RelationGroup extends Model{
	constructor(op){
		super(op);
		this.displayName = "关系";
		this.isRelationGroup = true;

	}
}

// 元图形，根据元图形可以创建图形实例，需要根据模型的typeName以及parentModelDefineId去box配置中找到对应的box配置，准备好op后才可以new Shape
class Shape {
	constructor(op) {
		this.id = op.id;
		this.parentId = op.parentId;
		this.modelId = op.modelId;
		this.box = op.box;
		this.sourceId = op.sourceId;
		this.targetId = op.targetId;
		this.children = [];
	}
	getOption(){
		return {
			id: op.id,
			parentId: op.parentId,
			modelId: op.modelId,
			box: op.box,
			isEdge: op.isEdge,
			sourceId: op.sourceId,
			targetId: op.targetId
		};

	}
	updateChildren(shapePool){
		this.children = op.childIds ? op.childIds.map(id => shapePool[id]) : [];

	}
}
// 工厂，负责对元模型，模型，图形的管理，包括初始化，创建，插入，更新，移动，删除
// op是存储的3种option集合
class Factory {
	constructor(op){
		this.modelDefinePool = op.modelDefinePool || {};
		this.modelPool = {};
		this.shapePool = {};
		Object.values(op.modelOptionPool || {}).forEach(option => {
			this.modelPool[option.id] = new Model(option);

		});
		Object.values(this.modelPool || {}).forEach(model => {
			model.updateChildren(this.modelPool);

		});
		Object.values(op.shapeOptionPool || {}).forEach(option => {
			this.shapePool[option.id] = new Shape(option);

		});
		Object.values(this.shapePool || {}).forEach(shape => {
			model.updateChildren(this.shapePool);

		});
	}
	createModelDefine(){

	}

	updateModelDefine(){

	}
	removeModelDefine(){

	}

	createModel(op){
		const { modelDefineId } = op;
		const modelDefine = this.modelDefinePool[modelDefineId];

		const model = new Model(op);
		const parentModel = this.modelPool[model.parentId];
		this.modelPool[model.id] = model;
		if (modelDefine.isEdge){
			if (parentModel.children[0] && parentModel.children[0].isRelationGroup){
				parentModel.children[0].children.push(model);
			} else {
				const relationGroup = new RelationGroup({ id: getUid() });
				relationGroup.children.push(model);
				parentModel.children.unshift(relationGroup);

			}

		} else {
			parentModel.children.push(model);

		}

	}

	updateModel(){

	}
	moveModel(){

	}
	removeModel(id){
		const toRemoveModel = this.modelPool[id];
		if (!toRemoveModel) return;
		
		if (toRemoveModel.children){
			toRemoveModel.children.forEach(child => {
				this.removeModel(child.id);
			});
		}
		toRemoveModel.shapeIds.forEach(shapeId => {
			this.removeShape(shapeId);
		});
		delete this.modelPool[id];

	}

	createShape(){

	}

	updateShape(){

	}
	moveShape(){
		
	}
	removeShape(){

	}

}

// 模型的创建，修改，删除，移动，都必须通过Factory提供的方法进行统一处理，Factory会在执行逻辑的同时维护pool