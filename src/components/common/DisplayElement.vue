<template>
	<m-modal
		v-model="visible"
		class="displayElement"
		title="显示关联元素"
		ok-text="确定"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<m-attr-tip type="displayElement" />
		<div class="row">
			<div class="g-inline-block _label">元素名称</div>
			<div class="g-inline-block _content">{{ name }}</div>
		</div>
		<div class="row">
			<div class="g-inline-block _label">关系方向</div>
			<div class="g-inline-block _content">
				<a-radio-group v-model="direction">
					<a-radio value="in">
						仅入方向
					</a-radio>
					<a-radio value="out">
						仅出方向
					</a-radio>
					<a-radio value="both">
						全部
					</a-radio>
				</a-radio-group>
			</div>
		</div> 
		<div class="row">
			<div class="g-inline-block _label">范围</div>
			<div class="g-inline-block _content">
				<a-radio-group v-model="scope">
					<a-radio :value="1">
						当前包
					</a-radio>
					<a-radio :value="2">
						整个项目
					</a-radio>
				</a-radio-group>
			</div>
		</div>
		<div class="row">
			<div class="g-inline-block _label">层级</div>
			<div class="g-inline-block _content">一级</div>
		</div>
		<div class="row" style="minHeight:155px">
			<div class="g-inline-block _label">关系</div>
			<div class="g-inline-block _content">
				<a-checkbox-group v-model="checkList" :options="options" @change="onChange" />
			</div>
		</div>
	</m-modal>
</template>
<script>
import { Portal } from "@/components/common/Portal.vue";
import Modal from "@/components/common/CustomModal";
import AttrTip from "@/components/Attribute/comps/AttrTip";
import { getCNnameByENname } from "@/api/config/ConfigUtil.js";
const comp = {
	name: "comp-dispalyelement",
	components: {
		"m-modal": Modal,
		"m-attr-tip": AttrTip
	},
	props: {
		name: String,
		relation: Array,
		type: String,
		clickedCell: Object
	},
	data() {

		return {
			visible: false,
			direction: "out",
			scope: 2,
			checkList: []
		};
	},
	mounted(){
		this.visible = true;
	},
	computed: {
		options(){
			return this.relation.map((item) => { return { label: getCNnameByENname(item), value: item }; });
		}
	},

	methods: {
		onChange(checkedList){
			this.checkList = checkedList;
		},
		handleCancel(){
			this.visible = false;
			this.$emit("close");
		},
		handleOk(){
			this.visible = false;
			this.$emit("sure", { relations: this.checkList, direction: this.direction });
		}
	}
};
export default comp;
export const dispalyelement = new Portal(comp);
</script>
<style lang="scss">
.displayElement{
  .row{
  height: 28px;
  line-height: 26px;
  border: 1px solid  #E4E3E3;
  ._label{
      width: 133px;
      padding-left: 18px;
      font-size: 12px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.65);
      line-height: 25px;
      border-right: 1px solid  #E4E3E3;
  }
  ._content{
    padding-left: 5px;
  }
}
}

</style>
