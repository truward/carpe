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
      if (typeof(window.app) === undefined) {
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
