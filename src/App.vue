<template>
	<div id="app">
		<m-header />
		<div>
			<m-model-tree />
			<m-graph />
		</div>
		<m-portal />
	</div>
</template>

<script>
import Header from "@/components/header/header";
import ModelTree from "@/components/modelTree/modelTree";
import Graph from "@/components/graph/graph";
import Portal from "./components/common/Portal.vue";

export default {
	name: "app",
	components: {
		"m-header": Header,
		"m-model-tree": ModelTree,
		"m-graph": Graph,
		"m-portal": Portal
	}
};
</script>

<style lang="scss">
</style>
