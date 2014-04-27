var a = {test: {myVar: 100}};
window = {app: a};

var includeFile = require("./include-file").includeFile;
includeFile("./js/module.js");

describe("module test with predefined root namespace", function () {
  window.module(["model", "test"], function (model, test) {
    model.myVar = 1 + test.myVar;
    modelNs = model;
  });

  it("should have two declarations in namespaces", function () {
    expect(a.model.myVar).toBe(101);
    expect(a.test.myVar).toBe(100);
  });
});

