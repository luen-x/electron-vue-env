<template>
	<m-modal
		v-model="visible"
		:show-footer="false"
		:show-close="false"
		title="请稍后..."
		class="v-save-loading"
		width="400px"
		mask
	>
		<div class="_content">
			<div class="g-flex-center g-pd-t-30">
				<div style="width:300px;height:20px;overflow:hidden" class="g-relative">
					<div class="_move-bar" />
				</div>
			</div>

			<div class="g-tc g-pd-tb-20 g-bold">
				<a-icon type="sync" spin style="color: rgb(11,108,156)" />
				<span class="g-m-l-10"> 保存中...</span>
			</div>
		</div>
	</m-modal>
</template>
<script>
import { Portal } from "@/components/common/Portal.vue";
import Modal from "@/components/common/CustomModal";
import { sleep } from "@/util/common";
const com = {
	name: "comp-save-loading",
	components: {
		"m-modal": Modal

	},
	props: {
		time: {
			type: Number,
			default: 2 // 秒
		},
		saveFn: Function
	},
	data() {
		return {
			visible: false
		};
	},
	mounted(){
		this.visible = true;
		setTimeout(() => {
			this.startSave();
      
		}, 100);

	},
	methods: {
		handleOk(res){
			this.visible = false;
			this.$emit("sure", res);
		},
		handleCancel(e){
			this.visible = false;
			this.$emit("close", e);
		},
		startSave(){
			console.log("ssssssss");
			Promise.all([
				this.saveFn(),
				sleep(this.time)

			]).then(() => {
				this.handleOk();
			}).catch(e => {
				console.log("cccccccccc");
				console.error(e);
				this.handleCancel(e);
			});
		}
	}
};

export default com;
export const saveLoading = new Portal(com);
</script>
<style lang="scss" scoped>
@keyframes save-loading {
 from { transform: translateX(-50%)}
	to{ transform: translateX(0%)}
}
.v-save-loading {
	._content {
		background: #d4ebf8
	}
	._move-bar {
		position: absolute;
		// background: linear-gradient(to right,#fff, blue, #fff,blue, #fff), ;
    background-image:
    
    repeating-linear-gradient(to right,rgba(54, 229, 241, 0.5) 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0) 30%,rgba(54, 229, 241, 0.5) 50% , rgba(255,255,255,0) 70%, rgba(255,255,255,0) 80%,rgba(54, 229, 241, 0.5) 100%), 
    linear-gradient(to bottom, rgb(177,236,243) 0% ,  rgb(177,236,243) 20%, rgb(11,108,156) 50%, rgb(16,154,211) 80%, rgb(16,154,211) 100%);
		width: 200%;
		height:100%;
		animation: 1s linear 0s infinite normal save-loading;
		// animation-name: save-loading;
		// animation-iteration-count:infinite;
		// animation-direction: 0.5;
		// animation: save-loading duration timing-function delay iteration-count direction fill-mode;
	}

}
</style>