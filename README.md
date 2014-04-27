Carpe Diem
==========

```
Carpe Diem = Seize the day (Latin) 
```

See also http://en.wikipedia.org/wiki/Carpe_diem

## Motivation

Carpe Diem is a minimalistic javascript framework inspired by backbone and marionette.
It depends only on jquery.

## Parts

### module.js

module.js defines a ``module`` function in a global scope.
This function can be used to break parts of applications into the different namespaces.
If ``window.app`` is not null, this will be used as namespace root.

Sample usage:

```javascript
module(['view', 'model.zoo', 'model.animals', 'controller'], function (view, zoo, animals, controller) {
  var view = new view.ZooView();
  //...
  var enclosure = new zoo.Enclosure(new animals.Lion());
  //...
  function MyController() {/*...*/}
  //...

  // Exports:
  controller.MyController = MyController;
});
```

### domain-object.js

domain-object.js is designed to introduce a model, which later can be used to either represent data, which came outside,
i.e. from AJAX request or represent just a plain application model.

This file depends on ``module.js`` and after inclusion introduces an entity ``<root>.model.DomainObject``.

Sample usage:

```javascript
model.DomainObject.define(model, "Post", {
  parameters: {
    "title": "t",
    "content": "c"
  }
});

// another file..
var post = new model.Post({model: {title: "Hello", content: "Lorem ipsum"}});
console.log(post.getTitle()); // => Hello
console.log(post.getContent()); // => Lorem ipsum

var post2 = new model.Post({payload: {t: "AJAX", c: "External post format"}});
console.log(post.getTitle()); // => AJAX
console.log(post.getContent()); // => External post format
```

### view.js

view.js is designed to introduce a marionette-alike views.

This file depends on ``module.js`` and after inclusion introduces an entity ``<root>.view.View``.

Sample usage:

```javascript
view.PostView = view.View.extend({
  /* Template should be defined in HTML file, e.g.:
    <script id="publication-item-template" type="text/template">
      <li>
        <div>
          <div class="pull-right">
            <button class="btn btn-danger delete">Delete</button>
          </div>
          <h3 class="title"></h3>
          <p class="content"></p>
        </div>
      </li>
    </script>  
  */
  template: "#publication-item-template",

  ui: {
    content: ".content", // binds to element with 'content' class within the template
    title: ".title" // binds to element with 'title' class within the template
  },

  onRender: function () {
    // elements are accessible by this.ui.<elementName>
    this.ui.title.text(this.model.getTitle());
    this.ui.content.text(this.model.getContent());
  },

  deletePost: function () {
    var self = this;
    this.$el.fadeOut(300, function () {
      self.remove();
    });
  },

  events: {
    "click .delete": "deletePost" // binds click event for element with 'delete' class to this.deletePost()
  } 
});
```



