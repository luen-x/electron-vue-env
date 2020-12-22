import mxgraph from "./init";
const {
	mxGraph,
	mxVertexHandler,
	mxConstants,
	mxCellState,
	mxCellEditor,
	mxGraphHandler,
	mxEvent,
	mxEdgeHandler,
	mxShape,
	mxConnectionConstraint,
	mxPoint,
	mxEventObject,
	mxCodec,
	mxUtils,
	mxImageExport,
	mxResources,
	mxClient,
	mxPopupMenu,
	mxStencilRegistry,
	mxRubberband,
	mxText,
	mxGraphView,
	mxSvgCanvas2D,
	mxRectangle,
	mxCellHighlight,
	mxImage,
	mxCellRenderer,
	mxConnector,
	mxStencil,
	mxGuide,
	mxConnectionHandler,
	mxConstraintHandler,
	mxOutline,
	mxPanningHandler,
	mxDragSource,
	mxLayoutManager,
	mxPolyline,
	mxImageShape,
	mxDictionary,
	mxStackLayout,
	mxEllipse,
	mxElbowEdgeHandler,
	mxPopupMenuHandler, // edge浏览器鼠标移动报错
	mxCell,
	mxSelectionCellsHandler,
	mxEdgeStyle,
	mxGraphModel
} = mxgraph;

export class GraphModel extends mxGraphModel {
	constructor(container, model, renderHint, stylesheet) {
		super(container, model, renderHint, stylesheet);
		// this.defaultEdgStyle = {
		// 	edgeStyle: "orthogonalEdgeStyle",
		// 	rounded: "0",
		// 	jettySize: "auto",
		// 	orthogonalLoop: "1"
		// };
	}
}
