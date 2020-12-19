// pool其实就是数据库，以id为键的键值对

// 元元模型库,存储元元模型实例
export const modelDefinePool = {
	
};

// 元模型库，存储元模型实例
export const modelPool = {

};

// 图形库，存储图形实例
export const shapePool = {
	
};

export class Factory {
	
}
console.log(Date.now());

const map = {};
for (let i = 0; i < 1000000010; i++){
	map[i] = 1;
}
console.log(Date.now());
console.log(map[100000000]);
console.log(map[100]);

console.log(Date.now());

