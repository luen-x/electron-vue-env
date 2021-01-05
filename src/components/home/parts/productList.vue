<template>
	<div class="v-productList">
		<div v-for="(item, index) in productList" :key="index" class="_list-item">
			<div>
				<img :src="item.img" class="_bg-img">
				<img v-show="item.type=='video'" src="statics/icons/app/iconplay.png" class="_play-icon">
			</div>
			<div class="_title">{{ item.name }}</div>
		</div>
	</div>
</template>

<script>

export default {
	name: "product-list",
	props: {
		navType: {
			type: String,
			default: "productCase" 
		}
	},
	data() {
		return {
			productCaseList: [
        
				{
					name: "HUAWEI-5G城域网核心交换机案例",
					type: "",
					img: "statics/images/draw/piccase1.png"
				},
				{
					name: "混动suv案例",
					type: "",
					img: "statics/images/draw/picase2.png"
				},
				{
					name: "卫星案例",
					type: "",
					img: "statics/images/draw/piccase3.png"
				},
				{
					name: "火箭案例",
					type: "",
					img: "statics/images/draw/piccase4.png"
				}
        
			],
			videoCourseList: [
				{
					name: "软件基础操作教程",
					type: "",
					img: "statics/images/draw/design.png"
				},
				{
					name: "M-Design产品PPT",
					type: "",
					img: "statics/images/draw/picppt@2x.png"
				},
				{
					name: "图形区操作教程",
					type: "video",
					img: "statics/images/draw/design.png"
				},
				{
					name: "M-Design产品PPT",
					type: "video",
					img: "statics/images/draw/design.png"
				},
				{
					name: "M-Design产品PPT",
					type: "",
					img: "statics/images/draw/picppt2.png"
				},
				{
					name: "M-Design产品PPT",
					type: "",
					img: "statics/images/draw/picppt.png"
				},
				{
					name: "M-Design产品PPT",
					type: "",
					img: "statics/images/draw/picppt4.png"
				},
				{
					name: "M-Design产品PPT",
					type: "",
					img: "statics/images/draw/picppt@2x.png"
				}
			]
		};
	},
	computed: {
		productList() {
			return this[this.navType + "List"];
		}
	}
};
</script>
<style lang="scss" scoped>
.v-productList {
	padding: 46px 50px 46px 70px;
	display: flex;
	flex-wrap: wrap;
	._list-item {
		width: 284px;
		margin-right: 20px;
		margin-bottom: 20px;
    position: relative;
    &:hover {
			box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
		}
    ._bg-img {
      width: 100%;
      border-radius: 10px 10px 0 0;
    }
    ._play-icon {
      position: absolute;
      width: 40px;
      top: 37px;
      left: 83px;
    }
    ._title {
      text-align: center;
      font-size: 16px;
      font-weight: 700;
      color: #000;
      line-height: 24px;
      padding-top: 16px;
      padding-bottom: 40px;
      background: white;
    }
	}
}
</style>
