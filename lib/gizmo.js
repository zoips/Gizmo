var Prototypes = require("./prototypes");

/**
 * When a Gizmo constructor function is being called as a parent constructor,
 * it recieves as its first argument an instance of this object. This holds the
 * correct self ('this') and our references.
 *
 * @param self the self reference, otherwise known as 'this'
 * @param our the shared our object
 */
function Parent(self, our) {
  this.self = self;
  this.our = our;
}

/**
 * Gizmo.define(cons : Function) : Function
 * Gizmo.define(parentCons : Function ..., cons : Function) : Function
 *
 * Defines a Gizmo constructor. cons is the constructor function that will
 * construct the object. parentCons are any Gizmo constructor functions that
 * are the parents.
 *
 * The first argument passed to cons will always be the shared 'our' object.
 * The shared 'our' object is a place for objects to place protected
 * information. It will be shared up and down the inheritance hierarchy.
 * Closure variables plus the 'our' object plus normal properties yields
 * full private, protected, and public encapsulation.
 *
 * The next arguments will be parent functions to invoke. The parent functions
 * supplied to the child are a special function which will ensure that all
 * parents up the chain are using the same 'our' object and have the same
 * 'this', so it's important to use that reference rather than direct invoking
 * the parent constructor.
 *
 * Parent functions are passed to cons in the same order they were passed to
 * Gizmo.define. Because Gizmo allows multiple "inheritance", developers need to
 * be aware of the pitfalls associated with it (diamond inheritance, name
 * collisions, etc). Gizmo makes no efforts to help with this.
 *
 * Example hierarchy:
 *
 * var TheParent = Gizmo.define(function(our, foo) {
 *   var bar = "some text"; // this is private to this instance
 *
 *   our.foo = foo; // this is protected and shared with children
 *
 *   // this is a public method
 *   our.self.doFoo = function() {
 *     sys.log(our.foo + ": " + bar);
 *   };
 *
 *   // this is a protected method
 *   our.doBar = function() {
 *     sys.log(bar);
 *   };
 * });
 *
 * var TheChild = Gizmo.define(TheParent, function(our, parent, someVar) {
 *   parent(someVar); // run the parent constructor.
 *
 *   our.self.doFoo(); // call doFoo defined by the parent
 *   our.doBar(); // call doBar in the protected object
 * });
 *
 * @param cons constructor function for the object
 * @param parentCons parent constructor functions or objects to mix
 * @return constructor function
 */
function define() {
  var defargs = Array.prototype.slice.call(arguments, 0);
  var constructor = defargs.pop();
  var parents = defargs.slice();

  return function() {
    var conargs = Array.prototype.slice.call(arguments, 0);
    var self;
    var our;

    // If first arg is an instanceof Parent, then we've been invoked as a
    // parent constructor rather than via new
    if (conargs[0] instanceof Parent) {
      self = conargs[0].self;
      our = conargs[0].our;
      conargs.shift();
    }
    // Else we've been invoked via new, so we're constructing a new object
    else {
      self = this;
      our = {};

      our.__defineGetter__("self", function() {
        return self;
      });
    }

    // Unshift a wrapped version of the parent constructors into the arguments
    // for constructor. The wrapped versions get an instanceof Parent in the first
    // arg, which tells them they're constructing as a parent, not a new object
    for (var i = parents.length - 1; i >= 0; i--) {
      (function() {
        var c = parents[i];

        conargs.unshift(function() {
          var parargs = Array.prototype.slice.call(arguments, 0);

          c.apply(self, [new Parent(self, our)].concat(parargs));
        });
      })();
    }

    // Unshift the whole reason for this code in the first place
    conargs.unshift(our);

    // Lift off!
    constructor.apply(self, conargs);
  };
}

/**
 * Gizmo.create(cons : Function, args... : Object) : Object
 *
 * Creates a new Prototypes object from a Gizmo constructor with the given arguments. The difference between using this
 * to instantiate a Gizmo object versus using the new operator is that the returned object will be a Prototypes object
 * with support for multiple dynamic prototypes. Otherwise, everything else is the same.
 *
 * The implementation mechanism is to create a Prototypes object via Prototypes.create(), and then apply() the Gizmo
 * constructor to the Prototypes object.
 *
 * @param cons the Gizmo constructor
 * @param args... arguments to the Gizmo constructor
 * @returns constructed object.
 */
function create(cons) {
    var obj = Prototypes.create();

    cons.apply(obj, Array.prototype.slice.call(arguments, 1));

    return obj;
}

module.exports = {
  define: define,
  create: create,
  Prototypes: Prototypes
};
