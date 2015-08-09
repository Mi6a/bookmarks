/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

"use strict";

// jQuery
// on document ready
$(document).ready(function() {}); // === $(function(){})
// conflicts with other libs
(function( $ ) { /* Your jQuery code here, using the $ */ })( jQuery );

// attributes
// attr setter
$( "a" ).attr( "href", "allMyHrefsAreTheSameNow.html" );

$( "a" ).attr({
   title: "all titles are the same too!",
   href: "somethingNew.html"
});

// attr getter
$( "a" ).attr( "href" );

// !!! Selecting elements
$( "#myId" ); // by id
$( ".myClass" ); // by class
$( "input[name='first_name']" ); // by attr
$( "#contents ul.people li" ); // by css

// events
$("a").click(function(){});

// utilities
// get page
$.get( "myhtmlpage.html", function() {});

// Inheritance - the right way

// Example 1: class Impl inherits class Interface
/*
 * Impl completely hides Interface
 * 
 */
/*
class Interface {
   public:
      // factory method
      static Interface* Factory(int a) { return new Impl(a); }

      // Interface
      virtual int get() = 0;
};

class Impl {
   public:
      Impl(int a) _a(a) {}
      virtual int get() { return _a; }

   private:
      int _a;
};
*/

// JavaScript implementation of Example 1:
// Variant 1. 
// This variant is OK as long as our internal functions are simple and interface overall is small
// However if want to hide implementation and show only interface use Variant 2
// function Factory is analog of Interface::Factory()
// Private members can be implemented in JavaScript through closures only
//
function factory() {
   // _dat hides private data
   var _a = arguments[0];

   // Interface
   return {
      f1 : function() { return _a; },
   };
}

// Variant 2. Base for everything else
/* Explanation:
   Split interface and Implementation. Put all interface into factory
   Put all implementation into factoryImpl
   For real example see Pair in pair.js
 */

function factory() {
   // _dat hides private data
   var _dat = factoryImpl(arguments);

   // Interface
   return {
      f1 : function() { return _dat.f1(); },
   };
}

function factoryImpl(args) {
   return {
      _a : ars[0],
      f1: function() { return this.o1; },
   };
}

// Example 2
/* class Parent have private methods and data
 * class Child inherits same interface and adds some, and uses public members of Parent
 */
/*
class Parent {
   public:
      Parent(int a, int b) : _a(a), _b(b) {}

      // Interface
      virtual int getA() { return _a; }

   private:
      void getB() { return _b; }
      int _a;
      int _b;
};

class Child {
   public:
      Child(int a, int b, int c) : Public(a, b), _c(c) {}

      int getC() { return _c; }

   private:
      void doSome() { cout << c; }

      int _c;
};
*/

/*
 *  Prototype doesn't work for private data. Put statics and public data into prototype
 */
function Parent(a,b) {

   // if _priv is a complex, then can put it into the prototype - see below
   var _priv = {
      _a : a,
      _b : b,
      getB : function() { return _priv._b; }
   };
   
   return {
      getA : function() { return _priv._a; }
   };
}

function Child(a, b, c) {
   var _priv = {
            _c : c,
            doSome: function() { alert(_priv._c); }
         };

   this.getC = function getC() { return _priv._c; };
}

function getChild(a,b,c) {
   var child = Object.create(Parent(a,b));
   Child.call(this, c);
}

// Improve above using prototypes
// if _priv is a complex, then can put it into the prototype
// !!! Base for all classes using inheritance
function ParentPriv(a, b)
{
   this._a = a;
   this._b = b;
}

ParentPriv.prototype  = {
   getB: function() { return this._b; }  
};

function Parent(a,b) {
   // if _priv is a complex, then can put it into the prototype - see below
   var _priv = new ParentPriv(a,b);
   
   return {
      getA : function() { return _priv._a; },
      getB : function() { return _priv.getB(); }
   };
}

function ChildPriv(c) {
   this._c = c;
}

ChildPriv.prototype  = {
   getC : function() { return this._c; },
   doSome: function() { alert(this._c); }
};

function Child(c) {
   var _priv = new ChildPriv(c);
   this.getC = function() { return _priv.getC(); };
   Child.count++;
}

Child.count = 0;

function getChild(a,b,c) {
   var child = Object.create(Parent(a,b));
   Child.call(this, c);
}

// from Mozilla - regular way - no privacy whatsoever !!!
function Employee() {
  this.name = "";
  this.dept = "general";
}

function Manager() {
  Employee.call(this);
  this.reports = [];
}
Manager.prototype = Object.create(Employee.prototype);

function WorkerBee() {
  Employee.call(this);
  this.projects = [];
}
WorkerBee.prototype = Object.create(Employee.prototype);


///
// implementing protected
function Parent(protecteds) {
    protecteds = protecteds || {};
    var alpha = 'private var';
    protecteds.beta = 'protected var';
    this.gamma = 'public var';
}

function Child() {
    var supers = {};
    var child = new Parent(supers); // parasitic constructor, to which we pass supers

    child.delta = 'public child var';
    child.getBeta = function() {
        return 'Accesses ' + supers.beta;
    };

return child;
}

var parent = new Parent(); // sole instance of parent
parent.beta; // returns undefined - it's not public

var child = new Child();
child.getBeta(); // returns 'Accesses protected var'
child.beta; // returns undefined - beta is still not directly exposed
child.gamma; // returns 'public var' - we have inherited from parent


//------------------------ some of the JavaScript useful staff -----------------//

var switchProto = {
    isOn: function isOn() {
      return this.state;
    },

    toggle: function toggle() {
      this.state = !this.state; // creates new property this.state
      return this;
    },

    state: false
  },
  switch1 = Object.create(switchProto),
  switch2 = Object.create(switchProto);

function factory() {
  var highlander = {
      name: 'MacLeod'
    };
    
  return {
    get: function get() {
      return highlander;
    }
  };
}

// encapsulate some data
var car = function car(color, direction, mph) {
  var isParkingBrakeOn = false;

  return {
    color: color || 'pink',
    direction: direction || 0,
    mph: mph || 0,
    gas: function gas(amount) {
      amount = amount || 10;
      this.mph += amount;
      return this;
    },

    brake: function brake(amount) {
      amount = amount || 10;
      this.mph = ((this.mph - amount) < 0) ? 0
        : this.mph - amount;
      return this;
    },

    toggleParkingBrake: function toggleParkingBrake() {
      isParkingBrakeOn = !isParkingBrakeOn;
      return this;
    },

    isParked: function isParked() {
      return isParkingBrakeOn;
    }
  };
},
myCar = car('orange', 0, 5);

var carPrototype = {
    gas: function gas(amount) {
      amount = amount || 10;
      this.mph += amount;
      return this;
    },
    brake: function brake(amount) {
      amount = amount || 10;
      this.mph = ((this.mph - amount) < 0)? 0
        : this.mph - amount;
      return this;
    },
    color: 'pink',
    direction: 0,
    mph: 0
  },

  car = function car(options) {
    return extend(Object.create(carPrototype), options);
  },

  myCar = car({
    color: 'red'
  });