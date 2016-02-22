(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['messages'] = template({"1":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<a id=\""
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" href=\""
    + alias3(((helper = (helper = helpers.url || (depth0 != null ? depth0.url : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"url","hash":{},"data":data}) : helper)))
    + "\" class=\"openable list-group-item "
    + alias3((helpers.checkNew || (depth0 && depth0.checkNew) || alias1).call(depth0,(depth0 != null ? depth0.state : depth0),{"name":"checkNew","hash":{},"data":data}))
    + "\">\r\n    <div class=\"row\">\r\n        <div class=\"col-xs-2\">\r\n            <img src=\""
    + alias3(((helper = (helper = helpers.picture || (depth0 != null ? depth0.picture : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"picture","hash":{},"data":data}) : helper)))
    + "\" alt=\""
    + alias3((helpers.getName || (depth0 && depth0.getName) || alias1).call(depth0,(depth0 != null ? depth0.authors : depth0),{"name":"getName","hash":{},"data":data}))
    + "\" />\r\n        </div>\r\n        <div class=\"col-xs-10\">\r\n            <div class=\"conversation-name\">\r\n                <div>\r\n                    <span class=\"emphasize\">"
    + alias3(((helper = (helper = helpers.header || (depth0 != null ? depth0.header : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"header","hash":{},"data":data}) : helper)))
    + "</span>\r\n                </div>\r\n            </div>\r\n            <div class=\"conversation-text\">\r\n                "
    + alias3(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"text","hash":{},"data":data}) : helper)))
    + "\r\n            </div>\r\n            <div class=\"conversation-timestamp\">\r\n                <span>"
    + alias3(((helper = (helper = helpers.timestamp || (depth0 != null ? depth0.timestamp : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"timestamp","hash":{},"data":data}) : helper)))
    + "</span>\r\n            </div>\r\n        </div>\r\n        <div class=\"read-button-container\">\r\n            <div title=\"Read\" class=\"read-button\" data-read-info=\""
    + alias3((helpers.serializeReadInfo || (depth0 && depth0.serializeReadInfo) || alias1).call(depth0,depth0,{"name":"serializeReadInfo","hash":{},"data":data}))
    + "\"></div>\r\n        </div>\r\n    </div>\r\n</a>\r\n";
},"3":function(depth0,helpers,partials,data) {
    return "<div class=\"row list-group-item\">\r\n    <div class=\"col-xs-12\">\r\n        <span class=\"center-block\">No messages found</span>\r\n    </div>\r\n</div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0,depth0,{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "");
},"useData":true});
templates['notifications'] = template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<a id=\""
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" href=\""
    + alias3(((helper = (helper = helpers.url || (depth0 != null ? depth0.url : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"url","hash":{},"data":data}) : helper)))
    + "\" class=\"openable list-group-item "
    + alias3((helpers.checkNew || (depth0 && depth0.checkNew) || alias1).call(depth0,(depth0 != null ? depth0.state : depth0),{"name":"checkNew","hash":{},"data":data}))
    + "\">\r\n    <div class=\"row\">\r\n        <div class=\"col-xs-2\">\r\n            <img src=\""
    + alias3(((helper = (helper = helpers.picture || (depth0 != null ? depth0.picture : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"picture","hash":{},"data":data}) : helper)))
    + "\" alt=\""
    + alias3((helpers.getName || (depth0 && depth0.getName) || alias1).call(depth0,(depth0 != null ? depth0.authors : depth0),{"name":"getName","hash":{},"data":data}))
    + "\" />\r\n        </div>\r\n        <div class=\"col-xs-10\">\r\n            <div class=\"primary-text\">\r\n                "
    + ((stack1 = (helpers.emphasize || (depth0 && depth0.emphasize) || alias1).call(depth0,depth0,{"name":"emphasize","hash":{},"data":data})) != null ? stack1 : "")
    + "\r\n            </div>\r\n            <div class=\"secondary-text\">\r\n                <img class=\"icon\" src=\""
    + alias3(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"icon","hash":{},"data":data}) : helper)))
    + "\" alt=\"\" />\r\n                <span>"
    + alias3(((helper = (helper = helpers.timestamp || (depth0 != null ? depth0.timestamp : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"timestamp","hash":{},"data":data}) : helper)))
    + "</span>\r\n            </div>\r\n        </div>\r\n        <div class=\"read-button-container\">\r\n            <div title=\"Read\" class=\"read-button\" data-read-info=\""
    + alias3((helpers.serializeReadInfo || (depth0 && depth0.serializeReadInfo) || alias1).call(depth0,depth0,{"name":"serializeReadInfo","hash":{},"data":data}))
    + "\"></div>\r\n        </div>\r\n    </div>\r\n</a>\r\n";
},"3":function(depth0,helpers,partials,data) {
    return "<div class=\"row list-group-item\">\r\n    <div class=\"col-xs-12\">\r\n        <span class=\"center-block\">No notifications found</span>\r\n    </div>\r\n</div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0,depth0,{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "");
},"useData":true});
})();