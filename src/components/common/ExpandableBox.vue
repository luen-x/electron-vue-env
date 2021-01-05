<template>
	<div class="c-expandable-box">
		<div :style="boxStyle" style="overflow:auto;height:100%" :class="contentClass" class="c-expandable-box-body">
			<slot />
		</div>
		<div class="_drag-line" @mousedown="handleMouseDown" />
	</div>
</template>
<script>
export default {
	name: "common-expandable-box",
	components: {},
	props: {
		initWidth: {
			type: Number,
			default: 240
		},
		minWidth: {
			type: Number,
			default: 200
		},
		maxWidth: {
			type: Number,
			default: 500
		},
		contentClass: String
	},
	data() { 
		return {
			mouseStartX: 0,
			width: this.initWidth,
			hasDragged: false
		};
	},
	computed: {
		boxStyle() {
			return {
				width: this.width + "px"
			};
		}
	},
	watch: {
		initWidth(val) {
			if (this.hasDragged) return;
			if (val > this.maxWidth) {
				this.width = this.maxWidth;
			} else if (val < this.minWidth) {
				this.width = this.minWidth;
			} else {
				this.width = val;
			}
		}
	},
	methods: {
		handleMouseDown() {
			this.mouseStartX = window.event.clientX;
			this.originWidth = this.width;
			window.addEventListener("mousemove", this.handleMouseMove);
			window.addEventListener("mouseup", this.handleMouseUp);
		},
		handleMouseUp() {
			this.hasDragged = true;
			window.removeEventListener("mousemove", this.handleMouseMove);
			window.removeEventListener("mouseup", this.handleMouseUp);
		},
		handleMouseMove() {
			const mouseEndX = window.event.clientX;
			let changeWidth = mouseEndX - this.mouseStartX;
			let width = this.originWidth + changeWidth;
			if (width > this.maxWidth) {
				width = this.maxWidth;
			} else if (width < this.minWidth) {
				width = this.minWidth;
			}
			this.width = width;
		}
	}
};
</script>
<style lang="scss">
.c-expandable-box {
	height: 100%;
	position: relative;
	overflow: visible;

	._drag-line {
		position: absolute;
		right: -8px;
		width: 8px;
		cursor: col-resize;
		// opacity: 0;
		// background-color: red;
		height: 100%;
		top: 0;
    z-index:1;
	}
}
</style>