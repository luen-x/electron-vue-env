<template>
	<div 
		v-if="menu && menu.length" 
		class="v-menu" 
		:class="{'_child-menu':isChild,'_size-small':size==='small'}"
		:style="menuStyle"
	>
		<div
			v-for="(item,index) in menu"
			:key="index"
			class="_menu-item g-relative"
			:class="{_disabled:item.disabled,'_child-menu-tem':isChild,_hr:item.isHR}"
			@click.stop="handleClickMenuItem(item)"
		>
			<div class="_left-cell g-flex-0 g-flex-center">
				<!-- <i v-if="item.icon" :class="getIcon(item.icon)" class="g-m-r-8" /> -->
				<img v-if="item.icon" :src="getIcon(item.icon)" alt="" style="width:16px;height:16px">
			</div>
			<div class="_right-cell g-flex-1 g-flex g-ai-c">
				<span v-if="item.label" class="g-flex-1 g-one-line">{{ item.label }}</span>
				<span class="g-flex-0 g-m-lr-6 g-fs-12">
					<a-icon v-if="item.children && item.children.length" type="right" />
				</span>
			</div>
			<context-menu v-if="item.children && item.children.length" :menu="item.children" is-child @click-menu-item="handleClickMenuItem" />
		</div>
	</div> 
</template>
<script>
export default {
	name: "context-menu",
	components: {},
	props: {
		menu: Array,
		isChild: Boolean,
		size: {
			type: String,
			default: "common" // small
		}
	},
	data() {
		return {
			menuStyle: {}
		};
	},
	mounted(){
		// console.log(this.$el.getBoundingClientRect());

	},

	methods: {
		handleClickMenuItem(item) {
			this.$emit("click-menu-item", item);
		},
		getIcon(icon) {
			if (!icon) return;
			if (icon.startsWith("statics")) return icon;
			return "statics/images/sysml/" + icon + ".svg";
		}
	}
};
</script>
<style lang="scss">
.v-menu {
	box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05),
		0px 6px 16px 0px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12);
	border-radius: 2px;
	border: 1px solid #d8d8d8;
	._menu-item {
		display: flex;
		height: 28px;
		font-size: 12px;
		cursor: pointer;
		&._hr{
			border-bottom: 1px solid rgba(220,219,219,1);
		}
		& > ._left-cell {
			padding-left: 15px;
			width: 34px;
			background-color: #fff;
		}
		& > ._right-cell {
			min-width: 136px;
			background-color: #fff;
			padding-left: 6px;
			color: #333;
		}
		&:hover {
			& > ._left-cell {
				background:linear-gradient(180deg,rgba(231,245,254,1) 0%,rgba(199,232,255,1) 60%,rgba(176,222,255,1) 66%,rgba(178,221,253,1) 100%);
			}
			& > ._right-cell {
				background:linear-gradient(180deg,rgba(231,245,254,1) 0%,rgba(199,232,255,1) 60%,rgba(176,222,255,1) 66%,rgba(178,221,253,1) 100%);
				color: #000;
				font-weight: 600;
			}
			& > ._child-menu {
				display: block;
			}
		}
		&._disabled {
			& > ._right-cell {
				color: #979797;
				cursor: not-allowed;
			}
			&:hover {
				& > ._left-cell {
					background-color: #DAEAF3
				}
				& > ._right-cell {
					background-color: #fff;
				  color: #979797;
					font-weight: 400;
				}
				& > ._child-menu {
					display: none;
				}
			}
		}
	}
	&._size-small{
		._menu-item {
				& > ._left-cell {
					width: 32px;
				}
				& > ._right-cell {
					padding-left: 6px;
					min-width: 72px;
				}

		}

	}
}
._child-menu {
	display: none;
	position: absolute;
	top: 0;
	left: 100%;
	margin-left: 0px;
}
</style>