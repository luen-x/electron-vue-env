<template>
	<div v-show="visible" class="v-property-bar" :style="styleC">
		<div v-for="item in list" :key="item.value" class="g-pd-lr-10 g-pd-b-10 g-pointer">
			<span @click="$emit('click-btn',item)">{{ item.label }}</span>
		</div>
	</div>
</template>
<script>
import { Portal } from "@/components/common/Portal";
const comp = {
	name: "comp-",
	components: {},
	props: {
		x: Number,
		y: Number,
		visible: Boolean
	},
	data() {
		return {
			list: [
				{ label: "属性1", value: 1 },
				{ label: "属性2", value: 2 },
				{ label: "属性3", value: 3 },
				{ label: "属性4", value: 4 }
			]
		};
	},
	computed: {
		styleC() {
			return {
				left: this.x + "px",
				top: this.y + "px"
			};
		}
	},
	methods: {
		handleOk(res) {
			this.visible = false;
			this.$emit("sure", res);
		},
		handleCancel() {
			this.visible = false;
			this.$emit("close");
		}
	}
};
export default comp;
export const propertyBar = new Portal(comp);
</script>
<style lang="scss">
.v-property-bar {
	position: absolute;
}
</style>