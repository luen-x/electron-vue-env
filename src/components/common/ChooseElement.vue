<template>
	<m-modal
		v-model="visible"
		v-clickoutside="handleCancel"
		width="178px"
		class="v-choose-element"
		:title="title"
		:left="x"
		:top="y"
		:show-footer="false"
		@cancel="handleCancel"
	>
		<div>
			<div class="g-tc">
				<a-input-search v-model="keyWord" placeholder="搜索关键字" size="small" style="width: 146px;margin:10px" />
			</div>
     
			<div class="_content">
				<div v-if="listFilterd.length===0" class="g-tc">
					无匹配项
				</div>
				<div v-for="(group,index) in listFilterd" :key="index" class="_item-group">
					<div v-for="(item,index) in group.children" :key="index" class="_item" @click="handleClickItem(item)">
						<img :src="item.icon" style="position: relative;top: -3px;" class="g-m-r-4 g-m-l-8">
						<span>
							{{ item.label }} 
						</span>
					</div>
				</div>
			</div>
		</div>
	</m-modal>
</template>
<script>
import CustomModal from "@/components/common/CustomModal";
import { Portal } from "@/components/common/Portal.vue";
import Clickoutside from "@/components/common/ContextMenu/clickoutside";
// import { ModelTreeDataGenerator } from "src/api/generator/model-tree-data-generator";
import { getNodePath, treeForEach } from "@/util/common";
// import { SysmlDiagramHelper } from "src/api/sysml-imports";
// import { GenericTableApi } from "src/api/shape/GenericTableApi";
import treeUtil from "@/components/modelTree/treeUtil";

const comp = {
	name: "choose-element",
	components: {
		"m-modal": CustomModal
	},
	props: {
		title: String,
		x: Number,
		y: Number,
		list: Array // [[{label:'',value:'',icon:'',children:[]}]] // 第一层为分组，一组的元素会出现分割线，后期考虑做分组title，第二层为用于选择的元素
	},
	directives: {
		Clickoutside
	},
	data() {

		return {
			keyWord: "",
			visible: false,
			hasClicked: false

		};
	},
	computed: {
		listFilterd(){
			if (!this.keyWord) return this.list;
			else {
				const listFilterd = [];
				this.list.forEach(group => {
					const matchs = 	group.children.filter(i => i.label.includes(this.keyWord));
					if (matchs.length){
						listFilterd.push( { ...group, children: matchs });
					}

				});
				return listFilterd;
			}
		}

	},
	beforeMount() {

	},
	mounted(){
		this.visible = true;
	},
	methods: {
		handleOk(key){
			this.visible = false;

			this.$emit("sure", key);
		},
		handleCancel(){
			this.visible = false;
			this.$emit("close");
		},

		handleClickItem(item){
      
			if (this.hasClicked) return;
			this.hasClicked = true;
			this.handleOk(item);

		}
	}
};

export default comp;
export const chooseElement = new Portal(comp);
</script>
<style lang="scss" scoped>
.v-choose-element {

	._content {
    max-height: 300px;
    min-height: 30px;
    overflow: auto;
    padding: 0 0 10px 0;
		._item-group{
      border-bottom: 1px solid #DAE5ED;
      padding: 0 16px;
      &:last-of-type {
         border-bottom:none
      }
			._item{
        background: white;
        height: 24px;
        line-height: 24px;
        cursor: pointer;
        &:hover {
          background: linear-gradient(180deg, #e7f5fe 0%, #c7e8ff 60%, #b0deff 66%, #b2ddfd 100%);
        }

			}
		}

	}
}
</style>
