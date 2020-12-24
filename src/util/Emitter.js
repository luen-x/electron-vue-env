const eventPool = {
	// "model-[action]": "  模型变更   | action:'add/update/delete'      | {id:'', data:{} }",  
	"model-add": true, // 新增模型
	"model-update": true, // 模型更新
	"model-delete": true, // 模型删除

	// 'diagram-[action]': " 图表变更   | action:'open/remove/update'   | {id:'', data:{}}",
	"diagram-open": true, // 打开图表
	"diagram-remove": true, // 关闭图表
	"diagram-update": true, // 更新图表，暂时没有用到

	// "shape-[action]": "   图形变更-    | action:'add/update/delete',     | {id:'', data:{}",
	"shape-add": true, // 暂时没有用到
	"shape-update": true, // 暂时没有用到
	"shape-delete": true, // 图形删除 | {modelId:'',shapeIds:[]}

	// "project-[action]": " 项目变更    | action:'add/update/delete/switch' | {id:'', data:{}}",
	"project-add": true, // 暂时没有用到
	"project-update": true, // 暂时没有用到
	"project-delete": true, // 暂时没有用到
	"project-switch": true, // 切换项目

	"fresh-graph": true, // 通知所有画布刷新cell，可以限制刷新范围以提高性能，all表示全部刷新,目前只支持all和modelId  | { all：Boolean, diagramId, diagramIds, modelId, modelIds, shapeId, shapeIds } 默认 all=true
	"model-tree-add-expandkeys": true, // modeltree 添加需要展开的节点keys 为model 的id
	"model-tree-add-selectkeys": true // modeltree 添加需要选中的节点keys 为model 的id
};

export class Emitter {

	constructor(allowUnkonwEvent = false) {
		this.store = {};
		this.allowUnkonwEvent = allowUnkonwEvent;

	}
	on(event, callback) {
		// if (!this.allowUnkonwEvent && !eventPool[event] ) console.warn('未定义的事件名: ' + event + ',请注册到util/emitter eventPool中');
		if (!this.store[event]) {
			this.store[event] = [];
		}
		this.store[event].push(callback);
	}
	onBatch(obj){
		Object.keys(obj).forEach(key => {
			this.on(key, obj[key]);
		});
	}
	off(event, callback) {
		if (!this.store[event]) return;
		if (!callback) {
			delete this.store[event];
			return;
		}
		const index = this.store[event].indexOf(callback);
		if (index > -1) {
			this.store[event].splice(index, 1);
			if (this.store[event].length == 0) {
				delete this.store[event]; 
			}
		}
		
	}
	offBatch(obj){
		Object.keys(obj).forEach(key => {
			this.off(key, obj[key]);
		});
	}
	emit(event, ...rest) {
		if (!this.store[event]) return;
		console.log("%cemit event: " + event, "color: dodgerblue;font-weight:600;", ...rest);
		this.store[event].forEach(callback => {
			try {
				callback(...rest);
			} catch (e) {
				console.error(e);
			}
		});
	}

}

export const emitter = new Emitter();