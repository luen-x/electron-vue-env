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
	mxEdgeStyle
} = mxgraph;
import { ConnectionHandler } from "./ConnectionHandler";

const util = {
	obj2Style(obj) {
		let str = "";
		Object.keys(obj).forEach(key => {
			const value = obj[key];
			if (value !== undefined && value !== null) {
				str += `${key}=${value};`;
			}
		});
		return str;
	}
};

export class Graph extends mxGraph {
	constructor(container, model, renderHint, stylesheet) {
		super(container, model, renderHint, stylesheet);

		this.defaultEdgStyleObj = {
			edgeStyle: "orthogonalEdgeStyle",
			rounded: "0",
			jettySize: "auto",
			orthogonalLoop: "1",
			html: "1",
			[mxConstants.STYLE_MOVABLE]: 0 // 控制边不可移动
		};
		this.curEdgeStyleObj = { ...this.defaultEdgStyleObj };
		this.curEdgeStyle = this.createCurrentEdgeStyle();
		this.resetEdgesOnConnect = false;
		this.extendParentsOnAdd = false; // 新增cell时是否自动扩展父元素大小,改为不扩展，扩展时会导致打开画布时重复更新size
		this.extendParents = false; // 子元素resize时自动扩展父元素，改为false,因为port就是可以在一半在父元素外面
		this.connectableEdges = true;// 线要可以连接
	}
	createCurrentEdgeStyle() {
		return util.obj2Style(this.curEdgeStyleObj);
	}
	createConnectionHandler() {
		const connectionHandler = new ConnectionHandler(this);

		connectionHandler.setCreateTarget(false);
		connectionHandler.livePreview = true;
		return connectionHandler;
	}
}
