
import { shapeApi } from "@/api/shapeApi";
import { BoundsChange, ObjectChange } from "@/model/stepManager";

import graphUtil from "./graphUtil";

const getText = (shape) => {
	return (shape.getText ? shape.getText() : shape.text) || "";
};

export const resizeUtil = {
	/**
   * box schame {
   * position:String, flow/absolute/port/edge defalut= flow,
      * flow元素会遵循流式布局的方式自动排布，
      * absolute的元素会按照bounds中的x,y直接定位，
      * port类型的元素会吸附的父元素的边界上，超出父元素时不需要扩展父元素，port类型的元素expandParent应为false
      * edge类型的元素不会计算bounds，其子元素不扩展父元素，会直接跳过位置和大小计算的步骤，edge类型的元素会被前置到画布的最顶层，
             edge的子元素的expandParent属性应为false，position应为absolute，edge的子元素的位置与一般元素不同，其x是线上的比例位置，y是交叉轴位置，offset是相对交叉点的偏移位置
              edge的子元素会跳过位置和大小计算的步骤

   * expandParent:Boolean, default = true // 是否撑开父元素 , 一些元素的nameLabel的位置在父元素外面的，此参数应设为false,
   * portDirection: 枚举 left/top/right/bottom // port的朝向
   * portPosition: 0, // port的位置，代表port应该向容器外偏移的比例，0代表内嵌，0.5代表在中线上, 1代表外部，
   * width:String ,100 / 100% defalut=100% // 初始宽度，可以是绝对的值（字符串）,也可以是百分比（相对父元素），这个宽度会用于boxWidth的计算，当宽度是比例值时，resizable必须是false，因为此元素的宽度只会跟着父元素的变化而变化，本生resize触发的大小变化将会失效
   * height:String， 100 / 100% // 初始高度，和宽度一样，可以时绝对值或百分比。是百分比时不能设置resizable=1
   * paddingTop:Number,  defalut=0 // 上下左右的边距,此边据是borderbox的的，会从width和height中扣除后再计算contentWidth
   * paddingLeft:Number,defalut=0
   *  paddingBottom:Number,defalut=0
   * paddingRight:Number,defalut=0
   *
   * boxWidth: Number // 包括padding的宽度,非用户配置，运行时根据子元素和自己的width计算得到
   * boxHeight: Number // 包括padding的高度
   * boxX:Number // 包括padding的X
   * boxY:Number // 包括padding的Y
   *
   * right:Number,  // 绝对定位并且expandParent为false时，时可用right和bottom进行靠右或者靠下定位，此参数优先级高于boxX，boxY
   * bottom:Number, //
   *
   *
   *
   *
   * }
   * @param {*} shape
   * @param {*} parentShape
   * @param {*} preShape
   * @param {*} absolute
   */

	getBoxWidthHeight(box, parentBox){
		if (box.boxWidth !== undefined) return { boxWidth: box.boxWidth, boxHeight: box.boxHeight };
		const result = { boxWidth: 0, boxHeight: 0 };
		if (box.widthUnit === "px"){
			result.boxWidth = box.width;
		} else {
			result.boxWidth = parentBox.boxWidth * box.width / 100;
		}

		if (box.heightUnit === "px"){
			result.boxHeight = box.height;
		} else {
			result.boxHeight = parentBox.boxHeight * box.height / 100;
		}
		return result;

	},
	getChidrenBounding(shape){
		let maxWidth = shape.box.boxWidth;
		let maxHeight = shape.box.boxHeight;

		const childShapes = shape.children.forEach(child => {
			child.localStyle.isDisplay && child.box.position === "flow";
		});

	},
	updatePortBox(portShape, parentShape) {
		const portBox = portShape.box;
		const parentBox = parentShape.box;
		const direction = portBox.portDirection;
		const movePercent = portBox.portPosition;
		if (direction === "right") {
			portBox.boxX = parentBox.boxWidth - portBox.boxWidth * (1 - movePercent);
			this.updateBoundsByBox(portShape);

		} else if (direction === "bottom") {
			portBox.boxY = parentBox.boxHeight - portBox.boxHeight * (1 - movePercent);
			this.updateBoundsByBox(portShape);
		}

	},
	updateBoundsByBox(shape){
		shape.bounds.x = shape.box.boxX + shape.box.paddingLeft;
		shape.bounds.y = shape.box.boxY + shape.box.paddingTop;
		shape.bounds.width = shape.box.boxWidth - shape.box.paddingLeft - shape.box.paddingRight;
		shape.bounds.height = shape.box.boxHeight - shape.box.paddingTop - shape.box.paddingBottom;

	},
	/**
   * 初始化shape，为box设置boxX, boxY, boxWidth, boxHeight,
   * 如果已经被初始化过则不会再初始化
   * @param {shape} shape 
   * @param {number} x 
   * @param {number} y 
   */
	initShape(shape, x, y){
		console.log("init shape");
		const box = shape.box;
		if (box.boxX !== undefined) return;
		box.boxX = x === undefined ? box.initX : x;
		box.boxY = y === undefined ? box.initY : y;
		const parent = shape.getParent();
		const parentBox = parent && parent.box;
		if (box.widthUnit !== "%") {
			box.boxWidth = box.width;

		} else {
			box.boxWidth = parentBox.boxWidth * box.width / 100;
		}

		if (box.heightUnit !== "%"){
			box.boxHeight = box.height;
		} else {
			box.boxHeight = parentBox.boxHeight * box.height / 100;
		}
		this.updateBoundsByBox(shape);
		const childShapes = shape.children;

		let curY = 0;
		childShapes.forEach(child => {
			if (child.box.position == "absolute"){
				this.initShape(child);
			} else if (child.box.position == "flow") {
				this.initShape(child, 0, curY);
				curY += child.box.boxHeight;
			}

		});

	},

	// 当父元素大小变化时重新计算其子元素的位置和大小
	updateAutoFlow(shape, parentShape, preShape){
		const childShapes = shape.children;
		const flowShapes = [];
		const absoluteShapes = [];
		const portShapes = [];
		const edgeShapes = [];
    
		childShapes.forEach(childShape => {
			if (!childShape.box.visible) return;
			const postion = childShape.box.position;
			if (postion === "flow"){
				flowShapes.push(childShape);
			} else if (postion === "absolute") {
				absoluteShapes.push(childShape);
				// absoluteShape.push(childShape);
			} else if (postion === "port"){
				portShapes.push(childShape);
			} else if (postion === "edge"){
				edgeShapes.push(childShape);
			}

			// eg. nameLabel,keywordLabel，调整宽度
			if (childShape.box.widthUnit === "%"){
				// debugger;
				// childShape.box.boxWidth = shape.box.boxWidth * childShape.box.width / 100;
				const boxWidth = shape.box.boxWidth * childShape.box.width / 100;
				if (boxWidth !== childShape.boxWidth) {
					childShape.updateBoxBounds({ boxWidth });

				}

			}
			// if(childShape.box.heightUnit==='%') {
			//   childShape.box.boxHeight = shape.box.boxHeight *  childShape.box.height/100
			// }
		});

		absoluteShapes.forEach(childShape => {
			const childBox = childShape.box;
			// eg. block的加号Icon
			if (childBox.expandParent == false && childBox.moveType == "notAllow"){
				if (childBox.left !== undefined ){
					if (	childBox.boxX !== childBox.left) {
						childShape.updateBoxBounds({ boxX: childBox.left });

					}
				
				} else if (childBox.right !== undefined ) {
					const boxX = shape.box.boxWidth - childBox.right;
					if (	childBox.boxX !== boxX) {
						childShape.updateBoxBounds({ boxX });

					}
					// childBox.boxX = shape.box.boxWidth - childBox.right;

				}

				if (childBox.top !== undefined ){
					if (childBox.top !== childBox.boxY) {
						childShape.updateBoxBounds({ boxY: childBox.top });
					}
					// childBox.boxY = childBox.top;
				} else if (childBox.bottom !== undefined ){
					const boxY = shape.box.boxHeight - childBox.bottom;
					if (childBox.boxY !== boxY) {
						childShape.updateBoxBounds({ boxY });
					// childBox.boxY = shape.box.boxHeight - childBox.bottom;
					}
				}
				// this.updateBoundsByBox(childShape);

			}

		});
		let y = 0;
		flowShapes.forEach(childShape => {
			const childBox = childShape.box;
			if (childBox.boxY !== y){
				childShape.updateBoxBounds({ boxY: y });
			}
			// childShape
			// childBox.boxY = y;
			if (childShape.box.style.startsWith("text;")){
				const height = graphUtil.getTextHeight(childShape.getText(), childShape.box.style, childBox.boxWidth - childBox.paddingLeft - childBox.paddingRight);
				const boxHeight = childShape.box.paddingTop + childShape.box.paddingBottom + height;
				if (childBox.boxHeight !== boxHeight) {
					childShape.updateBoxBounds({ boxHeight });
				}
				// childBox.boxHeight = childShape.box.paddingTop + childShape.box.paddingBottom + height;

			}
     
			y += childBox.boxHeight;
			// resizeUtil.updateBoundsByBox(childShape);

		});
		// 子元素超出父元素时宽展父元素
		if (y > shape.box.boxHeight){
			childShape.updateBoxBounds({ boxHeight: y });
			// shape.box.boxHeight = y; 
		}
		portShapes.forEach(childShape => {
			const childBox = childShape.box;

			resizeUtil.updatePortPosition(childShape, shape);

		});
		// resizeUtil.updateBoundsByBox(shape);

	},
	addBoundsChange(stepManager, shape, bounds){
		const change = new BoundsChange({ shape, bounds });
		change.redo();
		stepManager.addChange(change);

	},
	/**
   * 递归扩展shape
   * @param {*} shape 当前shape，会将此shape与owningElement进行对比
   * @param {*} affectedShapeds 不用传，用于递归
   * return 受影响的cellId
   */
	expandParentSize(shape, affectedShapeds = []){
		const parent = shape.getParent();
		const sm = shape.factory.stepManager;
   
		if (!parent ) return affectedShapeds;
		const parentBox = parent.box;
		if (parentBox.expandParent === false) return affectedShapeds;
		const shapeBox = shape.box;

		console.log("expandParentSize", shape);

		const isParentDiagram = parent.parentId === null || parent.parentId === undefined;

		let resized = false;
		// x cell
		const xDiff = shapeBox.boxX - shapeBox.expandPaddingLeft;
		if (xDiff < 0){
			if (!isParentDiagram){
				parent.updateBounds({ x: parent.bounds + xDiff, width: parent.bounds - xDiff });
				// this.addBoundsChange(sm, parent, { ...parent.bounds, x: parent.bounds + xDiff, width: parent.bounds - xDiff });
				// parentBox.boxX += xDiff;
				// parentBox.boxWidth -= xDiff;

				const otherChild = parent.children.filter(c => c.id !== shape.id && (c.box.moveType === "allow" || c.box.moveType === "xonly"));
				otherChild.forEach(child => {
					if (!child.bounds) return;
					child.updateBounds({ x: child.bounds - xDiff });
					// this.addBoundsChange(sm, child, { ...child.bounds, x: child.bounds - xDiff });
					// const change = new ObjectChange({ obj: child.box, key: "boxX", val: child.box.boxX - xDiff });
					// change.redo();
					// shape.factory.stepManager.addChange(change);
          
					// this.updateBoundsByBox(child);
				});
				resized = true;
			}
			shape.updateBounds({ x: shape.box.boxX + shape.box.expandPaddingLeft });
			// this.addBoundsChange(sm, shape, { ...shape.bounds, x: shape.box.boxX + shape.box.expandPaddingLeft });
			// shapeBox.boxX = shapeBox.expandPaddingLeft;
			affectedShapeds.push(shape.id); 

		}
		const yDiff = shape.box.boxY - shape.box.expandPaddingTop;
		if (yDiff < 0){
			if (!isParentDiagram){

				parentBox.boxY += yDiff;
				parentBox.boxHeight -= yDiff;
				shape.updateBounds({ y: shape.bounds.y + yDiff, height: shape.bounds.height - yDiff });
				// this.addBoundsChange(sm, shape, { ...shape.bounds, y: shape.bounds.y + yDiff, height: shape.bounds.height - yDiff });
        
				const otherChild = parent.children.filter(c => c.id !== shape.id && (c.box.moveType === "allow" || c.box.moveType === "yonly"));
				otherChild.forEach(child => {
					if (!child.bounds) return;
					child.box.boxY -= yDiff;
					child.updateBounds({ y: child.bounds.y - yDiff });
					// this.addBoundsChange(sm, child, { ...child.bounds, y: child.bounds.y - yDiff });

					affectedShapeds.push(child.id);
					// this.updateBoundsByBox(child);
				});
				resized = true;
        
			}
			shapeBox.boxY = shapeBox.expandPaddingTop;
			affectedShapeds.push(shape.id);

		}
		const widthDiff = parentBox.boxWidth - (shapeBox.boxX + shapeBox.boxWidth + shapeBox.expandPaddingRight);
		if (widthDiff < 0){
			parentBox.boxWidth -= widthDiff;
			resized = true;

		}
		const heightDiff = parentBox.boxHeight - (shapeBox.boxY + shapeBox.boxHeight + shapeBox.expandPaddingBottom);
		if (heightDiff < 0){
			parentBox.boxHeight -= heightDiff;
			resized = true;

		}
		if (resized) {
			affectedShapeds.push(parent.id);
			this.updateBoundsByBox(shape);
			this.updateBoundsByBox(parent);

			this.updateAutoFlow(parent);
			this.expandParentSize(parent, affectedShapeds);
		}
		return affectedShapeds;

	}

};

