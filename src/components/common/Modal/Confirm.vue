<template>
	<m-modal
		v-model="visible"
		:show-footer="showFooter"
		:show-close="showClose"
		:title="title"
		:ok-text="okText"
		:cancel-text="cancelText"
		:mask="mask"
		class="v-confirm"
		width="300px"
    
		@cancel="handleCancel"
		@ok="handleOk(okText)"
	>
		<div class="_content">
			<a-icon type="exclamation-circle" theme="filled" style="color:rgb(251,173,22);fontSize:16px;paddingTop:5px" />
			<div class="__content-wrapper  g-tl">
				<div class="_text">{{ text }}</div>
				<div style="whiteSpace:pre-line">{{ content }}</div>
			</div>
		</div> 
	</m-modal>
</template>
<script>
import { Portal } from "@/components/common/Portal.vue";
import Modal from "@/components/common/CustomModal";

const com = {
	name: "comp-comfirm",
	components: {
		"m-modal": Modal

	},
	props: {
		title: {
			type: String,
			default: "提示"
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
		}
  
	},
	data() {
		return {
			visible: false
		};
	},
	mounted(){
		this.visible = true;

	},
	methods: {
		handleOk(res){
			this.visible = false;
			this.$emit("sure", res);
      
		},
		handleCancel(e){
			this.visible = false;
			this.$emit("close", e);
		}
	}
};

export default com;
export const confirm = new Portal(com);
</script>
<style lang="scss" scoped>

.v-confirm {
	._content {
		display: flex;

		background: white;
    padding: 20px;
    .__icon-wrapper { 
      width: 60px;
      flex: 0 0 60px

    }
    .__content-wrapper { 
      width: 100px;
      flex:1 1 auto;
      margin-left: 20px;
      ._text{
        font-size: 14px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.85);
        line-height: 24px;
      }
    }

	}

}
</style>