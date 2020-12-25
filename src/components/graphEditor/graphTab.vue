<template>
	<div>
		<el-tabs
			v-model="app.activeDiagramId"
			type="card"
			closable
			@edit="handleTabsEdit"
		>
			<el-tab-pane v-for=" diagram in app.diagrams" :key="diagram.id" :label="diagram.name" :name="diagram.id">
				<m-content :diagram="diagram" />
			</el-tab-pane>
		</el-tabs>
	</div>
</template>
<script>
import { ArrayRemoveChange, ObjectChange } from "@/model/stepManager";
import Content from "./content";
export default {
	name: "comp-",
	components: {
		"m-content": Content
	},
	props: {
	},
	data() {
		return {
			app: app,
			events: {
				"diagram-open": this.handleDiagramOpen,
				"diagram-remove": this.handleDiagramRemove
			}

		};
	},
	computed: {
		stepManager(){
			return app.activeProject.stepManager;
		},
		modelPool(){
			return app.activeProject.modelPool;
		},
		diagrams(){
			return app.diagrams;
		}

	},
	watch: {
 
	},
	mounted(){
		this.$bus.onBatch(this.events);
	},
	beforeDestroy(){
		this.$bus.offBatch(this.events);

	},
	methods: {
		handleDiagramOpen(id){
			const diagram = this.modelPool.get(id);
			if (!diagram) return;
			if (!this.diagrams.includes(diagram)) this.diagrams.push(diagram);
			app.activeDiagramId = id;

		},
		handleDiagramRemove(id){
			const diagramIndex = this.diagrams.findIndex(i => i.id === id);
			if (diagramIndex === -1) return;
			this.diagrams.splice(diagramIndex, 1);
			app.activeDiagramId = this.diagrams[0] && this.diagrams[0].id;

		},
		handleTabsEdit(tabKey, action){
			console.log(tabKey, action);
			if (action === "remove") {
				this.handleDiagramRemove(tabKey);
			}

		},
		handleClickTab(tab){
			console.log(tab);

		}
	}
};
</script>
<style lang="scss">
</style>