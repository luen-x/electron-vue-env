import { getUid } from "../util/common";
import modelDefineJson from "./modelDefine.json";
import shapeDefineJson from "./shapeDefine.json";
import {
	StepManager,
	InsertPoolChange,
	RemovePoolChange,
	InsertTreeNodeChange,
	RemoveTreeNodeChange,
	UpdateAttrChange,
	BoundsChange,
	ArrayRemoveChange,
	ObjectChange,
	BoxBoundsChange
} from "./stepManager";
import { cloneDeep } from "lodash";
import graphUtil from "@/components/graphEditor/graph/graphUtil";

// 元元模型定义，根据元元模型定义可以创建元模型，相当于模型的模型,元元模型定义实际上是json配置（op），此处只是定义json格式
class ModelDefine {
	constructor(op) {
		this.id = op.id;
		this.typeName = op.typeName;
		this.parentModelDefineId = op.parentModelDefineId;
		this.attrs = op.attrs;
		this.allowedNestModelDefineIds = op.allowedNestModelDefineIds;
		this.icon = op.icon;
		this.isRelation = op.isRelation;
		this.isDiagram = op.isDiagram;
		this.shapeDefineId = op.shapeDefineId; // 直接通过模型创建图形时（创建画布的shape），对应的ShapeDefineId

	}
}
// 元模型，元模型可以创建模型实例，op是保存的json数据,也就是model.getOption返回的数据
// children属性表达了模型之间的包含关系（除了relationGroup），这里是为了树渲染能够更快才放到的children里，除了relationGroup之外，所有children关系都应对应一条类型为contain的Relation
/**
 * op
 {
 	id:getUid(),
  parentId:'',
  modelDefineId:'',
  name:'',
  displayName:'',
  attrs:'',

  sourceId:'',
  targetId:''
  
  }
 */
class Model {
	constructor(op, factory) {
		this.factory = factory;
		this.stepManager = factory.stepManager;
		this.id = op.id;
		this.parentId = op.parentId; // 关系没有parentId
		this.modelDefineId = op.modelDefineId;
		this.name = op.name;
		this.displayName = op.displayName;
		this.attrs = op.attrs;
		this.sourceId = op.sourceId; // 如果isRelation,则有sourceId和targetId
		this.targetId = op.targetId;
		this.diagramShapeId = op.diagramShapeId; // 如果是isDiagram,则会有diagramShapeId,diagramShapeId就是shape.id,他是model和shape之间的桥梁，双击画布元素时会去shapePool中
		// 查询是否有diagramShapeId对应的shape,如果有则打开，如果没有则创建画布shape，然后打开
		this.children = [];
		this.shapeIds = [];
		this.childIds = op.childIds;
		this.inEditName = false;
	}
	getOption() {
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

			diagramShapeId: this.diagramShapeId,
			shapeIds: this.shapeIds,
			shapeDefineId: this.shapeDefineId
		};
	}
	updateChildren(modelPool) {
		this.children = this.childIds
			? this.childIds.map(id => modelPool[id])
			: [];
	}
	addChild(model, index) {
		if (this.children.includes(model)) return;
		if (index === undefined) index = this.children.length;
		const change = new InsertTreeNodeChange({
			parent: this,
			node: model,
			index
		});
		change.redo();
		this.stepManager.addChange(change);
	}
	removeChild(model) {
		const index = this.children.indexOf(model);
		if (index === -1) return;
		const change = new RemoveTreeNodeChange({
			parent: this,
			node: model,
			index
		});
		change.redo();
		this.stepManager.addChange(change);
	}
	updateAttr(attrKey, value) {

		// model[attrKey] = value;

		const change = new UpdateAttrChange({ model: this, attrKey, value });
		change.redo();
		this.stepManager.addChange(change);
	}
	getModelDefine(){
		return this.factory.modelDefinePool.get(this.modelDefineId);
	}
	getParentModel(){
		return this.factory.modelPool.get( this.parentId);
	}
	getName(){
		return this.name;

	}
	getKeyword(){
		return this.getModelDefine().typeName;

	}
	getDiagramName(){
		const parentShapeModel = this.factory.modelPool.get(this.parentId);
		const modelDefine = this.factory.modelDefinePool.get(this.modelDefineId);
		return `${modelDefine.shortTypeName || "shortName"}    ;[ ${modelDefine.typeName} ] ;${parentShapeModel.name} [${this.name}]`;
	}
}
class Relation extends Model {
	constructor(op, factory) {
		super(op, factory);
		this.sourceId = op.sourceId; // 如果isRelation,则有sourceId和targetId
		this.targetId = op.targetId;
	}
}
// relationGroup是一种特殊的Model,是一个虚的模型，除了id，children之外其他属性均为空，专门用来容纳relation，relation的sourceId决定了该relation存储于那个模型的relationGroup下
//
class RelationGroup extends Model {
	constructor(op, factory) {
		super(op, factory);
		this.displayName = "关系";
	}
}

