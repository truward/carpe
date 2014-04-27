var a = {};

// include javascript
window = {app: a};
var includeFile = require("./dinclude").includeFile;
includeFile("./js/module.js");
global.module = window.module;

includeFile("./js/domain-object.js");

describe("should define domain object", function () {
  var model = a.model;
  model.DomainObject.define(model, "Post", {
    parameters: {
      "title": "t",
      "content": "c"
    }
  });

  var post;
  var content = "content";
  var title = "title";

  beforeEach(function () {
    post = new model.Post({model: {"content": content, "title": title}});
  });

  it("should get title", function () {
    expect(post.getTitle()).toEqual(title);
  });

  it("should get optional title and content", function () {
    var post = new model.Post();
    var defaultVal = 5;
    expect(post.getTitle(defaultVal)).toEqual(defaultVal);
    expect(post.getContent()).toBeUndefined();
  });

  it("should get content", function () {
    expect(post.getContent()).toEqual(content);
  });

  it("should be serialization-friendly", function () {
    expect(JSON.parse(JSON.stringify(post))).toEqual({"c": content, "t": title});
  });

  it("should deserialize payload", function () {
    expect(new model.Post({payload: {"t": title, "c": content}})).toEqual(post);
  });
});

