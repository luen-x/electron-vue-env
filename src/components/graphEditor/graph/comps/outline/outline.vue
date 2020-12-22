<template>
	<div style="position:absolute;right:10px;top:10px;width:300px;height:300px;z-index:100;border:1px solid black">
		<div ref="container" />
	</div>
</template>
<script>
import { mxOutline } from "../../classes/index";
export default {
	name: "comp-",
	components: {},
	props: {
		graph: Object
	},
	data() {
		return {
			outlineInstance: undefined
		};
	},
	watch: {
		graph(val) {
			this.createOutline();
		}
	},
	mounted() {
		this.createOutline();
	},
	methods: {
		createOutline(graph) {
			if (this.graph && !this.outlineInstance && this.$refs.container) {
				this.outlineInstance = new mxOutline(
					this.graph,
					this.$refs.container
				);
			}
		}
	}
};
</script>
<style lang="scss">
</style>