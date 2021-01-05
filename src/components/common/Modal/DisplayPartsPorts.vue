<template>
	<m-modal
		v-model="visible"
		:show-footer="showFooter"
		:show-close="showClose"
		:title="title"
		:ok-text="okText"
		:cancel-text="cancelText"
		:mask="mask"
		class="settingModal"
		@cancel="handleCancel"
		@ok="handleOk"
	>
		<div class="_content">
			<div class="header">待补充描述文字</div>
			<div class="body">
				<a-tree 
					checkable 
					check-strictly
					default-expand-all
					:tree-data="treeData"
					:default-checked-keys="checkedKeys"
					@check="onCheck"
				/>
			</div> 
		</div>
	</m-modal>
</template>
<script>
import { Portal } from "@/components/common/Portal.vue";
import Modal from "@/components/common/CustomModal";
const com = {

	name: "comp-modal-ibdsetting",
	components: {
		"m-modal": Modal
	},
	props: {
		title: {
			type: String,
			default: "选择ports和parts"
		},
		text: {
			type: String
		},
		content: {
			type: String,
			default: "确定？"
		},
		showFooter: {
			type: Boolean,
			default: true
		},
		showClose: {
			type: Boolean,
			default: true
		},
		okText: {
			type: String,
			default: "确定"
		},
		cancelText: {
			type: String,
			default: "取消"
		},
		status: {
			type: String,
			default: "info"
		},
		mask: {
			type: Boolean,
			default: true
		},
		treeData: {
			type: Array
		}
	},
	data() {
		return {
			visible: false,
			replaceFields: {
				children: "child",
				title: "name"
			},
			checkedIds: []
		};
	},
	mounted(){
		this.visible = true;
		this.checkedIds = this.checkedKeys;
	},
	computed: {
		checkedKeys(){
			return this.treeData && this.treeData[0].children.map((item) => item.value);
		}
	},
	methods: {

		onCheck(checkedKeys, info) {
			this.checkedIds = checkedKeys.checked;
			console.log("onCheck", checkedKeys, info);
		},
		handleOk(){
			this.visible = false;
			const checkedNodes = this.treeData[0].children.filter((item) => {
				return this.checkedIds.includes(item.key);
			});
			this.$emit("sure", checkedNodes);
		},
		handleCancel(e){
			this.visible = false;
			this.$emit("close", e);
		}
	}
};
export default com;
export const displayPartsPorts = new Portal(com);
</script>
<style lang="scss">
._content{
  .header{
    height: 100px;
  }
  .body{

  }
}
</style>