import { StorageManager } from "./storage";
import { version, storeKey as storeKey_ } from "@/constants/constants";
import moment from "moment";
import Vue from "vue";
export const storage = new StorageManager({ version, prefix: "m-require" });
export const storeKey = storeKey_;
/**
 * 获取唯一的id，以时间为基准，
 */
// export const getUid = (() => {
// 	const now = Date.now();
// 	let index = 1;
// 	return () => `${now}-${index++}`;
// })();

export const getUid = (() => {
	const chars = [];
	for (let i = 33; i < 127; i++){
		chars.push(String.fromCharCode(i));
	}
	let index = 1;
	function string10to64(number) {
		
		let radix = chars.length;
		let	qutient = +number;
		let	arr = [];
		do {
			mod = qutient % radix;
			qutient = (qutient - mod) / radix;
			arr.unshift(chars[mod]);
		} while (qutient);
		return arr.join("");
	}
	const now = string10to64(Date.now() - 1609006458579);

	return () => `${now} ${index++}`;
});

/**
 * 根据点号分割的字符串或字符串数组从一个对象中取值
 * @param {Object} obj {a:[{b:'xx'}]}
 * @param {Srting,Array} prop a.0.b or ['a','0','b']
 */
export const getObjectValue = (obj, prop) => {
	let proArr;
	if (typeof prop === "string") {
		proArr = prop.split(".");
	} else if (Array.isArray(prop)) {
		proArr = prop;
	} else {
		// console.error('getObjectValue  prop must be string or array');
		return undefined;
	}
	proArr = proArr.filter(i => i !== "");
	let value = obj;
	for (let i = 0; i < proArr.length; i++) {
		const p = proArr[i];
		value = value[p];
		if (value === undefined) {
			return undefined;
		}
		if (value === null) {
			if (i === proArr.length - 1) {
				return null;
			} else {
				return undefined;
			}
		}
	}
	return value;
};
/**
 * 设置formData数据
 * @param {Object} to
 * @param {Object} from
 */
export const setData = (to, from) => {
	for (let key in to) {
		if (from[key] !== undefined) {
			to[key] = from[key];
		}
	}
};
/**
 * 遍历树结构，fn一旦返回false就会停止遍历
 * @param {Array} tree 树结构
 * @param {Function} fn 对每个节点执行一遍fn方法
 * @param {String} childrenKey  作为children的键
 */
export const treeForEach = (
	tree,
	fn,
	childrenKey = "children",
	parent = undefined
) => {
	for (let i = 0; i < tree.length; i++) {
		if (fn(tree[i], parent) === false) return false;
		if (
			tree[i][childrenKey] &&
			tree[i][childrenKey].length &&
			treeForEach(tree[i][childrenKey], fn, childrenKey, tree[i]) ===
				false
		)
			return false;
	}
};
/**
 * 从树结构里根据value找到第一个结点
 * @param {*} value
 * @param {Array} tree [{label,value,children}]
 */
export const findNodeByValue = (tree, value, valueKey = "value") => {
	let result;
	treeForEach(tree, node => {
		if (node[valueKey] === value) {
			result = node;
			return false;
		}
	});
	return result;
};
/**
 * 从树结构里根据label找到第一个结点
 * @param {*} value
 * @param {Array} tree [{label,value,children}]
 */
export const findNodeByLabel = (tree, label) => {
	let result;
	treeForEach(tree, node => {
		if (node.label === label) {
			result = node;
			return false;
		}
	});
	return result;
};
/**
 *
 * @param {Array} tree [{label,value,children}]
 * @param {Object} option
 * {
 * labelKey String 将转换为label的键  default:'label'
 * valueKey String 将转换为value的键  default:'value'
 * childrenKey String 将转换为children的键 default:'children'
 * clean Boolean 是否剔除其余属性，default:true
 * getValue Function 用于获取value的函数，传入当前节点,优先级高于valueKey default:undefind
 * getLabel Function 用于获取label的函数，传入当前节点,优先级高于labelKey default:undefind
 * getChildren Function 用于获取label的函数，传入当前节点,优先级高于childrenKey default:undefind
 * deep Number 转化树结构的深度,为0时转化所有，默认为0 default:0
 * }
 * @param {Array} result  目标数组，不用传 default:[]
 * 此方法不会修改原数据，会返回一个新的数组
 * example:
 * initTree(data, { labelKey: 'region_name', valueKey: 'national_code', childrenKey: 'childn_ational' })
 */
