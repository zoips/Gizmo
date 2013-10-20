try {
    // Look for Proxy in the normal global space. 
    if (typeof Proxy !== "object") {
        throw new Error("Proxy not found");
    }
}
catch(ex) {
  module.exports = {
      create: function() {
          throw new Error("No Proxy support found. Please enable Harmony (--harmony)");
      }
  };

  return;
}

/**
 * copy(obj : Object) : Object
 *
 * Shallow copies all properties of an object (even non enumerable ones).
 *
 * @param obj object to copy
 * @return copy
 */
function copy(obj) {
    var c = {};

    Object.getOwnPropertyNames(obj).forEach(function(prop) {
        c[prop] = obj[prop];
    });

    return c;
}

// from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript#answer-2117523
// copyright broofa?
function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == "x" ? r : (r&0x3|0x8);

        return v.toString(16);
    }).toUpperCase();
};

// holds an undefined value
var undef;

function Prototypes(opts) {
    var self = this;
    var prototypeList = [];
    var listeners = [];
    var base = copy(opts.base || {});
    var id = uuid();

    /**
     * [getter] prototypes : Prototypes
     *
     * Gets the Prototypes object associated with the object. This is attached directly to the original base object
     * so it can be retrieved without having a reference to the Proxy.
     *
     * @returns the Prototypes object
     */
    Object.defineProperty(base, "prototypes", {
        get: function() {
            return self;
        }
    });

    /**
     * Creates a basic Proxy. This is an expansion on the basic no-op forwarding Proxy defined here:
     *
     * http://wiki.ecmascript.org/doku.php?id=harmony:proxies#examplea_no-op_forwarding_proxy
     *
     * This traps gets and when the object doesn't define the property, it checks the list of prototypes, left to
     * right, depth first.
     */
    var proxy = Proxy.create({
        getOwnPropertyDescriptor: function(name) {
            var desc = Object.getOwnPropertyDescriptor(base, name);

            // a trapping proxy's properties must always be configurable
            if (typeof desc !== "undefined") {
                desc.configurable = true;
            }

            return desc;
        },

        getPropertyDescriptor: function(name) {
            var desc = Object.getPropertyDescriptor(base, name); // not in ES5

            // a trapping proxy's properties must always be configurable
            if (typeof desc !== "undefined") {
                desc.configurable = true;
            }
            return desc;
        },

        getOwnPropertyNames: function() {
            return Object.getOwnPropertyNames(base);
        },

        getPropertyNames: function() {
            return Object.getPropertyNames(base); // not in ES5
        },

        defineProperty: function(name, desc) {
            Object.defineProperty(base, name, desc);
        },

        "delete": function(name) {
            var isExisting = typeof base[name] !== "undefined";
            var v = base[name];
            var r = delete base[name];

            if (isExisting) {
                fire("property_deleted", { prop: name, value: v });
            }

            return r;
        },

        fix: function() {
        },

        has: function(name) {
            return name in base;
        },

        hasOwn: function(name) {
            return Object.prototype.hasOwnProperty.call(base, name);
        },

        get: function(receiver, name) {
            // check for the property on the base object
            var v = base[name];

            if (typeof v === "undefined") {
                try {
                    self.forEach(function(proto) {
                        v = proto[name];

                        if (typeof v !== "undefined") {
                            throw "exit early";
                        }
                    });
                }
                catch(ex) {
                }
            }

            return v;
        },

        set: function(receiver, name, val) {
            var isNew = typeof base[name] === "undefined";

            base[name] = val;

            if (isNew) {
                fire("property_added", { prop: name, value: val });
            }

            return true; // bad behavior when set fails in non-strict mode
        },

        enumerate: function() {
            var result = [];

            for (var name in base) {
                result.push(name);
            }

            return result;
        },

        keys: function() {
            return Object.keys(base);
        }
    });

    Object.defineProperty(self, "id", {
        get: function() {
            return id;
        }
    });

    /**
     * [getter] proxy : PrototypesProxy
     *
     * Gets the Proxy object that proxies the base object.
     *
     * @returns the proxy object
     */
    Object.defineProperty(self, "proxy", {
        get: function() {
            return proxy;
        }
    });

    /**
     * add(proto : PrototypesProxy) : Prototypes
     *
     * Adds a new prototype. Must be a Proxy created by Prototypes.create(). This adds proto to the end
     * of the list iff no current prototype is or has proto as a prototype.
     *
     * @param proto prototype to add
     * @throws Error if proto is already a prototype
     * @returns Prototypes (this) object
     */
    Object.defineProperty(self, "add", {
        value: function(proto) {
            if (proto === proxy) {
                throw new Error("Object cannot be a prototype of itself!");
            }
            else if (self.has(proto)) {
                throw new Error("Object is already a prototype of this!");
            }
            else if (proto.prototypes && proto.prototypes.has(proxy)) {
                throw new Error("This is already a prototype of the object!");
            }

            prototypeList.push(proto);
            fire("prototype_added", { value: proto});

            return self;
        }
    });

    /**
     * insert(proto : PrototypesProxy) : Prototypes
     * insert(proto : PrototypesProxy, index : Number) : Prototypes
     *
     * Inserts a new prototype. Must be a Proxy created by Prototypes.create(). This adds proto to index, or offset 0 if
     * index was not specified, of the list iff no current prototype is or has proto as a prototype.
     *
     * @param proto prototype to insert
     * @param index insertion point
     * @throws Error if proto is already a prototype
     * @returns Prototypes (this) object
     */
    Object.defineProperty(self, "insert", {
        value: function(proto, i) {
            i = i || 0;

            if (proto === proxy) {
                throw new Error("Object cannot be a prototype of itself!");
            }
            else if (self.has(proto)) {
                throw new Error("Object is already a prototype of this!");
            }
            else if (proto.prototypes && proto.prototypes.has(proxy)) {
                throw new Error("This is already a prototype of the object!");
            }

            prototypeList.splice(i, 0, proto);
            fire("prototype_added", { value: proto});

            return self;
        }
    });

    /**
     * remove(proto : PrototypesProxy) : Prototypes
     *
     * Removes a prototype. This will only remove proto if it is a direct prototype; it will not remove it if it is
     * a transitive prototype (ie prototype of a prototype).
     *
     * @param proto prototype to remove
     * @returns Prototypes (this) object
     */
    Object.defineProperty(self, "remove", {
        value: function(proto) {
            var i = prototypeList.indexOf(proto);

            if (i !== -1) {
                prototypeList.splice(i, 1);
                fire("prototype_removed", { value: proto});
            }

            return self;
        }
    });

    /**
     * has(proto : PrototypesProxy) : Boolean
     *
     * Determines if proto is a prototype of this object, either directly or transitively through a prototype of a
     * prototype.
     *
     * @param proto prototype to look for
     * @returns true if proto is a prototype of this
     */
    Object.defineProperty(self, "has", {
        value: function(protoToFind) {
            return prototypeList.some(function(proto) {
                return proto === protoToFind || (proto.prototypes && proto.prototypes.has(protoToFind));
            });
        }
    });

    /**
     * [getter] length : Number
     *
     * Gets the number of direct prototypes (does not include prototypes of prototypes).
     *
     * @returns number of direct prototypes
     */
    Object.defineProperty(self, "length", {
        get: function() {
            return prototypeList.length;
        }
    });

    /**
     * forEach(cb : Function(proto : PrototypesProxy, index : Number, array : Array)) : void
     * forEach(cb : Function(proto : PrototypesProxy, index : Number, array : Array), thisObj : Object) : void
     * forEach(cb : Function(proto : PrototypesProxy, index : Number, array : Array), thisObj : Object, all : Boolean) : void
     *
     * Iterates the list of direct prototyes. The callback recieves the normal Array.forEach() parameters, however
     * the array parameter is a copy of the prototypes list, so modifying it will have no effect.
     *
     * thisObj has the same definition as in the normal forEach (ie will be 'this' when callback is invoked).
     *
     * If all is true, then this will iterate the whole tree of prototypes depth first.
     *
     * @param cb callback function that will be called for each prototype.
     * @param thisObj 'this' set when the callback is invoked
     * @param all iterate entire prototype tree
     */
    Object.defineProperty(self, "forEach", {
        value: function(cb) {
            var all = false;
            var thisObj = null;

            if (arguments.length > 2) {
                thisObj = arguments[1];
                all = arguments[2];
            }

            if (all) {
                prototypeList.forEach.call(prototypeList.slice(0), function() {
                    cb.apply(this, Array.prototype.slice.call(arguments, 0));

                    arguments[0].prototypes.forEach(cb, this, all);
                }, thisObj);
            }
            else {
                prototypeList.forEach.call(prototypeList.slice(0), cb, thisObj);
            }
        }
    });

    /**
     * listen(cb : Function(obj : PrototypeProxy, eventType : String, event : { prop : String, value : Object })) : void
     *
     * Adds a listener for events on the proxied object. The listener will be invoked when one of the events
     * happens. If the listener is already present, it will not be readded.
     *
     * Event types:
     *
     *  property_added: A new property has been added to the proxied object.
     *  property_deleted: An existing property has been removed from the proxied object.
     *  prototype_added: A new prototype has been added to the proxied object.
     *  prototype_removed: An existing prototype has been removed from the proxied object.
     *
     * @param cb callback function that will be invoked on property changes
     */
    Object.defineProperty(self, "listen", {
        value: function(l) {
            if (listeners.indexOf(l) === -1) {
                listeners.push(l);
            }
        }
    });

    /**
     * ignore(cb : Function(obj : PrototypeProxy, eventType : String, prop : String, value : Object)) : void
     *
     * Removes a previously added listener
     *
     * @param cb listener to remove
     */
    Object.defineProperty(self, "ignore", {
        value: function(l) {
            var i = listeners.indexOf(l);

            if (i !== -1) {
                listeners.splice(i, 1);
            }
        }
    });

    /**
     * fire(obj : PrototypeProxy, eventType : String, event { prop : String, value : Object }) : void
     *
     * Fires a property event.
     *
     * Event types:
     *
     *  property_added: A new property has been added to the proxied object.
     *  property_deleted: An existing property has been removed from the proxied object.
     *  prototype_added: A new prototype has been added to the proxied object.
     *  prototype_removed: An existing prototype has been removed from the proxied object.
     *
     * @param obj PrototypeProxy the event is related to
     * @param eventType type of event
     * @param event event object
     */
    function fire(eventType, event) {
        listeners.forEach(function(l) {
            l(proxy, eventType, event);
        });
    }
}

/**
 * create() : PrototypesProxy
 * create(obj : Object) : PrototypesProxy
 *
 * Create a new PrototypesProxy, optionally with an existing base object; if no base is supplied then an empty new
 * object is created. A PrototypesProxy adds a single new property to the object: prototypes.
 *
 * The prototypes property provides access to the Prototypes object, which allows prototypes to be
 * added and removed from the object. Beyond this single property, the returned PrototypesProxy behaves
 * identically to the underlying object (caveat: you cannot fix the proxy, and freezing the underlying object may have
 * undesired side effects). When properties that are undefined on the underlying object are looked up, the
 * PrototypesProxy will attempt to look up the property in the prototype list depth first.
 */
function create(obj) {
    return new Prototypes({ base: obj }).proxy;
}

module.exports = {
    create: create
};
