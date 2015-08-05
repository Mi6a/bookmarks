/* Example of the class  */
"use strict";

// Define namespace BearsNS
var BearsNS = BearsNS || (function() {
   var namespace = {};
   return function() { return namespace; }
}());

// anonymous namespace in which Pair interface is defined
(function() {

// Dial interface
// Using var for incapsulation
function Pair() {
   // data
   var _dat = pairImplFactory(arguments);

   // Interface
   return {
      
      data : function() { return _dat.copy(); },

      set : function(o1, o2) { _dat.set(o1, o2); return this; },
   
      sum : function() { return _dat.sum(); },
   
      swap : function() { _dat.swap(); return this; },
   
      clone : function() { return Pair(_dat.o1, _dat.o2); }
   };
}

// put in DialProto complex functions - implementation
function pairImplFactory(args) {
   return {
      o1 : args.length > 0? args[0] : null,
      o2 : args.length > 1? args[1] : null,

      copy: function() { return {o1 : this.o1, o2: this.o2}; },
      
      set: function(o1, o2) { this.o1 = o1; this.o2 = o2; return this; },
      
      sum : function() { return this.o1 + this.o2; },
      
      swap: function() { var tmp = this.o1; this.o1 = this.o2; this.o2 = tmp; return this; }
   };
}

// Add Dial into NameSpace
var ns = BearsNS();
if(!ns.makePair) {
   ns.makePair = Pair;
}

}());

var myPair = BearsNS().makePair(3,5);
myPair.set(2,4).swap();
var dat = myPair.get();