import { Behavior } from "./Behavior";
export class PackageBehavior extends Behavior {
	constructor(){ 
		super({ shapeDefineId: 2 });
		// this.shapeDefineId = 2; // shapeDefineId表达了这个图形的定义，每个mainShape都应该对应一个Behavior
		//

	}
	/**
	 * hover类型的行为应返回Boolean,只显示是否需要高亮，
	 */
	treeModelHover(model, shape){

	}
	siderBarItemHover(modelDefine, shape){

	}
	shapeHover(sourceShape, shape){

	}
	/**
	 * drop类型的行为会操作模型和图形，一个drop操作往往是一个事务
	 */
	treeDrop(model, shape){

	}
	siderBarDrop(modelDefine, shape){

	}
	shapeDrop(sourceShape, shape){

	}

}