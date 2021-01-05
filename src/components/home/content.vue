<template>
	<div class="v-home">
		<a-tabs
			v-model="activeKey"
			type="editable-card"
			class="tabs"
			hide-add
			@edit="onEdit"
		>
			<a-tab-pane
				key="1"
				:closable="false"
				style="height:100%"
			>
				<div slot="tab" style="fontSize:12px;height:20px" class="tab-titles">
					<img src="statics/images/mainpage/iconhi.svg" style="margin-top:-3px">
					<span> 欢迎使用M-Design </span>
				</div>
				<div class="_hello-main">
					<div class="_navLeft"> 
						<div ref="navLeftUl">
							<div
								v-for="(item,index) in navList"
								:key="index"
								class="__nav-item g-pointer"
								@click="handleNavClick(item,index)"
							>
								<img class="_img" :src="item.img"> <br>
								<span class="_title">{{ item.name }}</span>
							</div>
							<div v-if="arrowTop" ref="downDom" class="__arrow" :style="{top:arrowTop+'px'}" />
						</div>
					</div>
					<div class="_hello-content" :class="{isBackground: contentType!=='recentProjects'}">
						<m-recentProjects v-if="contentType==='recentProjects'" @click-project="handleclickProject" />
						<m-introduction v-else-if="contentType==='introduction'" />
						<m-productList v-else-if="contentType==='productList'" :nav-type="currentNav" />
					</div>
				</div>
			</a-tab-pane>
		</a-tabs>
	</div>
</template>

<script>
// import localFile from "@/util/LocalFile";
import Introduction from "./parts/introduction";
import ProductList from "./parts/productList";
import RecentProjects from "./parts/recentProjects";
import { addProject } from "@/components/home/modals/addProject.vue";
import { saveLoading } from "@/components/project/modals/saveLoading";

export default {
	name: "hello",
	components: {
		"m-introduction": Introduction,
		"m-recentProjects": RecentProjects,
		"m-productList": ProductList
	},
	filters: {
	},
	data() {

		return {
			arrowTop: 0,
			currentNav: "recentProjects",
			navList: [
				{
					name: "新建项目",
					key: "newProject",
					img: "statics/icons/app/welcomeiconadd.png"
				},
				{
					name: "打开项目",
					key: "openProject",
					img: "statics/icons/app/welcomeiconopen.png"
				},
				{
					name: "产品介绍",
					key: "introduction",
					img: "statics/icons/app/welcomeiconintro.png"
				},
				{
					name: "项目案例",
					key: "productCase",
					img: "statics/icons/app/welcomeiconcase.png"
				},
				{
					name: "视频教程",
					key: "videoCourse",
					img: " statics/icons/app/welcomeiconcourse.png"
				}
			],
			activeKey: "1",
			newTabIndex: 0,
			serverProjects: []
		};
	},
	computed: {
		contentType() {

			if ( this.currentNav === "introduction" ) {
				return "introduction";
			} else if ( this.currentNav === "productCase" || this.currentNav === "videoCourse" ) {
				return "productList";
			} else return "recentProjects";
		}
	},
	watch: {

	},
	mounted(){

	},
	methods: {
		handleNavClick(item, index){
			this.arrowTop = index * 73 + 36.5;
			this.currentNav = item.key;
			if (item.key === "newProject") {
				  this.handleAddProject();

			} else if (item.key === "openProject"){
				  this.openProject();

			}

		},
		handleAddProject(){
			addProject.popup().then((res) => {
				this.$router.push("/edit/default");
			}).catch(err => {
				err && console.error(err);
			});

		},
		openProject() {
			localFile.openProject().then(project => {
				localFile.switchToProject(project, true);

			}).catch(err => {
				if (err && err.status === "canceled") return;
				console.error(err);
				app.$messageBox.error({ id: "open error", text: "打开项目失败" });
			});
		},
		handleclickProject(data) {
			let path = data.path + localFile.getSeparator() + data.name + ".md3";
			// debugger;
			const existProject = proxy.projects.get(data.id);
			if (existProject) {
				proxy.activityProject = existProject.config.id;
				this.$bus.emit("project-switch", { id: existProject.config.id });
				this.$router.push("/edit/default");
			} else {
				const fs = require("fs");
				console.log(path);
				if (fs.existsSync(path)){

					localFile.readProject( path).then(project => {
						localFile.switchToProject(project, true);
					});
				} else {
					this.$Confirm.popup({
						title: "错误",
						status: "warn",
						subTitle: "无法打开项目",
						content: "请确认文件是否存在",
						subContent: path,
						okText: "",
						cancelText: "关闭"
						// renderContent: (h) => {
						//   return h('div', {}, ['sss']);
						// }
					});
				}

			}

		},

		onEdit(targetKey, action) {
			// this[action](targetKey);
		},
		createProject() {
			console.log("createProject");
			this.hideModal();
			this.remove(this.activeKey);
		}
	}
};

</script>

<style lang='scss' scoped>
.v-home {
	height:100%;
	/deep/ .ant-tabs {
		height: 100%;
		.ant-tabs-content {
			height: 100%;
			.ant-tabs-tabpane {
				height: 100%;
			}

		}
	}
	._hello-main {
		display: flex;
		width: 100%;
    height: 100%;
		._navLeft {
			position: relative;
			width: 80px;
			flex: 0 0 80px;
			background: linear-gradient(145deg,#4b9ed8,#307eb2 41%,#1d6797);
			.__nav-item {
				text-align: center;
				padding: 10px 0;
				._img {
					width: 32px;
					height: 32px;
				}
				._title {
					line-height: 20px;
					font-size: 12px;
					color: white;
				}
			}
			.__arrow {
				position: absolute;
				width: 0;
				height: 0;
				border-top: 5px solid transparent;
				border-right: 9px solid #fff;
				border-bottom: 5px solid transparent;
				position: absolute;
				right: -1px;
				transform: translateY(-50%);
				transition: top .3s linear;
			}
		}
		._hello-content {
			flex: 1 1 1000px;
			width: 1000px;
      overflow: auto;
      background: #f5f5f5;

		}

	}

}

</style>
