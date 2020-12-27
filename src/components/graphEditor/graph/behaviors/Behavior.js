export class Behavior {
	constructor(op){ 
		this.shapeDefineId = op.shapeDefineId; // shapeDefineId表达了这个图形的定义，每个mainShape都应该对应一个Behavior
		// behavior是针对目标Shape的，shapeDefineId是目标shape的shapeDefineId
		// this.factory = op.factory;
	}
	/**
	 * hover类型的行为应返回Boolean,只显示是否需要高亮，
	 * 此行为只做效率比较高的基础检查，能够在大部分情况下界定是否可以操作，具体行为在drop中验证处理
	 */
	treeModelHover(model, shape){

	}
	siderBarItemHover(modelDefine, shape){

	}
	shapeHover(sourceShape, shape){

	}
	/**
	 * drop类型的行为会操作模型和图形，一个drop操作往往是一个事务
	 * drop操作应在hover为true时才会执行
	 */
	treeDrop(model, shape){
		if (!this.treeModelHover(model, shape)) return;

	}
	siderBarDrop(modelDefine, shape){
		if (!this.siderBarItemHover(modelDefine, shape)) return;

	}
	shapeDrop(sourceShape, shape){
		if (!this.shapeHover(sourceShape, shape)) return;

	}
}