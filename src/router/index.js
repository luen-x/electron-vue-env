import VueRouter from "vue-router";
import Home from "@/view/home";
import Editor from "@/view/editor";

export const router = new VueRouter({
	mode: "hash",
	routes: [
		{
			path: "/",
			redirect: "/home"
		},
		{
			path: "/home",
			component: Home
		},
		{
			path: "/editor",
			component: Editor
		},
		{
			path: "*",
			redirect: "/home"
		}
	]
});
