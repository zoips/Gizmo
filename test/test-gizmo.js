var Gizmo = require("../");
var vows = require("vows");
var assert = require("assert");

function mix(obj) {
  var others = Array.prototype.slice.call(arguments, 1);

  others.forEach(function(other) {
    for(var p in other) {
      if (other.hasOwnProperty(p)) {
        obj[p] = other[p]
      }
    }
  });

  return obj;
};

var C1 = Gizmo.define(function(our, opts) {
  assert.isObject(our);
  assert.isObject(our.self);

  var bar = opts.bar;

  our.foo = opts.foo;

  our.self.getOur = function() {
    return our;
  };

  our.self.getFoo = function() {
    return our.foo;
  };

  our.self.getBar = function() {
    return bar;
  };
});

var C2 = Gizmo.define(C1, function(our, c1, opts) {
  assert.isFunction(c1);

  c1(opts);

  our.self.getOur2 = function() {
    return our;
  };
});

var C3 = Gizmo.define(function(our, opts) {
  assert.isObject(our);
  assert.isObject(our.self);

  var fizz = opts.fizz;

  our.self.getFizz = function() {
    return fizz;
  };

  our.self.getOur3 = function() {
    return our;
  };
});

var C4 = Gizmo.define(C2, C3, function(our, c2, c3, opts) {
  assert.isFunction(c2);
  assert.isFunction(c3);

  c2(opts);
  c3(opts);
});

var C5 = Gizmo.define(function(our, opts) {
  var foo = opts.foo;

  this.getFoo = function() {
    return foo;
  };
});

var C6 = Gizmo.define(C5, function(our, c5, opts) {
  var bar = opts.bar;

  c5(opts);

  this.getFooBar = function() {
    return this.getFoo() + ":" + bar;
  };
});

var C1Tests = {
  "exports a 'getFoo' function" : function(c) {
    var o = new c({});

    assert.isFunction(o.getFoo);
  },

  "exports a 'getBar' function" : function(c) {
    var o = new c({});

    assert.isFunction(o.getBar);
  },

  "exports a 'getOur' function" : function(c) {
    var o = new c({});

    assert.isFunction(o.getOur);
  },

  "returns 'foo' correctly" : function(c) {
    var o = new c({
      foo: "this is foo",
      bar: "this is bar"
    });

    assert.equal("this is foo", o.getFoo());
  },

  "returns 'bar' correctly" : function(c) {
    var o = new c({
      foo: "this is foo",
      bar: "this is bar"
    });

    assert.equal("this is bar", o.getBar());
  },

  "returns 'our' correctly" : function(c) {
    var o = new c({});

    assert.isObject(o.getOur());
  },

  "two instances don't share the same 'our'" : function(c) {
    var o = new c({});
    var o2 = new c({});

    assert.notEqual(o.getOur(), o2.getOur());
  }
};

var C2Tests = {
  "exports a 'getOur2' function" : function(c) {
    var o = new c({});

    assert.isFunction(o.getOur2);
  },

  "has same 'our' as parent" : function(c) {
    var o = new c({});

    assert.equal(o.getOur(), o.getOur2());
  }
};

var C4Tests = {
  "exports a 'getOur3' function" : function(c) {
    var o = new c({});

    assert.isFunction(o.getOur3);
  },

  "has same 'our' as both parents" : function(c) {
    var o = new c({});

    assert.equal(o.getOur(), o.getOur2());
    assert.equal(o.getOur2(), o.getOur3());
  },

  "exports a 'getFizz' function" : function(c) {
    var o = new c({});

    assert.isFunction(o.getFizz);
  },

  "returns 'fizz' correctly" : function(c) {
    var o = new c({
      foo: "this is foo",
      bar: "this is bar",
      fizz: "this is fizz"
    });

    assert.equal("this is fizz", o.getFizz());
  }
};

var C6Tests = {
  "exports a 'getFoo' function" : function(c) {
    var o = new c({});

    assert.isFunction(o.getFoo);
  },

  "exports a 'getFooBar' function" : function(c) {
    var o = new c({});

    assert.isFunction(o.getFooBar);
  },

  "'getFoo' returns the right value" : function(c) {
    var o = new c({
      foo: "this is foo",
      bar: "this is bar"
    });

    assert.equal("this is foo", o.getFoo());
  },

  "'getFooBar' returns the right value" : function(c) {
    var o = new c({
      foo: "this is foo",
      bar: "this is bar"
    });

    assert.equal("this is foo:this is bar", o.getFooBar());
  }
};

module.exports.gizmo = vows.describe("Gizmo").addBatch({
  "The Gizmo import" : {
    topic: Gizmo,

    "defines a 'define' function" : function(g) {
      assert.isFunction(g.define);
    }
  },

  "The C1 Gizmo Object" : mix({
    topic: function() {
      return C1;
    },

    "actually constructs" : function(c) {
      assert.doesNotThrow(function() {
        var o = new c({});
      });
    }
  }, C1Tests),

  "The C2 Gizmo Object" : mix({
    topic: function() {
      return C2;
    },

    "actually constructs" : function(c) {
      assert.doesNotThrow(function() {
        var o = new c({});
      });
    }
  }, C1Tests, C2Tests),

  "The C4 Gizmo Object" : mix({
    topic: function() {
      return C4;
    },

    "actually constructs" : function(c) {
      assert.doesNotThrow(function() {
        var o = new c({});
      });
    }
  }, C1Tests, C2Tests, C4Tests),

  "The C6 Gizmo Object" : mix({
    topic: function() {
      return C6;
    },

    "actually constructs" : function(c) {
      assert.doesNotThrow(function() {
        var o = new c({});
      });
    }
  }, C6Tests)
});
