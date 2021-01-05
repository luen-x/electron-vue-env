<template>
	<div>
		<div class="g-flex">
			<m-model-tree class="g-flex-0" />
			<m-graph-tab class="g-flex-1" />
		</div>
	</div>
</template>
<script>
import ModelTree from "@/components/modelTree/modelTree";
import GraphTab from "@/components/graphEditor/graphTab";
export default {
	name: "comp-",
	components: {
		"m-model-tree": ModelTree,
		"m-graph-tab": GraphTab
	},
	props: {
	},
	data() {
		return {
		};
	},
	methods: {
	}
};
</script>
<style lang="scss">
</style>