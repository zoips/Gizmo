var Prototypes = require("../lib/prototypes");
var vows = require("vows");
var assert = require("assert");

module.exports.prototypes = vows.describe("Prototypes")
    .addBatch({
        "The Prototypes import" : {
            topic: Prototypes,

            "defines a 'create' function" : function(p) {
                assert.isFunction(p.create);
            },

            "creates an object when 'create' is invoked" : function(p) {
                var o = p.create({});

                assert.isObject(o);
            }
        }
    })
    .addBatch({
        "A basic Prototypes object" : {
            topic: function() {
                return Prototypes.create({
                    foo: "this is foo"
                });
            },

            "has the right value for 'foo'" : function(o) {
                assert.equal(o.foo, "this is foo");
            },

            "the 'prototypes' property is an object" : function(o) {
                assert.isObject(o.prototypes);
            },

            "doesn't allow the 'prototypes' property to be reassigned" : function(o) {
                var prototypes = o.prototypes;
                var v = [];
                
                o.prototypes = v;
                
                assert.strictEqual(o.prototypes, prototypes);
            },

            "can set a new property" : function(o) {
                assert.doesNotThrow(function() {
                    o.bar = "this is bar";
                });
            },

            "can retrieve a previously set new property" : function(o) {
                assert.doesNotThrow(function() {
                    assert.equal(o.bar, "this is bar");
                });
            },

            "can delete a previously set new property" : function(o) {
                assert.doesNotThrow(function() {
                    delete o.bar;
                    assert.isUndefined(o.bar);
                });
            },

            "cannot be its own direct prototype (you can't be your own dad dammit!)" : function(o) {
                assert.throws(function() {
                    o.prototypes.add(o);
                });
            },

            "informs listeners of new properties" : function(o) {
                assert.doesNotThrow(function() {
                    var l = function(p, eventType, event) {
                        assert.equal(eventType, "property_added");
                        assert.equal(event.prop, "new_prop");
                        assert.equal(event.value, "new_prop value");
                    };

                    o.prototypes.listen(l);
                    o.new_prop = "new_prop value";
                    o.prototypes.ignore(l);
                });
            },

            "informs listeners when properties are deleted" : function(o) {
                assert.doesNotThrow(function() {
                    var l = function(p, eventType, event) {
                        assert.equal(eventType, "property_deleted");
                        assert.equal(event.prop, "new_prop");
                        assert.equal(event.value, "new_prop value");
                    };

                    o.new_prop = "new_prop value";
                    o.prototypes.listen(l);
                    delete o.new_prop;
                    o.prototypes.ignore(l);
                });
            }
        }
    })
    .addBatch({
        "A Prototypes with disabled shortcuts" : {
            topic: function() {
                return Prototypes.create({}, { disableShortcuts: true });
            },

            "can still set a property" : function(o) {
                assert.doesNotThrow(function() {
                    o.foo = "this is foo";
                });
            },

            "can retrieve a set property" : function(o) {
                assert.doesNotThrow(function() {
                    assert.equal(o.foo, "this is foo");
                });
            }
        }
    })
    .addBatch({
        "With two Prototypes objects" : {
            topic: function() {
                return {
                    o: Prototypes.create({
                        foo: "this is foo",
                        bar: "this is bar"
                    }),

                    o2: Prototypes.create({
                        bar: "this is the prototype's bar",
                        baz: "this is baz"
                    })
                }
            },

            "one can be added as the prototype of the other" : function(objs) {
                var o = objs.o, o2 = objs.o2;

                assert.equal(o.prototypes.length, 0);
                assert.doesNotThrow(function() {
                    o.prototypes.add(o2);
                });
            },

            "can get the prototype's 'baz' property" : function(objs) {
                var o = objs.o, o2 = objs.o2;

                assert.equal(o.baz, o2.baz);
            },

            "shadows the prototype's 'bar' property" : function(objs) {
                var o = objs.o, o2 = objs.o2;

                assert.notEqual(o.bar, o2.bar);
            },

            "cannot readd the same prototype" : function(objs) {
                var o = objs.o, o2 = objs.o2;

                assert.throws(function() {
                    o.prototypes.add(o2);
                });
            },

            "cannot be its own prototype (you can't be your own grandpa dammit!)" : function(objs) {
                var o = objs.o, o2 = objs.o2;

                assert.throws(function() {
                    o2.prototypes.add(o);
                });
            },

            "can remove the prototype" : function(objs) {
                var o = objs.o, o2 = objs.o2;

                assert.doesNotThrow(function() {
                    o.prototypes.remove(o2);
                });

                assert.equal(o.prototypes.length, 0);
            },

            "informs listeners when a prototype is added" : function(objs) {
                var o = objs.o, o2 = objs.o2;

                assert.doesNotThrow(function() {
                    var l = function(p, eventType, event) {
                        assert.equal(eventType, "prototype_added");
                        assert.equal(event.value, o2);
                    };

                    o.prototypes.listen(l);
                    o.prototypes.add(o2);
                    o.prototypes.ignore(l);
                });
            },

            "informs listeners when a prototype is removed" : function(objs) {
                var o = objs.o, o2 = objs.o2;

                assert.doesNotThrow(function() {
                    var l = function(p, eventType, event) {
                        assert.equal(eventType, "prototype_removed");
                        assert.equal(event.value, o2);
                    };

                    o.prototypes.listen(l);
                    o.prototypes.remove(o2);
                    o.prototypes.ignore(l);
                });
            }
        }
    })
    .addBatch({
        "With three Prototypes objects" : {
            topic: function() {
                return {
                    o: Prototypes.create({
                        __id: 1,
                        foo: "this is foo",
                        bar: "this is bar"
                    }),

                    o2: Prototypes.create({
                        __id: 2,
                        bar: "this is the prototype's bar",
                        baz: "this is baz"
                    }),

                    o3: Prototypes.create({
                        __id: 3,
                        chez: "this is chez"
                    })
                }
            },

            "a chain can of prototypes can be created" : function(objs) {
                var o = objs.o, o2 = objs.o2, o3 = objs.o3;

                assert.equal(o.prototypes.length, 0);
                assert.equal(o2.prototypes.length, 0);

                assert.doesNotThrow(function() {
                    o2.prototypes.add(o3);
                });

                assert.doesNotThrow(function() {
                    o.prototypes.add(o2);
                });
            },

            "can get the prototype's 'chez' property" : function(objs) {
                var o = objs.o, o2 = objs.o2, o3 = objs.o3;

                assert.equal(o.chez, o3.chez);
            },

            "cannot be its own prototype (you can't be your own great-grandpa dammit!)" : function(objs) {
                var o = objs.o, o2 = objs.o2, o3 = objs.o3;

                assert.throws(function() {
                    o3.prototypes.add(o);
                });
            },

            "forEach can iterate all prototypes" : function(objs) {
                var o = objs.o, o2 = objs.o2, o3 = objs.o3;
                var protos = [o2, o3];

                o.prototypes.forEach(function(proto) {
                    var idx = protos.indexOf(proto);

                    assert.notEqual(idx, -1);
                    protos.splice(idx, 1);
                }, null, true);

                assert.equal(protos.length, 0);
            }
        }
    })
    .addBatch({
        "With a normal object": {
            topic: function() {
                return {
                    stuff: "this is stuff"
                };
            },
            
            "it can be added to the prototypes list": function(on) {
                var o = Prototypes.create({
                    __id: 1,
                    foo: "this is foo",
                    bar: "this is bar"
                });    
                
                assert.doesNotThrow(function() {
                    o.prototypes.add(on);        
                });
                assert.equal(o.stuff, on.stuff);
            },
            
            "it can be checked for existence in the prototypes list": function(on) {
                var o = Prototypes.create({
                    __id: 1,
                    foo: "this is foo",
                    bar: "this is bar"
                });    
                
                assert.doesNotThrow(function() {
                    o.prototypes.add(on);        
                });
                assert.ok(o.prototypes.has(on));                
            }
        }
    });
