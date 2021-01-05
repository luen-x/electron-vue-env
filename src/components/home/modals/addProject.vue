<template>
	<m-modal
		v-model="visible"
		title="新建项目"
		class="v-home-add-project"
		mask
		@cancel="handleCancel"
		@ok="handleSave"
	>
		<div class="_introduce">
			<!-- <img src="statics/images/draw/addtitlebg.png" style="width:100%;top: 0;left: 0;z-index: -1;" class="g-absolute"/> -->
			<img src="statics/icons/app/welcomeiconadd.png" height="32px">
			<span
				style="marginLeft:5px;fontWeight:bold;fontSize:14px"
			>新建sysml空白项目</span>
			<p style="fontSize:12px;marginTop:5px;marginLeft:4px">
				Sysml是为复杂工程而设计的图形建模语言，支持最新的Sysml1.6标准。
			</p>
		</div>
		<div class="_form-content g-flex">
			<div class="_choose"> 
				<p style="fontWeight:bold;marginLeft:5px;fontSize:14px">
					选择模板
				</p>
				<div>
					<div style="marginLeft:1px">
						<div
							class="_radio-rect g-flex g-ai-c"
							:class="{ custom_radio_checked: selected === 1 }"
						>
							<div>
								<img src="statics/images/mainpage/iconmx.png" style="width:28px">
							</div>

							<div class="g-flex-1 g-m-lr-10">
								<div
									style="fontWeight:bold;fontSize:14px"
								>
									空白项目
								</div>
								<div>SYSML v1.6</div>
							</div>
							<div style="align-self:start;padding-top:3px">
								<a-icon
									v-show="selected === 1"
									type="check-circle"
									theme="filled"
									style="color:#4091C8"
									class="g-fs-18"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="g-flex-1 g-m-lr-30 g-m-tb-10">
				<a-form-model ref="form" :model="formData" :rules="rules">
					<a-form-model-item label="项目名称" prop="projectName">
						<a-input
							v-model="formData.projectName"
						/>
					</a-form-model-item>
					<a-form-model-item v-if="isElectron" label="项目存储位置" prop="projectPath">
						<a-input
							v-model="formData.projectPath"
							read-only
							style="padding-right: 25px;"
						/>
						<span class="_img-btn" style="position:absolute;top:2px;right:4px" @click="handleSelectPath">
							<img style="height:12px;width:12px" src="statics/icons/app/iconmore.png">
						</span>
						<!-- <span
              class="selectPath"
              style="fontWeight:bold; margin-left: 5px;"
              @click="handleSelectPath"
            >...</span> -->
					</a-form-model-item>
					<a-form-model-item label="项目描述" prop="desc">
						<a-textarea
							v-model="formData.desc"
							placeholder="请输入您的项目描述"
							:auto-size="{ minRows: 3, maxRows: 5 }"
							style="resize:none"
						/>
					</a-form-model-item>
				</a-form-model>
			</div>
		</div>
	</m-modal>
</template>
<script>
import { Portal } from "@/components/common/Portal.vue";
import Modal from "@/components/common/CustomModal";
import { getUid, VueMap, formatTime } from "@/util/common";
// import {
// 	SysmlDiagramHelper,
// 	SysmlPackageHelper,
// 	SysmlCommonStructureHelper, SysMLUtilHelper, GraphContextHelper, GraphHelper,
// 	ModelProfileHelper
// } from "src/api/sysml-imports";
// import "src/statics/images/draw/addtitlebg.png";
// import localFile from "src/util/LocalFile";
// import { profileApi } from "src/api/profile/profileApi";
// import { modelConfig } from "src/api/model/modelConfig";
const comp = {
	name: "new-project",
	components: {
		"m-modal": Modal

	},
	data() {
		return {
			visible: false,
			formData: {
				projectName: "未命名项目1",
				desc: "",
				projectPath: process.cwd()

			},
			rules: {
				projectName: [{ required: true, validator: this.projectNameValidator, trigger: "blur" }],
				desc: [{ required: false, message: "请输入项目描述", trigger: "blur" }],
				projectPath: [{ required: true, message: "请选择项目存储位置", trigger: "change" }]

			},
			isElectron: process.env.MODE === "electron",
			selected: 1

		};
	},
	mounted(){
		this.visible = true;
		// app.$get('/statics/SysML.md3');
		// console.log(__dirname);
		// console.log(__filename);
		// console.log(_statics);

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
		handleSelectPath(){
			const savePath = localFile.showDirDialog();
			if (savePath) this.formData.projectPath = savePath;

		},
		projectNameValidator(rule, value, cb){
			if (!value){
				return cb(new Error("请输入项目名称"));
			}

			if (this.isElectron){
				const fs = require("fs");
				if (fs.existsSync(this.formData.projectPath + localFile.getSeparator() + value + ".md3")) {
					return cb(new Error("已存在该文件，请重新输入"));
				}
			}
			cb();

		},

		async handleSave(){
			const valid = await this.$refs.form.validate().then(() => true).catch(() => false);

			if (!valid) return;
			console.log("valid");
			const project = localFile.getInitProject();
			const createDate = formatTime(Date.now());
			project.config = {
				id: getUid(),
				projectName: this.formData.projectName,
				projectPath: this.formData.projectPath,
				projectDescription: this.formData.desc,
				createdDate: createDate,
				updateDate: createDate,
				xml: []
			};

			// 初始化项目的基础配置信息
			modelConfig.loadModeConfig(project.config.id);

			// const model = SysmlPackageHelper.createModel(null);
			SysMLUtilHelper.setCurrentInstancePool(project.config.id);
			const model = GraphHelper.getRootNodeByProjectId(project.config.id);
			console.log("模型", model.getModelElement());
			// debugger;
			SysMLUtilHelper.updateName("模型", model.model);
			project.metadata.sysml.model = model;
			proxy.projects.set(project.config.id, project);
			proxy.activityProject = project.config.id;

			// 加载系统自带Profile
			await profileApi.loadSysProfile( { projectId: project.config.id } );

			this.$bus.emit("project-add", { id: project.config.id });
			this.$bus.emit("project-switch", { id: project.config.id });
			if (this.isElectron){
				localFile.saveProject( project.config.id).then(() => {
					this.handleOk(project);
				});
			} else {
				this.handleOk(project);
			}
		}
	}
};

export default comp;
export const addProject = new Portal(comp);
</script>
<style lang="scss" >
.v-home-add-project {
	._introduce {
		padding-top: 12px;
		padding-left: 18px;
		background: no-repeat center;
    background-image: url('/statics/images/draw/addtitlebg.png');
		background-size: 100%;
    height: 96px;
    position: relative;
    border-bottom: 1px solid #eee;
	}
	._choose {
		width: 195px;
		// height: 340px;
		background: rgba(246, 252, 255, 1);
		border-right: none;
		padding-top: 18px;
		padding-left: 16px;
	}
	._radio-rect {
		width: 164px;
		height: 62px;
		background: #FFFFFF;
		border-radius: 2px;
		border: 1px solid #BDC8DA;
		padding: 10px;

	}
	.ant-form-item-label > label::after {
		display: none;
	}
  ._img-btn {
		padding: 2px;
		display: inline-block;
		box-sizing: border-box;
		cursor: pointer;
		img {
			display: block;
			height: 14px;
			width: 14px;
		}
		&:hover {
			padding: 1px;
			background: #f4df99;
			border: 1px solid #c2b597;
		}
		&:active {
			padding: 1px;
			background: #eac266;
			border: 1px solid #c2b597;
		}
	}
  // .selectPath{
  //   position: absolute;
  //   right: 5px;
  // }

}

</style>
