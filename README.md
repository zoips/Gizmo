Gizmo
=====

What is Gizmo?
--------------

Gizmo is a simple object system for Javascript. It provides an easy way to
create objects via mixing and provides a mechanism for sharing protected data
up and down the inheritance tree. This allows you to create "classes" with the
full range of encapsulation: public, protected, and private.

With Harmony Proxies (use --harmony), Gizmo adds dynamic prototype support similar
to SELF and io. You can create trees of prototypes to enable dynamic mixin capabilities.

API
---

### Gizmo.define

Gizmo.define(cons : Function) : Function
Gizmo.define(parentCons : Function ..., cons : Function) : Function

Defines a Gizmo constructor. cons is the constructor function that will
construct the object. parentCons are any Gizmo constructor functions that
are the parents. The constructor returned can be instantiated via the new operator like a normal Javascript constructor
function, or it can be passed to Gizmo.create in order to add prototype support.

#### Example

    var sys = require("sys");
    var Gizmo = require("gizmo");

    var TheParent = Gizmo.define(function(our, foo) {
      var bar = "some text"; // this is private to this instance

      our.foo = foo; // this is protected and shared with children

      // this is a public method. our.self is a reference to the correct 'this'
      // object
      our.self.doFoo = function() {
        sys.log(our.foo + ": " + bar);
      };

      // this is a protected method
      our.doBar = function() {
        sys.log(bar);
      };
    });

    var TheChild = Gizmo.define(TheParent, function(our, parent, someVar) {
      parent(someVar); // run the parent constructor.

      our.self.doFoo(); // call doFoo defined by the parent
      our.doBar(); // call doBar in the protected object
    });

    var c = new TheChild("this is the value for someVar");

    c.doFoo();

### Gizmo.create

Gizmo.create(cons : Function, args... : Object) : Object

Takes a constructor function, either created by Gizmo.define or a normal Javascript constructor function. This will
construct an object with prototype support using the constructor function and arguments.

#### Example

Coming soon?! Check the test-create.js test

License
-------

Copyright (c) 2011 Matt Eberts

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
