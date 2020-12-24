<template>
	<div>
		<el-tabs v-model="app.activeDiagramId" type="card" editable @edit="handleTabsEdit">
			<el-tab-pane v-for=" diagram in app.diagrams" :key="diagram.id" :label="diagram.name" :name="diagram.id">
				<m-content :diagram="diagram" />
			</el-tab-pane>
		</el-tabs>
	</div>
</template>
<script>
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

	},
	watch: {
 
	},
	methods: {
		handleTabsEdit(tabKey, action){
			console.log(data, action);
			if (action === "delete") {
				app.diagrams.splice(app.diagrams.findIndex(di => di.id === tabKey), 1);
				app.activeDiagramId = ( app.diagrams[0] || {} ).id;

			}

		}
	}
};
</script>
<style lang="scss">
</style>