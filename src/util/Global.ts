import { Emitter } from "./Emitter";

export class GlobalConfig {
    env:string|undefined
    platform:string
    isElectron:boolean
    windowBarHeight:string
    topBarHeight:string
    tabBarHeight:string
    toolBarHeight:string
    footerHeight:string
    graphHeight:string
    workSpaceHeight:string
    mainContent:string

    constructor(){
      this.env = process.env.MODE;
      this.platform = process.platform;
      this.isElectron = process.env.MODE === 'electron';
      this.init();

    }  
    init(){
      this.windowBarHeight = this.isElectron ? '32px' : '0px';
      this.topBarHeight = '62px';
      this.tabBarHeight = '28px';
      this.toolBarHeight = '32px';
      this.footerHeight = '30px';
      const otherHeight = parseFloat( this.windowBarHeight) + parseFloat(this.topBarHeight) + parseFloat(this.tabBarHeight) + parseFloat(this.toolBarHeight) + parseFloat(this.footerHeight);
      const other2 = parseFloat( this.windowBarHeight) + parseFloat(this.topBarHeight);
      this.graphHeight = `calc(100vh - ${otherHeight}px)`;
      this.workSpaceHeight =  `calc(100vh - ${other2}px)`;
      this.mainContent = `calc(100vh - ${other2}px)`;

    }
}
// 声明全局变量类型

// declare global {
//   interface TreeNode {
//     label:string
//     value:string|number
//     children?:TreeNode[],
//     [prop:string]:any
//   }
//   // const proxy:{projects:Map<string, any>, activityProject:string|undefined};
//   // const debugUtil:{SysMLUtilHelper:any, mxUtils:any, graph:any, clickedCell:any};
//   // const app:{
//   //   treeData:TreeNode[] | undefined,
//   //   activeProject:Object|undefined
//   //   ui:Object|undefined
//   //   di:Object|undefined
//   //   selectedElement:Object|undefined
//   //   metadata:Object|undefined
//   //   sysmlModel:Object|undefined
//   //   $bus:Emitter
//   //   graphMap:Map<string, any>
//   // };

// }