// 元图形，根据元图形可以创建图形实例，需要根据模型的typeName以及parentModelDefineId去box配置中找到对应的box配置，准备好op后才可以new Shape
/**
 {
	 id:getUid(),
parentId:'',
modelId:'',

 }
 */
class Shape {
	constructor(op, factory) {
		this.factory = factory;
		this.stepManager = factory.stepManager;
		this.id = op.id;
		this.parentId = op.parentId;
		this.modelId = op.modelId;
		this.shapeDefineId = op.shapeDefineId;
		this.box = op.box;
		this.bounds = op.bounds || {};

		this.sourceId = op.sourceId;
		this.targetId = op.targetId;
		this.childIds = op.childIds;
		this.children = [];
		this.offset = op.offset;
		this.waypoints = op.waypoints;
		this.sourcePoint = op.sourcePoint;
		this.targetPoint = op.targetPoint;
	}
	getOption() {
		return {
			id: this.id,
			parentId: this.parentId,
			modelId: this.modelId,
			shapeDefineId: this.shapeDefineId,
			box: this.box,
			sourceId: this.sourceId,
			targetId: this.targetId,
			childIds: this.children.map(child => child.id),
			offset: this.offset,
			waypoints: this.waypoints,
			sourcePoint: this.sourcePoint,
			targetPoint: this.targetPoint,
			bounds: this.bounds || {}
		};
	}
	updateChildren() {
		this.children = this.childIds
			? this.childIds.map(id => this.factory.shapePool.get(id))
			: [];
	}
	isEdge(){
		return this.box.position === "edge";
	}
	getModel(){
		return this.factory.modelPool.get(this.modelId);
	}
	getParent(){
		return this.factory.shapePool.get(this.parentId);
	}
	getText(){
		const shapeDefine = this.factory.shapeDefinePool.get(this.shapeDefineId);
		if (!shapeDefine.bindGetTextMethod) return "";
		const model = this.getModel();
		if (!model[shapeDefine.bindGetTextMethod]) return "";
		return model[shapeDefine.bindGetTextMethod]() || "";
		
	}

	addChild(shape, index){
		if (this.children.includes(shape)) return;
		if (index === undefined) index = this.children.length;
		const change = new InsertTreeNodeChange({ parent: this, node: shape, index, freshGraph: true });
		change.redo();
		this.stepManager.addChange(change);

	}
	removeChild(shape) {
		const index = this.children.indexOf(shape);
		if (index === -1) return;
		const change = new RemoveTreeNodeChange({
			parent: this,
			node: shape,
			index,
			freshGraph: true
		});
		change.redo();
		this.stepManager.addChange(change);
	}
	updateBounds(bounds){
		if (
			(bounds.x === undefined || bounds.x === this.bounds.x) && 
			(bounds.y === undefined || bounds.y === this.bounds.y) && 
			(bounds.width === undefined || bounds.width === this.bounds.width) && 
			(bounds.height === undefined || bounds.height === this.bounds.height)
		) {
			return;
		}
		const change = new BoundsChange({ shape: this, bounds: { ...this.bounds, ...bounds } });
		change.redo();
		this.stepManager.addChange(change);

	}
	updateBoxBounds(boxBounds){
		const change = new BoxBoundsChange({ shape: this, boxBounds });
		change.redo();
		this.stepManager.addChange(change);

	}
	updateOffset(){

	}
	updateWaypoints(){

	}
	updateSource(){

	}
	updateTarget(){

	}
	updateSourcePoint(){

	}
	updateTargetPoint(){

	}
}

