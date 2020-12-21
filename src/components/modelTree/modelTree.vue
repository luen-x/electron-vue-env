<template>
	<div class="v-model-tree">
		<el-tree :data="treeData" node-key="id" default-expand-all @node-contextmenu="handleContextMenu">
			<span slot-scope="{data}">
				{{ data.displayName }}
				<i class="el-icon-circle-close g-operation" @click="handleDelete(data)" />

			</span>
		</el-tree>
		<el-button @click="handleSave">save</el-button>
		<el-button @click="handleRedo">前进</el-button>
		<el-button @click="handleUndo">后退</el-button>
		<el-button @click="handleTestRollBack">测试异常回滚</el-button>
	</div>
</template>
<script>
import { getUid, storage } from "../../util/common";
import modelDefine from "@/model/modelDefine.json";
import { Factory } from "../../model/graphNode";
import { cloneDeep } from "lodash";
import { ContextMenu } from "@/components/common/ContextMenu/index";

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
		this.treeData = [factory.getRootModel()];
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
			const modelDefine = this.factory.modelDefinePool.get(data.modelDefineId);
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
			if (!menuItem.modelDefine.isRelation) {
				this.factory.createModel({
					id: getUid(),
					modelDefineId: menuItem.value,
					parentId: parentNode.id,
					name:
						menuItem.modelDefine.typeName +
						(parentNode.children.length + 1),
					displayName:
						menuItem.modelDefine.typeName +
						(parentNode.children.length + 1),
					attrs: cloneDeep(menuItem.modelDefine.attrs)
				});
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
		},
		handleDelete(data) {
			this.factory.removeModel(data.id);
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
					if (index === 2) throw new Error("2 error");
					console.log(index);
					this.factory.removeModel(model.id);
				});
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
}
</style>