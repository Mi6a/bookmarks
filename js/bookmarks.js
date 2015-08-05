// Created by MishaBer on 24.07.2015.

"use strict";

// Define namespace BearsNS
var BearsNS = BearsNS || (function() {
   var namespace = {};
   return function() { return namespace; };
}());

(function() {

var ns = BearsNS(),
    // model
    Model = {
      _top : [], // top level folder, where folder is array of nodes of either folder, node or url types
      _tags : [], // array of tags
      _fld : this._top, // current folder
      _item : null,
      
      get top() { return this._top; },
      get tags() { return this._tags; },

      set folder(fld) { this._fld = fld; },
      get folder() { return this._fld; },
   
      set item(item) { this._item = item; },
      get item() { return this._item; }
   },
   
   Error = {
      NotNode : 0,
      NotIndex : 1
   };

// Item is parent class for all item types
//
function Item(name, descr, type, parent) {
   this._name = name || "";
   this._descr = descr || "";
   this._type = type;
   this._parent = parent || null;
}

//
Item.prototype = {
   FOLDER : 0,
   LINE : 1,
   URL : 2,
   NOTE : 3,
   set name(str) { this._name = str; },
   get name() { return this._name; },
   set descr(str) { this._descr = str; },
   get descr() { return this._descr; },
   get type() { return this._type; },
   
   isFolder : function() { return this.FOLDER === _type; },
   isLine : function() { return this.LINE === _type; },
   isUrl : function() { return this.URL === _type; },
   isNote : function() { return this.NOTE === _type; },
   
   parent: function() { return this._parent; },
   setParent : function(parent) { this._parent = parent; },
   
   setUsed : function() { this._used = Date(); },
   lastUsed : function() { return this._used; },

   modify : function() { this._modified = Date(); },
   modified : function() { return this._modified; }
};

// Folder = Item[_type ==  FOLDER] 
function Folder(name, descr, parent) {
   Item.call(this, name, descr, Item.FOLDER, parent);
   this._items = [];
}

// Folder prototype
Folder.prototype = Object.create(Item.prototype);
jQuery.extend(Folder.prototype, 
   { 
      TOP : 0,
      END : -1,
   
      items : function() { return this._items; },
      
      insert : function(item, before) { this.insertImpl(item, before); },

      
      // this should be private implementation. For a moment let's keep it here
      //
      insertImpl : function(item, before) { 
            if(!(item instanceof Item))
               throw Error.NotNode;
            if(arguments.length < 2)
               this.insertBeforeIndex(item, this.TOP);
            else if(before instanceof Item)
               this.insertBeforeItem(item, before);
            else
               this.insertBeforeIndex(item, before);            
         },
      
      insertBeforeIndex : function(item, before) {
            if(!isFinite(before))
               throw Error.NotIndex;
            if(this.END === before)
               this._items.items.push(item);
            else 
               this._items.splice(before, 0, item);
         },
      
      insertBeforeItem : function(item, before) {
            var index = this.find(item);
            this._items.splice(index, 0, item);
         },
         
      find : function(item) {
            var items = this._items;
            for(var i = 0; i < items.length; i++)
               if(items[i] === item)
                  return i;
            return items.length;
         }
   });

// Line = Item[type ==  LINE] 
function Line(name, descr, parent) {
   Item.call(this, name, descr, Item.LINE, parent);
}

// Url = Item[_type ==  URL]
function Url(url, name, descr, parent) {
   Item.call(this, name, descr, Item.URL, parent);
   this._url = url;
}

Url.prototype = Object.create(Item.prototype);
Url.prototype.url = function() { return this._url; };
Url.prototype.setUrl = function(str) { this._url = str; };

// Note = Item[_type ==  NOTE]
function Note(name, descr, parent) {
   Item.call(this, name, descr, Item.NOTE, parent);
}

// Event handlers
ns.eventHandlers = {
   clearGarbage: function() {
         $('#tags .tagList').empty();
         $('#folderCur').empty();
      },

   createTopic: function () {
         document.getElementById("editFolder").style.display = "block";
      },

   addFolder: function() {
         var name = $('#editFolderName').val(),
            descr = $('#editFolderDescr').val(),
            folder = new Folder(name, descr);
         
      }
};

}());

window.onload = function() {
   BearsNS().eventHandlers.clearGarbage();
};
