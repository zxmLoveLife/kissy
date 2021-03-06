/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 27 21:52
*/
/*
 Combined modules by KISSY Module Compiler: 

 editor/plugin/justify-left
*/

KISSY.add("editor/plugin/justify-left", ["editor", "./justify-left/cmd", "./button"], function(S, require) {
  var Editor = require("editor");
  var justifyCenterCmd = require("./justify-left/cmd");
  require("./button");
  function exec() {
    var editor = this.get("editor");
    editor.execCommand("justifyLeft");
    editor.focus()
  }
  function justifyLeft() {
  }
  S.augment(justifyLeft, {pluginRenderUI:function(editor) {
    justifyCenterCmd.init(editor);
    editor.addButton("justifyLeft", {tooltip:"\u5de6\u5bf9\u9f50", checkable:true, listeners:{click:exec, afterSyncUI:function() {
      var self = this;
      editor.on("selectionChange", function() {
        if(editor.get("mode") === Editor.Mode.SOURCE_MODE) {
          return
        }
        if(editor.queryCommandValue("justifyLeft")) {
          self.set("checked", true)
        }else {
          self.set("checked", false)
        }
      })
    }}, mode:Editor.Mode.WYSIWYG_MODE});
    editor.docReady(function() {
      editor.get("document").on("keydown", function(e) {
        if(e.ctrlKey && e.keyCode === S.Node.KeyCode.L) {
          editor.execCommand("justifyLeft");
          e.preventDefault()
        }
      })
    })
  }});
  return justifyLeft
});

