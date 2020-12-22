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

export default {
	name: "comp-",
	components: {
		"m-property-bar": PropertyBar,
		"m-outline": Outline
	},
	data() {
		return {
			graph: undefined,
			model: undefined,
			connectionData: {
				sourceCell: undefined,
				targetCell: undefined,
				edg: undefined
			},
			propertyBarData: {
				x: 0,
				y: 0,
				visible: false,
				type: "a"
			}
		};
	},
	mounted() {
		this.initGraph();
		this.addListener();
	},
	methods: {
		initGraph() {
			const model = new GraphModel();
			const graph = new Graph(this.$refs.con, model);
			this.model = model;
			this.graph = graph;
			let parent = graph.getDefaultParent();
			graph.getModel().beginUpdate();
			try {
				let v1 = graph.insertVertex(
					parent,
					null,
					"Hello,",
					20,
					200,
					80,
					30
				);
				let v2 = graph.insertVertex(
					parent,
					null,
					"World",
					200,
					150,
					80,
					30
				);
				let v3 = graph.insertVertex(
					parent,
					null,
					"everyBody!",
					300,
					350,
					60,
					60
				);
				const edg = graph.insertEdge(
					parent,
					null,
					"",
					v1,
					v2,
					graph.curEdgeStyle
				);
				// edg.moveable = false;
				// graph.setCellsMovable(false);
				graph.insertEdge(parent, null, "", v2, v3, graph.curEdgeStyle);
				graph.insertEdge(parent, null, "", v1, v3, graph.curEdgeStyle);
			} finally {
				// Updates the display
				graph.getModel().endUpdate();
			}
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