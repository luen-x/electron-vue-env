import { shapeApi } from "@/api/shape/shapeApi";

const graphUtil = {
	/**
	 * 根据shape创建cell
	 * @param {*} shape
	 * @param {*} option
	 */
	createCellByShape(shape, option) {
		const shapePool = shape.factory.shapePool;
		const modelPool = shape.factory.modelPool;
		const shapeModel = modelPool.get(shape.modelId);
		if (!shape || !shape.box || !shape.box.visible) return;
		const isEdge = shape.isEdge();

		let geo = isEdge
			? new mxGeometry(0, 0, 0, 0)
			: new mxGeometry(
				shape.bounds.x,
				shape.bounds.y,
				shape.bounds.width,
				shape.bounds.height
			  );

		// if (umlShape.bounds && umlShape.bounds.offset){
		//   geo.offset = umlShape.bounds.offset;
		// }
		const isParentEdge = shapePool.get(shape.parentId).isEdge();
		if (isParentEdge) {
			// const p = umlShape.owningElement.waypoints.toArray()[0];
			geo.relative = true;
			geo.x = shape.bounds.x;
			geo.y = shape.bounds.y;

			geo.offset = new mxPoint(
				shape.bounds.offset.x,
				shape.bounds.offset.y
			);
		}

		// this.setShapeText(shape);
		// this.setPortStyle(umlShape);

		const cell = new mxCell(shapeModel.name, geo, shape.box.styles);
		// if (isReadOnlyMode()) {
		// 	if (this.isMainCell(umlShape)) {
		// 		let styleArr = cell.style.split(";");
		// 		styleArr = styleArr.filter(i => !i.includes("fillColor"));
		// 		styleArr.push("fillColor=none");
		// 		cell.style = styleArr.join(";");
		// 	}
		// }

		if (isEdge) {
			cell.edge = true;
			cell.geometry.relative = true;
			if (shape.waypoints && shape.waypoints.length > 0) {
				cell.geometry.points = shape.waypoints.map(point => new mxPoint(point.x, point.y));
			}
		} else {
			cell.vertex = true;
		}

		cell.setId(shape.id);
		cell.shape = shape;
		cell.relative = true;

		cell.typeName = shapeModel.typeName; // typeName 表示这个元素指向的模型的typeName

		cell.modelId = shapeModel.id;

		return cell;
	},
	getSortEdgeUmlElements(diagram) {
		const getOrder = i => {
			const order = edgeApi.isEdgeShape({ shape: i }) ? 1 : 0;
			console.log(order);
			return order;
		};
		const shapes = diagram.umlDiagramElement.toArray();
		return shapes.sort((i, j) => getOrder(i) - getOrder(j));
	},
	/**
	 * 根据shape创建cell并插入到Graph，会递归子元素
	 * @param {*} graph
	 * @param {*} shape
	 * @param {*} option
	 * @param {*} deep
	 */

	addCellByShape(graph, shape, option, deep = 1) {
		graph.model.beginUpdate();
		try {
			const cell = this.createCellByShape(shape, option);
			if (!cell) return;

			const parent = graph.model.getCell(shape.parentId);

			// todo source target 操作
			// cell,
			// parent,
			// index,
			// source,
			// target;
			if (cell.edge) {
				const source = graph.model.cells[shape.sourceId];
				const target = graph.model.cells[shape.target.id];
				cell.deep = 1;

				// message 没有source的target但是会指定起始点
	
				graph.addEdge(cell, parent, source, target);
				
			} else {
				cell.deep = deep;
				graph.addCell(cell, parent, undefined);
			}

			const children = shapeApi.sortBySize(shape.children);
			children.forEach(childShape => {
				this.addCellByShape(graph, childShape, option, deep + 1);
			});
		} finally {
			graph.model.endUpdate();
		}
	},
	/**
	 * 根据shape更新cell
	 * @param {*} graph
	 * @param {*} shape
	 */
	updateCellByShape(graph, shape) {
		const { shapePool, modelPool } = shape.factory;
		const shapeModel = modelPool.get(shape.modelId);
		const model = graph.getModel();
		const cell = model.getCell(shape.id);
		if (!cell) {
			console.error("cell not found", shape.id);
			return;
		}
		const geo = cell.getGeometry();
		let newGeo;
		cell.shape = shape;
		if (
			shape.bounds &&
			(geo.x !== shape.bounds.x ||
				geo.y !== shape.bounds.y ||
				geo.height !== shape.bounds.height ||
				geo.width !== shape.bounds.width)
		) {
			newGeo = geo.clone();

			newGeo.x = shape.bounds.x;
			newGeo.y = shape.bounds.y;
			newGeo.width = shape.bounds.width;
			newGeo.height = shape.bounds.height;
		}

		if (geo.sourcePoint != null && geo.targetPoint != null) {
			let start = shape.sourcePoint;
			let end = shape.targetPoint;
			if (
				start.x != geo.sourcePoint.x ||
				start.y != geo.sourcePoint.y ||
				end.x != geo.targetPoint.x ||
				end.y != geo.targetPoint.y
			) {
				newGeo = geo.clone();
				newGeo.sourcePoint.x = start.x;
				newGeo.sourcePoint.y = start.y;
				newGeo.targetPoint.x = end.x;
				newGeo.targetPoint.y = end.y;
			}
		}

		if (
			shape.bounds &&
			shape.bounds.offset &&
			geo.offset &&
			(shape.bounds.offset.x !== geo.offset.x ||
				shape.bounds.offset.y !== geo.offset.y)
		) {
			newGeo = newGeo || geo.clone();
			newGeo.offset = shape.bounds.offset;
		}
		if (newGeo) {
			model.setGeometry(cell, newGeo);
		}
		// this.setPortStyle(umlShape);

		if (shape.box.style !== cell.style) {
			model.setStyle(cell, shape.box.style);
		}

		// this.setShapeText(umlShape);
		if (shapeModel.name !== cell.value) {
			model.setValue(cell, shapeModel.name);
		}
		if (shape.box.visible !== cell.visible) {
			model.setVisible(cell, shape.box.visible);
		}
		if (shape.isEdge()){
			const sourceShape = shapePool.get(shape.sourceId);
			const targetShape = shapePool.get(shape.targetId);

			if ((cell.source && cell.source.id) !== sourceShape.id) {
				model.setTerminal(cell, model.getCell(sourceShape.id), true);
			}
			if ((cell.target && cell.target.id) !== targetShape.id) {
				model.setTerminal(cell, model.getCell(targetShape.id), false);
			}

		}
		
	},
	  /**
   * 根据cellId删除cell，cellId就是umlShape的Id
   * @param {*} graph
   * @param {*} ids
   */
	deleteCellByIds(graph, ids) {
		const model = graph.getModel();
		ids.forEach(id => {
			const cell = model.getCell(id);
			if (cell) {
				model.remove(cell);

			}
		});
		// 	todo 也可以考虑使用 graph.removeCells
	},
	getDiagramTitle(shape){
		const shapeModel = shape.getModel();
		const parentShapeModel = shape.factory.modelPool.get(shapeModel.parentId);
		const modelDefine = shape.factory.modelDefinePool.get(model.modelDefineId);
		return `${modelDefine.shortTypeName}&nbsp;&nbsp;&nbsp;&nbsp;[ ${modelDefine.typeName} ]&nbsp;${parentShapeModel.name} [${shapeModel.name}]`;

	// 	if (diagram.getModelElements().toArray().length > 0){
	// 	  const diagramTypeName = modelApi.getDiagramTypeName(diagram);
	// 	  const elementType = this.getModelElementType(diagram);
	// 	  const modelName = this.getModelElementName(diagram);
	// 	  const diagramName = diagram.getName() || "";
	// 	  return `${diagramTypeName}&nbsp;&nbsp;&nbsp;&nbsp;[ ${elementType} ]&nbsp;${modelName} [${diagramName}]`;
	// 	} else {
	// 	  return "";
	// 	}
	//   }
	},
	getTextWidth(text, styleStr){
		const style = getStyleObj(styleStr);
		let dx = 0;
		dx += 2 * (style[mxConstants.STYLE_SPACING] || 0);
		dx += style[mxConstants.STYLE_SPACING_LEFT] || 0;
		dx += style[mxConstants.STYLE_SPACING_RIGHT] || 0;
		text = text.replace(/\n/g, "<br>");
		const fontSize = style[mxConstants.STYLE_FONTSIZE] || mxConstants.DEFAULT_FONTSIZE;
		let size = mxUtils.getSizeForString(text || "1", fontSize,
		  style[mxConstants.STYLE_FONTFAMILY]);
		// const width = size.width + dx;
		const width = size.width + dx + 4;
		return width;
	  }
};

export default graphUtil;
