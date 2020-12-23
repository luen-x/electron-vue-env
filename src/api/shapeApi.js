class ShapeApi {
	  /**
   * 获取cell或shape的面积
   * @param {cell|umlShape} shape
   */
	getSize(shape){
		const bounds = shape.bounds || shape.geometry;
		if (bounds){
			return bounds.width * bounds.height || 0;
		} else {
			return 0;
		}

	}
	/**
   * 根据面积排序,传入cell或者shape数组，不操作原数组，会返回新的数组
   * @param {cells|shapes} shapes
   */
	sortBySize(shapes){
		shapes = [...shapes];
		shapes.sort((i, j) => {
			return this.getSize(j) - this.getSize(i);
		});
		return shapes;

	}

}
export const shapeApi = new ShapeApi();