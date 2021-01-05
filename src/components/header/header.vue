<template>
	<div class="v-header">
		<div v-show="isElectron" class="_window-bar" :style="{height:$globalConfig.windowBarHeight}">
			<div class="g-m-t-4 g-m-l-4">
				<img src="statics/images/mainpage/toplogo.svg">
			</div>
			<div class="g-flex-1" />
			<div class="_window-btn" @click="windowClick('min')">
				<img src="statics/images/mainpage/topicon1.svg">
			</div>
			<div class="_window-btn" @click="windowClick('max')">
				<img src="statics/images/mainpage/topicon2.svg">
			</div>
			<div class="_window-btn _close-btn" @click="windowClick('close')">
				<img src="statics/images/mainpage/topicon3.svg">
			</div>
		</div>
		<div class="_header-content" :style="{height:$globalConfig.topBarHeight}">
			<div class="_system-bar">
				<img
					src="statics/images/mainpage/topiconline.svg"
					class="topiconline"
				>
				<template v-for="(menu, index) in systemMenus">
					<a-dropdown
						:key="index"
						:visible="curShowMenu === menu.value"
						:trigger="['click']"
						:style="{
							textAlign: 'left',
							marginLeft: '10px',
							marginRight:'20px'
						}"
						overlay-class-name="dropdown_border_custom"
						:disabled="menu.disabled"
					>
						<span class="_system-btn" :class="{_disabled:menu.disabled}" @click.stop="!menu.disabled && (curShowMenu = menu.value)">
							{{ menu.label }}
						</span>
						<m-menu
							slot="overlay"
							:menu="menu.subItems"
							size="small"
							@click-menu-item="handleMenuClick"
						/>
					</a-dropdown>
				</template>
			</div>
			<div class="_tool-bar">
				<div style="min-width: 710px;">
					<img
						src="statics/images/mainpage/topiconline.svg"
						class="topiconline"
					>
					<span class="_tool-btn" title="主页" @click="handleLinkToHome">
						<img
							src="statics/icons/app/topiconhome.png"
							alt="主页"
						>
					</span>
					<span class="_tool-btn" title="新建" @click="newProject">
						<img
							src="statics/icons/app/topiconnew.png"
							alt="新建"
						>
					</span>
					<span class="_tool-btn" title="打开" @click="openProject">
						<img
							src="statics/icons/app/topiconopen.png"
							alt="打开"
						>
					</span>
					<span class="_tool-btn" :class="{_disabled:!hasCurProject}" title="关闭" @click="closeProject">
						<img
							src="statics/icons/app/topiconclose.png"
							alt="关闭"
						>
					</span>

					<span class="_tool-btn" :class="{_disabled:!hasCurProject}" title="保存" @click="saveProject">
						<img
							src="statics/icons/app/topiconsave.png"
							alt="保存"
						>
					</span>
					<span class="_tool-btn" :class="{_disabled:!hasCurProject}" title="上传" @click="saveProject">
						<img
							src="statics/icons/app/topiconsc.png"
							alt="上传"
						>
					</span>
					<img
						src="statics/images/mainpage/topiconline.svg"
						class="topiconline"
						style="marginLeft:18px;marginRight:18px"
					>
					<span class="_tool-btn" :class="{_disabled:!hasCurProject}" @click="openAddDiagramModal">
						<img
							src="statics/icons/app/topicontb.png"
							alt="新建图表"
						>
						<span class="g-m-lr-4">新建图表</span>
					</span> 
					<img
						src="statics/images/mainpage/topiconline.svg"
						style="marginLeft:18px"
						class="topiconline"
					>

					<span class="_tool-btn" :class="{_disabled:!hasCurProject}" @click="handleSimulation">
						<img
							src="statics/icons/app/btnfz2.png"
							alt="仿真"
						>
					</span>
					<img
						src="statics/images/mainpage/topiconline.svg"
						style="marginLeft:18px"
						class="topiconline"
					>
					<span class="_tool-btn" :class="{_disabled:!hasCurProject}">
						<img
							src="statics/images/mainpage/topiconpr.svg"
							alt="在线"
						>
					</span>
					<a-select
						:value="curProjectId"
						style="width:160px;margin-left:10px"
						size="small"
						placeholder="当前项目"
						@change="handleCurProjectChange"
					>
						<a-select-option v-for="item in openedProjectList" :key="item.id">
							{{ item.projectName }}
						</a-select-option>
					</a-select>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Menu from "@/components/common/ContextMenu/Menu";