export const initTree = (tree, option, result = [], parent = undefined) => {
	const {
		labelKey = "label",
		valueKey = "value",
		childrenKey = "children",
		clean = true,
		getValue,
		getLabel,
		getChildren,
		deep = 0,
		keepParent = false
	} = option;
	for (let i = 0; i < tree.length; i++) {
		result[i] = {
			label: getLabel ? getLabel(tree[i]) : tree[i][labelKey],
			value: getValue ? getValue(tree[i]) : tree[i][valueKey]
		};
		if (!clean) {
			result[i] = { ...tree[i], ...result[i] };
		}
		if (keepParent) {
			result[i].parent = parent;
		}
		const _children = getChildren
			? getChildren(tree[i])
			: tree[i][childrenKey];
		if (deep !== 1 && _children && _children.length) {
			result[i].children = [];
			initTree(
				_children,
				deep > 1 ? { ...option, deep: option.deep - 1 } : option,
				result[i].children,
				result[i]
			);
		}
	}
	return result;
};
/**
 * 根据value查询所在树中的路径
 * @param {*} tree 树结构
 * @param {*} value value
 * @param {*} result 递归存储数据，不用传
 * @param {*} deep 递归存储数据，不用传
 */
export const getNodePath = (tree, value, result = [], deep = 0) => {
	for (let i = 0; i < tree.length; i++) {
		result[deep] = tree[i];
		result.length = deep + 1;
		if (tree[i].value === value) return result;
		if (tree[i].children && tree[i].children.length) {
			const exist = getNodePath(
				tree[i].children,
				value,
				result,
				deep + 1
			);
			if (exist) {
				return exist;
			}
		}
	}
};
export const getNodeParent = (tree, value) => {
	let result;
	treeForEach(tree, node => {
		if (node.children.find(i => i.value === value)) {
			result = node;
			return false;
		}
	});
	return result;
};

// 创建一个工作线程（Worker），传入js代码字符串或一个onmessage 的 function
export const createWorker = (
	workerString = "onmessage = function(e) { postMessage('msg from worker'+e.data); }"
) => {
	if (typeof workerString === "function") {
		workerString = "onmessage = " + workerString.toString();
	}
	let blob = new Blob([workerString]);
	// Obtain a blob URL reference to our worker 'file'.
	let blobURL = window.URL.createObjectURL(blob);
	let worker = new Worker(blobURL);
	return worker;
};
// 深冻结
export const deepFreeze = obj => {
	const propNames = Object.getOwnPropertyNames(obj);
	propNames.forEach(function(name) {
		const prop = obj[name];
		if (typeof prop == "object" && prop !== null) {
			deepFreeze(prop);
		}
	});
	return Object.freeze(obj);
};

// 等待 单位秒
export const sleep = (s = 0) => new Promise(r => setTimeout(r, s * 1000));

// 预加载图片
export const preloadImgs = urls => {
	urls.forEach(url => {
		const img = new Image();
		img.src = url;
	});
};

/**
 *
 * @param {Number,String} num   格式化目标
 * @param {Number} precision  精度
 * @param {String} prefix 前缀
 * @param {String} suffix 后缀
 */
export const getFormatNum = (num, precision = 2, prefix = "", suffix = "") => {
	let num2 = +num;
	if (isNaN(num2)) {
		num2 = 0;
		console.error("getFormatNum：不是一个数字或数字格式的字符串 " + num);
		return num;
	}
	const arr = num2.toFixed(precision).split(".");
	let length = arr[0].length;
	let str = "";
	let index = length - 1;
	while (index >= 0) {
		str = arr[0].charAt(index) + str;
		if (index !== 0 && index !== length - 1 && (length - index) % 3 === 0) {
			str = "," + str;
		}
		index--;
	}
	if (arr[1]) {
		str += "." + arr[1];
	}
	return prefix + str + suffix;
};

export const pickProp = (obj, props) => {
	const result = {};
	props.forEach(prop => {
		result[prop] = obj[prop];
	});
	return result;
};

