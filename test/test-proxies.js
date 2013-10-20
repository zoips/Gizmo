function create(obj) {

    var prototypes = [];

    Object.defineProperty(prototypes, "add", {
        value: function(v) {
            if (this.indexOf(v) !== -1) {
                throw new Error("Object is already a prototype of this!");
            }
            else {
                this.push(v);
            }

            return this;
        }
    });

    Object.defineProperty(prototypes, "remove", {
        value: function(v) {
            var i = this.indexOf(v);

            if (i !== -1) {
                this.splice(i, 1);
            }

            return this;
        }
    });

    Object.defineProperty(prototypes, "insert", {
        value: function(v, i) {
            i = i || 0;

            if (this.indexOf(v) !== -1) {
                throw new Error("Object is already a prototype of this!");
            }

            this.splice(i, 0, v);
        }
    });

    Object.defineProperty(obj, "__prototypes__", {
        value: prototypes
    });

    return {
        getOwnPropertyDescriptor: function(name) {
            var desc = Object.getOwnPropertyDescriptor(obj, name);

            // a trapping proxy's properties must always be configurable
            if (typeof desc !== "undefined") {
                desc.configurable = true;
            }

            return desc;
        },

        getPropertyDescriptor: function(name) {
            var desc = Object.getPropertyDescriptor(obj, name); // not in ES5

            // a trapping proxy's properties must always be configurable
            if (typeof desc !== "undefined") {
                desc.configurable = true;
            }
            return desc;
        },

        getOwnPropertyNames: function() {
            return Object.getOwnPropertyNames(obj);
        },

        getPropertyNames: function() {
            return Object.getPropertyNames(obj);                // not in ES5
        },

        defineProperty: function(name, desc) {
            Object.defineProperty(obj, name, desc);
        },

        "delete": function(name) {
            return delete obj[name];
        },

        fix: function() {
            var undef;

            if (Object.isFrozen(obj)) {
                return Object.getOwnPropertyNames(obj).map(function(name) {
                    return Object.getOwnPropertyDescriptor(obj, name);
                });
            }

            // As long as obj is not frozen, the proxy won't allow itself to be fixed
            return undef; // will cause a TypeError to be thrown
        },

        has: function(name) {
            return name in obj;
        },

        hasOwn: function(name) {
            return Object.prototype.hasOwnProperty.call(obj, name);
        },

        get: function(receiver, name) {
            var v = obj[name];

            if (typeof v !== "undefined") {
                return v;
            }
            else {
                for (var i = 0; i < prototypes.length; i++) {
                    v = prototypes[i][name];

                    if (typeof v !== "undefined") {
                        return v;
                    }
                }
            }
        },

        set: function(receiver, name, val) {
            obj[name] = val;

            return true; // bad behavior when set fails in non-strict mode
        },

        enumerate: function() {
            var result = [];

            for (var name in obj) {
                result.push(name);
            }

            return result;
        },

        keys: function() {
            return Object.keys(obj);
        }
    };
}
var myObj = Proxy.create(create({}));
var pObj = Proxy.create(create({
    foo: "this is foo"
}));

var p2Obj = Proxy.create(create({
    foo: "this is p2 foo"
}));

console.log("foo: " + myObj.foo);

myObj.__prototypes__.add(pObj);

console.log("foo: " + myObj.foo);

myObj.__prototypes__.insert(p2Obj);

console.log("foo: " + myObj.foo);

myObj.__prototypes__.remove(p2Obj);

console.log("foo: " + myObj.foo);
