<template>
	<div>
		<el-tabs v-model="app.activeDiagramId" @tab-click="handleClick">
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
	methods: {
	}
};
</script>
<style lang="scss">
</style>