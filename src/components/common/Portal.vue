<template>
	<div class="c-portal-container">
		<component
			:is="item.comp"
			v-for="(item,index) in list"
			:ref="item.key"
			:key="item.key"
			v-bind="item.props"
			@close="list[index].close"
			@sure="list[index].sure"
		/>
	</div>
</template> 
<script>
// import { getUid } from '@util/common';
let i = 1;
const getUid = () => i++;
const list = [];
let vm;
/**
 * 传送门
 * 
 */ 
export class Portal{
	constructor(comp, option = {}){
		if (!comp) throw new Error("portal 的 Component 必传");
		if (!comp.name) throw new Error("portal 的 Component.name 必传");
		this.comp = comp;
		this.option = option;

	}
	popup(props = {}, option = { }){
		const { single = false } = { ...this.option, ...option };
		
		return new Promise((resolve, reject) => {
			const key = single ? this.comp.name : getUid();
			const listItem = {
				comp: this.comp, 
				props, option, 
				key,
				close(data) {
					listItem.remove();
					reject(data);	
				},
				sure(data){
					listItem.remove();
					resolve(data);
				},
				remove(){
					setTimeout(() => {
						const index = list.indexOf(this);
						if (index > -1){
							list.splice(index, 1);
						} 
					}, 300);
				},
				removeImmediately(){
					const index = list.indexOf(this);
					if (index > -1){
						list.splice(index, 1);
					}
				},
				getInstance(){
					return vm && vm.$refs[key] && vm.$refs[key][0];
				}
			};
			if (props.getPortal){
				props.getPortal(listItem);
				delete props.getPortal;
			}
			
			const index = list.findIndex(item => item.key === listItem.key);
			if (index === -1){
				list.push(listItem);
			} else {
				list.splice(index, 1, listItem);
			}
		});
	}
}
// 唯一的portal容器
export default {
	name: "c-portal-container",
	components: {
	},
	props: {
	},
	data() {
		return {
			list
		};
	},
	created(){
		vm = this;
	},
	methods: {
	}
};
</script>
<style lang="scss">
</style>