<template>
	<div class="g-relative">
		<div ref="con" />
		<!-- <m-property-bar v-bind="propertyBarData" @click-btn="handlePropertyClick" />
		<m-outline :graph="graph" /> -->
	</div>
</template>
<script>
/* eslint-disable no-unused-vars */

import {
	Graph,
	GraphModel,
	mxEvent,
	ConnectionHandler,
	mxGeometry
} from "./classes/index";
import PropertyBar from "./comps/propertyBar.vue";
import Outline from "./comps/outline/outline";
import graphUtil from "./graphUtil";
import freshUtil from "./freshUtil";

export default {
	name: "comp-",
	components: {
		"m-property-bar": PropertyBar,
		"m-outline": Outline
	},
	props: {
		diagram: Object

	},
	data() {
		return {
			graph: undefined,
	
			propertyBarData: {
				x: 0,
				y: 0,
				visible: false,
				type: "a"
			}
		};
	},
	computed: {
		factory(){
			return this.diagram.factory;
		},
		shapePool(){
			return this.factory.shapePool;
		},
		modelPool(){
			return this.factory.modelPool;
		}

	},
	
	mounted() {
		this.initGraph();
		this.addListener();
		this.$bus.on("fresh-graph", this.freshGraph);
	},
	beforeDestroy(){
		this.$bus.off("fresh-graph", this.freshGraph);

	},
	methods: {
		freshGraph(op){
			freshUtil.freshGraph(this.graph, op);

		},
		initGraph() {
			const model = new GraphModel();
			const graph = new Graph(this.$refs.con, model);
			graph.diagram = this.diagram;
			this.graph = graph;
			let parent = graph.getDefaultParent();
			this.initCells();
		
		},
		initCells(){
			let diagram = this.diagram;
			// freshUtil.updateDiagramName(this.graph);
			// if (!diagram.bounds || diagram.bounds.height === 0) {
			// 	boundsApi.setDiagramBounds(diagram, { x: 12, y: 12, height: 800, width: 1400 });

			// }
			const diagramShapeId = diagram.diagramShapeId;
			const diagramShape = this.shapePool.get(diagramShapeId);
			// debugger;

			graphUtil.addCellByShape(this.graph, diagramShape, { sortEdge: true }, 0);
		},
		addListener() {
			const instance = this;
			this.graph.addListener(mxEvent.CLICK, this.handleGraphClick);
			this.graph.addListener(mxEvent.SIZE, this.handleSizeChange);
			this.graph.addMouseListener({
				mouseDown() {}, // 必须实现的方法
				mouseMove(graph, evt) {
					// 监听鼠标移动事件 , evt中的state代表当前hover的元素，state为空则代表没有hover元素
					// console.log("mouseMove", graph, evt);
					//
					// console.log(evt, evt.state && evt.state.cell);
					const selection = graph.getSelectionModel();

					if (
						evt.state &&
						evt.state.cell &&
						selection.cells[0] &&
						selection.cells[0].id === evt.state.cell.id &&
						!evt.state.cell.edge &&
						!instance.graph.connectionHandler.previous
					) {
						instance.setPropertyBarVisible(
							true,
							evt.state.cellBounds,
							evt
						);
						// const bounds = evt.state.cellBounds;
						// instance.propertyBarData.visible = true;
						// instance.propertyBarData.x = bounds.x + bounds.width;
						// instance.propertyBarData.y = bounds.y;
						// instance.propertyBarData.mxEvent = evt;
					} else {
						instance.setPropertyBarVisible(false);
					}
				},
				mouseUp() {} // 必须实现的方法
			});
			this.graph.connectionHandler.addListener(
				mxEvent.START,
				this.handleConnectStart
			);
			this.graph.connectionHandler.addListener(
				mxEvent.CONNECT,
				this.handleConnectSuccess
			);
		},
		handleGraphClick(graph, event) {
			if (window.event.button === 2) {
				this.handleRightClick(graph, event);
			} else {
				this.handleLeftClick(graph, event);
			}
		},
		handleLeftClick(graph, event) {
			console.log("left click", graph, event);
			const cell = event.properties.cell;
			if (!cell) return;
			console.log("cell", cell);
			if (cell.edge) return;
			setTimeout(() => {
				const selection = graph.getSelectionModel();
				if (selection.cells[0] && !selection.cells[0].edge) {
					this.setPropertyBarVisible(true, cell.geometry, event);
				}
			}, 100);
		},
		handleRightClick(graph, event) {
			console.log(
				"right click",
				graph,
				event,
				event.properties.cell,
				event.properties.cell.getGeometry
			);
			let geo = graph.getCellGeometry(event.properties.cell);
			geo = geo.clone();
			geo.width = 200;
			this.graph.getModel().setGeometry(event.properties.cell, geo);

			// event.properties.cell.setGeometry(
			// 	new mxGeometry(100, 100, 100, 100)
			// );
		},
		changeCellPosition(cell, geo) {
			this.getModel().setGeometry(mxCell, geo);
		},

		handleConnectStart(connectionHandler, eventObj) {
			console.log("connection start", eventObj.properties.state.cell);

			// console.log(arguments);
		},
		handleConnectSuccess(connectionHandler, eventObj) {
			console.log("connection success");
			console.log("create edg ", eventObj.properties.cell);
			console.log("target ", eventObj.properties.target);
			this.graph.clearSelection();
			// console.log(arguments);
		},
		handlePropertyClick() {
			const selection = this.graph.getSelectionModel();

			this.startConnect(selection.cells[0], this.propertyBarData.mxEvent);
		},
		startConnect(cell, event) {
			let state = this.graph.view.getState(cell);
			this.graph.connectionHandler.start(
				state,
				mxEvent.getClientX(event),
				mxEvent.getClientY(event)
			);
		},
		setPropertyBarVisible(visible, bounds, mxevent) {
			this.propertyBarData.visible = visible;
			if (visible) {
				this.propertyBarData.x =
					(bounds.x + bounds.width + this.graph.view.translate.x) *
					this.graph.view.scale;

				this.propertyBarData.y =
					(bounds.y + this.graph.view.translate.y) *
					this.graph.view.scale;
				this.propertyBarData.mxEvent = mxevent;
			}
		},
		handleSizeChange() {
			console.log(arguments);
		}
	}
};
</script>
<style lang="scss">
</style>