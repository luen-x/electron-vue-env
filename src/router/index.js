import VueRouter from "vue-router";

export const router = new VueRouter({
	mode: "hash",
	routes: [
		{
			path: "/",
			redirect: "/home"
		},
		{
			path: "/home",
			component: { render: h => <div>home</div> }
		},
		{
			path: "/editor",
			component: { render: h => <div>editor</div> }
		},
		{
			path: "*",
			redirect: "/home"
		}
	]
});
