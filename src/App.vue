<template>
	<div id="app">
		<m-header />
		<div class="g-flex">
			<m-model-tree class="g-flex-0" />
			<m-Graph-editor class="g-flex-1" />
		</div>
		<m-portal />
	</div>
</template>

<script>
import Header from "@/components/header/header";
import ModelTree from "@/components/modelTree/modelTree";
import GraphEditor from "@/components/graphEditor/content";
import Portal from "./components/common/Portal.vue";

export default {
	name: "app",
	components: {
		"m-header": Header,
		"m-model-tree": ModelTree,
		"m-Graph-editor": GraphEditor,
		"m-portal": Portal
	}
};
</script>

<style lang="scss">
</style>
