/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 27 21:45
*/
KISSY.add("component/extension/shim",["ua"],function(e,c){function a(){}var b=6===c("ua").ie,d='<iframe style="position: absolute;border: none;width: '+(b?"expression(this.parentNode.clientWidth)":"100%")+";top: 0;opacity: 0;filter: alpha(opacity=0);left: 0;z-index: -1;height: "+(b?"expression(this.parentNode.clientHeight)":"100%")+';"/>';a.ATTRS={shim:{value:b}};a.prototype.__createDom=function(){this.get("shim")&&this.get("el").prepend(d)};return a});
