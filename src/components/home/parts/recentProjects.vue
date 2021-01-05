<template>
	<div class="v-recent-projects">
		<div class="_content ">
			<div class="_title">
				<img src="statics/images/draw/picslogan2.png">
			</div>
			<div class="g-m-t-30 g-m-l-10">
				<div v-if="recentProjects.length===0" class="__empty-tip">
					暂无历史记录
				</div>
				<div v-else class="_project-list">
					<div v-for="(item, index) in recentProjects" :key="index" class="_project g-flex g-ai-c g-pd-10 g-pointer" @click="handleProjectClick(item)">
						<img class="__project-img g-m-r-6" src="statics/icons/app/down.png" style="height:8px">
						<span class="__project-name g-inline-block g-m-r-20" style="width:360px">{{ item.name }}</span>

						<span class="g-m-r-10 g-inline-block " style="width:64px">{{ item.timeToNow }}</span>
						<a-icon class="_close-btn" type="close-circle" @click.stop="handleRemoveProject(index,item)" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import moment from "dayjs";
import { storage, getTimeDiff } from "@/util/common";
import { storeKey } from "src/constants/constants";

export default {
	name: "recent-projects",
	data() {
		return {
			/**
       *  id: config.id,
        name: config.projectName,
        createdDate: config.createdDate,
        updateDate: config.updateDate,
        desc: config.projectDescription,
        path: config.projectPath
       */
			recentProjects: this.getRecentProjects() 
		};
	},
	methods: {
		handleProjectClick(item) {
			this.$emit("click-project", item);
		},
		// 获取最近打开项目
		getRecentProjects() {
			const list = storage.get(storeKey.recentProjects) || [];
			list.forEach(i => {
				i.timeToNow = getTimeDiff(i.updateDate);
			});
			return list;
     
		},
		handleRemoveProject(index){
			this.recentProjects.splice(index, 1);
			storage.set(storeKey.recentProjects, this.recentProjects);
     
		}
	}
};
</script>
<style lang="scss" scoped>
.v-recent-projects {
  height: 100%;
  width: 100%;
  position: relative;
  background: no-repeat center 0;
  background-image: url('../../../statics/images/draw/welcomebg@2x.png');
  background-size: cover;
  overflow: auto;
  ._content {
    padding: 60px 80px;
  }
  ._project {
    ._close-btn {
      display: none;
      &:hover {
        color: dodgerblue;
      }
    }
    &:hover {
      ._close-btn {
        display: inline;
      }
    }
  }

}

</style>
