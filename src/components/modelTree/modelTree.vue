<template>
	<div class="v-model-tree">
		<el-button @click="handleSave">save</el-button>
		<el-button @click="handleRedo">前进</el-button>
		<el-button @click="handleUndo">后退</el-button>
		<el-button @click="handleTestRollBack">测试异常回滚</el-button>
		<div style="height:800px;overflow:auto">
			<el-tree
				:data="treeData"
				node-key="id"
				:indent="0"
				default-expand-all
				class="tree-line"
				@node-contextmenu="handleContextMenu"
			>
				<span slot-scope="{data}" class="g-relative g-lh-18" @dblclick="handleOpenDiagram(data)">
					<img :src="data.getModelDefine().icon" class="g-m-l-4" style="position:relative;top:-2px">
					<span v-if="!data.inEditName">
						{{ data.name }}
						<i class="el-icon-circle-close g-operation" @click.stop="handleDelete(data)" />
						<i class="el-icon-edit g-operation g-m-l-10" @click.stop="handleEdit(data)" />

					</span>
					<el-input
						v-else
						ref="input"
						v-model="data.nameForEdit"
						size="mini"
						class="_tree-input"
						autofocus
						@blur="handleSaveName(data)"
						@click.native.stop
					/>

				</span>
			</el-tree>
		</div>
	</div>
</template>
<script>
import { getUid, storage } from "../../util/common";
import modelDefine from "@/model/modelDefine.json";
import { Factory, transaction, transaction2 } from "../../model/graphNode";
import { cloneDeep } from "lodash";
import { ContextMenu } from "@/components/common/ContextMenu/index";
import graphUtil from "../graphEditor/graph/graphUtil";
import { ArrayInsertChange, ObjectChange, OpenDiagramChange } from "@/model/stepManager";
import { resizeUtil } from "../graphEditor/graph/resizeUtil";

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
		// let factoryOption = storage.get("project-1");
		// let factory;
		// if (!factoryOption) {
		// 	factory = Factory.getInitFactory("project-1");
		// 	factory.createModel({
		// 		id: getUid(),
		// 		parentId: null,
		// 		name: "Root",
		// 		displayName: "Root",
		// 		modelDefineId: 1,
		// 		attrs: cloneDeep(factory.modelDefinePool.get(1).attrs)
		// 	});
		// } else {
		// 	factory = new Factory(factoryOption);
		// }
		const factory = app.activeProject;
		this.factory = factory;
		this.stepManager = factory.stepManager;
		this.treeData = [factory.getRootModel()];
		// app.projects.set(this.factory.projectInfo.id, this.factory);
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
		@transaction
		addNode(parentNode, menuItem) {
	
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
					const shapeDefine = this.factory.shapeDefinePool.get(menuItem.modelDefine.shapeDefineId);
					const box = shapeDefine.box;
					const initBox = { ...box };
					const diagramShape = this.factory.createShape({
						id: getUid(),
						parentId: undefined,
						modelId: model.id,
						shapeDefineId: shapeDefine.id,
						box: initBox,
						sourceId: undefined,
						targetId: undefined,
						childIds: [],
						children: [],
						offset: undefined,
						waypoints: [],
						sourcePoint: undefined,
						targetPoint: undefined,
						bounds: {}
					});
						// 初始化shape
					resizeUtil.initShape(diagramShape);

					// 给模型绑定diagramShapeId
					const objChange = new ObjectChange({ obj: model, key: "diagramShapeId", val: diagramShape.id });
					objChange.redo();
					this.stepManager.addChange(objChange);

					// 发送事件打开画布,一种特殊的Change，只在本地生效，只负责发射事件
					const change2 = new OpenDiagramChange({ diagramId: model.id });
					change2.redo();
					this.stepManager.addChange(change2);
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

		},
		handleDelete(data) {
			this.factory.removeModel(data.id);
		},
		handleEdit(data) {
			this.$set(data, "nameForEdit", data.name);
			// data.nameForEdit = data.name;
			data.inEditName = true;
			this.$nextTick(() => {
				this.$refs.input.focus();
			});
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
		handleRedo(){
			this.factory.stepManager.redo();
		},
		handleUndo() {
			this.factory.stepManager.undo();
		},
		@transaction
		handleTestRollBack() {
			console.log(this.treeData[0].children.length);
			[...this.treeData[0].children].forEach((model, index) => {
				if (index === 1) throw new Error("2 error");
				// console.log(index);
				this.factory.removeModel(model.id);
			});
			
		},
		handleOpenDiagram(data){
			this.$bus.emit("diagram-open", data.id);
			// try {
			// 	this.factory.stepManager.beginUpdate();
			// 	const modelDefine = data.getModelDefine();
			// 	if (!modelDefine.isDiagram) return;
			// 	const change = new ArrayInsertChange({ arr: app.diagrams, val: data, onlyLocal: true });
			// 	change.redo();
			// 	change.userId = app.userId;
			// 	this.stepManager.addChange(change);
			// 	const change2 = new ObjectChange({ obj: app, key: "activeDiagramId", val: data.id, onlyLocal: true });
			// 	change2.userId = app.userId;
			// 	change2.redo();
			// 	this.stepManager.addChange(change2);

			// 	this.factory.stepManager.endUpdate();
			// } catch (error) {
			// 	this.factory.stepManager.rollBack();
			// 	throw error;
			// }

		}
	}
};
</script>
<style lang="scss">
.v-model-tree {
	width: 300px;
	margin-right: 20px;
	._tree-input {
		.el-input__inner {
			height: 18px;
			line-height: 18px;
			padding-left: 8px;

		}
		margin-left: 4px;
		width: 100px;

	}
	.tree-line{
  .el-tree-node {
    position: relative;
    padding-left: 16px; // 缩进量
  }
  .el-tree-node__expand-icon.is-leaf {
	  display: none;
  }
  .el-tree-node__expand-icon {
	  margin-right: 3px;
  }
  .el-tree-node__children {
    padding-left: 16px; // 缩进量
  }

  // 竖线
  .el-tree-node::before {
    content: "";
    height: 100%;
    width: 1px;
    position: absolute;
    left: -3px;
    top: -26px;
    border-width: 1px;
    border-left: 1px dashed #52627C;
  }
  // 当前层最后一个节点的竖线高度固定
  .el-tree-node:last-child::before {
    height: 38px; // 可以自己调节到合适数值
  }

  // 横线
  .el-tree-node::after {
    content: "";
    width: 16px;
    height: 20px;
    position: absolute;
    left: -3px;
    top: 12px;
    border-width: 1px;
    border-top: 1px dashed #52627C;
  }

  // 去掉最顶层的虚线，放最下面样式才不会被上面的覆盖了
  & > .el-tree-node::after {
    border-top: none;
  }
  & > .el-tree-node::before {
    border-left: none;
  }
	
  // 展开关闭的icon
  .el-tree-node__expand-icon{
    font-size: 16px;
    // 叶子节点（无子节点）
    &.is-leaf{
      color: transparent;
      // display: none; // 也可以去掉
    }
  }
}
}
</style>