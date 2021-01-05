<template>
	<div
		v-show="visible"
		ref="contextMenu"
		v-clickoutside="handleClickOutSide"
		class="c-contextmenu"
		:class="poperClass"
		:style="{left:x-moveLeft+'px',top:y-moveTop+'px',zIndex}"
		@contextmenu.prevent
	>
		<m-menu :menu="menuItems" @click-menu-item="handleClickMenuItem" />
	</div>
</template>
<script>
import { Portal } from "../Portal";
import Menu from "./Menu";
import Clickoutside from "./clickoutside";

let menuInstance;
const com = {
	name: "common-context-menu",
	components: {
		"m-menu": Menu
	},
	directives: { 
		Clickoutside 
	},
	props: {
		x: Number,
		y: Number,
		menuItems: Array,
		model: Object,
		nodeType: String,
		zIndex: {
			type: Number,
			default: 2100
		},
		poperClass: {
			type: String,
			default: ""
		}

	},

	data() {
		return {
			visible: false,
			moveTop: 0,
			moveLeft: 0

			// values: [undefined, undefined], // 暂时没必要记录多级的数据
		};
	},
	watch: {
		"$route.path"(){
			this.handleCancel();
      
		},
		// x(){
		//   this.updatePosition();
		// },
		// y(){
		//   this.updatePosition();
		// },
		menuItems(val){
			this.updatePosition();
			this.visible = true;
		}

	},
	mounted(){
		this.visible = true;
		this.updatePosition();
     
		// menuInstance = this;
	},
	// beforeCreate(){
	//   if (menuInstance){
	//     menuInstance.handleCancel();
	//   }

	// },
	// created(){
	//   console.log('created');
	//   menuInstance = this;

	// },
	// beforeDestroy() {
	//   menuInstance = undefined;

	// },
	methods: {
		handleCancel(){
			this.visible = false;
			this.$emit("close");
		},
		handleOk(item){
			this.visible = false;
			this.$emit("sure", item);
		},
		handleClickMenuItem(item){
			if (item.disabled || (item.children && item.children.length)){
				return;
			}
      
			this.handleOk(item);
		},
		getIcon(icon){
			return icon + " " + (icon.startsWith("el-icon") ? "" : "FontFamily");
		},
		updatePosition(){
			this.$nextTick(function() {
				const element = this.$refs.contextMenu;
				const overY = element.clientHeight + element.offsetTop - window.innerHeight;
				if (overY > 0){
					this.moveTop = overY + 2; // mac存在右击事件触发机制和windows不一致问题，这里-2是为了兼容
				}
				const overX = element.clientWidth + element.offsetLeft - window.innerWidth;
				if (overX > 0){
					this.moveLeft = overX + 2;
				}
			});

		},
		handleClickOutSide(){
			const lastItems = this.menuItems;
			setTimeout(() => {
				if (lastItems === this.menuItems) this.handleCancel();
          
			}, 50);
       
		}
    
	}
};
export default com;
export const ContextMenu = new Portal(com, { single: true });
</script>
<style lang="scss">
.c-contextmenu {
    position: fixed;
	  user-select: none;
}
</style>