class Pool {
	constructor(factory) {
		this.map = {};
		this.stepManager = factory.stepManager;
		this.factory = factory;
	}
	get(id) {
		return this.map[id];
	}
	add(model) {
		if (this.map[model.id]) return;
		const change = new InsertPoolChange({ pool: this.map, item: model });
		change.redo();
		this.stepManager.addChange(change);
	}
	remove(id) {
		if (this.map[id] === undefined) return;
		const change = new RemovePoolChange({
			pool: this.map,
			item: this.map[id]
		});
		change.redo();
		this.stepManager.addChange(change);
	}
}
// 工厂，负责对元模型，模型，图形的管理，包括初始化，创建，插入，更新，移动，删除
// op是存储的3种option集合
export class Factory {
	constructor(op) {
		this.projectInfo = op.projectInfo;
		this.stepManager = new StepManager();
		this.modelDefinePool = new Pool(this);
		this.modelDefinePool.map = op.modelDefinePool || {};
		this.modelPool = new Pool(this);
		this.relationPool = new Pool(this);
		this.shapePool = new Pool(this);
		this.shapeDefinePool = new Pool(this);
		this.shapeDefinePool.map = op.shapeDefinePool || {};

		// this.modelPool = {};
		// this.relationPool = {};
		// this.shapePool = {};
		Object.values(op.modelOptionPool || {}).forEach(option => {
			this.modelPool.map[option.id] = new Model(option, this);
		});
		Object.values(op.relationOptionPool || {}).forEach(option => {
			this.relationPool.map[option.id] = new Relation(
				option,
				this
			);
		});
		Object.values(this.modelPool.map).forEach(model => {
			const modelDefine = this.modelDefinePool.get(model.modelDefineId);
			model.updateChildren(
				modelDefine.isRelationGroup
					? this.relationPool.map
					: this.modelPool.map
			);
		});
		Object.values(this.relationPool.map).forEach(model => {
			model.updateChildren(this.modelPool.map);
		});
		Object.values(op.shapeOptionPool || {}).forEach(option => {
			this.shapePool.map[option.id] = new Shape(option, this);
		});
		Object.values(this.shapePool.map || {}).forEach(shape => {
			shape.updateChildren(this.shapePool.map);
		});
	}
	createModelDefine() {}

	updateModelDefine() {}
	removeModelDefine() {}
	createRelation(op) {
		try {
			this.stepManager.beginUpdate();
			const { modelDefineId } = op;
			const modelDefine = this.modelDefinePool.get(modelDefineId);
			op.attrs = cloneDeep(modelDefine.attrs);
			const model = new Relation(op, this);
			this.relationPool.add(model);

			if (modelDefine.typeName === "Contain") {
				this.stepManager.endUpdate();
				return;
			}

			const sourceModel = this.modelPool.get(model.sourceId);
			const firstChildModelDefine =
				sourceModel.children[0] &&
				this.modelDefinePool.get(sourceModel.children[0].modelDefineId);
			if (firstChildModelDefine && firstChildModelDefine.isRelationGroup) {
				model.parentId = sourceModel.children[0].id;
				sourceModel.children[0].addChild(model);
			} else {
				const relationGroupModelDefine = this.modelDefinePool.get(5);
				const relationGroup = new RelationGroup(
					{
						id: getUid(),
						parentId: sourceModel.id,
						modelDefineId: 5,
						attrs: cloneDeep(relationGroupModelDefine.attrs),
						name: "关系"
					},
					this
				);
				this.modelPool.add(relationGroup);

				model.parentId = relationGroup.id;
				sourceModel.addChild(relationGroup, 0);
				relationGroup.addChild(model);
			}
			this.stepManager.endUpdate();
			return model;
		} catch (error) {
			this.stepManager.rollBack();
			throw error;
		}
	}
	createModel(op) {
		try {
			console.log("create model");
			this.stepManager.beginUpdate();
			const { modelDefineId } = op;
			const modelDefine = this.modelDefinePool.get(modelDefineId);
			if (modelDefine.isRelation) {
				this.stepManager.endUpdate();
				return this.createRelation(op);
			}
			op.attrs = cloneDeep(modelDefine.attrs);

			const model = new Model(op, this);
			const parentModel = this.modelPool.get(model.parentId);
			this.modelPool.add(model);

			if (parentModel) {
				parentModel.addChild(model);
			}
			const ContainModelDefine = this.modelDefinePool.get(4);
			parentModel &&
				this.createRelation({
					id: getUid(),
					parentId: null,
					modelDefineId: ContainModelDefine.id,
					name: "包含",
					displayName: "包含",
					attrs: cloneDeep(ContainModelDefine.attrs),
					sourceId: parentModel.id,
					targetId: model.id,
					diagramShapeId: null,
					children: [],
					shapeIds: []
				});
			this.stepManager.endUpdate();
			return model;
		} catch (error) {
			this.stepManager.rollBack();
			throw error;
		}
	}