export const getSiderWidthRange = () => {
	const width = document.body.clientWidth;
	let siderWidth;
	if (width < 1280) {
		siderWidth = 232;
	} else if (width < 1440) {
		siderWidth = 256;
	} else {
		siderWidth = 256;
	}
	return {
		siderWidth,
		minWidth: 232,
		maxWidth: siderWidth * 2,
		bodyWidth: width
	};
};

// 时间转换 ====>  yy-mm-dd
export const dealDate = time => {
	if (!time) return;
	let t = new Date(time);
	return t.getFullYear() + "-" + (t.getMonth() + 1) + "-" + t.getDate();
};
export const formatTime = (time, format = "YYYY-MM-DD HH:mm:ss") => {
	if (!time) return "";
	return moment(time).format(format);
};
export const sleepUntil = (fn, delay = 10) => {
	return new Promise((rs, rj) => {
		let time = 0;
		const timer = setInterval(() => {
			time += 0.1;
			const result = fn(time);
			if (result) {
				rs(result);
				clearInterval(timer);
			}
			if (time >= delay) {
				rj();
				clearInterval(timer);
			}
		}, 100);
	});
};
export function getTimeBetween(time) {
	let date = new Date(time);
	// 计算毫秒数
	let between = new Date().getTime() - date.getTime();
	let days = Math.floor(between / (24 * 3600 * 1000));
	if (days >= 30) {
		return Math.floor(days / 30) + "月前";
	} else if (days >= 1) {
		return days + "天前";
	} else {
		// 计算天数后剩余的毫秒
		let mils1 = between % (24 * 3600 * 1000);
		let hours = Math.floor(mils1 / (3600 * 1000));
		if (hours >= 1) return hours + "小时前";
		// 计算小时后剩余的毫秒
		let mils2 = mils1 % (3600 * 1000);
		let minutes = Math.floor(mils2 / (60 * 1000));
		minutes = minutes >= 1 ? minutes : 1;
		return minutes + "分钟前";
	}
}
const htmlRegx = /<\/?.+?>/g;
export const cleanHtml = str => {
	return str.replace(htmlRegx, "");
};
export const getStyleObj = str => {
	const result = {};
	if (!str) return result;
	str.split(";")
		.filter(Boolean)
		.forEach(entry => {
			const values = entry.split("=");
			result[values[0]] = values[1] === undefined ? true : values[1];
		});
	return result;
};
export const getStyleStr = obj => {
	let str = "";
	Object.keys(obj).forEach(key => {
		if (obj[key] === undefined) return;
		str += key;
		if (obj[key] === true) {
			str += ";";
		} else {
			str += "=" + obj[key] + ";";
		}
	});
	return str;
};

export const strToDom = str => {
	let obj = document.createElement("div");
	obj.innerHTML = str;
	return obj.childNodes;
};
export const domToStr = node => {
	const tmpNode = document.createElement("div");
	tmpNode.appendChild(node.cloneNode(true));
	const str = tmpNode.innerHTML;
	return str;
};
let dom;
export const getTextWidth = text => {
	if (!dom) {
		dom = document.createElement("span");
		dom.style.position = "absolute";
		dom.style.top = 0;
		dom.style.left = 0;
		dom.style.zIndex = -1000;
		dom.style.opacity = 0;
		dom.style.pointerEvents = "none";
		document.body.appendChild(dom);
	}
	dom.innerText = text;
	return dom.clientWidth * 1.15;
};
export const uniqueArr = arr => {
	const newArr = [];
	const map = {};
	arr.forEach(i => {
		if (!map[i]) {
			map[i] = true;
			newArr.push(i);
		}
	});
	return newArr;
};
export class VueMap {
	
	constructor(){
	  this.map = {};
	}
	get(key){
	  return this.map[key];
	}
	set(key, value){
	  Vue.set(this.map, key, value);
	}
	delete(key){
	  Vue.delete(this.map, key);
	}
	has(key){
	  return Object.prototype.hasOwnProperty.call( this.map, key);
	}
	forEach(fn){
	  Object.entries(this.map).forEach(([key, value]) => {
			fn(value, key);
	  });
	}
  
}