<template>
	<div>
		<el-tabs
			:value="app.activeDiagramId"
			type="card"
			closable
			@edit="handleTabsEdit"
			@click="handleClickTab"
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
			app: app
		};
	},
	computed: {
		stepManager(){
			return app.activeProject.stepManager;
		}

	},
	watch: {
 
	},
	methods: {
		handleTabsEdit(tabKey, action){
			console.log(tabKey, action);
			if (action === "remove") {
				try {
					this.stepManager.beginUpdate();
					const change = new ObjectChange({ obj: app, key: "activeDiagramId", val: (app.diagrams[0] || {}).id });
					change.redo();
					this.stepManager.addChange(change);
					const change2 = new ArrayRemoveChange({ arr: app.diagrams, val: app.diagrams.find(i => i.id === tabKey) });
					change2.redo();
					this.stepManager.addChange(change2);
					this.stepManager.endUpdate();
					
				} catch (error) {
					this.stepManager.rollBack();
					throw error;
					
				}

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