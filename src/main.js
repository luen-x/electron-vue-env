import Vue from "vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "@/assets/css/index.scss";
import moment from "moment";
import App from "./App.vue";
import { emitter } from "./util/Emitter";
import { router } from "./router/index";
moment.locale("zh-cn");

Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.prototype.$bus = emitter;

new Vue({
	router,
	render: h => h(App)
}).$mount("#app");
