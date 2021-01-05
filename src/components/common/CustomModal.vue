<template>
	<div class="c-model-wapper" :style="{opacity,zIndex:conStyle.zIndex}">
		<div v-if="mask" :style="{zIndex:conStyle.zIndex}" class="c-modal-mask" /> 
		<div
			ref="modal"
			class="c-modal"
			:style="conStyle"
			@click="handleModalClick"
		>
			<div class="c-modal--title g-flex" @mousedown="handleTitleMouseDown">
				<div class="g-flex-1">
					<slot name="title"><span class="g-fs-14 g-lh-30">{{ title }}</span></slot>
				</div>
				<template v-if="showSizer">
					<div v-if="sizerState==='normal'" class="g-flex-0 _close-btn" @click.stop="handleSizeChange('small')">
						<img src="statics/icons/simulation/topicon1.png">
					</div>
					<div v-else-if="sizerState==='small'" class="g-flex-0 _close-btn" @click.stop="handleSizeChange('normal')">
						<img src="statics/icons/simulation/topicon2.png">
					</div>
				</template>
				<div v-if="showClose" class="g-flex-0 _close-btn" @click.stop="$emit('cancel')">
					<img src="statics/icons/simulation/topicon3.png">
				</div>
			</div> 
			<div class="c-modal--content">
				<slot />
			</div>
			<div v-if="showFooter" class="c-modal--footer">
				<slot name="footer">
					<a-button v-if="cancelText" class="g-m-r-12" @click="$emit('cancel')">{{ cancelText }}</a-button>
					<a-button
						v-if="okText"
						type="primary"
						@click="$emit('ok')"
					>
						{{ okText }}
					</a-button>
				</slot>
			</div>
		</div> 
	</div>
</template>
<script>
// 模态框实例数组，用于计算z-index
const modalInstanceList = [];
// 窗口拖动条高度，electron下才会有
const windowBarHeight = process.platform !== "browser" ? 32 : 0;

export default {
	name: "custom-modal",
	props: {
		title: {
			type: String,
			default: "Title"
		},
		value: Boolean,
		keepAlive: Boolean,
		okText: {
			type: String,
			default: "确定"
		},
		cancelText: {
			type: String,
			default: "取消"
		},
		width: {
			type: String,
			default: "736px"
		},
		top: {
			type: [String, Number],
			default: "15%"

		},
		left: {
			type: [String, Number]
			// default: '30%'

		},
		showFooter: {
			type: Boolean,
			default: true
		},
		showSizer: Boolean,
		showClose: {
			type: Boolean,
			default: true
		},
		mask: Boolean

	},
	data() {
		let left = typeof this.left === "number" ? this.left + "px" : this.left;
		const width = typeof this.width === "number" ? this.width + "px" : this.width;
		if (left === undefined){
			left = `calc(50% - ${parseFloat( width) / 2}px)`;
		}
		let top = this.top;
 
		return {
			visible: this.value,
			conStyle: {
				zIndex: this.getZIndex(),
				width,
				left,
				top: typeof top === "number" ? top + "px" : top
			},
			sizerState: "normal" // small / large / normal

		};
	},
	computed: {
		opacity(){
			return this.visible ? 1 : 0;
		}

	},
	watch: {
		value(val){
			this.visible = val;
		},
		"$route.path"(){
			if (!this.keepAlive){
				this.$emit("cancel");

			}
      
		}

	},
	created(){
		modalInstanceList.push(this);

	},
	mounted(){
		// 
		// setTimeout(() => {
		//   this.conStyle.zIndex = this.getZIndex();
      
		// }, 100);

	},
	beforeDestroy(){
		const index = modalInstanceList.findIndex(instance => instance === this);
		if (index > -1){
			modalInstanceList.splice(index, 1);
		}

	},
	methods: {
		getZIndex(){
			const list = modalInstanceList.filter(i => i !== this);
			if (list.length === 0) return 1000;
			const zIndexArr = list.map(i => i.conStyle.zIndex);
			const maxZIndex = Math.max(...zIndexArr, 1000);
			return maxZIndex + 1;
		},
		getTop(top){
			const modal = this.$refs.modal;
			top = top <= 0 ? 0 : (top >= document.body.offsetHeight - modal.offsetHeight - 1 ? document.body.offsetHeight - modal.offsetHeight - 1 : top);
			if (top < windowBarHeight){
				top = windowBarHeight;
			}
			return top;

		},
		getLeft(){

		},

		handleTitleMouseDown(){
			const modal = this.$refs.modal;
			let X = event.clientX - modal.offsetLeft;
			let Y = event.clientY - modal.offsetTop;
			const mouseMoveHandler = event => {
				let left = event.clientX - X;
				let top = event.clientY - Y;
				left = left <= 0 ? 0 : (left >= document.body.offsetWidth - modal.offsetWidth - 1 ? document.body.offsetWidth - modal.offsetWidth - 1 : left);
				top = this.getTop(top);
				// top = top <= 0 ? 0 : (top >= document.body.offsetHeight - modal.offsetHeight - 1 ? document.body.offsetHeight - modal.offsetHeight - 1 : top);
				// if (top < windowBarHeight){
				//   top = windowBarHeight;
				// }
				requestAnimationFrame(() => {
					this.conStyle.left = left + "px";
					this.conStyle.top = top + "px";

				});
        
			};
			const mouseUpHandler = (event) => {
				window.removeEventListener("mousemove", mouseMoveHandler);
				window.removeEventListener("mouseup", mouseUpHandler);

			};
			window.addEventListener("mousemove", mouseMoveHandler);
			window.addEventListener("mouseup", mouseUpHandler);

		},
		handleModalClick(){
			this.conStyle.zIndex = this.getZIndex();

		},
		handleSizeChange(size){
			this.sizerState = size;
			this.$emit("sizeChange", size);

		}

	}
};
</script>
<style lang="scss">
.c-model-wapper {
  transition: opacity .2s ease;
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
}
.c-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(100,100,100,0.2);

}
.c-modal {
  position: fixed;
  box-sizing: border-box;
  width: 736px;
  box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05),
  0px 6px 16px 0px rgba(0, 0, 0, 0.08),
  0px 3px 6px -4px rgba(0, 0, 0, 0.12);
  border-radius: 2px;
  background: #ffffff;
  .c-modal--title {
    overflow: hidden;
    color: #ffffff;
    background: linear-gradient(180deg, rgba(75, 158, 216, 1) 0%,
      rgba(48, 126, 178, 1) 41%,
      rgba(29, 103, 151, 1) 100%);
    padding-left: 20px;
    height: 30px;
    ._close-btn {
      width: 30px;
      text-align: center;
      line-height: 25px;
      cursor: pointer;
      &:hover {
        background: rgba(157, 17, 18, 1);   
      }
    }
  }
  .c-modal--content {
    margin: 0;
    font-size: 12px;
  }
  .c-modal--footer {
    overflow: hidden;
    // height: 40px;
    border-top: 1px solid #eee;
    text-align: right;
    padding: 12px 20px;
   
  }
  
}
</style>
