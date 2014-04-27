window = {};

var includeFile = require("./include-file").includeFile;
includeFile("./js/module.js");

describe("module test with undefined root namespace", function () {
  var modelNs = {};

  window.module(["model"], function (model) {
    model.a = 1;
    modelNs = model;
  });
  window.module(["model"], function (model) {
    model.b = 2;
  });

  it("should have two declarations in model namespace", function () {
    expect(modelNs.a).toBe(1);
    expect(modelNs.b).toBe(2);
  });
});

