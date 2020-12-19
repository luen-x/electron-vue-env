<template>
	<div id="app">
		<m-header />
		<div>
			<m-model-tree />
			<m-graph />
		</div>
	</div>
</template>

<script>
import Header from "@/components/header/header";
import ModelTree from "@/components/modelTree/modelTree";
import Graph from "@/components/graph/graph";
export default {
	name: "app",
	components: {
		"m-header": Header,
		"m-model-tree": ModelTree,
		"m-graph": Graph
	}
};
</script>

<style lang="scss">
</style>
