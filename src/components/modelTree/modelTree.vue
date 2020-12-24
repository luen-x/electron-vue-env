<template>
	<div class="v-model-tree">
		<el-button @click="handleSave">save</el-button>
		<el-button @click="handleRedo">前进</el-button>
		<el-button @click="handleUndo">后退</el-button>
		<el-button @click="handleTestRollBack">测试异常回滚</el-button>
		<div style="height:800px;overflow:auto">
			<el-tree :data="treeData" node-key="id" default-expand-all @node-contextmenu="handleContextMenu">
				<span slot-scope="{data}" @dblclick="handleOpenDiagram(data)">
					<span v-if="!data.inEditName">
						{{ data.name }}
						<i class="el-icon-circle-close g-operation" @click.stop="handleDelete(data)" />
						<i class="el-icon-edit g-operation g-m-l-10" @click.stop="handleEdit(data)" />

					</span>
					<el-input
						v-else
						v-model="data.nameForEdit"
						size="mini"
						autofocus
						@blur="handleSaveName(data)"
						@click.stop
					/>

				</span>
			</el-tree>
		</div>
	</div>
</template>
<script>
import { getUid, storage } from "../../util/common";
import modelDefine from "@/model/modelDefine.json";
import { Factory } from "../../model/graphNode";
import { cloneDeep } from "lodash";
import { ContextMenu } from "@/components/common/ContextMenu/index";
import graphUtil from "../graphEditor/graph/graphUtil";
import { ArrayInsertChange, ObjectChange } from "@/model/stepManager";

export default {
	name: "comp-",
	components: {},
	props: {},
	data() {
		return {
			treeData: [],
			factory: undefined
		};
	},
	mounted() {
		let factoryOption = storage.get("project-1");
		let factory;
		if (!factoryOption) {
			factory = Factory.getInitFactory("project-1");
			factory.createModel({
				id: getUid(),
				parentId: null,
				name: "Root",
				displayName: "Root",
				modelDefineId: 1,
				attrs: cloneDeep(factory.modelDefinePool.get(1).attrs)
			});
		} else {
			factory = new Factory(factoryOption);
		}
		this.factory = factory;
		this.stepManager = factory.stepManager;
		this.treeData = [factory.getRootModel()];
		app.projects.set(this.factory.projectInfo.id, this.factory);
	},
	beforeDestroy() {
		// this.handleSave();
	},
	methods: {
		handleSave() {
			console.log("save");
			const options = this.factory.getFactoryOptions();
			storage.set(options.projectInfo.projectName, options);
		},
		handleContextMenu(event, data) {
			event.preventDefault();
			event.stopPropagation();
			ContextMenu.popup({
				x: event.clientX,
				y: event.clientY,
				menuItems: this.getMenuItems(data)
			})
				.then((menuItem) => {
					this.addNode(data, menuItem);
				})
				.catch((err) => {
					if (err) throw err;
				});
		},
		getMenuItems(data) {
			const modelDefine = this.factory.modelDefinePool.get(
				data.modelDefineId
			);
			const items = modelDefine.allowedNestModelDefineIds
				.map((id) => this.factory.modelDefinePool.get(id))
				.map((item) => ({
					value: item.id,
					label: item.typeName,
					modelDefine: item
				}));
			return items;
		},
		addNode(parentNode, menuItem) {
			try {
				this.factory.stepManager.beginUpdate();
			
				if (!menuItem.modelDefine.isRelation) {
					const model = this.factory.createModel({
						id: getUid(),
						modelDefineId: menuItem.value,
						parentId: parentNode.id,
						name: menuItem.modelDefine.typeName + (parentNode.children.length + 1),
						displayName: menuItem.modelDefine.typeName + (parentNode.children.length + 1),
						attrs: cloneDeep(menuItem.modelDefine.attrs)
					});
					if (menuItem.modelDefine.isDiagram){
						const box = cloneDeep( this.factory.shapeDefinePool.get(menuItem.modelDefine.shapeDefineId).box);
						box.boxWidth = +box.width;
						box.boxHeight = +box.height;
						const diagramShape = this.factory.createShape({
							id: getUid(),
							parentId: undefined,
							modelId: model.id,
							box,
							sourceId: undefined,
							targetId: undefined,
							childIds: [],
							children: [],
							offset: undefined,
							waypoints: [],
							sourcePoint: undefined,
							targetPoint: undefined,
							bounds: graphUtil.getBoundsByBox(box)
						});
						const change = new ObjectChange(model, "diagramShapeId", diagramShape.id);
						change.redo();
						this.factory.stepManager.addChange(change);
						this.handleOpenDiagram(model);
					}
				} else {
					this.factory.createRelation({
						id: getUid(),
						modelDefineId: menuItem.value,
						parentId: null,
						name: menuItem.modelDefine.typeName,
						displayName:
						menuItem.modelDefine.typeName +
						parentNode.name +
						"->" +
						"zqq",
						attrs: cloneDeep(menuItem.modelDefine.attrs),
						sourceId: parentNode.id,
						targetId: null
					});
				}
				this.factory.stepManager.endUpdate();
				
			} catch (error) {
				this.factory.stepManager.rollBack();
				throw error;
				
			}
		},
		handleDelete(data) {
			this.factory.removeModel(data.id);
		},
		handleEdit(data) {
			this.$set(data, "nameForEdit", data.name);
			// data.nameForEdit = data.name;
			data.inEditName = true;
		},
		handleSaveName(data) {
			if (data.nameForEdit !== data.name) {
				this.factory.updateModelAttr({
					model: data,
					attrKey: "name",
					value: data.nameForEdit
				});
			}
			data.inEditName = false;
		},
		handleRedo() {
			this.factory.stepManager.redo();
		},
		handleUndo() {
			this.factory.stepManager.undo();
		},
		handleTestRollBack() {
			try {
				this.factory.stepManager.beginUpdate();
				console.log(this.treeData[0].children.length);
				[...this.treeData[0].children].forEach((model, index) => {
					if (index === 3) throw new Error("2 error");
					// console.log(index);
					this.factory.removeModel(model.id);
				});
				this.factory.stepManager.endUpdate();
			} catch (error) {
				this.factory.stepManager.rollBack();
				throw error;
			}
		},
		handleOpenDiagram(data){
			try {
				this.factory.stepManager.beginUpdate();
				const modelDefine = data.getModelDefine();
				if (!modelDefine.isDiagram) return;
				const change = new ArrayInsertChange(app.diagrams, data);
				change.redo();
				change.userId = app.userId;
				this.stepManager.addChange(change);
				const change2 = new ObjectChange(app, "activeDiagramId", data.id);
				change2.userId = app.userId;
				change2.redo();
				this.stepManager.addChange(change2);

				this.factory.stepManager.endUpdate();
			} catch (error) {
				this.factory.stepManager.rollBack();
				throw error;
			}

		}
	}
};
</script>
<style lang="scss">
.v-model-tree {
	width: 300px;
	margin-right: 20px;
}
</style>