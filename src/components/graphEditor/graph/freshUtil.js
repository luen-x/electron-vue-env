import graphUtil from "./graphUtil";
import { shapeApi } from "@/api/shapeApi";
import { getStyleObj, getStyleStr, uniqueArr } from "@/util/common";

export default {
	/**
	 * 刷新画布
	 * @param {*} graph
	 * @param {*} option
	 */
	freshGraph(graph, option = { all: true }) {
		if (!graph.visible) return;
		try {
	
			graph.inFresh = true;
			console.time("fresh-time");
			const {
				all,
				diagramId,
				diagramIds,
				modelId,
				modelIds,
				shapeId,
				shapeIds
			} = option;
			const diagram = graph.diagram;

			if (all) {
				this.updateDiagramName(graph);
				const diagramShape = diagram.factory.shapePool.get(diagram.diagramShapeId);

				const flatShapes = this.getFlatShapes(diagramShape);
				const cells = graph.model.cells;
				const modelCells = Object.keys(cells).map(key => cells[key]);
				// 如果没有对应的cell则创建cell
				flatShapes.forEach(shape => {
					if (!cells[shape.id]) {
						graphUtil.addCellByShape(graph, shape, {}, shape.deep);
					}
				});
				// 如果cell没有对应的shape则移除cell,
				const removeCells = modelCells.filter(
					cell =>
						!flatShapes.find(shape => shape.id === cell.id) &&
					cell.id !== "0" &&
					cell.id !== "1"
				);
				graphUtil.deleteCellByIds(
					graph,
					removeCells.map(c => c.id)
				);

				// 递归差异对比，更新所有cell
				graphUtil.updateCellsByShapes(graph, [diagramShape], true);
			// const edges = modelCells.filter(cell => cell.edge);
			// this.freshEdgeLabelPosition(graph, edges,);
			} else if (modelId) {
				this.freshGraphByModelId(graph, modelId);
			} else if (shapeId) {
				this.freshGraphByShapeId(graph, shapeId);
			} else if (shapeIds) {
				const uniqShapeIds = uniqueArr(shapeIds);
				uniqShapeIds.forEach(id => {
					this.freshGraphByShapeId(graph, id);
				});
			}
			console.timeEnd("fresh-time");
			graph.inFresh = false;
		} finally {
			graph.inFresh = false;
		}
	},
	freshGraphByModelId(graph, id) {
		this.handleModelUpdate(graph, id);
	},
	freshGraphByShapeId(graph, id) {
		graphUtil.updateCellByShape(graph, graph.model.cells[id].shape);
	},
	// 模型更新引起图形更新 ,  如果是当前的diagram更新需要刷新diagram名字，
	handleModelUpdate(graph, id) {
		if (graph.diagram.id === id) this.updateDiagramName(graph);
		const model = SysMLUtilHelper.getModelById(id, proxy.activityProject);
		if (!model) return;

		// 根据模型id获取当前diagram下的所有umlshape
		console.log(graph);
		const shapes = shapeApi.getShapeByModel({
			model,
			diagram: graph.diagram
		});

		const flatShapes = this.getFlatShapes(graph.diagram);
		const cells = graph.model.cells;
		// let typeName = ModelTreeDataGenerator.getIcon(model);

		// 如果没有对应的cell则创建cell
		flatShapes.forEach(shape => {
			if (!cells[shape.id]) {
				graphUtil.addCellByShape(graph, shape, {}, shape.deep);
			}
		});

		// 如果cell没有对应的shape则移除cell,
		const modelCells = Object.keys(cells)
			.map(key => cells[key])
			.filter(ce => ce.modelId === model.id);
		const removeCells = modelCells.filter(
			cell => !flatShapes.find(shape => shape.id === cell.id)
		);
		graphUtil.deleteCellByIds(
			graph,
			removeCells.map(c => c.id)
		);

		// 递归差异对比，更新所有cell
		graphUtil.updateCellsByShapes(graph, shapes, true);
	},
	getFlatShapes(shapes, flatArr = [], deep = 0) {
		if (!Array.isArray(shapes)) {
			shapes = [shapes];
		}
		shapes.forEach(shape => {
			if (!shape.box.visible) return;
			flatArr.push(shape);
			shape.deep = deep;
			// if (shape.isEdge()) return;
			const chidShapes = shape.children;
			// shape.umlDiagramElement && shape.umlDiagramElement.toArray();
			if (chidShapes && chidShapes.length) {
				this.getFlatShapes(chidShapes, flatArr, deep + 1);
			}
		});
		return flatArr;
	},
	/* updateDiagramName(graph) {
    const diagram = graph.diagram;
    diagram.text = graphUtil.getDiagramTitle(diagram);
  }, */
	updateDiagramName(graph) {
		// const diagram = graph.diagram;
		// diagram.name = graphUtil.getDiagramTitle(diagram);

		// const width = graphUtil.getTextWidth(
		// 	diagram.name,
		// 	diagram.box.style
		// );
		// const style = getStyleObj(diagram.box.style);
		// style.width = width + 10;
		// const styleStr = getStyleStr(style);
		// shapeApi.updateShapes({ oldShape: diagram, styles: styleStr });
	},
	freshEdgeLabelPosition(graph, edges) {
		edges.forEach(edge => {
			const labels = edge.children;
			const edgeLength = graph.view
				.getState(edge)
				.segments.reduce((pre, cur) => pre + cur, 0);
			console.log(graph.view.getState(edge).segments);

			labels.forEach(label => {
				const edgeLabelPosition = graph.view.getState(label).style
					.edgeLabelPosition;
				console.log(graph.view.getState(label).style);
				const labelWidth = label.shape.bounds.width;
				if (!edgeLabelPosition) return;
				const x = this.getEdgeLabelX(
					edgeLength,
					edgeLabelPosition,
					labelWidth
				);

				console.log(x, label);
				if (x !== label.geometry.offset.x) {
					label.shape.bounds.x = x;
					const newGeo = label.geometry.clone();
					newGeo.x = x;
					graph.model.setGeometry(label, newGeo);
				}
			});
		});
	},
	getEdgeLabelX(edgeLength, position, labelWidth) {
		if (position === "startTop" || position === "startBottom") {
			return -(edgeLength / 2 - labelWidth) / (edgeLength / 2);
		} else if (position === "endTop" || position === "endBottom") {
			return (edgeLength / 2 - labelWidth) / (edgeLength / 2);
		}
	}
};
