import Vue from 'vue';
export const errorCode = {
  ELEMENT_TYPE_ERROR: 100,
  RANGE_ERROR: 110,
  NAME_RANGE_ERROR: 111,
  CONSTRAINT_ERROR: 120,
  EMPTY_ERROR: 130,
  CALCULATION_ERROR: 150,

  SYSTEM_ERROR: 4000,
  MODEL_CREATE_ERROR: 4001,
  MODEL_UPDATE_ERROR: 4002,
  MODEL_DI_CREATE_ERROR: 4003,
  MODEL_DI_UPDATE_ERROR: 4004,
  MODEL_CONSTRAINT_ERROR: 4005,
  CONTAINMENT_EXIST: 4006,
  CONTAINMENT_ERROR: 4007,
  OWNER_CANNOT_BE_YOURSELF: 4008,
  CHILD_CAN_NOT_BE_PARENT: 4009,
  CURRENT_PROJECT_NOT_EXISTS: 4010,
  PASTE_NOT_ALLOW: 4011,
	
  FILE_READ_ERROR: 5001,
  FILE_WRITE_ERROR: 5002,
  SAVE_PROJECT_ERROR: 5003,
  LOAD_PROJECT_ERROR: 5004,
  DEFAULT_ERROR: 5005,
  SER_ERROR: 5006,
  DESER_ERROR: 5007

};

export const errorConfig = {
  100: '对象类型不匹配',
  110: '超出系统允许范围',
  111: '名称输入超过规定长度，最长不能超过50个字符',
  120: '超出模型约束范围',
  130: '不允许为空',
  150: '解析错误',

  4000: '系统错误',
  4001: '模型创建失败',
  4002: '模型更新失败',
  4003: 'DI创建失败',
  4004: 'DI更新失败',
  4005: '操作不符合规范',
  4006: '已存在包含',
  4007: '不可相互包含',
  4008: '元素的所有者不能是自己',
  4009: '子元素不能为父元素的父元素',
  4010: '当前项目不存在',
  4011: '粘帖失败，复制元素不允许挂载在当前节点下',

  5001: '读取文件失败',
  5002: "写入文件失败",
  5003: '保存项目失败',
  5004: '加载项目失败',

  5005: '操作失败',
  5006: '序列化失败',
  5007: '反序列化失败',

  ENOENT: '文件不存在'
};

export const createError = (status, error) => {
  if (!error){
    error = new Error();
  }
  if (error.status){
    return error;
  }
  if (error.info){
    error.status = error.info.code;
    return error;
  }
  error.status = status;
  return error;

};
export const tipError = (err) => {
  // debugger;
  console.error(err);
  err = createError(errorCode.DEFAULT_ERROR, err);
  const status = err.status;
  const msg = errorConfig[status];
  if (!msg) return;
  window.app.$messageBox.error({
    id: status,
    text: msg,
    duration: 3000,
  });
};

Vue.config.errorHandler = function (err, vm, info) {
  tipError(err);
  console.error(err);

};

window.onerror = (message, source, lineno, colno, err ) => {
  tipError(err);

  console.error(err);
};
window.addEventListener('unhandledrejection', function (err) {
  err.reason && tipError(err.reason);

});
