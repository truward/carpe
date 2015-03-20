/**
 * Simple module definition library.
 *
 * Sample usage:
 * <pre>
 * module(["view", "model.core", "model.account"], function (view, modelCore, modelAccount) {
 *   var myView = view.MyView(new modelAccount.UserAccount(new modelCore.Money(100), "bob"));
 *   // ...
 * });
 * </pre>
 *
 * @author Alexander Shabanov
 */
window.module = (function () {

  /* module root */
  var fetchRootNs = (function () {
    var rootNs;
    return function fetchRootNs() {
      if (rootNs !== undefined) {
        return rootNs;
      }

      // search for namespace
      if (typeof(window.app) === "undefined") {
        rootNs = {};
        console.log("Introducing new root namespace");
      } else {
        rootNs = window.app;
        console.log("Using existing root namespace");
      }

      return rootNs;
    }
  }());

  /**
   * Fetches a specified dependency from the dependencies list
   */
  function fetchDependency(dependency, dependencies) {
    var depType = typeof(dependency);
    if (depType === "string") {
      // fetch a dependency from root namespace
      var mods = dependency.split('.');
      var result = fetchRootNs();
      for (var i = 0; i < mods.length; ++i) {
        var mod = mods[i];
        if (mod in result) {
          // refer to the existing module
          result = result[mod];
        } else {
          // introduce new module
          var newModule = {};
          result[mod] = newModule;
          result = newModule;
        }
      }
      return result;
    }

    return dependency; // return dependency 'as is'
  }

  function module(dependencies, definitionFn) {
    var fetchedDependencies = [];
    for (var i = 0; i < dependencies.length; ++i) {
      fetchedDependencies.push(fetchDependency(dependencies[i], dependencies));
    }

    return definitionFn.apply(this, fetchedDependencies);
  }

  return module;
} ());
/**
 * Declares base domain object.
 * Minimalistic backbone-alike definition of the domain objects without bells and whistles.
 * Oriented to REST API with "shortened" field names.
 *
 * @author Alexander Shabanov
 */
module(["model"], function (model) {

  function DomainObject(options) {
  }

  function createCtorFn(fieldToPayloadKeys, payloadToFieldKeys) {
    // create object constructor
    return function (options) {
      if (!options) {
        return;
      }

      // init-by-payload
      if (typeof(options.payload) !== "undefined") {
        for (var payloadKey in payloadToFieldKeys) {
          if (payloadKey in options.payload) {
            this[payloadKey] = options.payload[payloadKey];
          }
        }
      }

      // init-by-model
      if (typeof(options.model) !== "undefined") {
        for (var fieldKey in fieldToPayloadKeys) {
          if (fieldKey in options.model) {
            this[fieldToPayloadKeys[fieldKey]] = options.model[fieldKey];
          }
        }
      }
    };
  }

  DomainObject.define = function DomainObject_define(domainNamespace, objectName, mapping) {
    var parameterMapping = mapping.parameters;

    // prepare keys
    var fieldToPayloadKeys = {};
    var payloadToFieldKeys = {};
    for (var key in parameterMapping) {
      if (parameterMapping.hasOwnProperty(key)) {
        var payloadKey = parameterMapping[key];
        fieldToPayloadKeys[key] = payloadKey;
        payloadToFieldKeys[payloadKey] = key;
      }
    }

    var ctor = createCtorFn(fieldToPayloadKeys, payloadToFieldKeys);
    ctor.name = objectName;
    domainNamespace[objectName] = ctor;

    // initialize getters
    for (var fieldKey in fieldToPayloadKeys) {
      var payloadKey = fieldToPayloadKeys[fieldKey];

      // Create getter name, i.e. title => getTitle
      var getterName = "get" + fieldKey.charAt(0).toUpperCase() + fieldKey.substring(1);
      var getterFn = (function (payloadKey) {
        return function (defaultValue) {
          if (this.hasOwnProperty(payloadKey)) {
            return this[payloadKey];
          }

          return defaultValue;
        };
      } (payloadKey));

      getterFn.name = getterName;
      ctor.prototype[getterName] = getterFn;
    }
  }

  //
  // Export
  //

  model.DomainObject = DomainObject;
});
/**
 * Simple Marionette-alike template-based view.
 *
 * @author Alexander Shabanov
 */
module(["view", "$"], function (view, $) {
  function View(create) {
    this.create = create;
    this.ui = {};
  }

  View.prototype.prependTo = function ($target) {
    this.create();
    $target.prepend(this.$el);
    return this;
  }

  View.prototype.appendTo = function ($target) {
    this.create();
    $target.append(this.$el);
    return this;
  }

  View.prototype.onRender = function () {
    // do nothing
  }

  View.prototype.remove = function () {
    this.$el.remove();
  }

  function makeCreateViewFn(template, el, ui, events) {
    var $template;
    var $elem;
    if (el) {
      $elem = $(el);
      if ($elem.size() === 0) {
        throw new Error("There is no element associated with selector " + el);
      }
    }
    if (!$elem) {
      var $template = $(template);
      if ($template.size() !== 1) {
        throw new Error("one template expected, got " + $template + " for " + template);
      }
    }

    var eventBinderFns = []; // event binder functions
    $.each(events, function (event, handler) {
      var selectorIndex = event.indexOf(" ") + 1;
      var selector = (selectorIndex > 0 ? event.substring(selectorIndex) : undefined);
      event = (selectorIndex > 0 ? event.substring(0, selectorIndex - 1) : event);
      eventBinderFns.push(function () {
        var self = this;
        var el = (selector ? $(selector, this.$el): this.$el);
        el.on(event, function () {
          return self[handler].apply(self, arguments);
        });
      });
    });

    return function createView() {
      this.$el = $elem || $($template.text());

      // activate ui
      for (var e in ui) {
        if (!ui.hasOwnProperty(e)) { continue; }
        this.ui[e] = $(ui[e], this.$el);
      }

      // bind events
      for (var e in eventBinderFns) {
        if (!eventBinderFns.hasOwnProperty(e)) { continue; }
        eventBinderFns[e].call(this);
      }

      this.onRender();
      return this;
    };
  }

  View.extend = function View_extend(viewOptions) {
    if (typeof viewOptions !== "object") {
      throw new Error("options argument is not an object");
    }
    viewOptions = $.extend({
      ui: {},
      events: {}
    }, viewOptions); // safe copy with defaults

    // make 'create view' lambda
    var createView = makeCreateViewFn(viewOptions.template, viewOptions.el, viewOptions.ui, viewOptions.events);

    // return view object
    var newViewClass = function (options) {
      options = options || {};
      View.call(this, createView);
      if (typeof options.model !== "undefined") {
        this.model = options.model;
      }
    };
    if (typeof viewOptions.name !== "undefined") {
      newViewClass.name = viewOptions.name;
    }
    newViewClass.prototype.__proto__ = View.prototype;

    // copy member functions - except for 'ui', 'template'
    delete viewOptions.ui;
    delete viewOptions.events;
    delete viewOptions.template;
    for (var memberName in viewOptions) {
      if (viewOptions.hasOwnProperty(memberName)) {
        newViewClass.prototype[memberName] = viewOptions[memberName];
      }
    }

    return newViewClass;
  }

  //
  // Export
  //

  view.View = View;
});
