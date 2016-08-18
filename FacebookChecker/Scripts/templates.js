(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['friendRequests'] = template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div id=\""
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"list-group-item "
    + alias3((helpers.checkNew || (depth0 && depth0.checkNew) || alias1).call(depth0,(depth0 != null ? depth0.state : depth0),{"name":"checkNew","hash":{},"data":data}))
    + "\">\r\n    <div class=\"row\">\r\n        <div class=\"col-xs-2\">\r\n            "
    + alias3((helpers.renderPicture || (depth0 && depth0.renderPicture) || alias1).call(depth0,(depth0 != null ? depth0.requestor : depth0),{"name":"renderPicture","hash":{},"data":data}))
    + "\r\n        </div>\r\n        <div class=\"col-xs-5\">\r\n            <div class=\"requestor-name\">\r\n                <div>\r\n                    <a class=\"openable emphasize\" href=\""
    + alias3(((helper = (helper = helpers.url || (depth0 != null ? depth0.url : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"url","hash":{},"data":data}) : helper)))
    + "\">"
    + alias3(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"text","hash":{},"data":data}) : helper)))
    + "</a>\r\n                </div>\r\n            </div>\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.mutualFriendText : depth0),{"name":"if","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "        </div>\r\n        <div class=\"col-xs-5\">\r\n            <div class=\"request-buttons\">\r\n                <button type=\"button\" class=\"btn btn-primary btn-sm friend-request-button\" data-friend-info=\""
    + alias3((helpers.serializeFriendInfo || (depth0 && depth0.serializeFriendInfo) || alias1).call(depth0,(depth0 != null ? depth0.id : depth0),true,{"name":"serializeFriendInfo","hash":{},"data":data}))
    + "\">Confirm</button>\r\n                <button type=\"button\" class=\"btn btn-secondary btn-sm friend-request-button\" data-friend-info=\""
    + alias3((helpers.serializeFriendInfo || (depth0 && depth0.serializeFriendInfo) || alias1).call(depth0,(depth0 != null ? depth0.id : depth0),false,{"name":"serializeFriendInfo","hash":{},"data":data}))
    + "\">Reject</button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n";
},"2":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "            <div class=\"tooltip-text\">\r\n                <a class=\"openable\" href=\""
    + alias3(((helper = (helper = helpers.mutualFriendTooltip || (depth0 != null ? depth0.mutualFriendTooltip : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"mutualFriendTooltip","hash":{},"data":data}) : helper)))
    + "\">"
    + alias3(((helper = (helper = helpers.mutualFriendText || (depth0 != null ? depth0.mutualFriendText : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"mutualFriendText","hash":{},"data":data}) : helper)))
    + "</a>\r\n            </div>\r\n";
},"4":function(depth0,helpers,partials,data) {
    return "<div class=\"row list-group-item\">\r\n    <div class=\"col-xs-12\">\r\n        <span class=\"center-block\">No friend requests found</span>\r\n    </div>\r\n</div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0,depth0,{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(4, data, 0),"data":data})) != null ? stack1 : "");
},"useData":true});
templates['messages'] = template({"1":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<a id=\""
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" href=\""
    + alias3(((helper = (helper = helpers.url || (depth0 != null ? depth0.url : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"url","hash":{},"data":data}) : helper)))
    + "\" class=\"openable list-group-item "
    + alias3((helpers.checkNew || (depth0 && depth0.checkNew) || alias1).call(depth0,(depth0 != null ? depth0.state : depth0),{"name":"checkNew","hash":{},"data":data}))
    + "\">\r\n    <div class=\"row\">\r\n        <div class=\"col-xs-2\">\r\n            "
    + alias3((helpers.renderPicture || (depth0 && depth0.renderPicture) || alias1).call(depth0,(depth0 != null ? depth0.authors : depth0),{"name":"renderPicture","hash":{},"data":data}))
    + "\r\n        </div>\r\n        <div class=\"col-xs-10\">\r\n            <div class=\"conversation-name\">\r\n                <div>\r\n                    <span class=\"emphasize\">"
    + alias3(((helper = (helper = helpers.header || (depth0 != null ? depth0.header : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"header","hash":{},"data":data}) : helper)))
    + "</span>\r\n                </div>\r\n            </div>\r\n            <div class=\"conversation-text\">\r\n                <span class=\""
    + alias3((helpers.displayStatus || (depth0 && depth0.displayStatus) || alias1).call(depth0,depth0,{"name":"displayStatus","hash":{},"data":data}))
    + "\"></span> "
    + alias3((helpers.emojify || (depth0 && depth0.emojify) || alias1).call(depth0,depth0,{"name":"emojify","hash":{},"data":data}))
    + "\r\n            </div>\r\n            <div class=\"conversation-timestamp\">\r\n                <span>"
    + alias3(((helper = (helper = helpers.timestamp || (depth0 != null ? depth0.timestamp : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"timestamp","hash":{},"data":data}) : helper)))
    + "</span>\r\n            </div>\r\n        </div>\r\n        <div class=\"read-button-container\">\r\n            <div title=\"Read\" class=\"read-button\" data-read-info=\""
    + alias3((helpers.serializeReadInfo || (depth0 && depth0.serializeReadInfo) || alias1).call(depth0,depth0,{"name":"serializeReadInfo","hash":{},"data":data}))
    + "\" style=\"display:none;\"></div>\r\n        </div>\r\n    </div>\r\n</a>\r\n";
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
    + "\">\r\n    <div class=\"row\">\r\n        <div class=\"col-xs-2\">\r\n            "
    + alias3((helpers.renderPicture || (depth0 && depth0.renderPicture) || alias1).call(depth0,(depth0 != null ? depth0.authors : depth0),{"name":"renderPicture","hash":{},"data":data}))
    + "\r\n        </div>\r\n        \r\n        <div class=\""
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.attachment : depth0),{"name":"if","hash":{},"fn":this.program(2, data, 0),"inverse":this.program(4, data, 0),"data":data})) != null ? stack1 : "")
    + "\">\r\n            <div class=\"primary-text\">\r\n                "
    + alias3((helpers.emphasize || (depth0 && depth0.emphasize) || alias1).call(depth0,depth0,{"name":"emphasize","hash":{},"data":data}))
    + "\r\n            </div>\r\n            <div class=\"secondary-text\">\r\n                <img class=\"icon\" src=\""
    + alias3(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"icon","hash":{},"data":data}) : helper)))
    + "\" alt=\"\" />\r\n                <span>"
    + alias3(((helper = (helper = helpers.timestamp || (depth0 != null ? depth0.timestamp : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"timestamp","hash":{},"data":data}) : helper)))
    + "</span>\r\n            </div>\r\n        </div>\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.attachment : depth0),{"name":"if","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "        <div class=\"read-button-container\">\r\n            <div title=\"Read\" class=\"read-button\" data-read-info=\""
    + alias3((helpers.serializeReadInfo || (depth0 && depth0.serializeReadInfo) || alias1).call(depth0,depth0,{"name":"serializeReadInfo","hash":{},"data":data}))
    + "\" style=\"display:none;\"></div>\r\n        </div>\r\n    </div>\r\n</a>\r\n";
},"2":function(depth0,helpers,partials,data) {
    return "col-xs-7";
},"4":function(depth0,helpers,partials,data) {
    return "col-xs-10";
},"6":function(depth0,helpers,partials,data) {
    var helper;

  return "        <div class=\"col-xs-3\">\r\n            <img src=\""
    + this.escapeExpression(((helper = (helper = helpers.attachment || (depth0 != null ? depth0.attachment : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"attachment","hash":{},"data":data}) : helper)))
    + "\" class=\"attachment\" alt=\"\" />\r\n        </div>\r\n";
},"8":function(depth0,helpers,partials,data) {
    return "<div class=\"row list-group-item\">\r\n    <div class=\"col-xs-12\">\r\n        <span class=\"center-block\">No notifications found</span>\r\n    </div>\r\n</div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0,depth0,{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(8, data, 0),"data":data})) != null ? stack1 : "");
},"useData":true});
})();