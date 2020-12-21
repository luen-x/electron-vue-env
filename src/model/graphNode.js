import { getUid } from "../util/common";
import modelDefineJson from "./modelDefine.json";
import {
	StepManager,
	InsertPoolChange,
	RemovePoolChange,
	InsertTreeNodeChange,
	RemoveTreeNodeChange
} from "./stepManager";
import { cloneDeep } from "lodash";

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
	}
}
// 元模型，元模型可以创建模型实例，op是保存的json数据,也就是model.getOption返回的数据
// children属性表达了模型之间的包含关系（除了relationGroup），这里是为了树渲染能够更快才放到的children里，除了relationGroup之外，所有children关系都应对应一条类型为contain的Relation
class Model {
	constructor(op) {
		this.id = op.id;
		this.parentId = op.parentId; // 关系没有parentId
		this.modelDefineId = op.modelDefineId;
		this.name = op.name;
		this.displayName = op.displayName;
		this.attrs = op.attrs;
		this.sourceId = op.sourceId; // 如果isRelation,则有sourceId和targetId
		this.targetId = op.targetId;
		this.diagramId = op.diagramId; // 如果是isDiagram,则会有diagramId,diagramId就是shape.id,他是model和shape之间的桥梁，双击画布元素时会去shapePool中
		// 查询是否有diagramId对应的shape,如果有则打开，如果没有则创建画布shape，然后打开
		this.children = [];
		this.shapeIds = [];
		this.childIds = op.childIds;
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

			diagramId: this.diagramId,
			shapeIds: this.shapeIds
		};
	}
	updateChildren(modelPool) {
		this.children = this.childIds
			? this.childIds.map(id => modelPool[id])
			: [];
	}
}
class Relation extends Model {
	constructor(op) {
		super(op);
		this.sourceId = op.sourceId; // 如果isRelation,则有sourceId和targetId
		this.targetId = op.targetId;
	}
}
// relationGroup是一种特殊的Model,是一个虚的模型，除了id，children之外其他属性均为空，专门用来容纳relation，relation的sourceId决定了该relation存储于那个模型的relationGroup下
//
class RelationGroup extends Model {
	constructor(op) {
		super(op);
		this.displayName = "关系";
		this.isRelationGroup = true;
	}
	updateChildren(relationPool) {
		this.children = op.childIds
			? op.childIds.map(id => relationPool[id])
			: [];
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
	getOption() {
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
	updateChildren(shapePool) {
		this.children = op.childIds ? op.childIds.map(id => shapePool[id]) : [];
	}
}
// 工厂，负责对元模型，模型，图形的管理，包括初始化，创建，插入，更新，移动，删除
// op是存储的3种option集合
export class Factory {
	constructor(op) {
		this.modelDefinePool = op.modelDefinePool || {};
		this.modelPool = {};
		this.relationPool = {};
		this.shapePool = {};
		this.projectInfo = op.projectInfo;
		this.stepManager = new StepManager();
		Object.values(op.modelOptionPool || {}).forEach(option => {
			this.modelPool[option.id] = new Model(option);
		});
		Object.values(op.relationOptionPool || {}).forEach(option => {
			this.relationPool[option.id] = new Model(option);
		});
		Object.values(this.modelPool || {}).forEach(model => {
			model.updateChildren(
				model.isRelationGroup ? this.relationPool : this.modelPool
			);
		});
		Object.values(op.shapeOptionPool || {}).forEach(option => {
			this.shapePool[option.id] = new Shape(option);
		});
		Object.values(this.shapePool || {}).forEach(shape => {
			model.updateChildren(this.shapePool);
		});
	}
	createModelDefine() {}

	updateModelDefine() {}
	removeModelDefine() {}
	createRelation(op) {
		try {
			this.stepManager.beginUpdate();
			const { modelDefineId } = op;
			const modelDefine = this.modelDefinePool[modelDefineId];
			const model = new Relation(op);
			this.relationPool[model.id] = model;
			this.stepManager.addChange(
				new InsertPoolChange({ pool: this.relationPool, item: model })
			);
			if (modelDefine.typeName === "Contain") {
				this.stepManager.endUpdate();
				return;
			}

			const sourceModel = this.modelPool[model.sourceId];
			if (
				sourceModel.children[0] &&
				sourceModel.children[0].isRelationGroup
			) {
				model.parentId = sourceModel.children[0].id;
				sourceModel.children[0].children.push(model);
				this.stepManager.addChange(
					new InsertTreeNodeChange({
						parent: sourceModel.children[0],
						node: model
					})
				);
			} else {
				const relationGroup = new RelationGroup({
					id: getUid(),
					parentId: sourceModel.id,
					modelDefineId: 5
				});
				this.modelPool[relationGroup.id] = relationGroup;
				this.stepManager.addChange(
					new InsertPoolChange({
						pool: this.modelPool,
						item: relationGroup
					})
				);
				model.parentId = relationGroup.id;
				sourceModel.children.unshift(relationGroup);
				this.stepManager.addChange(
					new InsertTreeNodeChange({
						parent: sourceModel,
						node: relationGroup,
						type: "first"
					})
				);
				relationGroup.children.push(model);
				this.stepManager.addChange(
					new InsertTreeNodeChange({
						parent: relationGroup,
						node: model
					})
				);
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
			console.log("crate");
			this.stepManager.beginUpdate();
			const { modelDefineId } = op;
			const modelDefine = this.modelDefinePool[modelDefineId];
			if (modelDefine.isRelation) {
				this.stepManager.endUpdate();
				return this.createRelation(op);
			}

			const model = new Model(op);
			const parentModel = this.modelPool[model.parentId];
			this.stepManager.addChange(
				new InsertPoolChange({ pool: this.modelPool, item: model })
			);

			this.modelPool[model.id] = model;

			if (parentModel) {
				parentModel.children.push(model);
				this.stepManager.addChange(
					new InsertTreeNodeChange({
						parent: parentModel,
						node: model
					})
				);
			}
			const ContainModelDefine = this.modelDefinePool[4];
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
					diagramId: null,
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

	updateModel() {}
	moveModel() {}
	removeModel(id) {
		try {
			this.stepManager.beginUpdate();
			console.log("remove");
			const toRemoveModel = this.modelPool[id] || this.relationPool[id];
			if (!toRemoveModel) {
				this.stepManager.endUpdate();
				return;
			}
			const toRemoveModelDefine = this.modelDefinePool[
				toRemoveModel.modelDefineId
			];

			if (toRemoveModel.children) {
				toRemoveModel.children.forEach(child => {
					this.removeModel(child.id);
				});
			}
			toRemoveModel.shapeIds.forEach(shapeId => {
				this.removeShape(shapeId);
			});
			if (!toRemoveModelDefine.isRelation) {
				Object.values(this.relationPool).forEach(model => {
					if (model.sourceId === id || model.targetId === id) {
						this.removeModel();
					}
				});
			}
			if (toRemoveModel.parentId) {
				// console.log()
				const parentModel = this.modelPool[toRemoveModel.parentId];
				const index = parentModel.children.indexOf(toRemoveModel);
				parentModel.children.splice(
					parentModel.children.indexOf(toRemoveModel),
					1
				);
				this.stepManager.addChange(
					new RemoveTreeNodeChange({
						parent: parentModel,
						node: toRemoveModel,
						index
					})
				);
				if (
					parentModel.isRelationGroup &&
					parentModel.children.length === 0
				) {
					const sourceModel = this.modelPool[parentModel.parentId];
					const index = sourceModel.children.indexOf(parentModel);
					sourceModel.children.splice(
						sourceModel.children.indexOf(parentModel),
						1
					);
					this.stepManager.addChange(
						new RemoveTreeNodeChange({
							parent: sourceModel,
							node: parentModel,
							index
						})
					);

					delete this.modelPool[parentModel.id];
					this.stepManager.addChange(
						new RemovePoolChange({
							pool: this.modelPool,
							item: parentModel
						})
					);
				}
			}
			if (toRemoveModelDefine.isRelation) {
				delete this.relationPool[id];
				this.stepManager.addChange(
					new RemovePoolChange({
						pool: this.relationPool,
						item: toRemoveModel
					})
				);
			} else {
				delete this.modelPool[id];
				this.stepManager.addChange(
					new RemovePoolChange({
						pool: this.modelPool,
						item: toRemoveModel
					})
				);
			}
			this.stepManager.endUpdate();
		} catch (error) {
			this.stepManager.rollBack();
			throw error;
		}
	}

	createShape() {}

	updateShape() {}
	moveShape() {}
	removeShape() {}
	static getInitFactory(projectName) {
		return new Factory({
			projectInfo: { projectName: projectName, projectId: getUid() },
			modelDefinePool: (() => {
				const result = {};
				modelDefineJson.forEach(i => {
					result[i.id] = i;
				});
				return result;
			})(),
			modelOptionPool: {},
			relationOptionPool: {},
			shapeOptionPool: {}
		});
	}
	getRootModel() {
		let model = Object.values(this.modelPool)[0];
		if (!model) return null;
		while (model.parentId) {
			model = this.modelPool[model.parentId];
		}
		return model;
	}
	getFactoryOptions() {
		const result = {
			projectInfo: this.projectInfo,
			modelDefinePool: this.modelDefinePool,
			modelOptionPool: {},
			relationOptionPool: {},
			shapeOptionPool: {}
		};
		Object.values(this.modelPool).forEach(model => {
			const op = model.getOption();
			result.modelOptionPool[op.id] = op;
		});
		Object.values(this.relationPool).forEach(model => {
			const op = model.getOption();
			result.relationOptionPool[op.id] = op;
		});
		Object.values(this.shapePool).forEach(model => {
			const op = model.getOption();
			result.shapeOptionPool[op.id] = op;
		});

		return result;
	}
}

// 模型的创建，修改，删除，移动，都必须通过Factory提供的方法进行统一处理，Factory会在执行逻辑的同时维护pool
