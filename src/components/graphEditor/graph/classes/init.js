import mx from "mxgraph";
const mxgraph = mx({
	mxImageBasePath: "./src/images",
	mxBasePath: "./src"
});
// decode bug https://github.com/jgraph/mxgraph/issues/49
window.mxGraph = mxgraph.mxGraph;
window.mxGraphModel = mxgraph.mxGraphModel;
window.mxEditor = mxgraph.mxEditor;
window.mxGeometry = mxgraph.mxGeometry;
window.mxDefaultKeyHandler = mxgraph.mxDefaultKeyHandler;
window.mxDefaultPopupMenu = mxgraph.mxDefaultPopupMenu;
window.mxStylesheet = mxgraph.mxStylesheet;
window.mxDefaultToolbar = mxgraph.mxDefaultToolbar;
export default mxgraph;
// ounded=0;whiteSpace=wrap;html=1;fillColor=#DDCD9E;gradientDirection=south;gradientColor=#FFFFFF;strokeColor=#99795C;shadow=1;rotatable=0;autosize=1;editable=0;allowArrows=1;resizeWidth=1;resizeHeight=1;fontSize=9;align=center;verticalAlign=top;resizable=1;c
