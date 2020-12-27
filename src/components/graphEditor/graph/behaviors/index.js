import { PackageBehavior } from "./PackageBehavior";
import { BlockDefinationDiagramBehavior } from "./BlockDefinationDiagramBehavior";
import { BlockBehavior } from "./BlockBehavior";

export class BehaviorManager{
	constructor(){
		this.behaviorMap = {};

	}
	register(behavior){
		this.behaviorMap[behavior.shapeDefineId] = behavior;

	}
	remove(shapeDefineId){
		delete this.behaviorMap[shapeDefineId];

	}
	get(shapeDefineId){
		return this.behaviorMap[shapeDefineId];

	}
}
export const behaviors = new BehaviorManager();
behaviors.register(new PackageBehavior());
behaviors.register(new BlockDefinationDiagramBehavior());
behaviors.register(new BlockBehavior());

