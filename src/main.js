import Vue from "vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "@/assets/css/index.scss";
import moment from "moment";
import App from "./App.vue";
moment.locale("zh-cn");

Vue.config.productionTip = false;
Vue.use(ElementUI);

new Vue(App).$mount("#app");
