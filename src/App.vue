<template>
	<div id="app">
		<m-header />
		<div class="g-flex">
			<m-model-tree class="g-flex-0" />
			<m-graph-tab class="g-flex-1" />
		</div>
		<m-portal />
	</div>
</template>

<script>
import Header from "@/components/header/header";
import ModelTree from "@/components/modelTree/modelTree";
import graphTab from "@/components/graphEditor/graphTab";
import Portal from "./components/common/Portal.vue";
import { storage, VueMap } from "@/util/common";
import { Factory } from "./model/graphNode";

export default {
	name: "app",
	components: {
		"m-header": Header,
		"m-model-tree": ModelTree,
		"m-graph-tab": graphTab,
		"m-portal": Portal
	},
	data(){
		const projects = new VueMap();
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
		projects.set(factory.projectInfo.projectId, factory);
		return {
			activeProjectId: factory.projectInfo.projectId,
			projects,
			activeDiagramId: "",
			diagrams: [],
			userId: "user-1"

		};
	},
	computed: {
		activeProject(){
			return this.projects.get(this.activeProjectId);
		}

	},
	created(){
		window.app = this;
	}
};
</script>

<style lang="scss">
</style>
