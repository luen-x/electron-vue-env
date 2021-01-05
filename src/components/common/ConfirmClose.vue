<template>
	<m-modal
		v-model="visible"
		:show-footer="showFooter"
		:title="title"
		:ok-text="okText"
		:cancel-text="cancelText"
		:un-save="unSave"
		:mask="mask"
		class="v-confirm"
		width="400px"
		@cancel="handleCancel"
		@ok="handleOk"
	>
		<div class="_content">
			<div class="g-m-r-20 g-pd-t-4">
				<a-icon v-if="status=='error'" type="close" style="background:red;border-radius:50%;color:white;padding:2px" />
				<a-icon v-else-if="status=='info'" type="info" style="background:dodgerblue;border-radius:50%;color:white;padding:2px" />
				<a-icon v-else-if="status=='warn'" type="exclamation" style="background:orange;border-radius:50%;color:white;padding:2px" />
			</div>
			<div class="__content-wrapper">
				<m-content v-if="renderContent" :render="renderContent" />
				<template v-else>
					<div class="__sub-title">
						{{ subTitle }}
					</div>
					<div v-if="content" class="__content">
						{{ content }} 
					</div>
					<div v-if="subContent" class="__sub-content">
						{{ subContent }}
					</div>
					<div v-if="explain" class="__explain">
						{{ explain }}
					</div>
				</template>
			</div>
		</div>
    
		<div class="c-modal--footer">
			<slot name="footer">
				<a-button v-if="cancelText" class="g-m-r-12" @click="handleCancel">{{ cancelText }}</a-button>
				<a-button v-if="unSave" class="g-m-r-12" @click="handleUnSave">{{ unSave }}</a-button>
				<a-button
					v-if="okText"
					type="primary"
					@click="handleSave"
				>
					{{ okText }}
				</a-button>
			</slot>
		</div>
	</m-modal>
</template>
<script>
import { Portal } from "@/components/common/Portal.vue";
import Modal from "@/components/common/CustomModal";
import { sleep, createFunctionalComponent } from "@/util/common";
const ContentRender = createFunctionalComponent();
const com = {
	name: "comp-confirm-close",
	components: {
		"m-modal": Modal,
		"m-content": ContentRender

	},
	props: {
		title: {
			type: String,
			default: "提示"
		},
		subTitle: String,
		content: {
			type: String,
			default: "确定？"
		},
		subContent: String,
		explain: String,
		showFooter: {
			type: Boolean,
			default: false
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
		unSave: {
			type: String,
			default: "不保存"
		},
		status: {
			type: String,
			default: "info"
		},
		mask: {
			type: Boolean,
			default: true
		},
		renderContent: Function
  
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
		handleCancel(){
			this.visible = false;
			this.$emit("close");
		},
		handleSave(){
			this.handleOk({ type: "save" });

		},
		handleUnSave(){
			this.handleOk({ type: "unSave" });

		}
	}
};

export default com;
export const confirmClose = new Portal(com);
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
      .__sub-title {
        color: black;
        font-weight: 600;
        margin-bottom: 8px;
        font-size: 14px;

      }
      .__content{
        color: rgba($color: #000000, $alpha: 0.85);
      }
      .__sub-content{
        color: rgba($color: #000000, $alpha: 0.85);
      }
      .__explain{
        color: rgba($color: #000000, $alpha: 0.65);
      }

    }

	}

}
</style>