	updateModelAttr({ attrKey, value, model }) {
		try {
			this.stepManager.beginUpdate();
			model.updateAttr(attrKey, value);
			this.stepManager.endUpdate();
		} catch (error) {
			this.stepManager.rollBack();
			throw error;
		}
	}
	moveModel() {}
	removeModel(id) {
		try {
			this.stepManager.beginUpdate();
			console.log("remove model", id);
			const toRemoveModel = this.modelPool.get(id) || this.relationPool.get(id);
			if (!toRemoveModel) {
				this.stepManager.endUpdate();
				return;
			}
			const toRemoveModelDefine = this.modelDefinePool.get(
				toRemoveModel.modelDefineId
			);

			if (toRemoveModel.children) {
				[...toRemoveModel.children].forEach(child => {
					this.removeModel(child.id); // 递归删除模型，从最底层的模型开始删除
				});
			}

			if (!toRemoveModelDefine.isRelation) { // 如果删除模型的不是关系，则需要把该模型相关的所有关系也删除
				Object.values(this.relationPool).forEach(model => {
					if (model.sourceId === id || model.targetId === id) {
						this.removeModel(model.id);
					}
				});
			}
			[...toRemoveModel.shapeIds].forEach(shapeId => {
				this.removeShape(shapeId); // 递归删除模型的图形，从最底层的模型开始删除，先删图形，再删模型
			});
			if (toRemoveModel.parentId) {
				// console.log()
				const parentModel = this.modelPool.get(toRemoveModel.parentId);
				const modelDefine = this.modelDefinePool.get(
					parentModel.modelDefineId
				);
				parentModel.removeChild(toRemoveModel);

				if (
					modelDefine.isRelationGroup &&
					parentModel.children.length === 0
				) {
					const sourceModel = this.modelPool.get(
						parentModel.parentId
					);
					sourceModel.removeChild(parentModel);

					this.modelPool.remove(parentModel.id);
				}
			}
			if (toRemoveModelDefine.isRelation) { // 关系从关系池中删除
				this.relationPool.remove(id);
			} else {
				if (toRemoveModelDefine.isDiagram){

					if (app.diagrams.find(i => i.id === id)){
						app.$bus.emit("diagram-remove", id);
						// const change = new ArrayRemoveChange({ arr: app.diagrams, val: toRemoveModel, onlyLocal: true } );
						// change.redo();
						// this.stepManager.addChange(change);

					}
					// if (app.activeDiagramId === id){
					// 	const change = new ObjectChange({ obj: app, key: "activeDiagramId", val: id, onlyLocal: true });
					// 	change.redo();
					// 	this.stepManager.addChange(change);
					// }

					this.modelPool.remove(id);

				} else {
					this.modelPool.remove(id);

				}
				
			}
			this.stepManager.endUpdate();
		} catch (error) {
			this.stepManager.rollBack();
			throw error;
		}
	}

	createShape(op) {
		try {
			console.log("create shape");
			this.stepManager.beginUpdate();
			const shapeDefine = this.shapeDefinePool.get(op.shapeDefineId);
			const shape = new Shape(op, this);
			this.shapePool.add(shape);
			if (op.parentId){
				const parentShape = this.shapePool.get(op.parentId);
				parentShape.addChild(shape);
				
			}
			if (shapeDefine.childIds){
				shapeDefine.childIds.forEach(childId => {
					const shapeDefine = this.shapeDefinePool.get(childId);
					const initBox = { ...shapeDefine.box };

					this.createShape({
						id: getUid(),
						parentId: shape.id,
						shapeDefineId: childId,
						modelId: op.modelId,
						box: initBox,
						bounds: {}
					});
				});
			}

			this.stepManager.endUpdate();
			return shape;
			
		} catch (error) {
			this.stepManager.rollBack();
			throw error;
		}
		  
	}

	updateShape() {}
	moveShape() {}
	removeShape() {}
	static getInitFactory(projectName) {
		function parseToPool(arr){
			const result = {};
			arr.forEach(i => {
				result[i.id] = i;
			});
			return result;

		}
		return new Factory({
			projectInfo: { projectName: projectName, projectId: getUid() },
			modelDefinePool: parseToPool(modelDefineJson),
			shapeDefinePool: parseToPool(shapeDefineJson),
			modelOptionPool: {},
			relationOptionPool: {},
			shapeOptionPool: {}
		});
	}
	getRootModel() {
		let model = Object.values(this.modelPool.map)[0];
		if (!model) return null;
		while (model.parentId) {
			model = this.modelPool.get(model.parentId);
		}
		return model;
	}
	getFactoryOptions() {
		const result = {
			projectInfo: this.projectInfo,
			modelDefinePool: this.modelDefinePool.map,
			shapeDefinePool: this.shapeDefinePool.map,
			modelOptionPool: {},
			relationOptionPool: {},
			shapeOptionPool: {}
		};
		Object.values(this.modelPool.map).forEach(model => {
			const op = model.getOption();
			result.modelOptionPool[op.id] = op;
		});
		Object.values(this.relationPool.map).forEach(model => {
			const op = model.getOption();
			result.relationOptionPool[op.id] = op;
		});
		Object.values(this.shapePool.map).forEach(model => {
			const op = model.getOption();
			result.shapeOptionPool[op.id] = op;
		});

		return result;
	}
}

// 模型的创建，修改，删除，移动，都必须通过Factory提供的方法进行统一处理，Factory会在执行逻辑的同时维护pool
