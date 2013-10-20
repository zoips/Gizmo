var Gizmo = require("../");
var vows = require("vows");
var assert = require("assert");

var Test = Gizmo.define(function(our, foo) {
    our.self.getFoo = function() {
        return foo;
    };
});

var Test2 = Gizmo.define(function(our, bar) {
    our.self.getBar = function() {
        return bar;
    };
});

var Test3 = Gizmo.define(function(our, baz) {
    our.self.getBaz = function() {
        return baz;
    };
});

vows.describe("Gizmo.create").addBatch({
    "A created Test object" : {
        topic: function() {
            return Gizmo.create(Test, "foo!");
        },

        "defines a getFoo function" : function(o) {
            assert.isFunction(o.getFoo);
        },

        "getFoo returns the right value" : function(o) {
            assert.equal(o.getFoo(), "foo!");
        }
    },

    "A created Test object with a created Test2 object as a prototype" : {
        topic: function() {
            var t = Gizmo.create(Test, "foo!");
            var t2 = Gizmo.create(Test2, "bar!");

            t.prototypes.add(t2);

            return t;
        },

        "defines a getBar function" : function(o) {
            assert.isFunction(o.getBar);
        },

        "getBar returns the right value" : function(o) {
            assert.equal(o.getBar(), "bar!");
        }
    },

    "A created Test object with a created Test2 and Test3 objects as prototypes" : {
        topic: function() {
            var t = Gizmo.create(Test, "foo!");
            var t2 = Gizmo.create(Test2, "bar!");
            var t3 = Gizmo.create(Test3, "baz!");

            t.prototypes.add(t2);
            t.prototypes.add(t3);

            return t;
        },

        "defines a getBaz function" : function(o) {
            assert.isFunction(o.getBaz);
        },

        "getBaz returns the right value" : function(o) {
            assert.equal(o.getBaz(), "baz!");
        }
    }
}).export(module);
