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
import { resizeUtil } from "./resizeUtil";
import { getUid } from "@/util/common";
import { cloneDeep, debounce } from "lodash";
import { behaviors } from "./behaviors/index";

export default {
	name: "comp-",
	components: {
		"m-property-bar": PropertyBar,
		"m-outline": Outline
	},
	props: {
		diagram: Object,
		getSiderBarDragData: Function

	},
	data() {
		return {
			graph: undefined,
	
			propertyBarData: {
				x: 0,
				y: 0,
				visible: false,
				type: "a"
			},
			events: {
				"fresh-graph": this.freshGraph
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
		shapeDefinePool(){
			return this.factory.shapeDefinePool;
		},
		modelPool(){
			return this.factory.modelPool;
		},
		modelDefinePool(){
			return this.factory.modelDefinePool;
		},
		stepManager(){
			return this.factory.stepManager;
		},
		visible(){
			return app.activeDiagramId = this.diagram.id;
		}

	},
	watch: {
		visible(val){
			this.graph.visible = val;
		}

	},
	
	mounted() {
		this.initGraph();
		this.addListener();
		this.$bus.onBatch(this.events);
	},
	beforeDestroy(){
		this.$bus.offBatch(this.events);

	},
	methods: {
	
		freshGraph: debounce(function(op){
			freshUtil.freshGraph(this.graph, op);

		}, 10),
		initGraph() {
			const model = new GraphModel();
			const graph = new Graph(this.$refs.con, model);
			graph.diagram = this.diagram;
			graph.visible = this.visible;
			this.graph = graph;
			let parent = graph.getDefaultParent();
			this.initCells();
		
		},
		initCells(){
			let diagram = this.diagram;

			const diagramShapeId = diagram.diagramShapeId;
			const diagramShape = this.shapePool.get(diagramShapeId);

			graphUtil.addCellByShape(this.graph, diagramShape, { sortEdge: true }, 0);
		},
		addListener() {
			const graph = this.graph;
			const instance = this;
			graph.addListener(mxEvent.CLICK, this.handleGraphClick);
			// graph.addMouseListener({
			// 	mouseDown() {
			// 	}, // 必须实现的方法
			// 	mouseMove(graph, evt) {
			// 		instance.handleMouseMovePopMenuVisiable(graph, evt);
			// 		instance.handleSiderBarHighlight(graph, evt);

			// 	},
			// 	mouseUp() {
			// 	} // 必须实现的方法
			// });
			// graph.addListener(mxEvent.LABEL_CHANGED, this.handleLabelChange);
			// // graph.addListener(mxEvent.CELLS_MOVED, this.handleCellsMoved);

			graph.addListener(mxEvent.MOVE_CELLS, this.handleCellsMoved);
			graph.addListener(mxEvent.CELLS_RESIZED, this.handleCellsResized);
		},
		handleGraphClick(graph, event) {
			if (window.event.button === 2) {
				this.handleRightClick(graph, event);
			} else {
				this.handleLeftClick(graph, event);
			}
		},
		handleLeftClick(graph, event) {
			console.log("click", event);

			// this.handleShowPopMenu(graph, event); // 情景菜单 bar
			this.handleSiderBarDrop(graph, event);
			// this.handleShowVertexBtn(graph, event);
			// this.handleShowPropertyMenu(graph, event); // 添加属性的菜单
			// this.handleChangeSelectedElement(graph, event);
			// this.handleEdgeClick(graph, event);

		},
		handleSiderBarDrop(graph, event){
			const dragData = this.getSiderBarDragData();
			if (!dragData) return;
			const modelDefine = this.modelDefinePool.get(dragData.modelDefineId);
			const shapeDefine = this.shapeDefinePool.get(modelDefine.shapeDefineId);
			const targetCell = event.properties && event.properties.cell;
			const targetShape = targetCell.shape;
			const targetModel = targetShape.getModel();
			const targetModelDefine = targetModel.getModelDefine();
			let parentModel = targetModel;
			if (targetModelDefine.isDiagram){
				parentModel = targetModel.getParentModel();
			}
			try {
				this.stepManager.beginUpdate();

				// createModel
				const model = this.factory.createModel({
					id: getUid(),
					parentId: parentModel.id,
					modelDefineId: modelDefine.id,
					name: modelDefine.name,
					displayName: modelDefine.name,
					attrs: cloneDeep( modelDefine.attrs)
				});
				 const relativePoint = graphUtil.getRelativePoint(graph, targetCell, window.event.clientX, window.event.clientY);
				const initBox = { ...shapeDefine.box };
				const shape = this.factory.createShape({
					id: getUid(),
					parentId: targetShape.id,
					modelId: model.id,
					shapeDefineId: shapeDefine.id,
					box: initBox,
					bounds: {}

				});
				resizeUtil.initShape(shape, relativePoint.x, relativePoint.y);
				// createShape 

				this.stepManager.endUpdate();
				
			} catch (error) {
				this.stepManager.rollBack();
				throw error;
				
			}

			modelDefine.isRelation;

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

		handleCellsMoved(graph, event) {
			const { cells, dx, dy } = event.properties;
			console.log("handleCellsMoved", event);
			cells.forEach(cell => {
				this.updateGeo(cell, { dx, dy, isMove: true });

			});
			this.$bus.emit("fresh-graph");

			this.$nextTick(() => {
				const sortedParentIds = [];
				cells.forEach(cell => {
					if (cell.parent == null || sortedParentIds.includes(cell.parent.id)) return; // 拖动后触发删除会引起parent没有
					const orderedCells = shapeApi.sortBySize(cell.parent.children);
					this.graph.orderCells(false, orderedCells);
					sortedParentIds.push(cell.parent.id);

				});

			});
		},
		handleCellsResized(graph, event) {
			const { cells } = event.properties;
			console.log("handleCellsResized", event);
			this.updateGeo(cells[0], { isResize: true });
			// this.$bus.emit("fresh-graph");

			// this.$nextTick(() => {
			// 	const orderedCells = shapeApi.sortBySize(cells[0].parent.children);
			// 	this.graph.orderCells(false, orderedCells);
			// });

		},
		updateBoxByBounds(shape){
			const box = shape.localStyle.boxInfo;
			const bounds = shape.bounds;

			box.boxX = bounds.x - box.paddingLeft;
			box.boxY = bounds.y - box.paddingTop;
			box.boxWidth = bounds.width + box.paddingLeft + box.paddingRight;
			box.boxHeight = bounds.height + box.paddingTop + box.paddingBottom;

		},
		updateGeo(cell, { dx, dy, isMove, isResize }) {

			const { x, y, width, height, offset } = cell.geometry;
			const diagram = this.graph.diagram;
			const oldShape = cell.shape;
			const oldBounds = cell.shape.bounds;
			let bounds = undefined;
			console.log("update geo");
			// cell.deep为3是messagetoself等

			if (!oldBounds || cell.edge) return; // 批量移动时，edge没有bounds

			if (offset && (offset.x !== oldBounds.offset.x || offset.y !== oldBounds.offset.y)) { // edgeLabel拖动时只有offset变化
				bounds = { x, y, width, height, offset: { x: offset.x, y: offset.y } };
			} else if (x !== oldBounds.x || y !== oldBounds.y || width !== oldBounds.width || height !== oldBounds.height) {
				bounds = { x, y, width, height };
			}

			if (!bounds) return;
			try {
				this.stepManager.beginUpdate();
				oldShape.updateBounds(bounds);
				resizeUtil.expandParentSize(oldShape);
				
				if (isResize) {
					resizeUtil.updateAutoFlow(oldShape);
					// graphUtil.updateShapeWhenResized(cell.umlShape);
				}
				this.stepManager.endUpdate();
				
			} catch (error) {
				this.stepManager.rollBack();
				throw error;
				
			}

			// if (cell.parent.deep === 0){
			// 	graphUtil.limitShapePosition(bounds, cell.typeName);
			// }

			// boundsApi.setBounds(cell.umlShape, { ...bounds });
			// this.updateBoxByBounds(cell.umlShape);

			// if (portApi.isPortShape(cell.umlShape)){
			// 	if (isMove){
			// 		const portPosition = portApi.getClosest(cell.geometry.x, cell.geometry.y, 0, 0, cell.parent.geometry.width, cell.parent.geometry.height);
			// 		cell.umlShape.localStyle.portPosition = portPosition;
			// 	}
			// 	portApi.updatePortPosition(cell); // port大小缩放或被拖动时时调整port的位置

			// }
			
			// resizeShape.expandParentSize(cell.umlShape);
			// graphUtil.expandParentSize(cell.umlShape);

		}
	}
};
</script>
<style lang="scss">
</style>