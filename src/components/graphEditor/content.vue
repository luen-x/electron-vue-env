<template>
	<div class="v-graph-editor-content">
		<m-sider-bar class="g-flex-0" :diagram="diagram" />
		<m-graph class="g-flex-1" :diagram="diagram" />
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
	methods: {}
};
</script>
<style lang="scss">
.v-graph-editor-content {
	display: flex;
}
</style>
