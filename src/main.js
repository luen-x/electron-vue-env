import Vue from "vue";
import VueRouter from "vue-router";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "@/assets/css/index.scss";
import moment from "moment";
import App from "./App.vue";
import { emitter } from "./util/Emitter";
import { router } from "./router/index";
import { GlobalConfig } from "@/util/Global.ts";
moment.locale("zh-cn");

Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(ElementUI);
Vue.prototype.$bus = emitter;
Vue.prototype.$globalConfig = new GlobalConfig();

new Vue({
	router,
	render: h => h(App)
}).$mount("#app");
