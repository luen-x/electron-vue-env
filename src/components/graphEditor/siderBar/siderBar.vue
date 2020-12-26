<template>
	<div v-clickoutside="handleClickOutSide" class="v-graph-editor-sider-bar">
		<el-collapse v-model="activeKey" expand-icon-position="right">
			<el-collapse-item
				v-for="menu in menus"
				:key="menu.enName"
				:title="menu.cnName"
				:class="{_expand:activeKey.includes(menu.enName)}"
			>
				<div
					v-for="item in menu.children"
					ref="activePanel"
					:key="item.enName"
					class="_menu-item g-pointer"
					@mousedown="handleSetDragData(item)"
				>
					<img :src="item.img" class="g-m-r-5">
					{{ item.cnName }}
				</div>
			</el-collapse-item>
		</el-collapse>
		<div v-if="dragData" class="_pointer-icon" :style="pointerIcon">
			<!-- 点击拖拽到画布上 -->
			<img :src="dragData.img" class="g-m-r-5"> {{ dragData.cnName }}
		</div>
	</div>
</template>
<script>
import Clickoutside from "@/components/common/ContextMenu/clickoutside";

import siderBarConfig from "@/configs/siderBarConfig.json";
Object.values(siderBarConfig).forEach((menus) => {
	// const menus =  configUtil.getSiderBarConfig()[key];
	menus.forEach((menu) => {
		const children = menu.children;
		children.forEach((child) => {
			child.img = "/statics/images/sysml/" + child.typeName + ".svg";
		});
	});
});
export default {
	name: "comp-",
	components: {},
	directives: {
		Clickoutside
	},
	props: {
		diagramType: {
			type: String,
			default: "SysMLBlockDefinitionDiagram"
		},
		graph: Object
	},
	data() {
		return {
			activeKey: ["1"],
			menus: siderBarConfig[this.diagramType],
			dragData: undefined,
			pointerIcon: {
				left: 0,
				top: 0
			}
		};
	},
	beforeDestroy() {
		window.removeEventListener("mousemove", this.handleMouseMove);
		window.removeEventListener("keyup", this.handleKeyUp);
	},
	methods: {
		handleSetDragData(item) {
			this.dragData = item;
			window.addEventListener("mousemove", this.handleMouseMove);
			window.addEventListener("keyup", this.handleKeyUp);
			this.pointerIcon.left = window.event.clientX + "px";
			this.pointerIcon.top = window.event.clientY + "px";
		},
		handleClickOutSide() {
			setTimeout(() => {
				// this.clearDragData();
			}, 100);
		},
		handleMouseMove(event) {
			window.requestAnimationFrame(() => {
				this.pointerIcon.left = event.clientX + 20 + "px";
				this.pointerIcon.top = event.clientY + "px";
			});
		},
		clearDragData() {
			if (this.dragData) {
				window.removeEventListener("mousemove", this.handleMouseMove);
				window.removeEventListener("keyup", this.handleKeyUp);

				this.dragData = undefined;
			}
		},
		handleKeyUp(event) {
			if (event.keyCode === 27) {
				this.clearDragData();

				// this.handleClickOutSide();
				this.graph.highlight.hide();
			}
		}
	}
};
</script>
<style lang="scss">
.v-graph-editor-sider-bar {
	width: 200px;
	._pointer-icon {
		position: fixed;
		z-index: 1;
		opacity: 0.65;
	}
}
</style>