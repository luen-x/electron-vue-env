<template>
	<div class="v-graph-editor-content">
		<m-sider-bar ref="siderBar" class="g-flex-0" :diagram="diagram" />
		<m-graph class="g-flex-1" :diagram="diagram" :get-sider-bar-drag-data="getSiderBarDragData" />
	</div>
</template>
<script>
import SiderBar from "./siderBar/siderBar";
import TopBar from "./topBar/topBar";
import Graph from "./graph/graph";

export default {
	name: "comp-graph-content",
	components: {
		"m-sider-bar": SiderBar,
		"m-graph": Graph
		
	},
	props: {
		diagram: Object
	},
	data() {
		return {};
	},
	methods: {
		getSiderBarDragData(){
			return this.$refs.siderBar.dragData;
		}

	}
};
</script>
<style lang="scss">
.v-graph-editor-content {
	display: flex;
}
</style>
