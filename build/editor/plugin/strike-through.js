/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 27 21:55
*/
/*
 Combined modules by KISSY Module Compiler: 

 editor/plugin/strike-through
*/

KISSY.add("editor/plugin/strike-through", ["./font/ui", "./strike-through/cmd", "./button"], function(S, require) {
  var ui = require("./font/ui");
  var cmd = require("./strike-through/cmd");
  require("./button");
  function StrikeThrough() {
  }
  S.augment(StrikeThrough, {pluginRenderUI:function(editor) {
    cmd.init(editor);
    editor.addButton("strikeThrough", {cmdType:"strikeThrough", tooltip:"\u5220\u9664\u7ebf"}, ui.Button)
  }});
  return StrikeThrough
});

