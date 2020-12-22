import mxgraph from "./init";

const { mxConnectionHandler, mxCellState, mxCell } = mxgraph;
export class ConnectionHandler extends mxConnectionHandler {
	constructor(graph, factoryMethod) {
		super(graph, factoryMethod);
		// statrt之后previous中存储了start的cellState
		// isValidTarget判断是否可以连接
		// 连接开始时发射start事件，可以获得startCell
		// 连接成功后发射connect事件，可以获得edg和targetCell
		this.outlineConnect = true;
	}
	// 验证是否是有效地target
	isValidTarget(cell) {
		if (cell.value === "Hello,") {
			return true;
		} else return false;
	}
	// 创建edg,使用全局边样式
	createEdge(value, source, target, style) {
		return super.createEdge(value, source, target, this.graph.curEdgeStyle);
	}
	// 复写mask上的边
	createEdgeState() {
		let edgeCell = new mxCell(
			"",
			new mxGeometry(),
			this.graph.curEdgeStyle
		);
		edgeCell.vertex = false;
		edgeCell.edge = true;

		let state = new mxCellState(
			this.graph.view,
			edgeCell,
			this.graph.getCellStyle(edgeCell)
		);

		return state;
	}
	mouseUp(graph, event) {
		const me = event;
		const sender = graph;

		if (!me.isConsumed() && this.isConnecting()) {
			if (this.waypointsEnabled && !this.isStopEvent(me)) {
				this.addWaypointForEvent(me);
				me.consume();

				return;
			}

			// 为了实现点击空白处不创建连线
			if (!event.state && this.first != null) {
				me.consume();
				this.reset();
				return;
			}

			let c1 = this.sourceConstraint;
			let c2 = this.constraintHandler.currentConstraint;

			let source = this.previous != null ? this.previous.cell : null;
			let target = null;

			if (
				this.constraintHandler.currentConstraint != null &&
				this.constraintHandler.currentFocus != null
			) {
				target = this.constraintHandler.currentFocus.cell;
			}

			if (target == null && this.currentState != null) {
				target = this.currentState.cell;
			}

			// Inserts the edge if no validation error exists and if constraints differ
			if (
				this.error == null &&
				(source == null ||
					target == null ||
					source != target ||
					this.checkConstraints(c1, c2))
			) {
				this.connect(source, target, me.getEvent(), me.getCell());
			} else {
				// Selects the source terminal for self-references
				if (
					this.previous != null &&
					this.marker.validState != null &&
					this.previous.cell == this.marker.validState.cell
				) {
					this.graph.selectCellForEvent(
						this.marker.source,
						me.getEvent()
					);
				}

				// Displays the error message if it is not an empty string,
				// for empty error messages, the event is silently dropped
				if (this.error != null && this.error.length > 0) {
					this.graph.validationAlert(this.error);
				}
			}

			// Redraws the connect icons and resets the handler state
			this.destroyIcons();
			me.consume();
		}

		if (this.first != null) {
			this.reset();
		}
	}
}
