import { notification } from "ant-design-vue";
notification.config({
	placement: "bottomRight",
	duration: 3
});

const Id2Type = {
	100: "对象类型不匹配",
	110: "超出系统允许范围",
	120: "超出模型约束范围",
	130: "不允许为空",
	140: "格式错误",
	150: "解析错误"
};

const MESSAGE = {
	install(Vue) {
		if (typeof window !== "undefined" && window.Vue) {
			Vue = window.Vue;
		}
		Vue.prototype.$messageBox = {
			/**
       * 错误消息框 
       * @param {Object} option
       * @param {number} option.id   100: '对象类型不匹配', 110: '超出系统允许范围', 120: '超出模型约束范围', 130: '不允许为空', 140: '格式错误', 150: '解析错误'
       * @param {string} option.text 消息框标题
       */
			error(option) {
				// 组件库没有暴露节点的key值,暂时通过dom去删除,待优化
				const ele = document.querySelectorAll(
					".ant-notification>span>.ant-notification-notice"
				);
				if (ele.length >= 6) {
					ele[0].remove();
				}
				notification.error({
					icon: h => {
						return h(
							"div",
							{
								class: "icon"
							},
							"×"
						);
					},
					message: "错误提示",
					description: h => {
						return h("div", {}, [
							h(
								"div",
								{
									class: "content"
								},
								option.text
							),
							h("div", { class: "id" }, `事件ID:${option.id}`)
						]);
					}
				});
			}
		};
	}
};
export default MESSAGE;
