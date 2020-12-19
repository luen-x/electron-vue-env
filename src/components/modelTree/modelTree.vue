<template>
	<div class="v-model-tree">
		<el-tree :data="treeData" />
	</div>
</template>
<script>
export default {
	name: "comp-",
	components: {},
	props: {},
	data() {
		return {
			treeData: []
		};
	},
	methods: {}
};
</script>
<style lang="scss">
.v-model-tree {
	width: 300px;
}
</style>