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
