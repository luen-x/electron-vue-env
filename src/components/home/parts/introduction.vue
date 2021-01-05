<template>
	<div class="introduction">
		<Card 
			name="产品介绍"
		>
			<div slot="content" class="introduction_content container">
				<div class="text">
					<p>2008-2010年公司前期为浙江大学CAD&CG国家重点实验室刘玉生教授团队，开始接触MBSE，获得ASME最佳会议论文。</p>
					<p>2011年研发国有自主可控MBSE平台M-Design 1.0（单机版），2017年成立杭州华望系统科技有限公司—专门从事MBSE的研发、培训、咨询与实施。</p>
					<p>2018年成为华为集团公司的国内唯一的MBSE咨询服务商。为航天五院一起规划整院MBSE发展计划，</p>
					<p>2019年认证成为航天五院总体部等的MBSE供应商。研发B/S结构的MBSE平台M-Design 2.0，荣获第五届中国互联网+创业大赛金奖。2020年通过ISO 9000质量体系认证。正进行保密资质认证。正在进行M-Design 3.0开发。</p>
				</div>
				<div class="imgage">
					<img src="statics/images/draw/piccpjs.png">
				</div>
			</div>
		</Card>
		<Card 
			name="产品历程" 
			style="margin-top:44px"
		>
			<div slot="content" class="introduction_course container">
				<div
					v-for="(item, index) in courseList" 
					:key="index" 
					class="course_list"
				>
					<span>{{ item.name }}</span>
					<span>{{ item.dec }}</span>
				</div>
			</div>
		</Card>
		<Card 
			name="其他系列产品"
			style="margin-top:62px"
		>
			<div slot="content" class="introduction_other container" style="height:300px">
				<div
					v-for="(item, index) in otherImage" 
					:key="index" 
					class="other_list"
					:style="`background-image:url('${item}')`"
				/>
			</div>
		</Card>
	</div>
</template>

<script>
const otherImage = [
	"statics/images/draw/MRequire.png",
	"statics/images/draw/MArch.png",
	"statics/images/draw/MReliability.png",
	"statics/images/draw/MLinker.png"  
];
export default {
	name: "introduction",
	components: {
		Card: {
			render(h) {
				let content = this.$slots.content;
				return h(
					"div", { 
						class: "introduction_card"
					}, [
						h(
							"div", {
								class: "name",
								style: {
									width: "100%",
									fontSize: "18px",
									color: "rgba(0,0,0,1)",
									lineHeight: "22px",
									paddingLeft: "10px",
									padding: "16px 10px",
									borderBottom: "1px solid #B1CEE2"
								},
								domProps: {
									innerHTML: this.name
								}
							}
						),
						h("div", content)
					]
				); },
			props: ["name"]
		}
	},
	data() {
		return {
			otherImage,
			courseList: [
				{
					name: "2011/M-Design 1.0（单机版）",
					dec: "研发国有自主可控MBSE平台"
				},
				{
					name: "2019/M-Design 2.0",
					dec: "2019年认证成为航天五院总体部等的MBSE供应商。研发B/S结构的MBSE平台"
				},
				{
					name: "2020/M-Design 3.0",
					dec: "通过ISO 9000质量体系认证。正进行保密资质认证"
				}
			]

		};
	}
};
</script>
<style lang="scss" scope>
.introduction {
  height: 100%;
  width: 84%;
  margin: auto;
  padding-top: 24px;
}
.introduction .container {
  padding: 0 12px;
}
.introduction_content {
  overflow: hidden;
  position: relative;
  margin-top: 16px;
  p {
     margin: 0;
    line-height: 28px;
    color:#5a5a5a;
  }
  .text {
    float: left;
    width: 60%;
  }
}
.introduction {
  .imgage {
    float: right;
    width: 267px;
    transform: translateY(-50%);
    position: absolute;
    right: 12px;
    top: 50%;
    img {
      width: 100%;
      height: auto;
    }
  }
}

@media screen and (max-width: 900px) {
  .introduction .imgage {
    width: 186px;
  }
}

.introduction_course {
  width: 100%;
  overflow: hidden;
  .course_list {
    float: left;
    width: 31%;
    margin-right: 40px;
    margin-top: 30px;
    &:last-child {
    margin-right: 0;
    margin-top: 30px;
    }
    span {
      font-size:18px;
      font-weight:600;
      color:rgba(0,0,0,1);
      line-height:25px;
      display: block;
      &:last-child {
        font-size:14px;
        font-weight:400;
        color:#5a5a5a;
        line-height:20px;
        margin-top: 6px;
      }
    }
  }
}

@media screen and (max-width: 1440px) {
  .introduction_course .course_list  {
    margin-right: 30px;
  }
}
.other_list {
  width:214px;
  height:68px;
  background-color:rgba(255,255,255,1);
  border-radius: 2px;
  border:1px solid rgba(153,177,197,1);
  background-position: center;
  background-repeat: no-repeat;
  // background-size: 67%;
  margin-top: 30px;
  float: left;
  margin-right: 16px;
}
</style>
