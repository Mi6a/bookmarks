/**
 * Created by Misha on 08.08.2015.
 */
// Define namespace BearsNS
var BearsNS = BearsNS || (function() {
      var namespace = {};
      return function() { return namespace; }
   }());

(function() {
   "use strict";
   var ns = BearsNS();

   function make(o, parent) {
      var tag = o.elem,
         text = o.text,
         elem = tag ? document.createElement(tag) : (text ? document.createTextNode(text) : null);
      if (!elem)
         return null; // no object created
      if (tag) {
         for(var key in o) {
            var val = o[key];
            switch (key) {
               case "elem":
                  break;

               case "sub":
                  if (Array.isArray(val))
                     val.forEach(function (ob, ind, ar) { make(ob, elem); });
                  else
                     make(val, elem);
                  break;

               case "attr":
                  for (var attr in val)
                     elem.setAttribute(attr, val[attr]);
                  break;

               case "text":
                  elem.appendChild(document.createTextNode(val));
                  break;

               case "id":
               case "class":
               case "style":
               case "src":
               case "href":
               case "value":
               case "type":
               // add more attribute cases here
                  elem.setAttribute(key, val);
                  break;
            }
         }
      }
      else
         tag = "text";
      if (parent) {
         parent.appendChild(elem);
         // create .tag property on parent
         parent[tag] = parent[tag] || [];
         if(Array.isArray(o))
            parent.tag.push(elem);
      }
      return elem;
   }

   if(!ns.dom) {
      ns.dom = {
         mk: make
      };
   };
}());

/* Example of Usage :
var o = {
   elem : "div",
   attr : { id : "id1", class: "myClass", style: "somestylestring"},
   text : "some text",
   sub : [
      {  elem: "ul", class: "class2", id: "id2", text: "menu 1"},
      {  text: "internal text 1"},
      {  elem: "ul", class: "class2", id: "id2", text: "menu 2"},
      {  text: "internal text 2"},
      {  elem: "ul", class: "class2", id: "id2", text: "menu 3"},
   ]
};

var elem = BearsNS().dom.mk(o, null);

 end of Example */