// import { confirmClose } from "@/components/common/ConfirmClose";
import treeUtil from "@/components/modelTree/treeUtil";
import { getNodePath, getUid, storage, treeForEach } from "@/util/common";
import { addProject } from "@/components/home/modals/addProject";
import { storeKey } from "@/constants/constants";
import { chooseElement } from "@/components/common/ChooseElement.vue";
// import localFile from "@/util/LocalFile";
// import XLSX from "xlsx";

export default {
	name: "m-header",
	components: { 
		"m-menu": Menu
	},
	data() {
		return {
			curShowMenu: "" // 当前显示的menu
		};
	},
	computed: {
		curProjectId(){
			return this.app.proxy.activityProject;
		},
		isElectron() {
			return process.platform !== "browser";
		},
		openedProjectList(){
			return Object.values(proxy.projects.map).map(i => ({ id: i.config.id, projectName: i.config.projectName }));
		},
		hasCurProject(){
			return !!this.curProjectId;
		},
		fileMenu(){
			return {
				label: "文件(F)",
				value: "file",
				subItems: [
					{ label: "新建", value: "newProject", icon: "statics/icons/app/topiconnew.png" },
					{ label: "打开...", value: "openProject", isHR: true, icon: "statics/icons/app/topiconopen.png" },
					{ label: "保存", value: "saveProject", disabled: !this.hasCurProject, icon: "statics/icons/app/topiconsave.png" },
					{ label: "另存为...", value: "saveAs", disabled: !this.hasCurProject, isHR: true, icon: "statics/icons/app/topiconsave.png" },
					{
						label: "导入",
						children: [
							{ label: "导入项目*.md3", value: "importProject" },
							{ label: "导入元模型*.md3p" }
							// { label: '导入excel', value: 'importExcel' }

						],
						value: "",
						disabled: !this.hasCurProject,
						icon: "statics/icons/app/topiconleadin.svg" },
					{
						label: "导出",
						children: [
							{ label: "导出项目*.md3" },
							{ label: "导出只读项目*.md3", value: "exportReadOnlyProject" },
							{ label: "导出元模型*.md3p" }
						],
						value: "saveAs",
						disabled: !this.hasCurProject,
						icon: "statics/icons/app/topiconexport.svg" }
					// { label: '关闭', fn: 'closeProject', action: '' }
				]
			};
		},
		diagramMenu(){
			const recentDi = app.ui && app.ui.recentDiagramIds.map(id => {
				const model = SysMLUtilHelper.getModelById(id, proxy.activityProject);
				if (!model) return;
				return {
					label: model.name,
					value: "openDiagram",
					id: id,
					model: model
				};
			}).filter(Boolean);
			return {
				label: "图表(D)",
				value: "diagram",
				disabled: !this.hasCurProject,
				subItems: [
					{
						label: "创建图表",
						value: "openAddDiagramModal"
					},
					{
						label: "最近的图表",
						children: recentDi,
						disabled: !(recentDi && recentDi.length > 0)
					},
					{ label: "打开全部图表", value: "openAllDiagrams" }
				]
			};
		},
		helpMenu(){
			return {
				label: "帮助(H)",
				value: "help",
				disabled: false,
				subItems: [{ label: "使用手册", value: "help", icon: "statics/icons/app/iconqa.png" }]
			};
		},
		systemMenus(){
			return [this.fileMenu, this.diagramMenu, this.helpMenu];
		}
	},

	mounted() {
		window.addEventListener("click", this.handleWindowClick);
	},
	beforeDestroy() {
		window.removeEventListener("click", this.handleWindowClick);
	},
	methods: {
		handleMenuClick(menuItem) {
			if (menuItem.disabled) return;
			this.curShowMenu = "";
			this[menuItem.value] && this[menuItem.value](menuItem);
		},
		openDiagram(data) {
			treeUtil.openDiagram(data.model);
		},
		windowClick(eventType) {
      
			if (process.env.MODE !== "electron") return;
			const win = this.$q.electron.remote.BrowserWindow.getFocusedWindow();
			if (eventType === "min") {
				win.minimize();
			} else if (eventType === "max") {
				if (win.isMaximized()) {
					win.unmaximize();
				} else {
					win.maximize();
				}
			} else if (eventType === "close") {
				this.openClosingModal(win);
        
			}
		},
		openClosingModal(win) {
			let projectName = app.activeProject.config.projectName;
			confirmClose.popup({
				title: "保存",
				subTitle: "保存",
				content: `是否保存对${projectName}项目的更改？`,
				cancelText: "取消",
				cancelSave: "不保存",
				okText: "立即保存",
				status: "warn"
			}).then(({ type }) => {
				if (type == "save") {
					localFile.saveProject(proxy.activityProject).then(() => {
						this.closeCurProject(win);
						setTimeout(() => {
							this.openClosingModal(win);
              
						}, 500);

					});

				} else {
					this.closeCurProject(win);
					setTimeout(() => {
						this.openClosingModal(win);
              
					}, 500);

				}
          
			}).catch(e => {
				e && console.error(e);

			});

		},
    
		closeCurProject(win) {
			if (!this.hasCurProject) {
				return;
			}
			proxy.projects.delete(proxy.activityProject);
			SysMLUtilHelper.removePoolById(proxy.activityProject);
			const keys = Object.keys( proxy.projects.map);
			if (keys.length === 0) {
				win.close();
        
			} else {
				const lastKey = keys[keys.length - 1];
				proxy.activityProject = lastKey;
				this.$bus.emit("project-switch", { id: lastKey });
			}

		},
		handleLinkToHome(){
			if (this.$route.path !== "/home") this.$router.push("/home");
		},
		newProject() {
			addProject.popup().then((res) => {
				if (this.$route.path !== "/edit/default") this.$router.push("/edit/default");
			}).catch(e => {
				e && console.error(e);
			});
		},
		saveAs() {
			localFile.saveAsProject(proxy.activityProject);
		},
		saveProject() {
      
			if (!this.hasCurProject) {
				return;
			}
			localFile.saveAndLoading(proxy.activityProject);

		},
    
		closeProject() {
			if (!this.hasCurProject) {
				return;
			}
			proxy.projects.delete(proxy.activityProject);
			SysMLUtilHelper.removePoolById(proxy.activityProject);
			const keys = Object.keys( proxy.projects.map);
			if (keys.length === 0) {
				proxy.activityProject = undefined;
				this.$router.push("/home");
			} else {
				const lastKey = keys[keys.length - 1];
				proxy.activityProject = lastKey;
				this.$bus.emit("project-switch", { id: lastKey });
			}
		},
    
		openProject() {

			localFile.openProject().then(project => {
				localFile.switchToProject(project, true);
			});
		},
		importProject() {
			localFile.openProject().then(project => {
				localFile.handlerImportProject(project, true);
			});

		},
		importExcel(){
			localFile.openExcel().then((data) => {
				// 解析数据
				const workbook = XLSX.read(data, {
					type: "buffer",
					cellHTML: false
				});
				const sheetNames = workbook.SheetNames;
				// 根据表名获取对应某张表
				const worksheet = workbook.Sheets[sheetNames[0]];
				let sheetjson = XLSX.utils.sheet_to_json(worksheet);
				let maps = [];
				sheetjson.forEach((item) => {
					let map = [];
					Object.keys(item).forEach((key) => {
						map.push(item[key]);
					});
					maps.push(map);
				});
				console.log("TCL: result", maps);
				console.log(SysMLUtilHelper.importExcelToRequirement(maps, app.selectedElement));
			});
		},
		exportReadOnlyProject(){
			localFile.saveAsProject(proxy.activityProject, true);
		},
		handleCurProjectChange(id){
			proxy.activityProject = id;

			this.$bus.emit("project-switch", { id: id });
			if (this.$route.path !== "/edit/default" ) {
				this.$router.push("/edit/default");
			}
		},

		handleSimulation() {
		},
		openAllDiagrams() {
			const allDi = treeUtil.getAllDiagrams();
			if (allDi.size === 0) return;
			allDi.forEach((value, key) => {
				treeUtil.openDiagram(value);
			});
		},
		openAddDiagramModal(){
			chooseElement.popup({
				x: window.event.clientX,
				y: window.event.clientY,
				title: "选择图表",
				list: treeUtil.getDiagramMenu()

			}).then(item => {
				treeUtil.createDiagram(item);

			}).catch(e => {
				e && console.error(e);
			});

		},
		handleWindowClick(){
			this.curShowMenu = "";
		}
	}
};
</script>
<style lang="scss" scoped>
.v-header {
  width:100%;
  .ant-btn {
    padding: 5px;
    border-radius: 0px;
    margin-right: 44px;
    margin-bottom: 0px;
    &:hover {
      box-shadow: 0px 0px 0px 1px rgba(194, 209, 218, 1) inset;
      background: linear-gradient(180deg, #b9e3ff 0%, #47b3ff 56%, #80c8fe 100%);
    }
    &.ant-dropdown-open {
      background: linear-gradient(180deg, #b9e3ff 0%, #47b3ff 56%, #80c8fe 100%);
    }
  }
  .topiconline {
    margin-top: -5px;
    margin-left: 5px;
  }
  ._window-bar {
    width: 100%;
    background: linear-gradient(
      180deg,
      rgba(75, 158, 216, 1) 0%,
      rgba(48, 126, 178, 1) 41%,
      rgba(29, 103, 151, 1) 100%
    );
    -webkit-app-region: drag;
    display: flex;

    ._window-btn {
      height: 100%;
      width: 45px;
      -webkit-app-region: no-drag;
      > img {
        margin: 7px 0 0 12px;
      }
      &:hover {
        background: #2d76b0;
        &._close-btn {
          background: #9d1112;
        }
      }
    }
  }
  ._header-content{
    position: relative;
    border-top: 1px solid rgba(153, 177, 197, 1);
    border-bottom:1px solid #b1cee2;
    background: linear-gradient(
      180deg,
      #e5f6ff 0%,
      #c8e3f3 100%,
      #cae4f3 100%,
      #abd7ef 100%
    );
    ._system-bar {
      padding: 0 5px;
      height: 32px;
      ._system-btn {
        cursor: pointer;
        padding: 5px;
        color: rgb(32, 32, 32);
        font-weight: bold;
        display: inline-block;
        &:hover {
          box-shadow: inset 0px 0px 0px 1px #c2d1da;
          background: linear-gradient(180deg,#b9e3ff,#47b3ff 56%,#80c8fe);
        }
        &._disabled {
          cursor: not-allowed;
          color: rgb(136, 136, 136);
           &:hover {
            box-shadow: none;
            background: inherit;
          }
        }
      }
    }
    ._tool-bar {
      padding: 0 5px;
      height: 32px;
      position: relative;
      ._tool-btn {
        display: inline-block;
        height: 26px;
        line-height: 24px;
        border: 1px solid rgba(43, 102, 134, 0);
        cursor: pointer;
        margin-left: 8px;
        margin-top: 4px;
        &:hover {
          background: linear-gradient(180deg,#b9e3ff,#47b3ff 56%,#80c8fe);
          box-shadow: 0px 9px 28px 8px rgba(0,0,0,0.05), 0px 6px 16px 0px rgba(0,0,0,0.08), 0px 3px 6px -4px rgba(0,0,0,0.12);
          border: 1px solid #b1cee2;
        }
        &._disabled {
          cursor: not-allowed;
          filter:grayscale(100%);
          &:hover {
            box-shadow: none;
            background: inherit;
            border: 1px solid rgba(0,0,0,0);
          }
        }
        &>img {
          height: 16px;
          margin: 4px;
          display: inline-block;
          vertical-align: top;
        }
      }
    }
  }
}
</style>
