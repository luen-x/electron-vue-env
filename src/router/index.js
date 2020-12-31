import VueRouter from "vue-router";
const Foo = { render: h => <div>foo</div> };
const Bar = { render: h => <div>bar</div> };
const routes = [
	{ path: "/foo", component: Foo },
	{ path: "/bar", component: Bar }
];

export const router = new VueRouter({
	routes 
});