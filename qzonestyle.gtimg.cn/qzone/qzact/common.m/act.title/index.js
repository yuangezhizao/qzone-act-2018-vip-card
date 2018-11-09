(function() {
    var mods = []
      , version = parseFloat(seajs.version);
    define(["qzact.v8.lib", "jquery"], function(require, exports, module) {
        var uri = module.uri || module.id, m = uri.split("?")[0].match(/^(.+\/)([^\/]*?)(?:\.js)?$/i), root = m && m[1], name = m && "./" + m[2], i = 0, len = mods.length, curr, args, undefined;
        name = name.replace(/\.r[0-9]{15}/, "");
        for (; i < len; i++) {
            args = mods[i];
            if (typeof args[0] === "string") {
                name === args[0] && (curr = args[2]);
                args[0] = root + args[0].replace("./", "");
                version > 1 && define.apply(this, args);
            }
        }
        mods = [];
        require.get = require;
        return typeof curr === "function" ? curr.apply(this, arguments) : require;
    });
    define.pack = function() {
        mods.push(arguments);
        version > 1 || define.apply(null, arguments);
    }
    ;
}
)();
define.pack("./footer", ["qzact.v8.lib", "jquery", "./tmpl", "./util"], function(require, exports, module) {
    var ACT = require("qzact.v8.lib")
      , $ = require("jquery");
    var TMPL = require("./tmpl")
      , UTIL = require("./util");
    var MOD = {
        init: function(options) {
            options = options || {};
            var container = UTIL.getContainer("footer", options);
            if (container) {
                $(container).append(TMPL.footer());
            }
        }
    };
    return MOD;
});
define.pack("./header", ["qzact.v8.lib", "jquery", "./tmpl", "./util"], function(require, exports, module) {
    var ACT = require("qzact.v8.lib")
      , $ = require("jquery");
    var TMPL = require("./tmpl")
      , UTIL = require("./util");
    var MOD = {
        init: function(options) {
            options = options || {};
            if (ACT.browser.client === "qzone" || (ACT.browser.client === "qq" || ACT.browser.client === "weiyun")) {
                return;
            }
            var container = UTIL.getContainer("header", options);
            if (container) {
                this.insertHeader(container, options);
            }
        },
        insertHeader: function(container, options) {
            options = options || {};
            var hd = $(TMPL.header());
            var that = this;
            var linkLogout = hd.find("a.j-logout");
            var _login = function() {
                linkLogout.text("[\u767b\u5f55]");
                linkLogout.bind("touchstart", function(ev) {
                    ev.preventDefault();
                    ACT.user.showLogin();
                });
            }
              , _logout = function() {
                linkLogout.text("[\u9000\u51fa]");
                linkLogout.bind("touchstart", function(ev) {
                    ev.preventDefault();
                    ACT.user.logout();
                });
            };
            $(container).prepend(hd);
            if (ACT.user.isLogin()) {
                if (options.hideUser) {
                    _logout();
                } else {
                    ACT.user.userinfo(options).done(function(info) {
                        hd.find("span.j-welcome").show();
                        hd.find("span.j-user-name").html(info.nickThumb);
                        _logout();
                    }).fail(function() {
                        _login();
                    });
                }
                hd.find("a.j-logo-link").attr("href", "http://m.qzone.com/infocenter?sid=" + ACT.user.getSid());
            } else {
                _login();
            }
            $(container).on("touchstart", ".toolbar-more", function(evt) {
                evt.preventDefault();
                var url = $(this).attr("href");
                ACT.stat.reportHotClick("qzonemall.act.title.m.qzact-home", "", "", {
                    timeout: 0,
                    "callback": function() {
                        location.href = url;
                    }
                });
            });
        }
    };
    return MOD;
});
define.pack("./index", ["qzact.v8.lib", "jquery", "./header", "./footer"], function(require, exports, module) {
    var ACT = require("qzact.v8.lib")
      , $ = require("jquery");
    var header = require("./header")
      , footer = require("./footer");
    var MOD = {
        init: function(options) {
            options = $.extend({
                forceLogin: false
            }, options);
            if (options.forceLogin && !ACT.user.isLogin()) {
                ACT.user.showLogin();
                return false;
            }
            header.init(options);
            footer.init(options);
        }
    };
    return MOD;
});
define.pack("./util", ["qzact.v8.lib", "jquery"], function(require, exports, module) {
    var ACT = require("qzact.v8.lib")
      , $ = require("jquery");
    var MOD = {
        getContainer: function(key, obj) {
            obj = obj || {};
            var rs = "body"
              , con = obj[key];
            if (key in obj) {
                if (!con) {
                    rs = undefined;
                } else {
                    rs = typeof con == "string" || (con.jquery || con.nodeName) ? con : "body";
                }
            }
            return rs;
        }
    };
    return MOD;
});
define.pack("./tmpl", [], function(require, exports, module) {
    var tmpl = {
        "encodeHtml": function(s) {
            return (s + "").replace(/[\x26\x3c\x3e\x27\x22\x60]/g, function($0) {
                return "&#" + $0.charCodeAt(0) + ";";
            });
        },
        "footer": function(data) {
            var __p = []
              , _p = function(s) {
                __p.push(s);
            }
              , out = _p;
            __p.push('\t<div class="footer"><div class="footer_wrap">\u817e\u8baf\u516c\u53f8 \u7248\u6743\u6240\u6709</div></div>');
            return __p.join("");
        },
        "header": function(data) {
            var __p = []
              , _p = function(s) {
                __p.push(s);
            }
              , out = _p;
            var User = data;
            __p.push('<div class="act_toolbar">\n\t<div class="toolbar_wrap">\n\t\t<a class="logo j-logo-link" title="QQ\u7a7a\u95f4" href="http://m.qzone.com/" target="_blank"><span>QQ\u7a7a\u95f4</span></a>\n\t\t<div class="user_info">\n\t\t\t<span class="tit_txt j-welcome" style="display:none;">Hi\uff0c</span>\n\t\t\t<span class="user_name j-user-name"></span>\n\t\t\t<a class="logout j-logout" href="javascript:" style="display:inline-block;height:30px;">&nbsp;</a>\n\t\t\t|\n\t\t\t<a href="https://act.qzone.qq.com/?adtag=toolbar" class="toolbar-more">\u70ed\u95e8\u6d3b\u52a8</a>\n\t\t</div>\n\t</div>\n</div>');
            return __p.join("");
        }
    };
    return tmpl;
});
