(function() {
    var e = []
      , t = parseFloat(seajs.version);
    define(["jquery"], function(require, i, n) {
        var r = n.uri || n.id, o = r.split("?")[0].match(/^(.+\/)([^\/]*?)(?:\.js)?$/i), a = o && o[1], s = o && "./" + o[2], c = 0, l = e.length, u, d;
        s = s.replace(/\.r[0-9]{15}/, "");
        for (; c < l; c++) {
            d = e[c];
            if (typeof d[0] === "string") {
                s === d[0] && (u = d[2]);
                d[0] = a + d[0].replace("./", "");
                t > 1 && define.apply(this, d)
            }
        }
        e = [];
        require.get = require;
        return typeof u === "function" ? u.apply(this, arguments) : require
    });
    define.pack = function() {
        e.push(arguments);
        t > 1 || define.apply(null, arguments)
    }
}
)();
define.pack("./ajax", ["jquery", "./stat", "./storage", "./browser", "./util", "./user", "./tmpl"], function(require, e, t) {
    var i = require("jquery")
      , n = require("./stat")
      , r = require("./storage").cookie
      , o = require("./browser");
    var a = require("./util");
    var s = require("./user");
    var c = o.isMobile;
    var l = {
        jsonpNum: 0,
        request: function(e) {
            e = l._fixMobile(e);
            var t = l._autoXSS(i.extend({}, e));
            var r = a.parseUrl(t.url), o = location.host, u = !/^(https?:)?\/\//i.test(t.url) || !r || r.host === o ? false : true, d, p;
            t.needLogin = typeof t.needLogin == "boolean" ? t.needLogin : true;
            if (!t.dataType) {
                t.dataType = "json"
            }
            var f = document.createElement("a")
              , m = ["h5.qzone.qq.com", "h5s.qzone.qq.com", "imgcache.qq.com", "qzonestyle.gtimg.cn", "apphub.qzone.qq.com", "game.qzone.qq.com"]
              , g = ["pay.qzone.qq.com"];
            f.href = t.url;
            if (!f.protocol) {
                f.protocol = location.protocol
            }
            if (window.isH5Test && i.inArray(f.host, g) !== -1) {
                t.url = t.url.replace(/^(https?:)?\/\//, "$1//h5.qzone.qq.com/proxy/domain/");
                f.href = t.url
            }
            l._fixAppType(t);
            if (location.protocol === "https:" || window.HYB && window.HYB.jsHttps) {
                if (i.inArray(f.host, m) === -1 && !t.forceNotProxy && !a.hasWsAuth(t.url)) {
                    t.url = t.url.replace(/^(http:)?\/\//, "https://h5.qzone.qq.com/proxy/domain/")
                } else if (a.hasWsAuth(t.url)) {
                    t.url = t.url.replace(/^(http:)?\/\//, "https://" + location.host + "/proxy/domain/")
                } else {
                    t.url = t.url.replace(/^(http:)?\/\//, "https://")
                }
            }
            f = null;
            if (t.url.indexOf("g_tk=") === -1) {
                t.url = t.url + (t.url.indexOf("?") === -1 ? "?" : "&") + "g_tk=" + s.getToken(t.url)
            }
            if (!/(\?|&)r=/g.test(t.url)) {
                t.url = t.url + (t.url.indexOf("?") === -1 ? "?" : "&") + "r=" + Math.random()
            }
            if (t.url.indexOf("uin=") === -1 && !(t.data && t.data.uin)) {
                t.data = t.data || {};
                var h = s.getUin();
                if (h !== 0) {
                    t.data.uin = h
                }
            }
            var v = false
              , _ = 1e4
              , q = null;
            var y = t.success
              , b = t.error;
            var w = +new Date;
            if (t.dataType === "jsonp" || t.dataType === "json") {
                if ((t.dataType == "jsonp" || t.dataType == "json") && (t.timeout > 0 || _ > 0)) {
                    if (t.timeout) {
                        _ = t.timeout
                    }
                    q = setTimeout(function() {
                        v = true;
                        if (t.error) {
                            t.error(p, "timeout")
                        }
                    }, _);
                    t.timeout = 0
                }
                t.success = function(r) {
                    clearTimeout(q);
                    if (v) {
                        return
                    }
                    var o = r && r.code
                      , a = r && r.subcode
                      , c = arguments
                      , u = +new Date
                      , d = u - w;
                    n.returnCodeV4({
                        cgi: t.url,
                        type: o === 0 ? 1 : 3,
                        code: a,
                        delay: d
                    });
                    if (o === -3e3 && (!t.hasOwnProperty("forceLogin") || t.forceLogin)) {
                        s.showLogin();
                        return false
                    }
                    var p = "autoVerify"in t ? t.autoVerify : true;
                    if (p !== false) {
                        var f;
                        if (i.inArray(o, [-2000002, -2000003, -3001, -3002]) !== -1) {
                            f = true
                        }
                        if (f) {
                            l.showCAPTCHA(e, o, y, b, c);
                            return false
                        }
                    }
                    y && y.apply(null, c)
                }
            }
            t.error = function(e, i) {
                clearTimeout(q);
                var r = (new Date).getTime(), o = r - w, a, s, c, l;
                n.returnCodeV4({
                    cgi: t.url,
                    type: 2,
                    code: i && {
                        timeout: -400,
                        parsererror: 511
                    }[i] || e && e.status || 999,
                    delay: o
                });
                if (typeof t.reportTextModuleName === "string" && i === "parsererror") {
                    n.text.report(i + "\nrequest: " + JSON.stringify(t) + "\n", t.reportTextModuleName)
                }
                b && b.apply(null, arguments)
            }
            ;
            if (t.formsender) {
                l._fsRequest(t, r.host)
            } else {
                if (!u || t.dataType == "jsonp" || c || t.forceCrossHeader) {
                    if (!!t["jsonpQzone"] || !!t["qzoneCoolCbName"]) {
                        if (!t.data)
                            t.data = {};
                        t.data["callbackFun"] = "mallv8" + l.jsonpNum;
                        l.jsonpNum++;
                        t.jsonpCallback = t.data["callbackFun"] + "_Callback"
                    }
                    if (u && (c || t.forceCrossHeader)) {
                        t.xhrFields = {
                            withCredentials: true
                        }
                    }
                    if (!(t["qzoneCoolCbName"] || t["jsonpQzone"]) && t.jsonpCallback) {
                        p = l._jsonpQueue.excute(t)
                    } else {
                        p = i.ajax(t)
                    }
                    return p
                } else {
                    return l._fsRequest(t, r.host)
                }
            }
        },
        _fixAppType: function(e) {
            if (o.client === "weishi" && !e.data.app_type) {
                e.data.app_type = "101";
                return
            }
            if (a.hasWsAuth(e.url) && o.client === "wx") {
                e.data.app_type = "102";
                return
            }
            var t = "102";
            var i = a.getUrlParam("app_type") === t && o.client === "wx";
            var n = "h5.weishi.qq.com";
            if (i) {
                e.url = e.url.replace(/^(http:)?\/\//, "https://" + n + "/proxy/domain/");
                if (!e.data.app_type) {
                    e.data.app_type = t
                }
            }
        },
        _fixMobile: function(e) {
            if (c) {
                var t = e.dataType;
                e.data = e.data || {};
                if (!t || t == "json" || e.formsender) {
                    e.data.format = e.data.format || "json"
                }
                if (e.formsender) {
                    e.formsender = undefined;
                    e.type = "post";
                    e.dataType = "json"
                }
            }
            return e
        },
        showCAPTCHA: function() {
            var e = {};
            var t = false;
            var n = function() {
                if (location.protocol === "http:") {
                    return "http://captcha.qq.com/getimage?aid=8000102&rt=" + Date.now()
                } else {
                    return "https://ssl.captcha.qq.com/getimage?aid=8000102&rt=" + Date.now()
                }
            };
            return function(t, o, a, s, u) {
                e = t;
                var d = "_isValidRequest";
                if (c) {
                    require.async("//qzonestyle.gtimg.cn/qzone/hybrid/common/verifyCode/index", function(t) {
                        t.show({
                            submitCallback: function(t) {
                                e.data = e.data || {};
                                e.data["verify"] = t;
                                l.request(e)
                            },
                            cancelCallback: function() {
                                a.apply(null, u)
                            }
                        })
                    })
                } else {
                    var p = require.async("mall.v8/common/popupDialog/index", function(t) {
                        var c = require("./tmpl");
                        t.popupDialog("验证码", c.captchaDialog({
                            imgUrl: n()
                        }), 372, 181, null, {
                            noscroll: true
                        }, {
                            onLoad: function(e) {
                                e.onUnload = e.opts.onUnload;
                                i(e.dialogContent).delegate(".j_changeimg", "click", function() {
                                    i(e.dialogContent).find(".j_imgVerify").attr("src", n())
                                })
                            },
                            onUnload: function(e) {},
                            buttonConfig: [{
                                type: QZFL.dialog.BUTTON_TYPE.Confirm,
                                text: "确定",
                                preventDefault: false,
                                tips: "确定",
                                clickFn: function(t) {
                                    var n = i("#captchaDialog input").val();
                                    e.data = e.data || {};
                                    var c;
                                    if (e.autoVerifyKey) {
                                        c = e.autoVerifyKey
                                    } else {
                                        if (i.inArray(o, [-2000002, -2000003, -3001, -3002]) !== -1) {
                                            c = "verifyCode";
                                            e.data["verify"] = n
                                        }
                                    }
                                    e.data[c] = n;
                                    e.data.verifysession = r.get("verifysession");
                                    e.success = a;
                                    e.error = s;
                                    e[d] = true;
                                    l.request(e)
                                }
                            }, {
                                type: QZFL.dialog.BUTTON_TYPE.Cancel,
                                text: "取消",
                                tips: "取消",
                                clickFn: function() {
                                    a.apply(null, u)
                                }
                            }]
                        })
                    })
                }
            }
        }(),
        jsonp: function(e) {
            e.dataType = "jsonp";
            return l.request(e)
        },
        _jsonpQueue: {
            queuesMap: {},
            proxyCallback: function(e, t, n, r) {
                if (n) {
                    n.apply(window, r)
                }
                var o = e.queuesMap[t];
                if (o.ajaxQueues.length > 0) {
                    var a = o.ajaxQueues.shift();
                    i.ajax(a)
                } else {
                    o.onsending = false;
                    e.timehandller = null
                }
            },
            excute: function(e) {
                var t = this.queuesMap[e.jsonpCallback]
                  , n = this
                  , r = e.success
                  , o = e.error;
                e.success = function(t) {
                    n.proxyCallback(n, e.jsonpCallback, r, arguments)
                }
                ;
                e.error = function(t) {
                    n.proxyCallback(n, e.jsonpCallback, o, arguments)
                }
                ;
                if (!t) {
                    t = this.queuesMap[e.jsonpCallback] = {
                        ajaxQueues: [],
                        onsending: false
                    }
                }
                if (t.onsending) {
                    t.ajaxQueues.push(e)
                } else {
                    t.onsending = true;
                    return i.ajax(e)
                }
            }
        },
        _fsRequest: function() {
            var e = function(e, t) {
                var n = "qzs.qq.com", r, o = document.createElement("iframe"), a = location.host, c, l;
                if (a.indexOf("pengyou.com") !== -1) {
                    n = "imgcache.pengyou.com"
                } else if (a.indexOf("qzone.com") !== -1) {
                    n = "imgcache.qzone.com"
                }
                c = location.protocol + "//" + n + "/qzone/mall/v8/lib/mall/misc/";
                if (e.formsender === "gbk") {
                    l = "formsender_gbk.htm"
                } else {
                    l = "formsender.htm"
                }
                r = c + l + "?max_age=2592000";
                o.src = r;
                o.style.position = "absolute";
                o.style.top = "-9999px";
                o.style.left = "-9999px";
                o.setAttribute("tabindex", "-1");
                o.callback = function(t) {
                    e.success(t);
                    i(this).remove()
                }
                ;
                e.data["g_tk"] = s.getToken(e.url);
                o.postData = {
                    uri: e.url,
                    method: e.type || "post",
                    data: e.data
                };
                i("body").append(o)
            };
            return function(t, i) {
                if (location.protocol !== "https:") {
                    t.url = t.url.replace(/^(https:)?\/\//, "http://")
                }
                e(t, i)
            }
        }(),
        _autoXSS: function() {
            var e = Object.prototype.toString;
            var t = {
                go: function(t) {
                    var i = t;
                    if (!t) {
                        return i
                    }
                    var n = typeof t, r;
                    if (n === "string") {
                        i = this.filter(t)
                    } else if (n === "object") {
                        r = e.call(t);
                        if (r === "[object Array]") {
                            i = this.parseArray(t)
                        } else if (r === "[object Object]") {
                            i = this.parseObject(t)
                        }
                    }
                    return i
                },
                parseArray: function(e) {
                    var t = 0, i = e.length, n;
                    for (; t < i; ++t) {
                        e[t] = this.go(e[t])
                    }
                    return e
                },
                parseObject: function(e) {
                    for (var t in e) {
                        if (e.hasOwnProperty(t)) {
                            e[t] = this.go(e[t])
                        }
                    }
                    return e
                },
                filter: function(e) {
                    e = e.replace(/\u0026/g, "&amp;").replace(/\u0022/g, "&quot;").replace(/\u003C/g, "&lt;").replace(/\u003E/g, "&gt;").replace(/\u0027/g, "&#39;");
                    return e
                }
            };
            return function(e) {
                var i = e.qzone
                  , n = e.dataType
                  , r = !!((!n || n === "json" || n === "jsonp" || e.formsender || e.gbkframe) && (e.filterXSS || i && i !== "noxss"));
                var o = e.success;
                if (r) {
                    e.success = function(e, i) {
                        e = t.go(e);
                        o(e, i)
                    }
                }
                return e
            }
        }()
    };
    return l
});
define.pack("./browser", ["./util"], function(require, e, t) {
    var i = require("./util");
    var n, r;
    var o = {};
    o.uaMatch = function(e) {
        e = e.toLowerCase();
        var t = /(edge)[ \/]([\w.]+)/.exec(e) || /(chrome)[ \/]([\w.]+)/.exec(e) || /(webkit)[ \/]([\w.]+)/.exec(e) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(e) || /(msie) ([\w.]+)/.exec(e) || e.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(e) || [];
        return {
            browser: t[1] || "",
            version: t[2] || "0"
        }
    }
    ;
    n = o.uaMatch(navigator.userAgent);
    r = {};
    if (n.browser) {
        r[n.browser] = true;
        r.version = n.version
    }
    if (r.chrome) {
        r.webkit = true
    } else if (r.webkit) {
        r.safari = true
    }
    (function() {
        var e = {}
          , t = navigator.userAgent;
        if (r.msie && (window.ActiveXObject || window.msIsStaticHTML)) {
            e.ie = 6;
            (window.XMLHttpRequest || t.indexOf("MSIE 7.0") > -1) && (e.ie = 7);
            (window.XDomainRequest || t.indexOf("Trident/4.0") > -1) && (e.ie = 8);
            t.indexOf("Trident/5.0") > -1 && (e.ie = 9);
            t.indexOf("Trident/6.0") > -1 && (e.ie = 10);
            t.indexOf("Trident/7.0") > -1 && (e.ie = 11);
            r.version = e.ie + ""
        }
    }
    )();
    var a = navigator.userAgent;
    var s = a.match(/(iPad).*OS\s([\d_]+)/)
      , c = !s && a.match(/(iPhone\sOS)\s([\d_]+)/)
      , l = a.match(/Android/)
      , u = c || l || s
      , d = a.match(/MicroMessenger\/([\d\.]+)/)
      , p = a.match(/QQ\/([\d\.]+)/)
      , f = a.indexOf("Qzone/") !== -1
      , m = a.match("MQQBrowser") && a.indexOf("TBS") === -1
      , g = / (V\S+_\S+_FM+_\S+_\S+_\S+_\S+)/.test(a)
      , h = /QQMUSIC\/(\d[\.\d]*)/i.test(a)
      , v = a.indexOf("Weiyun") !== -1
      , _ = a.indexOf("_WEISHI_") !== -1
      , q = a.match(/\/qqdownloader\/(\d+)(?:\/(appdetail|external|sdk))?/)
      , y = a.indexOf("dianping") !== -1
      , b = a.indexOf("Weibo") !== -1;
    r.isMobile = !!u;
    r.platform = function() {
        var e = "";
        if (c || s) {
            e = "ios"
        } else if (l) {
            e = "android"
        } else {
            e = "pc"
        }
        return e
    }();
    r.client = function() {
        var e = "";
        if (d) {
            e = "wx"
        } else if (p) {
            e = "qq"
        } else if (f) {
            e = "qzone"
        } else if (q) {
            e = "yyb"
        } else if (g) {
            e = "fm"
        } else if (h) {
            e = "qqmusic"
        } else if (v) {
            e = "weiyun"
        } else if (y) {
            e = "dianping"
        } else if (b) {
            e = "weibo"
        } else if (_) {
            e = "weishi"
        } else if (m) {
            e = "QQBrowser"
        }
        return e
    }();
    var w = /(V\S+_\S+_\S+_\S+_\S+_\S+_\S+)/;
    var x = a.match(w);
    var k = x ? x[1] : "";
    r.getQuaString = function() {
        return k
    }
    ;
    r.getQuaObj = function() {
        return i.formatQua(k)
    }
    ;
    r.getApiUrl = function() {
        if (r.client === "qq") {
            return window.seajs && seajs.data.alias && seajs.data.alias.qqapi ? "qqapi" : "//open.mobile.qq.com/sdk/qqapi.js?_bid=152"
        } else if (r.client === "qzone") {
            return window.seajs && seajs.data.alias && seajs.data.alias.qzoneapi ? "qzoneapi" : "//qzonestyle.gtimg.cn/qzone/hybrid/lib/jsbridge.js"
        }
        return ""
    }
    ;
    r.getQuaVersion = function() {
        return r.getQuaObj(k).version
    }
    ;
    r.compareVersion = function(e, t) {
        if (!k) {
            return false
        }
        var i = function(e, t, n) {
            if (!e[n] && !t[n]) {
                return 0
            }
            return (e[n] || 0) - (t[n] || 0) || i(e, t, n + 1)
        };
        var n = i(r.getQuaVersion().split("."), (e + "").split("."), 0);
        n = n < 0 ? -1 : n > 0 ? 1 : 0;
        switch (t) {
        case "eq":
            return n === 0;
        case "neq":
            return n !== 0;
        case "lt":
            return n < 0;
        case "nlt":
            return n >= 0;
        case "gt":
            return n > 0;
        case "ngt":
            return n <= 0;
        default:
            return n
        }
    }
    ;
    return r
});
define.pack("./classes", [], function(require, e, t) {
    var i = {
        clone: function(e) {
            var t = function() {}, i;
            t.prototype = e;
            i = new t;
            return i
        }
    };
    return i
});
define.pack("./cookie", [], function(require, e, t) {
    var i = document.domain.split(".")
      , n = i.length
      , r = i.slice(n - 2, n).join(".");
    return {
        name: "cookie",
        isSupported: typeof document.cookie == "string",
        init: function() {},
        set: function(e, t, i, n, o) {
            var a;
            if (o) {
                a = new Date;
                a.setTime(a.getTime() + 36e5 * o)
            }
            document.cookie = e + "=" + t + "; " + (a ? "expires=" + a.toGMTString() + "; " : "") + ("path=" + (n || "/") + "; ") + ("domain=" + (i || r) + ";")
        },
        get: function(e) {
            var t = new RegExp("(?:^|;\\s*)" + e + "=([^;]*)")
              , i = document.cookie.match(t);
            return i && i[1] || ""
        },
        del: function(e, t, i) {
            document.cookie = e + "=; expires=Mon, 26 Jul 1997 05:00:00 GMT; " + ("path=" + (i || "/") + "; ") + ("domain=" + (t || r) + ";")
        },
        clear: function() {
            var e = document.cookie.match(/\w+=[^;]*/g);
            if (e) {
                for (var t = 0, i = e.length; t < i; t++) {
                    this.del(e[t].split("=")[0])
                }
            }
        }
    }
});
define.pack("./data", ["jquery", "./user", "./ajax", "./msg", "./browser", "./util"], function(require, e, t) {
    var i = require("jquery")
      , n = require("./user")
      , r = require("./ajax")
      , o = require("./msg")
      , a = require("./browser")
      , s = require("./util");
    var c = {
        jsonp: function(e, t, n) {
            var o = i.Deferred();
            r.request(i.extend({
                dataType: "jsonp",
                url: e,
                qzoneCoolCbName: true,
                data: t,
                success: function(e) {
                    if (!e.code) {
                        o.resolve(e)
                    } else {
                        o.reject(e)
                    }
                },
                error: function() {
                    o.reject({})
                }
            }, n || {}));
            return o
        },
        post: function(e, t, n) {
            t = t || {};
            var o = i.Deferred();
            var s = a.isMobile ? "json" : "formsender";
            r.request(i.extend({
                dataType: "json",
                url: e,
                type: "POST",
                data: i.extend(t, {
                    format: s
                }),
                success: function(e) {
                    if (!e.code) {
                        o.resolve(e)
                    } else {
                        o.reject(e)
                    }
                },
                error: function() {
                    o.reject({})
                }
            }, n || {}));
            return o
        },
        draw: function(e) {
            var t = i.Deferred();
            c.post("http://activity.qzone.qq.com/cgi-bin/v2/fcg_lottery_act_for_prize", {
                act_id: e,
                uin: n.getUin()
            }).done(function(e) {
                if (e.code == 0) {
                    t.resolve({
                        name: e.data.awardName,
                        data: e.data
                    })
                } else {
                    t.reject(e)
                }
            }).fail(function(e) {
                t.reject(e)
            });
            return t
        },
        getAward: function(e, t) {
            var r = i.Deferred();
            c.post("http://activity.qzone.qq.com/cgi-bin/v2/fcg_accept_act_prize", {
                act_id: e,
                lv: t,
                uin: n.getUin()
            }).done(function(e) {
                if (e.code == 0) {
                    r.resolve({})
                } else {
                    r.reject(e)
                }
            }).fail(function(e) {
                r.reject(e)
            });
            return r
        },
        getBudget: function(e) {
            var t = i.Deferred();
            this._getUin(function(i) {
                c.jsonp("http://activity.qzone.qq.com/cgi-bin/v2/fcg_act_query_qualify_counter", {
                    counter_info: e + "-" + i
                }).done(function(n) {
                    if (n.code == 0) {
                        t.resolve(n.data[e + "-" + i])
                    } else {
                        t.reject(n)
                    }
                }).fail(function(e) {
                    t.reject(e)
                })
            });
            return t
        },
        getWinnerData: function(e) {
            var t = i.Deferred();
            c.jsonp("http://activity.qzone.qq.com/cgi-bin/v2/fcg_query_act_lucky_list", {
                act_id: e
            }).done(function(e) {
                if (e.code == 0) {
                    t.resolve(e)
                } else {
                    t.reject(e)
                }
            }).fail(function(e) {
                t.reject(e)
            });
            return t
        },
        getRecord: function(e) {
            var t = i.Deferred();
            c.jsonp("http://activity.qzone.qq.com/cgi-bin/v2/fcg_query_user_act_prize_list", {
                act_id: e,
                r: Math.random()
            }).done(function(e) {
                if (e.code == 0) {
                    t.resolve(e)
                } else {
                    t.reject(e)
                }
            }).fail(function(e) {
                t.reject(e)
            });
            return t
        },
        _getUin: function(e) {
            var t = n.getUin();
            if (!t && a.isMobile) {
                n.userinfo().done(function(t) {
                    e && e(t.uin)
                })
            } else {
                e && e(t)
            }
        },
        spreadAct: function(e) {
            var t = i.Deferred();
            var r = i.extend({
                uin: n.getUin()
            }, e);
            c.post("http://activity.qzone.qq.com/cgi-bin/v2/fcg_spread_act_components_delegate", r).done(function(e) {
                if (e.code === 0) {
                    t.resolve(e)
                } else {
                    t.reject(e)
                }
            }).fail(function(e) {
                t.reject(e)
            });
            return t
        }
    };
    return c
});
define.pack("./index", ["jquery", "./stat", "./ajax", "./user", "./module", "./util", "./msg", "./browser", "./cookie", "./storage", "./qboss", "./data", "./ui", "./pay", "./classes", "./router", "./share", "./revenue", "./tmpl", "./webapp"], function(require, e, t) {
    var i = require("jquery");
    var n = {
        stat: require("./stat"),
        ajax: require("./ajax"),
        user: require("./user"),
        module: require("./module"),
        util: require("./util"),
        msg: require("./msg"),
        browser: require("./browser"),
        cookie: require("./cookie"),
        storage: require("./storage"),
        qboss: require("./qboss"),
        data: require("./data"),
        ui: require("./ui"),
        pay: require("./pay"),
        classes: require("./classes"),
        router: require("./router"),
        share: require("./share"),
        revenue: require("./revenue"),
        tmpl: require("./tmpl"),
        webapp: require("./webapp")
    };
    (function() {
        if (!(location.hostname === "act.qzone.qq.com" || location.pathname.match("/qzone/qzact/act/"))) {
            return
        }
        if (!n.browser.isMobile) {
            try {
                document.domain = "qq.com";
                (function() {
                    var e = {
                        "qzs.qq.com": 1,
                        "gameapp.qq.com": 2,
                        "cf.qq.com": 2,
                        "lol.qq.com": 2
                    };
                    function t(e) {
                        var t = document.createElement("a");
                        t.href = e;
                        return t.hostname
                    }
                    if (window.opener && document.referrer) {
                        var i = t(document.referrer);
                        var n = i.split(".");
                        var r = n.slice(-2).join(".");
                        var o = n.slice(-3).join(".");
                        var a = n.slice(-4).join(".");
                        var s;
                        try {
                            s = t(window.opener.parent.location.href).split(".").slice(-3).join(".")
                        } catch (e) {
                            s = ""
                        }
                        if (r === "qq.com" && o !== "qzone.qq.com") {
                            if ((e[o] === 1 || e[a] === 1) && s && s === "qzone.qq.com") {
                                console.log("whileList opener type 1")
                            } else if (e[o] === 2 || e[a] === 2) {
                                console.log("whileList opener type 2")
                            } else {
                                window.close()
                            }
                        }
                    }
                }
                )()
            } catch (e) {}
            if (parent != self && (document.referrer && (!/^http(s)?:\/\/[.\w-]+\.(qzone|weishi)\.qq\.com\//i.test(document.referrer) && !/^http(s)?:\/\/meteor.cm.com\/ekko/i.test(document.referrer)))) {
                throw new Error("can't be iframed")
            }
        }
        if (n.browser.client === "qq" && !(n.cookie.get("p_uin") && n.cookie.get("p_skey"))) {
            if (location.href.indexOf("needQzoneTicket=1") === -1) {
                require.async(n.browser.client + "api", function() {
                    if (window.mqq && window.mqq.invoke) {
                        var e = location.protocol + "//" + location.hostname + location.pathname + location.search + (location.search ? "&" : "?") + "needQzoneTicket=1" + location.hash;
                        window.mqq.invoke("ui", "openUrl", {
                            url: e,
                            target: 1,
                            style: 0,
                            animation: 1
                        });
                        window.mqq.invoke("ui", "closeWebViews", {
                            mode: 2,
                            exclude: false
                        })
                    }
                })
            }
        } else if (-1 == ["qq", "qzone", "fm"].indexOf(n.browser.client) && window.QZACT) {
            if (window.syncData && window.syncData.meteorData && window.syncData.meteorData.jumpToQQ !== "yes") {
                return
            }
            if (QZACT.needLogin && QZACT.isLogin === false && n.browser.isMobile && n.browser.client !== "weishi" && n.browser.client !== "weiyun") {
                require.async("common.m/appInvoker/index", function(e) {
                    var t = location.href;
                    if (location.hostname === "act.qzone.qq.com") {
                        t = t.replace(/^http:\/\//, "https://")
                    }
                    if (t && t.indexOf("_wv=") < 0) {
                        t = n.util.appendUrlParam(t, {
                            _wv: 1
                        })
                    }
                    e.invokeSchema("mqqapi://forward/url?src_type=web&version=1&url_prefix=" + btoa(t))
                })
            }
        }
        i("body").delegate("[data-hottag],[hottag]", "click", function(e) {
            var t = i(e.currentTarget)
              , r = i.trim(t.attr("data-hottag")) || i.trim(t.attr("hottag"));
            if (r) {
                n.stat.reportHotClick(r)
            }
        });
        var e = location.pathname
          , t = n.browser.isMobile ? "mobile" : "pc"
          , r = n.util.parseUrl(location.href)
          , o = r && r.params && (r.params.adtag || r.params.ADTAG || r.params.advid);
        e = "/qzact/" + t + e.replace(/^\/(qzone\/qzact\/act|vip)\//, "/");
        n.stat.reportPV("mall.qzone.qq.com", e, {
            referURL: o || undefined
        });
        if (n.user.isLogin() && -1 == location.search.indexOf("noReportQzoneLogin")) {
            if (n.browser.isMobile) {
                n.ajax.request({
                    url: (location.protocol === "https:" ? "https://h5.qzone.qq.com/p/activity" : "http://activity.qzone.qq.com") + "/fcg-bin/v2/fcg_act_login_count_report",
                    type: "post",
                    forceLogin: false,
                    data: {
                        uin: n.user.getUin()
                    }
                })
            } else {
                try {
                    n.ajax.request({
                        url: (location.protocol === "https:" ? "https://h5.qzone.qq.com/p/statistic" : "http://statistic.qzone.qq.com") + "/cgi-bin/login_statistic.cgi",
                        type: "post",
                        forceLogin: false,
                        data: {
                            host_uin: n.user.getUin(),
                            pagetype: 9,
                            reserve_one: 0,
                            reserve_two: 0
                        }
                    })
                } catch (e) {}
            }
        }
        try {
            if (window != window.top) {
                if (window.top.mqq) {
                    window.mqq = window.top.mqq
                } else {
                    Object.defineProperty(window, "mqq", {
                        get: function() {
                            return window.top.mqq || {}
                        }
                    })
                }
                define("qqapi", function(require, e, t) {
                    t.exports = window.mqq
                })
            }
        } catch (e) {}
        if (!n.browser.isMobile) {
            setTimeout(function() {
                require.async(location.protocol + "//tajs.qq.com/stats?sId=45347400")
            }, 4e3)
        }
        if (r.params && r.params.reportPV === "push") {
            n.stat.compass.report("dc02880", {
                actiontype: 2,
                subactiontype: 2,
                item_type: r.params.hydtgzh,
                url: location.href
            })
        }
        setTimeout(function() {
            require.async(location.protocol + "//tajs.qq.com/stats?sId=65479472")
        }, 3e3);
        if (n.browser.isMobile) {
            n.stat.qboss.report({
                action_id: 101
            })
        }
    }
    )();
    return window["qzact.lib"] = n
});
define.pack("./module", ["jquery"], function(require, e, t) {
    var i = require("jquery");
    var n = function() {
        var e = {};
        function t() {
            this._defer = {}
        }
        t.prototype.defer = function(e) {
            e && !this._defer[e] && (this._defer[e] = i.Deferred());
            return e ? this._defer[e] : this._defer
        }
        ;
        return function(i) {
            i && !e[i] && (e[i] = new t);
            return i ? e[i] : e
        }
    }();
    return n
});
define.pack("./msg", ["./browser", "./util", "./tmpl", "jquery"], function(require, e, t) {
    var i = require("./browser");
    var n = require("./util");
    var r = require("./tmpl");
    var o = require("jquery");
    var a = {
        succ: "succeed",
        fail: "fail",
        info: "info",
        warn: "warning",
        loading: "loading"
    };
    var s = require("./browser").isMobile;
    var c = {
        succ: "hook",
        fail: "cancel",
        info: "info",
        loading: "loading"
    };
    var l, u;
    var d = {
        show: function(e, t, d, p) {
            var f = this;
            l && clearTimeout(l);
            f._hide();
            if (arguments.length == 1) {
                t = e;
                e = undefined
            }
            d = d || 2e3;
            p = p || "center";
            if (p === "top" && i.client === "qq" && window.mqq && e !== "loading") {
                var m = 3;
                if (e === "succ") {
                    m = 1
                } else if (e === "fail") {
                    m = 2
                } else if (e === "info") {
                    m = 3
                }
                mqq.ui && mqq.ui.showTips && mqq.ui.showTips({
                    text: t,
                    iconMode: m
                });
                return
            }
            if (s) {
                var g = {
                    icon: c[e] || c["info"],
                    content: t || ""
                };
                u || (u = n.insertStyleSheet("tips_css", r.mtips_css()));
                var h = o(r.mtips(g)).appendTo(document.body);
                var v = h.css("top");
                h.css("top", -50);
                h.animate({
                    top: v
                }, 300)
            } else {
                var g = {
                    type: a[e] || a["info"],
                    content: t || ""
                };
                u || (u = n.insertStyleSheet("tips_css", r.tips_css()));
                var h = o(r.tips(g));
                f._fixedPosition(h);
                h.appendTo(document.body)
            }
            l = setTimeout(f._hide, d)
        },
        showm: function(e, t, i) {},
        _hide: function() {
            o("#q_Msgbox").remove()
        },
        _fixedPosition: function(e) {
            if (document.compatMode == "BackCompat" || i.msie && i.version < 7) {
                var t = document.documentElement.scrollTop || document.body.scrollTop
                  , n = document.documentElement.clientHeight || document.body.clientHeight;
                e.css({
                    position: "absolute",
                    top: t + n / 2
                })
            }
        }
    };
    return d
});
define.pack("./pay.dialog", ["jquery", "./util", "./user", "./ajax", "./msg", "./browser", "./cookie", "./data", "./classes", "./stat"], function(require, e, t) {
    var i = require("jquery")
      , n = require("./util")
      , r = require("./user")
      , o = require("./ajax")
      , a = require("./msg")
      , s = require("./browser")
      , c = require("./cookie")
      , l = require("./data")
      , u = require("./classes").clone
      , d = require("./stat");
    var p = function() {};
    var f = {
        _DefaultConfig: {
            type: "vip",
            ui: "month"
        },
        APP_ID: function() {
            var e = {
                pc: {
                    vip: "1450012019",
                    deluxe: "1450011606",
                    webgame: "1450004362",
                    star: "",
                    weiyun: "1450012051",
                    deluxeStar: "",
                    liveVideo: "1450011623",
                    mgame: "",
                    h5game: ""
                },
                mobile: {
                    vip: "1450004411",
                    deluxe: "1450011590",
                    star: "1450006273",
                    weiyun: "1450006532",
                    webgame: "1450006674",
                    liveVideo: "1450011260",
                    deluxeStar: "1450008068",
                    mgame: "1450012896",
                    h5game: "1450012898",
                    wxpay: "1450013150",
                    copper: "1450014239",
                    silver: "1450014240",
                    drilling: "1450014241",
                    gold: "1450014242",
                    qzoneGift: "1450016785",
                    originMall: "1450017921"
                }
            };
            return s.isMobile ? e.mobile : e.pc
        }(),
        open: function() {
            var e = this
              , t = this.options;
            if (s.platform === "ios" && (s.client === "qq" || s.client === "qzone")) {
                if (window.QZACT && window.QZACT.iosStatus && window.QZACT.iosStatus.qzHide) {
                    a.show("活动已结束");
                    return
                }
            }
            var i = {
                month: this._orderMonth,
                item: this._orderItem
            }[t.ui || "month"];
            var n = ["copper", "silver", "gold", "drilling"];
            var r = n.indexOf(t.type) === -1 ? false : true;
            i.apply(this).done(function(t) {
                if (r) {
                    e._payLiveGrade(t);
                    return
                }
                if (s.isMobile) {
                    e._payH5(t)
                } else {
                    e._payPC(t)
                }
            }).fail(function(e) {
                t.onError && t.onError(e)
            })
        },
        init: function(e) {
            this.options = u(e)
        },
        _payLiveGrade: function(e) {
            var t = this.options, n;
            var o = s.getQuaString() || "V1_PC_QZ_1.0.0_0_IDC_B";
            var a = t.aid || "act";
            var l = this.APP_ID[t.type];
            require.async("https://midas.gtimg.cn/h5pay/js/api/midas.js", function() {
                if (t.ui === "item") {
                    alert("非包月（月卡购买）")
                } else {
                    n = {
                        appid: l,
                        service: e.code || "",
                        pf: "qqzone.hz.zhibo",
                        as: t.as,
                        n: t.n || t.count,
                        account: "qq",
                        productid: "1",
                        dc: t.dc || "qqcard,mcard",
                        hidePrice: t.hideprice,
                        mpid: e.vip_ma || "",
                        aid: JSON.stringify({
                            apf: "1",
                            preorder_bill: e.billno
                        })
                    }
                }
                t.sandbox && (n.sandbox = 1);
                n.onSuccess = t.onSuccess || p;
                n.onClose = t.onClose || p;
                if (r.getUin() && c.get("p_skey")) {
                    n = i.extend(n, {
                        openid: r.getUin(),
                        openkey: c.get("p_skey"),
                        sessionid: "uin",
                        sessiontype: "pskey_5"
                    })
                }
                if (t.ui === "item") {
                    alert(" opts.ui === 'item' ")
                } else {
                    window.Midas.openSubscribe(n)
                }
            })
        },
        _payH5: function(e) {
            var t = this.options, n;
            var o = s.getQuaString() || "V1_PC_QZ_1.0.0_0_IDC_B";
            var a = t.aid || "act";
            var l = e.business_type || "0";
            require.async("//midas.gtimg.cn/h5pay/js/api/midas.js", function() {
                if (t.ui === "item") {
                    n = {
                        params: e.url_params,
                        pf: "qzone_m_qq-1000-cp-1000-act",
                        _version: "v3",
                        dc: t.dc || "mcard,hfpay",
                        channelStyle: t.channelStyle
                    }
                } else {
                    n = {
                        pf: "qzone_m_qq-1000-html5-1000-" + a + "*" + o + "$a" + parseInt(t.ruleId) + "$b" + l + "$x$t1",
                        c: e.code || "",
                        n: t.n || t.count,
                        da: +(t.da || t.countFixed),
                        u: t.u,
                        mode: t.mode,
                        fixed_mode: t.fixed_mode,
                        as: t.as,
                        al: t.al,
                        dc: t.dc || "mcard,hfpay",
                        tc: t.tc,
                        hidePrice: t.hideprice,
                        mpid: e.vip_ma || "",
                        aid: JSON.stringify({
                            apf: "1",
                            preorder_bill: e.billno
                        })
                    }
                }
                if (t.type === "deluxe" && n.mode === "upgrade" && n.as === 1) {
                    n.c = "xxjzghh";
                    n.open_detail = "XXJZGW_0,XXJZSJ_" + 31 * (n.n || 1)
                }
                t.sandbox && (n.sandbox = 1);
                n.onSuccess = t.onSuccess || p;
                n.onClose = t.onClose || p;
                if (r.getUin() && c.get("p_skey")) {
                    n = i.extend(n, {
                        openid: r.getUin(),
                        openkey: c.get("p_skey"),
                        sessionid: "uin",
                        sessiontype: "pskey_5"
                    })
                }
                if (typeof t.groupid !== "undefined") {
                    n.groupid = t.groupid
                }
                if (t.ui === "item") {
                    window.Midas.buyGoods(n)
                } else {
                    n.supercoupons = "noCoupon";
                    window.Midas.openService(n)
                }
            })
        },
        _payPC: function(e) {
            var t = this
              , n = this.options;
            require.async(location.protocol + "//midas.gtimg.cn/midas/minipay_v2/jsapi/cashier.js", function() {
                var o, a;
                a = {
                    title: n.name || "",
                    hideHeader: n.hideHeader || false,
                    methods: {
                        onError: n.onError || p,
                        onSuccess: n.onSuccess || p,
                        onClose: n.onClose || p,
                        onNoResult: n.onNoResult || p,
                        onResize: n.onResize || p,
                        onBackButton: n.onBackButton || p
                    }
                };
                o = {
                    pf: n.pf || "website",
                    buy_quantity: n.count || 1,
                    provide_uin: n.friUin,
                    disableSend: !!n.disableSend
                };
                n.sandbox && (o.sandbox = 1);
                o = i.extend(o, {
                    openid: r.getUin(),
                    openkey: c.get("skey"),
                    session_id: "uin",
                    session_type: "skey"
                });
                if (n.ui === "item") {
                    if (!n.friUin) {
                        o.disableSend = true
                    }
                    o = i.extend(o, {
                        goodstokenurl: e.url_params,
                        appid: t.APP_ID[n.type],
                        service_pf: n.service_pf,
                        unit: n.unit,
                        desc_as_name: +n.desc_as_name
                    })
                } else {
                    o = i.extend(o, {
                        aid: JSON.stringify({
                            apf: "1",
                            preorder_bill: e.billno
                        }),
                        price_type: n.price_type,
                        appid: e.code
                    })
                }
                if (n.ui === "item") {
                    window.midas.minipay.buyGoods(a, o)
                } else {
                    window.midas.minipay.service(a, o)
                }
            })
        },
        _orderMonth: function() {
            var e = i.Deferred();
            var t = this.options;
            var r = {
                vip: 1,
                deluxe: t.as && t.mode !== "upgrade" ? 2 : 5,
                star: 3,
                deluxeStar: 4,
                copper: 6,
                silver: 7,
                gold: 8,
                drilling: 9
            }[t.type];
            var o = n.getUrlParam("qbossnewtrace");
            l.post("http://activity.qzone.qq.com/fcg-bin/fcg_qzact_minipay_preorder", {
                actid: t.actId,
                ruleid: t.ruleId,
                extend_field: n.toUrlParam({
                    adpos_clickid: o,
                    ref_clickid: o ? d.qboss.getPrevTraceStr(t.actId, t.ruleId) : "",
                    extra_info: t.extraInfo,
                    platform: s.isMobile ? 2 : 1,
                    adv_ref: t.adv_ref || "",
                    advid: t.advid || "",
                    card_id: t.cardId || "",
                    card_code: t.cardCode || "",
                    discount: t.discountype || 0
                }),
                vip_type: r
            }).done(function(t) {
                e.resolve(t.data)
            }).fail(function(t) {
                e.reject(t);
                a.show("fail", t.message || "下单失败")
            });
            return e
        },
        _orderItem: function() {
            var e = i.Deferred();
            var t = this.options;
            var r = n.getUrlParam("qbossnewtrace");
            l.post("http://pay.qzone.qq.com/fcg-bin/fcg_qzact_pic_order", {
                pfkey: "pfkey",
                appid: f.APP_ID[t.type],
                actid: t.actId,
                ruleid: t.ruleId,
                advid: t.advid || "",
                extra_info: t.extraInfo || "",
                report_extra_info: t.reportExtraInfo || "",
                pic_type: t.countFixed || "",
                buy_num: t.count || 1,
                aid: t.aid,
                qua: s.getQuaString() || "V1_PC_QZ_1.0.0_0_IDC_B",
                req_price: t.itemPrice,
                item_pic: t.itemPic || "https://qzonestyle.gtimg.cn/aoi/sola/20160427184516_fOlldDjHhC.png",
                item_name: t.name,
                item_desc: t.itemDesc,
                fri_uin: t.friUin,
                card_id: t.cardId || "",
                card_code: t.cardCode || "",
                adpos_clickid: r,
                ref_clickid: r ? d.qboss.getPrevTraceStr(t.actId, t.ruleId) : ""
            }).done(function(t) {
                e.resolve(t.data)
            }).fail(function(t) {
                var i = {
                    "-5053": "订单冲突，请先支付上一个订单，或等待15分钟后再操作",
                    "-5057": "一次只能购买一份",
                    "-7024": "您的订单中购买数量有问题，请重新下单",
                    "-7037": "库存不足"
                };
                a.show("fail", i[t.subcode] || t.message || "下单失败");
                e.reject(t)
            });
            return e.promise()
        }
    };
    return f
});
define.pack("./pay.iap", ["jquery", "./ajax", "./classes", "./msg", "./data", "./util", "./stat", "./browser"], function(require, e, t) {
    var i = require("jquery")
      , n = require("./ajax")
      , r = require("./classes").clone
      , o = require("./msg")
      , a = require("./data")
      , s = require("./util")
      , c = require("./stat")
      , l = require("./browser");
    var u = l.getQuaString() || "V1_PC_QZ_1.0.0_0_IDC_B";
    var d = {
        _DefaultConfig: {
            type: "vip"
        },
        APP_ID: function() {
            var e = {
                qq: {
                    vip: "1450012019",
                    deluxe: "1450011606"
                },
                qzone: {
                    vip: "1450004411",
                    deluxe: "1450011590"
                }
            };
            return e[l.client]
        }(),
        open: function() {
            var e = this
              , t = this.options;
            e._orderIap(t).done(function(t) {
                e._payIapAct(t)
            })
        },
        init: function(e) {
            this.options = r(e)
        },
        payIap: function(e) {
            var t;
            var i;
            if (l.client === "qq") {
                t = {
                    app_id: String(e.offerid || ""),
                    qq_product_name: e.productname || "",
                    pf: e.pf || "",
                    pfkey: "pfKey",
                    zoneId: String(e.zoneId || "1"),
                    product_id: String(e.productid || ""),
                    product_type: e.producttype === undefined ? 4 : Number(e.producttype),
                    quantity: 1,
                    is_deposit_game_coin: Number(e.isDepositGameCoin) || 0,
                    pay_item: e.payitem || "",
                    var_item: e.varItem || "",
                    apple_pay_source: "yellow_vip_center"
                };
                i = function() {
                    try {
                        mqq.pay.pay(t, function(t, i) {
                            if (t === 0) {
                                e.succCallback && e.succCallback()
                            } else {
                                e.errCallback && e.errCallback({
                                    code: t,
                                    message: i
                                })
                            }
                        })
                    } catch (e) {}
                }
            } else if (l.client === "qzone") {
                t = {
                    offerid: e.offerid || "",
                    productid: e.productid || "",
                    payitem: e.payitem || "",
                    quantity: 1,
                    productname: e.productname || "",
                    isDepositGameCoin: e.isDepositGameCoin || 0,
                    pf: e.pf || "qq_m_qq-2001-iap-2011-act",
                    pfkey: "pfKey",
                    zoneId: e.zoneId || "1",
                    producttype: e.producttype || 4,
                    varItem: e.varItem || ""
                };
                i = function() {
                    try {
                        mqq.invoke("qzone", "qzoneBuyVip", {
                            param: t
                        });
                        document.addEventListener("WEBAPP_BUYVIP", function(t) {
                            document.removeEventListener("WEBAPP_BUYVIP", arguments.callee);
                            if (t.data.value === 0) {
                                e.succCallback && e.succCallback()
                            } else {
                                e.errCallback && e.errCallback({
                                    code: t && t.data && t.data.value,
                                    message: t && t.data && t.data.message
                                })
                            }
                        })
                    } catch (e) {}
                }
            }
            if (typeof window.mqq === "object") {
                i()
            } else {
                require.async(l.getApiUrl(), function() {
                    i()
                })
            }
        },
        _payIapAct: function(e) {
            var t = this
              , i = this.options;
            var n = i.aid || "act";
            var r = e.business_type || "0";
            var o = "qq_m_qq-2001-iap-2011-" + n + "*" + u + "$a" + i.iapRuleId + "$b" + r + "$x$t1";
            t.payIap({
                offerid: e.appid,
                productid: e.product_id,
                payitem: e.payitem,
                productname: "",
                pf: o,
                producttype: 0,
                succCallback: function() {
                    i.onSuccess && i.onSuccess()
                },
                errCallback: function(e) {
                    i.onError && i.onError(e)
                }
            })
        },
        _orderIap: function() {
            var e = i.Deferred();
            var t = this.options;
            var n = s.getUrlParam("qbossnewtrace");
            a.post("http://pay.qzone.qq.com/fcg-bin/fcg_qzact_iap_pic_order", {
                actid: t.actId,
                ruleid: t.iapRuleId,
                buy_num: 1,
                aid: t.aid || "act",
                fri_uin: t.friUin,
                advid: t.advid,
                card_id: t.cardId,
                card_code: t.cardCode,
                extra_info: t.extraInfo,
                qua: u,
                adpos_clickid: n,
                ref_clickid: n ? c.qboss.getPrevTraceStr(t.actId, t.ruleId) : ""
            }).done(function(t) {
                e.resolve(t.data)
            }).fail(function(t) {
                e.reject(t);
                o.show("fail", t.message || "下单失败")
            });
            return e
        }
    };
    return d
});
define.pack("./pay", ["jquery", "./util", "./stat", "./browser", "./classes", "./pay.dialog", "./pay.mobile", "./pay.iap", "./pay.pc"], function(require, e, t) {
    var i = require("jquery")
      , n = require("./util")
      , r = require("./stat")
      , o = require("./browser")
      , a = require("./classes").clone;
    var s = require("./pay.dialog")
      , c = require("./pay.mobile")
      , l = require("./pay.iap")
      , u = require("./pay.pc");
    var d = o.isMobile;
    var p = {
        _DefaultConfig: {
            type: "vip",
            ui: "mini",
            itemType: "act"
        },
        _initKey: "___HASINIT___",
        init: function(e, t) {
            var i = this._initKey, n;
            if (this[i]) {
                n = this
            } else {
                n = a(p);
                n[i] = true;
                n._initOptions(e);
                n._initPay()
            }
            t && t.call(n);
            return n
        },
        bind: function(e, t) {
            this.init(t, function() {
                var t = this
                  , n = this.options;
                i(e).bind("click", function(e) {
                    e.preventDefault();
                    t.open()
                })
            });
            return this
        },
        open: function(e) {
            this.init(e, function() {
                this.pay.open()
            });
            if (d) {
                r.qboss.report({
                    action_id: 102,
                    actId: e.id || e.actId || e.actid,
                    ruleId: e.ruleid || e.ruleId
                })
            }
        },
        _initOptions: function(e) {
            e = this.options = i.extend({}, this._DefaultConfig, e);
            var t = n.parseUrl(location.href).params || {};
            if (!("adv_ref"in e) && t.adv_ref) {
                e.adv_ref = t.adv_ref
            }
            if (!("advid"in e) && t.advid) {
                e.advid = t.advid
            }
            if (t.sandbox) {
                e.sandbox = t.sandbox
            }
            if (!("cardId"in e) && t.card_id) {
                e.cardId = t.card_id
            }
            if (!("cardCode"in e) && t.card_code) {
                e.cardCode = t.card_code
            }
            if (e.type === "item" && e.canPayDialog === undefined) {
                e.canPayDialog = i.inArray(e.itemType, ["deluxe", "act", "weiyun", "mgame", "h5game", "wxpay", "qzoneGift", "originMall"]) > -1
            }
            if (e.canPayDialog) {
                if (e.ui === "mini") {
                    if (e.type === "item") {
                        e.ui = "item";
                        e.type = e.itemType === "act" ? "vip" : e.itemType
                    } else {
                        e.ui = "month"
                    }
                }
                e.actId = e.actId || e.id;
                e.ruleId = e.ruleId || e.ruleid;
                e.name = e.name || e.itemName
            }
            return e
        },
        _initPay: function() {
            var e = this.options, t, i;
            if (e.supportIap && e.iapRuleId && ((o.client === "qq" || o.client === "qzone") && o.platform === "ios")) {
                i = l
            } else if (e.canPayDialog) {
                i = s
            } else {
                if (d) {
                    i = c
                } else {
                    i = u
                }
            }
            t = a(i);
            t.init(e);
            this.pay = t
        }
    };
    return p
});
define.pack("./pay.mobile", ["jquery", "./util", "./user", "./ajax", "./msg", "./browser", "./cookie", "./data", "./stat"], function(require, e, t) {
    var i = require("jquery")
      , n = require("./util")
      , r = require("./user")
      , o = require("./ajax")
      , a = require("./msg")
      , s = require("./browser")
      , c = require("./cookie")
      , l = require("./data")
      , u = require("./stat");
    var d = {
        mini: {
            count: "n",
            countFixed: "da",
            countMax: "",
            toPayway: "as",
            success: "ru",
            channelOff: "dc"
        }
    };
    var p = {
        APP_ID: {
            act: "1450004411",
            star: "1450006273",
            weiyun: "1450006532",
            webgame: "1450006674",
            liveVideo: "1450011260",
            deluxeStar: "1450008068",
            mgame: "1450012896",
            h5game: "1450012898",
            wxpay: "1450013150",
            qzoneGift: "1450016785"
        },
        init: function(e) {
            this.options = e;
            return this
        },
        open: function() {
            var e = this.options;
            if (e.ui === "qzone") {
                return a.show("fail", "内支付功能已停用")
            }
            if (e.ui === "mini" && e.type === "item") {
                e.ui = "midas"
            }
            if (e.openWebview && -1 !== i.inArray(s.client, ["qq", "qzone"])) {
                e.openWebview = true;
                var t = {
                    event: "QzactPayVip",
                    data: {
                        time: +new Date
                    },
                    options: {
                        echo: true,
                        broadcast: true,
                        domains: ["*.qzone.qq.com"]
                    }
                };
                e.su = e.su || "jsbridge://event/dispatchEvent?p=" + encodeURIComponent(JSON.stringify(t));
                var n = function() {
                    var e = i.Deferred();
                    require.async(s.client + "api", function() {
                        e.resolve(window.mqq)
                    });
                    return e.promise()
                };
                var r = "id-" + e.id + "/rule-" + e.ruleid;
                i.when(this._getUrl(e.ui), n()).done(function(i, n) {
                    n.addEventListener("QzactPayVip", function(i, n) {
                        if (i.time == t.data.time) {
                            e.onSuccess && e.onSuccess();
                            u.reportPV("mall.qzone.qq.com", "/qzact/mobile/pay-ok/" + r)
                        }
                    });
                    u.reportPV("mall.qzone.qq.com", "/qzact/mobile/pay/" + r);
                    n.invoke("ui", "openUrl", {
                        url: i,
                        target: 1,
                        style: 1
                    })
                })
            } else {
                e.openWebview = false;
                this._getUrl(e.ui).done(function(e) {
                    location.href = e
                })
            }
            return this
        },
        _getUrl: function(e) {
            var t = this;
            var n = this.url;
            var r = i.Deferred()
              , o = {
                mini: "_getMiniUrl",
                midas: "_getMidasUrl"
            }[e];
            if (n) {
                r.resolve(n)
            } else {
                this[o]().done(function(e) {
                    t.url = e;
                    r.resolve(e)
                })
            }
            return r
        },
        _getMiniUrl: function() {
            var e = i.Deferred();
            var t = "http://pay.qq.com/h5/index.shtml";
            var o = this.options;
            var a = d.mini;
            for (var l in a) {
                if (a.hasOwnProperty(l) && o.hasOwnProperty(l)) {
                    if (a[l] && !o.hasOwnProperty(a[l])) {
                        o[a[l]] = o[l]
                    }
                    try {
                        delete o[l]
                    } catch (e) {
                        o[l] = undefined
                    }
                }
            }
            o.m = "buy";
            o.ru = o.openWebview ? "" : o.ru || location.href;
            var u = o.type;
            try {
                delete o.type
            } catch (e) {
                o.type = undefined
            }
            if (o.apf == 1) {
                this._orderMini(u, o).done(function(a) {
                    var l = s.getQuaString() || "V1_PC_QZ_1.0.0_0_IDC_B";
                    var u = o.aid || "act";
                    var d = a.business_type || "0";
                    o.c = a.code || "";
                    o.mpid = a.vip_ma || "";
                    o.aid = JSON.stringify({
                        apf: "1",
                        preorder_bill: a.billno
                    });
                    o.pf = "qzone_m_qq-1000-html5-1000-" + u + "*" + l + "$a" + o.ruleid + "$b" + d + "$x$t1";
                    o.dc = o.dc || "mcard,hfpay";
                    i(["id", "ruleid", "adv_ref", "apf", "advid"]).each(function(e, t) {
                        try {
                            delete o[t]
                        } catch (e) {
                            o[t] = undefined
                        }
                    });
                    if (r.getUin() && c.get("p_skey")) {
                        i.extend(o, {
                            openid: r.getUin(),
                            openkey: c.get("p_skey"),
                            sessionid: "uin",
                            sessiontype: "pskey_5",
                            _newservice: 1
                        })
                    }
                    t = n.appendUrlParam(t, o);
                    e.resolve(t)
                })
            } else {}
            return e
        },
        _orderMini: function(e, t) {
            var r = i.Deferred();
            var o = {
                vip: 1,
                deluxe: 2,
                star: 3,
                deluxeStar: 4
            }[e];
            l.post("http://activity.qzone.qq.com/fcg-bin/fcg_qzact_minipay_preorder", {
                actid: t.id,
                ruleid: t.ruleid,
                extend_field: n.toUrlParam({
                    platform: 2,
                    adv_ref: t.adv_ref || "",
                    advid: t.advid || "",
                    card_id: t.cardId || "",
                    card_code: t.cardCode || ""
                }),
                vip_type: o
            }).done(function(e) {
                r.resolve(e.data)
            }).fail(function(e) {
                r.reject(e);
                a.show("fail", e.message || "下单失败")
            });
            return r
        },
        _getMidasUrl: function() {
            var e = this;
            var t = i.Deferred();
            var o = this.options;
            e._orderMidas().done(function(e) {
                var a = "http://pay.qq.com/h5/index.shtml";
                var s = {
                    params: e.url_params,
                    m: "buy",
                    c: "goods",
                    appid: o.appid,
                    wxWapPay: 1,
                    ru: o.openWebview ? "" : o.ru || o.success || location.href,
                    su: o.su,
                    pf: "qzone_m_qq-1000-cp-1000-act",
                    sandbox: o.sandbox,
                    as: o.as || 0,
                    dc: o.dc || "mcard,hfpay"
                };
                if (e.auth_type === "pskey") {
                    i.extend(s, {
                        openid: r.getUin(),
                        openkey: c.get("p_skey"),
                        sessionid: "uin",
                        sessiontype: "pskey_5"
                    })
                }
                a = n.appendUrlParam(a, s);
                t.resolve(a)
            });
            return t.promise()
        },
        _orderMidas: function() {
            var e = i.Deferred();
            var t = this.options;
            if (t.apf == 1) {
                t.appid = p.APP_ID[t.itemType || "act"];
                l.post("http://pay.qzone.qq.com/fcg-bin/fcg_qzact_pic_order", {
                    pfkey: "pfkey",
                    appid: t.appid,
                    actid: t.id,
                    ruleid: t.ruleid,
                    advid: t.advid || "",
                    extra_info: t.extraInfo || "",
                    report_extra_info: t.reportExtraInfo || "",
                    pic_type: t.picType || "",
                    buy_num: t.count || 1,
                    aid: t.aid,
                    req_price: t.itemPrice,
                    item_pic: t.itemPic,
                    item_name: t.itemName,
                    item_desc: t.itemDesc,
                    fri_uin: t.friUin,
                    qua: s.getQuaString() || "V1_PC_QZ_1.0.0_0_IDC_B",
                    card_id: t.cardId || "",
                    card_code: t.cardCode || ""
                }).done(function(t) {
                    e.resolve(t.data)
                }).fail(function(t) {
                    var i = {
                        "-5053": "订单冲突，请先支付上一个订单，或等待15分钟后再操作",
                        "-5057": "一次只能购买一份",
                        "-7024": "您的订单中购买数量有问题，请重新下单",
                        "-7037": "库存不足"
                    };
                    a.show("fail", i[t.subcode] || t.message || "下单失败");
                    e.reject(t)
                })
            } else {
                t.appid = "1450001014";
                var n, r = [];
                if (i.isArray(t.id) || i.isArray(t.count)) {
                    for (var c = 0; c < t.id.length; c++) {
                        r.push(t.id[c] + "*" + t.count[c])
                    }
                    n = r.join("|")
                } else {
                    n = t.id + "*" + t.count
                }
                var u = {
                    callback: "order_Callback",
                    appid: t.appid,
                    zoneid: "1",
                    pic_act_name: t.info,
                    pic_act_dsc: t.info,
                    iteminfo: n,
                    adv_ref: t.adv_ref,
                    pfkey: "pfkey"
                };
                for (var d in t.orderOpts) {
                    u[d] = t.orderOpts[d]
                }
                o.request({
                    url: "http://playzone2.qzone.qq.com/fcg-bin/fcg_get_orders_midas",
                    dataType: "jsonp",
                    jsonpCallback: "order_Callback",
                    jsonp: true,
                    data: u,
                    success: function(t) {
                        if (t.code === 0) {
                            e.resolve(t.data)
                        } else {
                            a.show("fail", t.message || "下单失败")
                        }
                    },
                    error: function() {
                        a.show("fail", "系统繁忙")
                    }
                })
            }
            return e.promise()
        }
    };
    return p
});
define.pack("./pay.pc", ["jquery", "./util", "./msg", "./data", "./browser", "./stat"], function(require, e, t) {
    var i = require("jquery")
      , n = require("./util")
      , r = require("./msg")
      , o = require("./data")
      , a = require("./browser")
      , s = require("./stat");
    var c = {
        mini: {
            count: "amount",
            countOptions: "presetAmount",
            channelOff: "channels",
            info: "actinfo",
            success: "onSuccess",
            error: "onError"
        }
    };
    var l = {
        APP_ID: {
            act: "1450004410",
            webgame: "1450004362",
            star: "1450006337",
            weiyun: "1450006533",
            deluxeStar: "1450008077",
            mgame: "",
            h5game: ""
        },
        init: function(e) {
            this.options = e;
            return this
        },
        open: function() {
            var e = this.options;
            if (e.ui === "qzone") {
                return r.show("fail", "内支付功能已停用")
            }
            if (e.ui === "mini" && e.type === "item") {
                e.ui = "midas"
            }
            var t = {
                mini: "_openMini",
                midas: "_openMidas"
            }[e.ui];
            this[t]();
            return this
        },
        _openMini: function() {
            this._getMiniOption().done(function(e) {
                require.async(location.protocol + "//imgcache.qq.com/bossweb/ipay/js/api/cashier.js", function() {
                    cashier.dialog.buy(e)
                })
            })
        },
        _getMiniOption: function() {
            var e = i.Deferred();
            var t = i.extend({}, this.options);
            var n = c.mini;
            for (var o in n) {
                if (n.hasOwnProperty(o) && t.hasOwnProperty(o)) {
                    if (n[o] && !t.hasOwnProperty(n[o])) {
                        t[n[o]] = t[o]
                    }
                    try {
                        delete t[o]
                    } catch (e) {
                        t[o] = undefined
                    }
                }
            }
            if (t.presetAmount) {
                t.presetAmount = t.presetAmount.replace(/[_]+/g, ",")
            }
            if (t.input == 0 && t.presetAmount) {
                t.presetAmount = ("!" + t.presetAmount).replace("!!", "!")
            }
            if (t.countFixed == 1 && t.amount) {
                t.amount = ("!" + t.amount).replace("!!", "!")
            }
            var a = t.onError;
            t.onError = function(e) {
                var t = e.error_code_list;
                var i = t.split("-").pop() + "";
                var n = i.substr(-3, 3);
                var o = {
                    65570: "您的黄钻开通时长已达上限"
                };
                var s = {
                    701: "活动规则不存在",
                    706: "活动规则不匹配",
                    707: "活动支付类别不匹配",
                    708: "活动还没有开始，请耐心等待",
                    709: "活动已经结束",
                    715: "物品余量不足",
                    717: "个人资格不足",
                    727: "活动支付月份不匹配",
                    729: "已经购买过了",
                    732: "活动已经下线",
                    737: "今日物品余量不足"
                };
                if (o[i]) {
                    r.show("fail", o[i])
                } else if (s[n]) {
                    r.show("fail", s[n])
                }
                a && a.call(null, e)
            }
            ;
            var s = t.type;
            t.type = "service";
            if (t.apf == 1) {
                this._orderMini(s, t).done(function(n) {
                    var r = "V1_PC_QZ_1.0.0_0_IDC_B";
                    var o = t.aid || "act";
                    var a = n.business_type || "0";
                    t.codes = n.code || "";
                    t.actid = n.vip_ma || "";
                    t.pf = "qzone_m_qq-1000-html5-1000-" + o + "*" + r + "$a" + parseInt(t.ruleid) + "$b" + a + "$x$t1";
                    t.aid = encodeURIComponent(JSON.stringify({
                        apf: "1",
                        preorder_bill: n.billno
                    }));
                    i(["id", "ruleid", "adv_ref", "apf", "advid"]).each(function(e, i) {
                        try {
                            delete t[i]
                        } catch (e) {
                            t[i] = undefined
                        }
                    });
                    e.resolve(t)
                })
            } else {}
            return e
        },
        _orderMini: function(e, t) {
            var a = i.Deferred();
            var s = this;
            var c = {
                vip: 1,
                deluxeOpen: 2,
                deluxe: 5,
                star: 3,
                deluxeStar: 4
            }[e];
            o.post("http://activity.qzone.qq.com/fcg-bin/fcg_qzact_minipay_preorder", {
                actid: t.id,
                ruleid: t.ruleid,
                extend_field: n.toUrlParam({
                    platform: 1,
                    adv_ref: t.adv_ref || "",
                    advid: t.advid || ""
                }),
                vip_type: c
            }).done(function(e) {
                a.resolve(e.data)
            }).fail(function(e) {
                if (typeof t.onCustomMessage === "function") {
                    t.onCustomMessage.apply(s, [e, errCodeMap, r])
                } else {
                    r.show("fail", e.message || "下单失败")
                }
                a.reject(e)
            });
            return a.promise()
        },
        _openMidas: function() {
            var e = this.options;
            e.itemVersion = e.itemVersion || 0;
            var t = null;
            if (e.itemVersion.toString() === "2") {
                t = this._orderMidasV2
            } else {
                t = this._orderMidas
            }
            t.apply(this).done(function(t) {
                require.async(location.protocol + "//fusion.qzone.qq.com/fusion_loader?appid=" + e.appid + "&platform=website", function() {
                    if (!window.fusion2) {
                        return
                    }
                    var i = {
                        title: e.name,
                        param: t.url_params,
                        sandbox: !!e.sandbox,
                        onSuccess: e.onSuccess,
                        onClose: e.onClose,
                        onLoad: e.onLoad
                    };
                    if (e.itemVersion.toString() === "2") {
                        i.version = 2
                    }
                    window.fusion2.dialog.buy(i)
                })
            })
        },
        _orderMidas: function() {
            var e = i.Deferred();
            var t = this.options
              , n = this;
            if (t.apf != 1) {
                return e.reject()
            }
            t.appid = l.APP_ID[t.itemType || "act"];
            o.post("http://pay.qzone.qq.com/fcg-bin/fcg_qzact_pic_order", {
                pfkey: "pfkey",
                appid: t.appid,
                actid: t.id,
                ruleid: t.ruleid,
                advid: t.advid || "",
                buy_num: t.count || 1,
                aid: t.aid,
                req_price: t.itemPrice,
                item_pic: t.itemPic,
                item_name: t.itemName,
                item_desc: t.itemDesc,
                fri_uin: t.friUin,
                disable_snspay: t.disableSnspay,
                card_id: t.cardId || "",
                card_code: t.cardCode || ""
            }).done(function(t) {
                e.resolve(t.data)
            }).fail(function(i) {
                var o = {
                    "-5053": "订单冲突，请先支付上一个订单，或等待15分钟后再操作",
                    "-5057": "一次只能购买一份",
                    "-7024": "您的订单中购买数量有问题，请重新下单",
                    "-7037": "库存不足"
                };
                if (typeof t.onCustomMessage === "function") {
                    t.onCustomMessage.apply(n, [i, o, r])
                } else {
                    r.show("fail", o[i.subcode] || i.message || "下单失败")
                }
                e.reject(i)
            });
            return e.promise()
        },
        _orderMidasV2: function() {
            var e = i.Deferred();
            var t = this.options
              , n = this;
            if (t.apf != 1) {
                return e.reject()
            }
            t.appid = l.APP_ID[t.itemType || "act"];
            o.post("http://pay.qzone.qq.com/fcg-bin/fcg_make_order", {
                pfkey: "pfkey",
                appid: t.appid,
                actid: t.id,
                ruleid: t.ruleid,
                advid: t.advid || "",
                buy_num: t.count || 1,
                aid: t.aid,
                req_price: t.itemPrice,
                item_pic: t.itemPic,
                item_name: t.itemName,
                item_desc: t.itemDesc,
                fri_uin: t.friUin,
                disable_snspay: t.disableSnspay,
                card_id: t.cardId || "",
                card_code: t.cardCode || ""
            }).done(function(t) {
                e.resolve(t.data)
            }).fail(function(i) {
                var o = {
                    "-5053": "订单冲突，请先支付上一个订单，或等待15分钟后再操作",
                    "-5057": "一次只能购买一份",
                    "-7024": "您的订单中购买数量有问题，请重新下单",
                    "-7037": "库存不足"
                };
                if (typeof t.onCustomMessage === "function") {
                    t.onCustomMessage.apply(n, [i, o, r])
                } else {
                    r.show("fail", o[i.subcode] || i.message || "下单失败")
                }
                e.reject(i)
            });
            return e.promise()
        }
    };
    return l
});
define.pack("./qboss", ["jquery", "./ajax", "./user"], function(require, e, t) {
    var i = require("jquery");
    var n = require("./ajax")
      , r = require("./user");
    var o = {
        init: function(e) {
            var t = this;
            t.id = e.id || e.advId;
            t.postrace = null;
            t.pingTypeMap = {
                click: 1,
                close: 2
            };
            return t
        },
        get: function(e) {
            e = e || {};
            var t = this
              , r = i.Deferred()
              , o = t.id
              , a = {
                single: "http://boss.qzone.qq.com/fcg-bin/fcg_get_strategy",
                multi: "http://boss.qzone.qq.com/fcg-bin/fcg_get_multiple_strategy"
            };
            a = a[e.type] || a["single"];
            n.request({
                url: a,
                type: "get",
                dataType: "jsonp",
                data: {
                    board_id: o,
                    need_cnt: e.count
                },
                jsonpQzone: true,
                success: function(e) {
                    var i = e && e.code, n;
                    if (i == 0) {
                        n = e.data && e.data[o] && e.data[o].items;
                        if (n) {
                            t.postrace = n && n[0] && n[0].postrace;
                            r.resolve(n)
                        } else {
                            r.reject("没有数据")
                        }
                    } else {
                        r.reject(e && e.message || "看起来出了点问题，请稍后再试")
                    }
                },
                error: function() {
                    r.resolve("服务器出了点问题，我们正在紧急修复。")
                }
            });
            return r
        },
        ping: function(e, t) {
            var i = this
              , n = e && i.pingTypeMap[e];
            var o = r.getUin() || 1e4;
            t = t || i.postrace;
            if (n && t) {
                setTimeout(function() {
                    (new Image).src = (location.protocol === "https:" ? "https://h5.qzone.qq.com/proxy/domain/" : "http://") + "boss.qzone.qq.com/fcg-bin/fcg_rep_strategy?from=1&uin=" + o + "&postype=" + n + "&postrace=" + t + "&_=" + +new Date
                }, 0)
            }
        },
        getWapUrl: function(e, t, i) {
            return (location.protocol === "https:" ? "https://h5.qzone.qq.com/proxy/domain/" : "http://") + "boss.qzone.qq.com/fcg-bin/fcg_rep_strategy_for_wap?from=1&uin=" + t + "&oper_type=2&traceinfo=" + i + "&link=" + e
        }
    };
    return o
});
define.pack("./revenue", ["jquery", "./ajax", "./browser", "./user", "./msg", "./tmpl", "./pay.mobile", "./pay.pc", "./pay.dialog", "./util"], function(require, e, t) {
    var i = require("jquery")
      , n = require("./ajax")
      , r = require("./browser")
      , o = require("./user")
      , a = require("./msg")
      , s = require("./tmpl")
      , c = r.isMobile ? require("./pay.mobile") : require("./pay.pc")
      , l = require("./pay.dialog")
      , u = require("./util");
    var d = u.parseUrl(location.href).params || {};
    var p = {
        jsonp: function(e, t, r) {
            var o = i.Deferred();
            n.request(i.extend({
                dataType: "jsonp",
                url: e,
                qzoneCoolCbName: true,
                data: t,
                success: function(e) {
                    if (e.code == 0) {
                        o.resolve(e)
                    } else {
                        o.reject(e)
                    }
                },
                error: function() {
                    o.reject({})
                }
            }, r || {}));
            return o
        },
        post: function(e, t, o) {
            t = t || {};
            var a = i.Deferred();
            var s = r.isMobile ? "json" : "formsender";
            n.request(i.extend({
                dataType: "json",
                url: e,
                type: "POST",
                data: i.extend(t, {
                    format: s
                }),
                success: function(e) {
                    if (e.code == 0) {
                        a.resolve(e)
                    } else {
                        a.reject(e)
                    }
                },
                error: function() {
                    a.reject({})
                }
            }, o || {}));
            return a
        },
        draw: function(e, t) {
            var n = i.Deferred();
            p.post("http://activity.qzone.qq.com/fcg-bin/fcg_qzact_lottery", {
                actid: e,
                ruleid: t,
                card_id: d.card_id || "",
                card_code: d.card_code || ""
            }).done(function(e) {
                n.resolve(e.data || [])
            }).fail(function(e) {
                n.reject(e)
            });
            return n
        },
        award: function(e, t) {
            var n = i.Deferred();
            p.post("http://activity.qzone.qq.com/fcg-bin/fcg_qzact_present", {
                actid: e,
                ruleid: t,
                card_id: d.card_id || "",
                card_code: d.card_code || ""
            }).done(function(e) {
                n.resolve(e.data || [])
            }).fail(function(e) {
                n.reject(e)
            });
            return n
        },
        budget: function(e, t, n) {
            var r = i.Deferred();
            p.jsonp("http://activity.qzone.qq.com/fcg-bin/fcg_qzact_count", {
                actid: e,
                ruleid: t,
                countid: n
            }).done(function(e) {
                r.resolve(e.data || {})
            }).fail(function(e) {
                r.reject(e)
            });
            return r
        },
        actInfo: function(e) {
            var t = i.Deferred();
            p.jsonp("http://activity.qzone.qq.com/fcg-bin/fcg_qzact_act", {
                actid: e
            }).done(function(e) {
                t.resolve(e.data || {})
            }).fail(function(e) {
                t.reject(e)
            });
            return t
        },
        picInfo: function(e, t, n, r) {
            var o = i.Deferred();
            var a = c.APP_ID[n || "act"] || l.APP_ID[n];
            p.jsonp("http://pay.qzone.qq.com/fcg-bin/fcg_qzact_pic_info", {
                appid: a,
                actid: e,
                ruleid: t,
                buy_num: r
            }).done(function(e) {
                o.resolve(e.data || {})
            }).fail(function(e) {
                var t = {
                    "-5053": "订单冲突，请先支付上一个订单，或等待15分钟后再操作",
                    "-5057": "一次只能购买一份",
                    "-7024": "您的订单中购买数量有问题，请重新下单"
                };
                if (t[e.subcode]) {
                    e.message = t[e.subcode]
                }
                o.reject(e)
            });
            return o
        },
        luckyList: function(e) {
            var t = i.Deferred();
            p.jsonp("http://activity.qzone.qq.com/fcg-bin/fcg_qzact_lucky", {
                actid: e
            }).done(function(e) {
                t.resolve(e.data && e.data.list || [])
            }).fail(function(e) {
                t.reject(e)
            });
            return t
        },
        prizeRecord: function(e) {
            var t = i.Deferred();
            p.jsonp("http://activity.qzone.qq.com/fcg-bin/fcg_qzact_record", {
                actid: e
            }).done(function(e) {
                t.resolve(e.data && e.data.list || [])
            }).fail(function(e) {
                t.reject(e)
            });
            return t
        },
        prizeRecordAll: function(e, t, n) {
            var r = i.Deferred();
            p.jsonp("http://activity.qzone.qq.com/cgi-bin/v2/fcg_query_user_vipcenter_prize_list", {
                act_id: e,
                begin: t || 0,
                count: n || 50
            }).done(function(e) {
                r.resolve(e.data && e.data.list || [])
            }).fail(function(e) {
                r.reject(e)
            });
            return r
        },
        shareAward: function(e, t, n) {
            var o = i.Deferred();
            var a = {
                info: {
                    title: n.title,
                    summary: n.summary,
                    url: n.url,
                    pic: n.pic
                },
                height: i(window).scrollTop() + 200 + "px",
                util: u
            };
            var c;
            var l = function() {
                if (c) {
                    c.remove();
                    c = null
                }
            };
            var d = n.url + (n.url.indexOf("?") === -1 ? "?" : "&") + "share_nshowflag=3";
            d = d.replace(/\/\/act\.qzone\.qq\.com\//, "//h5.qzone.qq.com/act/proxy/");
            var f = {
                actid: e,
                ruleid: t,
                sReason: n.summary,
                sTitle: n.title,
                sPicUrl: n.pic,
                sUrl: d
            };
            var m = function() {
                var e = false;
                c.on("click", "#J_share_cancel,#J_share_close", function() {
                    l()
                }).on("click", "#J_share_ok", function() {
                    if (e) {
                        return
                    }
                    e = true;
                    p.post("http://activity.qzone.qq.com/fcg-bin/fcg_qzact_share_and_accept_prize", f).done(function(t) {
                        e = false;
                        o.resolve(t.data || {});
                        l()
                    }).fail(function(t) {
                        e = false;
                        o.reject(t);
                        l()
                    })
                })
            };
            var g, h;
            if (r.isMobile) {
                g = "//qzonestyle.gtimg.cn/qz-act/public/mobile/dialog-share-m.css";
                h = "shareDialogMobile"
            } else {
                g = "//qzonestyle.gtimg.cn/qz-act/public/pc/dialog-share.css";
                h = "shareDialogPc"
            }
            require.async(g, function() {
                c = i(s[h](a)).appendTo(document.body);
                c && m()
            });
            return o
        }
    };
    return p
});
define.pack("./router", ["jquery", "./util", "./stat"], function(require, e, t) {
    var i = require("jquery")
      , n = require("./util")
      , r = require("./stat");
    var o = false, a = "onhashchange"in window, s = document.documentMode, c = a && (s === void 0 || s > 7), l = "addEventListener"in window, u, d, p = (t.uri || t.id).match(/^[^\/]*\/\/[^\/]*/)[0] + location.pathname.substring(0, location.pathname.lastIndexOf("/") + 1), f = "&";
    var m, g;
    e.start = function(e) {
        if (!o) {
            if (!c) {} else if (l) {
                window.addEventListener("hashchange", h, false)
            } else if (a) {
                window.onhashchange = h
            }
            o = true;
            u = e;
            h()
        }
    }
    ;
    e.setting = function(e) {
        e = e || {};
        p = e.basePath || p;
        f = e.splitTag || "&"
    }
    ;
    e.go = function(e, t) {
        if (!e) {
            return
        }
        e = "#!/" + e;
        switch (t) {
        case "replace":
            location.replace(e);
            if (!c) {
                h()
            }
            break;
        case "popover":
            g = location.href.split("#")[0] + e;
            h();
            break;
        default:
            location.hash = e;
            if (!c) {
                h()
            }
        }
    }
    ;
    function h(e) {
        g = g || window.location.href;
        if (!o)
            return;
        var t = v(m || e && e.oldURL);
        var i = v(g);
        m = g;
        g = undefined;
        _(t, i)
    }
    function v(e) {
        e = e || "";
        var t = window.decodeURIComponent;
        var i = e.indexOf("#!/")
          , r = i >= 0 ? e.slice(i + 3) : "";
        var o = r.indexOf("?")
          , a = o >= 0 ? r.slice(o + 1) : "";
        var s = o >= 0 ? r.slice(0, o) : r;
        var c = a.split(f)
          , l = {};
        for (var u = 0; u < c.length; u++) {
            var d = c[u].replace(/\+/g, "%20")
              , p = d.indexOf("=")
              , m = ~p ? d.slice(0, p) : d
              , g = ~p ? d.slice(p + 1) : "";
            try {
                m = t(m);
                g = t(g)
            } catch (e) {
                console.log(e)
            }
            l[m] = n.encodeHtml(g)
        }
        return {
            url: e,
            page: s,
            state: l
        }
    }
    function _(t, i) {
        if (d && t.page === i.page) {
            d.show(i.state)
        } else if (i.page === "") {
            e.go(u, "replace")
        } else {
            var n = p + i.page;
            seajs.use(n, function(t) {
                if (t) {
                    if (d && d.hide)
                        d.hide();
                    if (t.show) {
                        t.show(i.state);
                        r.reportPV("", n.replace("#!", "__").replace(f, "_"))
                    }
                    d = t
                } else {
                    e.go(u, "replace")
                }
            })
        }
    }
});
define.pack("./share", ["jquery", "./browser", "./msg", "./user", "./util", "./ajax", "./stat", "./cookie", "./tmpl"], function(require, e, t) {
    var i = require("jquery");
    var n = require("./browser")
      , r = require("./msg")
      , o = require("./user")
      , a = require("./util")
      , s = require("./ajax")
      , c = require("./stat")
      , l = require("./cookie")
      , u = require("./tmpl");
    var d = function() {
        var e = {};
        return {
            trigger: function(t) {
                var i = e[t];
                if (!i) {
                    return false
                }
                Array.prototype.shift.call(arguments);
                for (var n = 0, r; r = i[n]; ++n) {
                    r.apply(null, arguments)
                }
            },
            bind: function(t, i) {
                e[t] = e[t] || [];
                e[t].push(i)
            }
        }
    }();
    function p(e) {
        require.async("wx_jssdk", function(t) {
            s.request({
                url: "http://activity.qzone.qq.com/fcg-bin/fcg_act_weixin_jssdk_sig",
                dataType: "jsonp",
                qzoneCoolCbName: true,
                data: {
                    url: location.href.replace(location.hash, "")
                },
                success: function(n) {
                    if (n.code === 0) {
                        var r = n.data;
                        t.config({
                            debug: false,
                            appId: r.appId,
                            timestamp: r.timestamp,
                            nonceStr: r.nonceStr,
                            signature: r.signature,
                            jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareQZone"]
                        });
                        t.error(function(e) {
                            if (e.errMsg === "config:invalid signature") {
                                c.returnCodeV4({
                                    domain: "activity.qzone.qq.com",
                                    cgi: "/activity/wxjssdk/invalid_signature",
                                    type: 3,
                                    code: 1,
                                    delay: 300
                                })
                            }
                        });
                        t.ready(function() {
                            var n = {
                                title: e.title,
                                desc: e.summary,
                                link: e.url,
                                imgUrl: e.pic,
                                type: "",
                                dataUrl: "",
                                cancel: function() {}
                            };
                            var r = function(e) {
                                return function() {
                                    d.trigger("share", {
                                        from: "wx",
                                        to: e,
                                        shareInfo: q
                                    })
                                }
                            };
                            t.onMenuShareQQ(i.extend({
                                success: r("qq")
                            }, n));
                            t.onMenuShareQZone(i.extend({
                                success: r("qzone")
                            }, n));
                            n.link = v(n.link);
                            t.onMenuShareAppMessage(i.extend({
                                success: r("wx")
                            }, n));
                            if (e.swapTitleInWX) {
                                n.title = e.summary;
                                n.desc = e.title
                            }
                            t.onMenuShareTimeline(i.extend({
                                success: r("tl")
                            }, n))
                        })
                    }
                },
                error: function() {}
            })
        })
    }
    function f(e) {
        require.async("qqapi", function() {
            window.mqq.ui.setOnShareHandler(function(t) {
                var i = {
                    appid: "100384226",
                    share_type: t,
                    back: true,
                    share_url: e.url,
                    title: e.title,
                    desc: e.summary,
                    image_url: e.pic
                };
                if (t == 2 || t == 3) {
                    i.share_url = v(h(i.share_url))
                } else {
                    i.share_url = h(i.share_url)
                }
                if (t == 3 && e.swapTitleInWX) {
                    i.title = e.summary;
                    i.desc = e.title
                }
                window.mqq.ui.shareMessage(i, function(e) {
                    if (e.retCode === 0) {
                        d.trigger("share", {
                            from: "qq",
                            to: ["qq", "qzone", "wx", "tl"][t],
                            shareInfo: q
                        })
                    }
                })
            })
        })
    }
    function m(e) {
        require.async("qzoneapi", function() {
            if (n.platform === "ios" && n.compareVersion("7.4", "nlt")) {
                window.mqq.invoke("ui", "setOnShareHandler", function(t) {
                    var i = {
                        appid: "100384226",
                        share_type: t,
                        back: true,
                        share_url: e.url,
                        title: e.title,
                        desc: e.summary,
                        image_url: e.pic
                    };
                    if (t == 2 || t == 3) {
                        i.share_url = v(i.share_url)
                    }
                    if (t == 3 && e.swapTitleInWX) {
                        i.title = e.summary;
                        i.desc = e.title
                    }
                    window.mqq.invoke("ui", "shareMessage", i, function(e) {
                        if (e.retCode === 0) {
                            d.trigger("share", {
                                from: "qzone",
                                to: ["qq", "qzone", "wx", "tl"][t],
                                shareInfo: q
                            })
                        }
                    })
                })
            } else if (QZAppExternal && QZAppExternal.setShare) {
                var t = []
                  , i = []
                  , r = []
                  , o = [];
                for (var a = 0; a < 5; a++) {
                    t.push(e.pic);
                    if (a === 4 && e.swapTitleInWX) {
                        i.push(e.summary);
                        r.push(e.title)
                    } else {
                        i.push(e.title);
                        r.push(e.summary)
                    }
                    if (a === 3 || a === 4) {
                        o.push(v(e.url))
                    } else {
                        o.push(e.url)
                    }
                }
                QZAppExternal.setShare(function(e) {}, {
                    type: "share",
                    image: t,
                    title: i,
                    summary: r,
                    shareURL: o
                })
            }
        })
    }
    function g(e) {
        e = i.extend({}, e);
        e.title = e.title || document.title || "";
        e.summary = e.summary || e.title;
        e.url = e.url || location.href;
        e.pic = e.pic || "";
        q = e;
        switch (n.client) {
        case "wx":
            p(e);
            break;
        case "qq":
            f(e);
            break;
        case "qzone":
            m(e);
            break
        }
    }
    function h(e) {
        var t = ["m.qzone.com", "mobile.qzone.qq.com"];
        var n = a.parseUrl(e);
        if (-1 === i.inArray(n.host, t)) {
            return e
        }
        var r = n.params;
        for (var o in r) {
            if (r.hasOwnProperty(o)) {
                r[o] = a.decodeHtml(r[o])
            }
        }
        r.gourl = e;
        var s = location.host;
        if (s == "act.qzone.qq.com") {
            e = location.protocol + "//act.qzone.qq.com/proxy/share.html"
        } else {
            e = location.protocol + "//" + s + "/qzone/qzact/act/proxy/share.html"
        }
        return a.appendUrlParam(e, r, false)
    }
    function v(e) {
        if (e.indexOf("#wechat_qqauth") > -1) {
            return e
        }
        if (e.indexOf("#") > -1) {
            return e.replace(/#(.*)/, "#wechat_qqauth&$1")
        } else {
            return e + "#wechat_qqauth"
        }
    }
    function _() {
        var e = location.pathname
          , t = e.substring(0, e.lastIndexOf("/") + 1);
        c.reportPV("mall.qzone.qq.com", t + "share")
    }
    var q;
    var y = {
        initShare: function(e) {
            if (!e) {
                return
            }
            g(e)
        },
        getShareInfo: function() {
            return q
        },
        showArrow: function() {
            i(u.shareArrow()).on("touchend", function(e) {
                e.preventDefault();
                i(this).remove()
            }).appendTo(document.body);
            _()
        },
        share2Qzone: function(e) {
            var t = {
                info: {
                    title: e.title,
                    summary: e.summary,
                    url: e.url,
                    pic: e.pic
                },
                height: i(window).scrollTop() + 200 + "px",
                util: a
            };
            var o;
            var c = function() {
                if (o) {
                    o.remove();
                    o = null
                }
            };
            var l = e.url + (e.url.indexOf("?") === -1 ? "?" : "&") + "share_nshowflag=3";
            l = l.replace(/\/\/act\.qzone\.qq\.com\//, "//h5.qzone.qq.com/act/proxy/");
            var d = {
                sReason: e.summary,
                sTitle: e.title,
                sPicUrl: e.pic,
                sUrl: l
            };
            var p = n.isMobile ? "json" : "formsender";
            var f = function() {
                var e = false;
                o.on("click", "#J_share_cancel,#J_share_close", function() {
                    c()
                }).on("click", "#J_share_ok", function() {
                    if (e) {
                        return
                    }
                    e = true;
                    s.request({
                        dataType: "json",
                        url: "http://activity.qzone.qq.com/fcg-bin/fcg_act_spread_share_v2",
                        type: "POST",
                        data: i.extend(d, {
                            format: p
                        }),
                        success: function(t) {
                            if (!t.code) {
                                r.show("succ", "恭喜您，分享成功！")
                            } else {
                                r.show("fail", t && t.message || "系统繁忙，请稍后再试！")
                            }
                            e = false;
                            c()
                        },
                        error: function() {
                            e = false;
                            r.show("fail", "系统繁忙，请稍后再试！");
                            c()
                        }
                    })
                })
            };
            var m, g;
            if (n.isMobile) {
                m = "//qzonestyle.gtimg.cn/qz-act/public/mobile/dialog-share-m.css";
                g = "shareDialogMobile"
            } else {
                m = "//qzonestyle.gtimg.cn/qz-act/public/pc/dialog-share.css";
                g = "shareDialogPc"
            }
            require.async(m, function() {
                o = i(u[g](t)).appendTo(document.body);
                o && f()
            });
            _()
        },
        showShare: function(e, t) {
            var i = n.client;
            if (i === "qq" || i === "qzone") {
                e && g(e);
                require.async(i + "api", function() {
                    if (!t && window.mqq && mqq.ui && mqq.ui.showShareMenu) {
                        mqq.ui.showShareMenu()
                    } else {
                        y.showArrow()
                    }
                })
            } else if (i === "wx") {
                e && g(e);
                y.showArrow()
            } else {
                y.share2Qzone(e)
            }
        },
        onShare: function(e) {
            d.bind("share", e)
        }
    };
    return y
});
define.pack("./stat", ["jquery", "./user", "./cookie", "./util", "./browser"], function(require, e, t) {
    var i = require("jquery")
      , n = require("./user")
      , r = require("./cookie")
      , o = require("./util")
      , a = require("./browser");
    var s = 1;
    var c = {};
    c._send = function(e, t, i, n) {
        t = t || 100;
        i = i || 0;
        if (n && typeof n.callback == "function") {
            i = i || 500
        }
        if (t < 100 && Math.random() * 100 > t) {
            if (n && typeof n.callback == "function") {
                n.callback()
            }
            return
        }
        var r = new Image;
        r.g_stat_reportId = s;
        window.g_stat_report = window.g_stat_report || {};
        window.g_stat_report[s] = r;
        s++;
        r.onload = r.onerror = r.ontimeout = function() {
            if (n && typeof n.callback == "function") {
                n.callback()
            }
            delete window.g_stat_report[this.g_stat_reportId]
        }
        ;
        if (i) {
            setTimeout(function() {
                r.src = e
            }, i)
        } else {
            r.src = e
        }
    }
    ;
    c._pgvGetUserInfo = function() {
        var e = document.cookie.match(/(^|;|\s)*pvid=([^;]*)(;|$)/);
        if (e && e.length > 2) {
            t = e[2]
        } else {
            var t = Math.round(Math.random() * 2147483647) * (new Date).getUTCMilliseconds() % 1e10;
            document.cookie = "pvid=" + t + "; path=/; domain=qq.com; expires=Sun, 18 Jan 2038 00:00:00 GMT;"
        }
        return "&pvid=" + t
    }
    ;
    c.reportPV = function(e, t, n) {
        e = e || "mall.qzone.qq.com";
        t = t || window.location && window.location.pathname || "/";
        n = i.extend({
            timeout: 500,
            referURL: document.referrer,
            referDomain: e
        }, n);
        try {
            var r = "//pingfore.qq.com/pingd";
            var o = [r, "?dm=", e, "&url=", t, "&tt=-&rdm=", n.referDomain, "&rurl=", escape(n.referURL), this._pgvGetUserInfo(), "&scr=-&scl=-&lang=-&java=1&cc=-&pf=-&tz=-8&ct=-&vs=3.3"].join("");
            c._send(o + "&emu=" + Math.random(), 100, n.timeout, n)
        } catch (e) {
            var a = ScriptEngine() + ScriptEngineMajorVersion() + "." + ScriptEngineMinorVersion();
            c._send("http://219.133.51.97/pingd?err=" + escape(e.message) + "&jsv=" + a + "&url=" + escape(location.href) + "&stone=" + Math.random())
        }
    }
    ;
    c.reportHotClick = function(e, t, n, r) {
        r = i.extend({
            x: 9999,
            y: 9999,
            timeout: 500,
            reportRate: 100
        }, r);
        t = t || "mall.qzone.qq.com";
        n = n || window.location && window.location.pathname || "/";
        var o;
        if (location.protocol === "https:") {
            o = "https://pingfore.qq.com/pingd"
        } else {
            o = "http://pinghot.qq.com/pingd"
        }
        var a = [o, "?dm=", t + ".hot", "&url=", escape(n), "&tt=-", "&hottag=", e, "&hotx=", r.x, "&hoty=", r.y, "&rand=", Math.random()].join("");
        c._send(a, r.reportRate, r.timeout, r)
    }
    ;
    c.returnCodeV4 = function() {
        var e = {
            domain: "",
            cgi: "",
            type: 1,
            code: 1,
            delay: 0,
            rate: 1
        }, t, r = [], o = 1e3, a;
        if (location.protocol === "https:") {
            t = "https://huatuocode.weiyun.com/code.cgi"
        } else {
            t = "http://c.isdspeed.qq.com/code.cgi"
        }
        function s() {
            var e = [];
            e.push("uin=" + (n.getUin() || 0), "key=" + "domain,cgi,type,code,time,rate", "r=" + Math.random());
            if (r && r.length) {
                var i = 0;
                while (r.length) {
                    if (e.join("&").length > 1e3) {
                        break
                    }
                    var o = r.shift();
                    e.push([i + 1, 1].join("_") + "=" + o[0]);
                    e.push([i + 1, 2].join("_") + "=" + o[1] + "?qzfl");
                    e.push([i + 1, 3].join("_") + "=" + o[2]);
                    e.push([i + 1, 4].join("_") + "=" + o[3]);
                    e.push([i + 1, 5].join("_") + "=" + o[4]);
                    e.push([i + 1, 6].join("_") + "=" + o[5]);
                    i++
                }
            }
            if (i > 0) {
                c._send(t + "?" + e.join("&"));
                r.length && setTimeout(s, 1e3)
            }
        }
        return function(t) {
            var c = require("./util")
              , l = i.extend({}, e, t)
              , u = n.getUin();
            l.rate = 1;
            if ((l.rate == 1 || Math.random() < 1 / l.rate) && t.cgi) {
                var d = c.parseUrl(t.cgi)
                  , p = d.pathname
                  , f = d.hostname;
                r.push([t.domain || f, p, l.type, l.code, l.delay, l.rate]);
                a && clearTimeout(a);
                a = setTimeout(s, o)
            }
        }
    }();
    c.text = {
        report: function(e, t) {
            t = t || "qzact";
            var i = "https:" == document.location.protocol ? "https://h5s.qzone.qq.com/log/post/" : "http://h5.qzone.qq.com/log/post/";
            var n = i + t;
            e += ";cookieUin:" + r.get("uin") + ";cookieSkey:" + r.get("skey") + ";cookiePskey:" + r.get("p_skey") + ";";
            l({
                type: "POST",
                data: "\n\n\n\n" + e + "\n\n\n",
                dataType: "json",
                url: n
            })
        }
    };
    c.compass = {
        report: function(e, t, r) {
            r = r || 1;
            if (Math.random() > r)
                return;
            var o = n.getUin();
            t = i.extend({
                app_id: t.app_id,
                actiontype: t.actiontype,
                subactiontype: t.subactiontype,
                reserves: t.reserves,
                reserves2: t.reserves2,
                uin: o,
                touin: o,
                qua: a.getQuaString().replace("Qzone/", ""),
                app_version: a.getQuaVersion(),
                platform: a.platform,
                page_type: 3,
                t: (new Date).getTime()
            }, t);
            (new Image).src = "https://h5.qzone.qq.com/report/compass/" + e + "?" + i.param(t)
        }
    };
    c.reportActCompass = function(e) {
        var t = {
            act_id: e.act_id,
            dst_idx1: n.getUin(),
            sum_idx1: 1
        };
        for (var r in e) {
            if (e.hasOwnProperty(r)) {
                t[r] = e[r] || t[r]
            }
        }
        var o = "https://h5.qzone.qq.com/report/compass/pf00045";
        (new Image).src = o + "?" + i.param(t)
    }
    ;
    c.speed = {
        _configId: 1,
        _config: {},
        init: function(e, t, i, n) {
            var r = {};
            r.flag = [e, t, i];
            r.base = n || 0;
            r.value = {};
            this._config[this._configId] = r;
            return this._configId++
        },
        add: function(e, t, i) {
            if (arguments.length < 3) {
                if (arguments[0]instanceof Array)
                    return this.addByArr(arguments[0]);
                i = t;
                t = e;
                e = this._configId - 1
            }
            if (!this._config[e]) {
                return
            }
            i = (i || 0) - this._config[e].base;
            this._config[e].value[t] = i
        },
        addByArr: function(e) {
            if (e && e.length) {
                var t = this._configId - 1
                  , i = this._config[t];
                if (i) {
                    for (var n = 0, r = e.length; n < r; n++) {
                        i.value[n + 1] = (e[n] || 0) - this._config[t].base
                    }
                }
            }
        },
        send: function(e, t) {
            t = t || 100;
            var i = Math.ceil(100 / t);
            var n = 500, r, o;
            var a;
            if (location.protocol === "https:") {
                a = "https://huatuospeed.weiyun.com/cgi-bin/r.cgi"
            } else {
                a = "http://isdspeed.qq.com/cgi-bin/r.cgi"
            }
            if (!!e) {
                o = this._config[e];
                var s = []
                  , l = o.value;
                for (var u in l) {
                    s.push(u + "=" + l[u])
                }
                r = [a, "?flag1=", o.flag[0], "&flag2=", o.flag[1], "&flag3=", o.flag[2], "&flag5=", i, "&", s.join("&"), "&_=", Math.random()].join("");
                c._send(r, t, n);
                delete this._config[e]
            } else {
                for (var d in this._config) {
                    o = this._config[d];
                    var s = []
                      , l = o.value;
                    for (var u in l) {
                        s.push(u + "=" + l[u])
                    }
                    r = [a, "?flag1=", o.flag[0], "&flag2=", o.flag[1], "&flag3=", o.flag[2], "&flag5=", i, "&", s.join("&"), "&_=", Math.random()].join("");
                    c._send(r, t, n);
                    n += 10
                }
                this._config = {}
            }
        }
    };
    var l = function() {
        return function(e) {
            var t = window, i = e.data || "", n;
            if (t.XDomainRequest) {
                n = new t.XDomainRequest
            } else {
                n = new t.XMLHttpRequest
            }
            e.url = e.url || "";
            n.open("POST", e.url, true);
            n.withCredentials = true;
            try {
                n.send(i || null)
            } catch (e) {}
            return {}
        }
    }();
    c.qboss = {
        _traceMap: {},
        _fixRuleId: function(e) {
            if (i.isArray(e)) {
                var t = [];
                for (var n = 0; n < e.length; n++) {
                    t.push(((e[n] + "").split("_") || [])[0])
                }
                return t
            } else {
                return ((e + "").split("_") || [])[0]
            }
        },
        parseTrace: function(e) {
            var t = e.split(".") || [];
            return {
                type: (t[0] || "").replace("l", ""),
                id: (t[1] || "").replace("a", ""),
                posId: (t[2] || "").replace("pn", ""),
                matterId: (t[6] || "").replace("m", ""),
                crowdId: (t[7] || "").replace("i", "")
            }
        },
        makeTraceStr: function(e, t) {
            var r = c.qboss._traceMap
              , o = Date.now();
            t = c.qboss._fixRuleId(t);
            var a = ["l" + e, "a" + (i.isArray(t) ? t.join(",") : t), "u" + n.getUin() || o, "t" + o, "x0", "y0", "z0"].join(".");
            if (i.isArray(t)) {
                for (var s = 0; s < t.length; s++) {
                    r[e + "-" + t[s]] = a
                }
            } else {
                r[e + "-" + t] = a
            }
            return a
        },
        getPrevTraceStr: function(e, t) {
            t = c.qboss._fixRuleId(t);
            if (c.qboss._traceMap[e]) {
                return c.qboss._traceMap[e]
            }
            return c.qboss._traceMap[e + "-" + t] || o.getUrlParam("qbossnewtrace")
        },
        getDeviceInfo: function() {
            var e = i.Deferred();
            setTimeout(function() {
                e.resolve({
                    identifier: Date.now()
                })
            }, 2e3);
            if (c.qboss._deviceInfo) {
                e.resolve(c.qboss._deviceInfo)
            } else {
                if (a.client === "qq" || a.client === "qzone") {
                    require.async(a.getApiUrl(), function() {
                        if (window.mqq && mqq.invoke) {
                            mqq.invoke("device", "getDeviceInfo", function(t) {
                                c.qboss._deviceInfo = t.data || t;
                                e.resolve(c.qboss._deviceInfo)
                            })
                        } else {
                            e.resolve({
                                identifier: Date.now()
                            })
                        }
                    })
                } else {
                    e.resolve({
                        identifier: Date.now()
                    })
                }
            }
            return e
        },
        getNetworkType: function() {
            var e = i.Deferred();
            setTimeout(function() {
                e.resolve(1)
            }, 2e3);
            if (c.qboss._networkType) {
                e.resolve(c.qboss._networkType)
            } else {
                if (a.client === "qq" || a.client === "qzone") {
                    require.async(a.getApiUrl(), function() {
                        if (window.mqq && mqq.invoke) {
                            mqq.invoke("device", "getNetworkInfo", function(t) {
                                c.qboss._networkType = (t.data || t).type;
                                e.resolve(c.qboss._networkType)
                            })
                        } else {
                            e.resolve(1)
                        }
                    })
                } else {
                    e.resolve(1)
                }
            }
            return e
        },
        report: function(e, t) {
            e.actId = e.actId || o.getUrlParam("actid");
            e.ruleId = e.ruleId || 0;
            t = t || o.getUrlParam("qbossnewtrace");
            if (!t || !e.actId) {
                return
            }
            var r = c.qboss
              , s = this.parseTrace(t);
            e.ruleId = c.qboss._fixRuleId(e.ruleId);
            var l = r.makeTraceStr(e.actId, e.ruleId)
              , u = {
                qq: n.getUin(),
                oper_time: Date.now(),
                trace_id: l,
                item_id: s.id,
                item_type: s.type,
                action_id: 101,
                busi_id: 1,
                module_id: s.posId,
                platform: a.platform,
                device: "unknown",
                network_type: "wifi",
                app_version: a.getQuaVersion(),
                report_source: a.platform === "android" ? 1 : a.platform === "ios" ? 2 : 3,
                extend_clickid: l,
                extend_ref_clickid: t,
                extend_adpos_clickid: t,
                extend_abtest: s.matterId,
                extend_crowid: s.crowdId,
                extend_actid: e.actId,
                extend_ruleid: i.isArray(e.ruleId) ? e.ruleId.join(",") : e.ruleId
            };
            r._traceMap["exposeTrace"] = l;
            (new Image).src = "https://h5.qzone.qq.com/report/compass/dc03232?" + o.toUrlParam(i.extend(u, e))
        }
    };
    return c
});
define.pack("./storage", ["jquery", "./cookie"], function(require, e, t) {
    var i = require("jquery")
      , n = require("./cookie");
    var r = {};
    r.cookie = n;
    r.localStorage = {
        name: "localStorage",
        isSupported: function() {
            try {
                return !!window.localStorage
            } catch (e) {
                return false
            }
        }(),
        init: function() {},
        set: function(e, t) {
            localStorage.setItem(e, t)
        },
        get: function(e) {
            return localStorage.getItem(e)
        },
        del: function(e) {
            localStorage.removeItem(e)
        },
        clear: function() {
            localStorage.clear()
        }
    };
    r.globalStorage = {
        name: "globalStorage",
        isSupported: !!window.globalStorage,
        db: null,
        init: function() {
            this.db = globalStorage[document.domain]
        },
        set: function(e, t) {
            try {
                this.db.setItem(e, t);
                return 1
            } catch (e) {
                return 0
            }
        },
        get: function(e) {
            var t;
            try {
                t = this.db.getItem(e);
                t = t && t.value || t
            } catch (e) {}
            return t
        },
        del: function(e) {
            try {
                this.db.removeItem(e)
            } catch (e) {}
        },
        clear: function() {
            try {
                for (var e in this.db) {
                    this.db.removeItem(e)
                }
            } catch (e) {}
        }
    };
    r.userData = {
        name: "userData",
        isSupported: !!window.ActiveXObject,
        db: null,
        _DB_NAME: "MALLV8_LOCAL_STORAGE",
        init: function() {
            this.db = document.documentElement || document.body;
            this.db.addBehavior("#default#userdata");
            this.db.load(this._DB_NAME)
        },
        set: function(e, t) {
            var i = this.db.expires.toString();
            if (i !== "" && i.indexOf("1983") !== -1) {
                this.db.expires = new Date(+new Date + 365 * 864e5).toUTCString()
            }
            try {
                this.db.setAttribute(e, t);
                this.db.save(this._DB_NAME);
                return 1
            } catch (e) {
                return 0
            }
        },
        get: function(e) {
            this.db.load(this._DB_NAME);
            return this.db.getAttribute(e)
        },
        del: function(e) {
            this.db.removeAttribute(e);
            this.db.save(this._DB_NAME)
        },
        clear: function() {
            this.db.expires = new Date(4176288e5).toUTCString();
            this.db.save(this._DB_NAME)
        }
    };
    r._default = {
        name: "_default",
        isSupported: true,
        init: function() {},
        set: function() {},
        get: function() {},
        del: function() {},
        clear: function() {}
    };
    r.global = {
        _priority: ["localStorage", "globalStorage", "userData", "cookie", "_default"],
        _inited: false,
        _db: null,
        _init: function() {
            for (var e in this._priority) {
                var t = this._priority[e];
                if (r[t].isSupported) {
                    this._db = r[t];
                    this._db.init();
                    break
                }
            }
            this._inited = true
        },
        set: function(e, t) {
            if (!this._inited) {
                this._init()
            }
            this._db.set(e, t, "qq.com", "/", 24 * 30)
        },
        get: function(e) {
            if (!this._inited) {
                this._init()
            }
            return this._db.get(e)
        },
        del: function(e) {
            if (!this._inited) {
                this._init()
            }
            this._db.del(e)
        },
        clear: function() {
            if (!this._inited) {
                this._init()
            }
            this._db.clear()
        }
    };
    i.extend(r, r.global);
    return r
});
define.pack("./ui", ["jquery", "./util", "./browser"], function(require, e, t) {
    var i = require("jquery")
      , n = require("./util")
      , r = require("./browser");
    e.showPay = function() {
        var e = "__QZACT_PAY_POP";
        window[e] = window[e] || {};
        return function(t, n) {
            require.async("v8/engine/popup/dialog", function(r) {
                var o = i.param(n);
                var a = r({
                    title: t || "  ",
                    skin: "dialog-s",
                    width: "460px",
                    height: "300px",
                    padding: "",
                    fixed: true,
                    content: "<div></div>",
                    ok: false,
                    onshow: function() {
                        var t = this.id;
                        var i = location.protocol + "//qzs.qzone.qq.com/qzone/mall/app/pay_for_vip/v4/index.html";
                        var n = '<iframe height="100%" src="' + i + "#closeDialogFn=" + e + ".closeDialog_" + t + "&" + o + '" frameborder="0" scrolling="no" allowTransparency="true"></iframe>';
                        this.contentNode.innerHTML = n;
                        window[e]["closeDialog_" + t] = function() {
                            seajs.use("v8/engine/popup/dialog", function(i) {
                                i.get(t).close();
                                window[e]["closeDialog_" + t] = null;
                                delete window[e]["closeDialog_" + t]
                            })
                        }
                    }
                });
                a.showModal()
            })
        }
    }();
    e.showRecord = function(e, t) {
        var i = location.protocol + "//qzs.qzone.qq.com/qzone/qzact/common.m/record/v2/index.html?act_id=" + e + (t ? "&all=1" : "");
        if (r.platform === "pc") {
            var o = arguments;
            require.async("qzact/common.pc/record/index", function(e) {
                e.show.apply(e, o)
            })
        } else if (r.client === "qq") {
            require.async("qqapi", function() {
                mqq.ui.openUrl({
                    url: i,
                    target: 1,
                    style: 3
                })
            })
        } else if (r.client === "qzone") {
            require.async("qzoneapi", function() {
                mqq.invoke("ui", "openUrl", {
                    url: i,
                    target: 1,
                    style: 3
                })
            })
        } else {
            n.jumpto(i)
        }
    }
    ;
    e.showAddress = function(e) {
        var t = location.protocol + "//qzs.qzone.qq.com/qzone/qzact/common.m/address/index.html?act_id=" + e;
        if (r.platform === "pc") {
            var i = arguments;
            require.async("qzact/common.pc/address/index", function(e) {
                e.show.apply(e, i)
            })
        } else if (r.client === "qq") {
            require.async("qqapi", function() {
                mqq.ui.openUrl({
                    url: t,
                    target: 1,
                    style: 3
                })
            })
        } else if (r.client === "qzone") {
            require.async("qzoneapi", function() {
                mqq.invoke("ui", "openUrl", {
                    url: t,
                    target: 1,
                    style: 3
                })
            })
        } else {
            n.jumpto(t)
        }
    }
});
define.pack("./user", ["jquery", "./storage", "./util", "./browser"], function(require, exports, module) {
    var $ = require("jquery")
      , cookie = require("./storage").cookie
      , util = require("./util")
      , browser = require("./browser");
    var isMobile = browser.isMobile;
    function getparams(e) {
        e = e || location.search;
        var t = {}, i = e.replace(/[\?\#]/g, "&").split("&"), n = i.length, r = 0, o;
        for (; r < n; r++) {
            if (!i[r]) {
                continue
            }
            o = i[r].split("=");
            t[o.shift()] = util.encodeHtml(decodeURIComponent(o.join("=")))
        }
        if (t.sid) {
            t.sid = encodeURIComponent(t.sid)
        }
        return t
    }
    function cutStrWithEmoji(e, t) {
        if (!e || e.length <= t)
            return e;
        var i = /^\[em\]e\d{3,10}\[\/em\]/;
        var n = "";
        var r = 0;
        while (r < t && e) {
            var o = e.match(i);
            var a = o && o.length ? o[0] : e.substring(0, 1);
            n += a;
            e = e.replace(a, "");
            r++
        }
        return n + (e ? "..." : "")
    }
    var CACHE, DEFER;
    var mod = {
        _getGParams: function() {
            var e = null;
            return function() {
                var t = e;
                if (!t) {
                    t = e = getparams((location.hash || "") + (location.search || ""))
                }
                return t
            }
        }(),
        isLogin: function() {
            var e = cookie.get;
            if (browser.client === "weishi") {
                return e("openid") && e("sSessionKey")
            } else if (/qzone.qq.com$/.test(location.hostname)) {
                return e("p_skey") && (e("p_uin") || e("uin"))
            } else if (/qq.com$/.test(location.hostname)) {
                return e("skey") && e("uin") || e("sSessionKey")
            } else {
                return e("p_skey") && (e("p_uin") || e("uin")) || e("skey") && e("uin")
            }
        },
        logout: function() {
            var e;
            $(["zzpaneluin", "zzpanelkey", "uin", "skey"]).each(function() {
                cookie.del(this)
            });
            $(["p_skey", "p_uin"]).each(function() {
                cookie.del(this, "qzone.qq.com")
            });
            cookie.del("keystr");
            if (isMobile) {
                e = location.href.replace(/([\?\&])sid=[^&]+(\?|\&|$)/, "$1").replace(/([\?\&])ticket=[^&]+(\?|\&|$)/, "$1").replace(/([\?\&])B_UID=[^&]+(\?|\&|$)/, "$1");
                if (location.href === e) {
                    location.reload()
                } else {
                    location.replace(e)
                }
            } else {
                location.reload()
            }
        },
        current: function() {
            var e = {};
            var t = {
                uin: function() {
                    var e = mod._getGParams();
                    var t = e.B_UID ? e.B_UID : e.uin ? e.uin : window.g_uin ? window.g_uin : "";
                    if (!mod.getSid()) {
                        return ""
                    }
                    return decodeURIComponent(t)
                },
                sid: function() {
                    var e = mod._getGParams();
                    var t = window.sid || e.sid || cookie.get("keystr") || (localStorage || {})["sid"] || cookie.get("sid");
                    return decodeURIComponent(t || "")
                }
            };
            return function(i) {
                var n = e[i];
                if (!n) {
                    n = t[i]();
                    e[i] = n
                }
                return n
            }
        }(),
        getUin: function() {
            var e = cookie.get, t, i, n = /\D/g;
            if (!!window.g_iLoginUin) {
                t = g_iLoginUin
            } else if (e("p_skey")) {
                t = (e("p_uin") || e("uin")).replace(n, "") - 0
            } else if (e("skey")) {
                t = e("uin").replace(n, "") - 0
            }
            i = t > 1e4 ? t : 0;
            return i
        },
        getSid: function() {
            var e = mod.current("sid");
            return e
        },
        getToken: function(e) {
            var t = document.createElement("a");
            t.href = e;
            if (e && t.hostname.indexOf("qzone.qq.com") >= 0) {
                str = cookie.get("p_skey") || cookie.get("skey")
            } else {
                str = cookie.get("skey")
            }
            if (util.hasWsAuth(e)) {
                str = cookie.get("sSessionKey")
            }
            return mod.getTokenByKey(str)
        },
        getTokenByKey: function(e) {
            var t = 5381
              , i = e;
            for (var n = 0, r = i.length; n < r; ++n) {
                t += (t << 5) + i.charAt(n).charCodeAt()
            }
            return t & 2147483647
        },
        showLogin: function() {
            var HAS_SHOW = false;
            return function(key, callbackFn, exappid, pOpt, sOpt) {
                if (isMobile) {
                    var returnUrl = location.href;
                    returnUrl = (returnUrl + "").replace(/(\?|&)sid=(.*?)(&|#|$)/, "$1$3").replace(/(\?|&)B_UID=(.*?)(&|#|$)/, "$1$3").replace("?&", "?").replace(/&{2}/, "&").replace(/[&?]$/, "");
                    var hideOneKeyLogin = 1;
                    if (-1 !== $.inArray(browser.client, ["wx", "QQBrowser"])) {
                        hideOneKeyLogin = 0
                    }
                    var opts = {
                        style: 9,
                        appid: 549000929,
                        pt_ttype: 1,
                        daid: 5,
                        pt_no_auth: 1,
                        pt_hide_ad: 1,
                        s_url: returnUrl,
                        pt_no_onekey: hideOneKeyLogin
                    };
                    if (browser.client === "wx") {
                        opts["pt_wxtest"] = 1
                    }
                    location.href = util.appendUrlParam(location.protocol + "//ui.ptlogin2.qq.com/cgi-bin/login", opts)
                } else {
                    if (HAS_SHOW) {
                        return false
                    }
                    HAS_SHOW = true;
                    var ptLoginParam = {
                        appid: 15000103,
                        s_url: location.href,
                        style: 20,
                        daid: 5,
                        pt_no_auth: 1
                    };
                    if (callbackFn) {
                        ptLoginParam.s_url = location.protocol + "//qzs.qzone.qq.com/qzone/qzact/common/proxy/login_jump.html";
                        ptLoginParam.target = "self"
                    }
                    var ptLoginUrl = util.appendUrlParam(location.protocol + "//xui.ptlogin2.qq.com/cgi-bin/xlogin", ptLoginParam);
                    require.async("qzact/common.pc/popup/popup", function(Popup) {
                        var popup = new Popup;
                        popup.html('<iframe src="' + ptLoginUrl + '" frameborder="0" scrolling="no" allowTransparency="true"></iframe>');
                        var $frame = $(popup.node).find("iframe");
                        $frame.attr({
                            width: 622,
                            height: 368
                        });
                        var ptlogin2_onClose = function() {
                            popup.close().remove();
                            HAS_SHOW = false
                        };
                        var ptlogin2_onResize = function(e, t) {
                            $frame.attr({
                                height: t,
                                width: e
                            });
                            popup.reset()
                        };
                        var ptlogin2_doAction = function(data) {
                            if (typeof data === "string") {
                                data = window.JSON ? JSON.parse(data) : function(str) {
                                    eval("var __pt_json=" + str);
                                    return __pt_json
                                }(data)
                            }
                            switch (data.action) {
                            case "close":
                                ptlogin2_onClose();
                                break;
                            case "resize":
                                ptlogin2_onResize(data.width, data.height);
                                break;
                            default:
                                break
                            }
                        };
                        if (typeof window.postMessage !== "undefined") {
                            window.onmessage = function(e) {
                                e = e || window.event;
                                ptlogin2_doAction(e.data)
                            }
                        } else {
                            navigator.ptlogin_callback = function(e) {
                                ptlogin2_doAction(e)
                            }
                        }
                        if (callbackFn) {
                            $frame[0]._login_success = function() {
                                ptlogin2_onClose();
                                callbackFn()
                            }
                        }
                        popup.showModal()
                    })
                }
            }
        }(),
        userinfo: function(e) {
            var t, i;
            if (typeof e == "object") {
                i = e
            } else {
                t = e
            }
            if (CACHE && DEFER && !t) {
                DEFER.resolve(CACHE)
            } else if (!DEFER) {
                DEFER = $.Deferred();
                var n;
                if (i && i.taotao) {
                    n = "http://taotao.qzone.qq.com/cgi-bin/fcg_get_user_info"
                } else {
                    n = "http://activity.qzone.qq.com/fcg-bin/v2/fcg_get_user_info"
                }
                var r = {
                    uin: mod.getUin(),
                    expire: 1,
                    emoji: 1
                };
                require.async("./ajax", function(e) {
                    e.request($.extend({
                        dataType: "jsonp",
                        url: n,
                        qzoneCoolCbName: true,
                        data: r,
                        success: function(e) {
                            var t = e && e.data;
                            var n = "";
                            if (t) {
                                if (isMobile) {
                                    window.g_uin = t.uin
                                }
                                if (t.vip) {
                                    n = '<i class="qz_vip_icon' + (t.deluxe ? "_fla" : "") + "_m_" + t.level + '"></i>';
                                    if (t.year) {
                                        n += '<img width="16" height="16" style="vertical-align:-4px;margin-left:1px;" src="//qzonestyle.gtimg.cn/ac/qzone_v5/client/year_vip_icon.png">'
                                    }
                                }
                                var r = i && i.emojiSize ? i.emojiSize : 16;
                                var o = /\<img class=/g;
                                var a = '<img style="width:' + r + "px;height:" + r + 'px" class=';
                                var s = util.transferUbbToImg(util.encodeHtml(t.nick));
                                s = s.replace(o, a);
                                var c = util.transferUbbToImg(util.encodeHtml(cutStrWithEmoji(t.nick, 8)));
                                c = c.replace(o, a);
                                CACHE = {
                                    nick: s,
                                    nickThumb: c,
                                    uin: t.uin,
                                    vip: {
                                        super: t.deluxe,
                                        deluxe: t.deluxe ? t.deluxe : t.luxuryvip,
                                        year: t.year ? t.year : t.nfvip,
                                        type: t.vip,
                                        level: t.level,
                                        vipexpire: t.vip_expire,
                                        supervipexpire: t.supervip_expire
                                    },
                                    vipIcon: n,
                                    nowtime: t.now
                                };
                                DEFER.resolve(CACHE)
                            } else {
                                DEFER.reject(e);
                                DEFER = null
                            }
                        },
                        error: function() {
                            DEFER.reject();
                            DEFER = null
                        }
                    }, i))
                })
            }
            return DEFER
        },
        avatar: function(e, t, i) {
            i = i || browser.client || "qzone";
            if (i === "qq") {
                var n = [40, 100, 140];
                t = t ? ~$.inArray(t, n) ? t : 100 : 100;
                return "//q.qlogo.cn/openurl/" + e + "/" + e + "/" + t + "?rf=qz_hybrid&c=" + util.base62().encode("qz_hybrid@" + e)
            } else {
                var n = [30, 50, 100];
                t = t ? ~$.inArray(t, n) ? t : 50 : 50;
                return "//qlogo" + (e % 4 + 1) + ".store.qq.com/qzone/" + e + "/" + e + "/" + t
            }
        },
        getAvatar: function(e, t, i) {
            return mod.avatar(e, t, i)
        }
    };
    return mod
});
define.pack("./util", ["jquery", "./storage"], function(require, e, t) {
    var i = require("jquery");
    var n = require("./storage").cookie;
    var r = {
        parseUrl: function(e) {
            var t = document.createElement("a"), i;
            t.href = e;
            i = {
                href: e,
                origin: undefined,
                protocol: t.protocol.replace(":", ""),
                hostname: t.hostname,
                host: t.hostname,
                port: t.port,
                search: t.search,
                hash: t.hash,
                pathname: t.pathname.replace(/^([^\/])/, "/$1"),
                params: function() {
                    var e = {}, i = t.search.replace(/^\?/, "").split("&"), n = i.length, o = 0, a;
                    for (; o < n; o++) {
                        if (!i[o]) {
                            continue
                        }
                        var s = i[o].indexOf("=");
                        e[i[o].substr(0, s)] = r.encodeHtml(decodeURIComponent(i[o].substr(s + 1)))
                    }
                    return e
                }()
            };
            return i
        },
        formatLeftTime: function(e) {
            var t = m = h = 0;
            t = parseInt(e / 1e3);
            t = t || 1;
            if (t >= 60) {
                m = parseInt(t / 60);
                t = t % 60
            }
            if (m >= 60) {
                h = parseInt(m / 60);
                m = m % 60
            }
            return [h ? h + "小时" : "", m ? m + "分" : "", t ? t + "秒" : ""].join("")
        },
        toUrlParam: function(e) {
            var t = [];
            if (!e) {
                return ""
            }
            for (var i in e) {
                if (e.hasOwnProperty(i)) {
                    if (typeof e[i] == "string" && e[i] || typeof e[i] == "number") {
                        t.push(i + "=" + encodeURIComponent(e[i]))
                    }
                }
            }
            return t.join("&")
        },
        appendUrlParam: function(e, t, i) {
            if (typeof t == "string") {
                t = t.replace(/^&/, "")
            } else {
                t = r.toUrlParam(t)
            }
            if (!t) {
                return e
            }
            if (i) {
                if (e.indexOf("#") == -1) {
                    e += "#" + t
                } else {
                    e += "&" + t
                }
            } else {
                if (e.indexOf("#") == -1) {
                    if (e.indexOf("?") == -1) {
                        e += "?" + t
                    } else {
                        e += "&" + t
                    }
                } else {
                    var n = e.split("#");
                    if (n[0].indexOf("?") == -1) {
                        e = n[0] + "?" + t + "#" + (n[1] || "")
                    } else {
                        e = n[0] + "&" + t + "#" + (n[1] || "")
                    }
                }
            }
            return e
        },
        encodeHtml: function(e) {
            return (e + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\x60/g, "&#96;").replace(/\x27/g, "&#39;").replace(/\x22/g, "&quot;")
        },
        decodeHtml: function(e) {
            return (e + "").replace(/&quot;/g, '"').replace(/&#0*39;/g, "'").replace(/&#0*96;/g, "`").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&")
        },
        cut: function(e, t, i) {
            e = String(e);
            t -= 0;
            i = i || "...";
            if (isNaN(t))
                return e;
            var n = e.length
              , r = Math.min(Math.floor(t / 2), n)
              , o = this._getRealLen(e.slice(0, r));
            for (; r < n && o < t; r++)
                o += 1 + (e.charCodeAt(r) > 255);
            return e.slice(0, o > t ? r - 1 : r) + (r < n ? i : "")
        },
        _getRealLen: function(e, t) {
            if (typeof e != "string")
                return 0;
            if (!t)
                return e.replace(/[^\x00-\xFF]/g, "**").length;
            else {
                var i = e.replace(/[\x00-\xFF]/g, "");
                return e.length - i.length + encodeURI(i).length / 3
            }
        },
        insertStyleSheet: function(e, t) {
            var i = document.createElement("style");
            i.type = "text/css";
            e && (i.id = e);
            document.getElementsByTagName("head")[0].appendChild(i);
            if (t) {
                if (i.styleSheet) {
                    i.styleSheet.cssText = t
                } else {
                    i.appendChild(document.createTextNode(t))
                }
            }
            return i.sheet || i
        },
        insertStyleLink: function(e, t) {
            var i = document.createElement("link");
            i.rel = "stylesheet";
            e && (i.id = e);
            document.getElementsByTagName("head")[0].appendChild(i);
            if (t) {
                i.href = t
            }
            return i
        },
        imgdpr: function() {
            if (window.devicePixelRatio > 1.3) {
                return imgdpr = "@2x."
            } else {
                return "."
            }
        },
        formatDate: function(e, t) {
            var i = t
              , n = "";
            i = i.replace(/yyyy|yy/, function(t) {
                if (t.length === 4) {
                    return e.getFullYear()
                } else {
                    return (e.getFullYear() + "").slice(2, 4)
                }
            }).replace(/MM|M/, function(t) {
                if (t.length === 2 && e.getMonth() < 9) {
                    return "0" + (e.getMonth() + 1)
                } else {
                    return e.getMonth() + 1
                }
            }).replace(/dd|d/, function(t) {
                if (t.length === 2 && e.getDate() < 10) {
                    return "0" + e.getDate()
                } else {
                    return e.getDate()
                }
            }).replace(/HH|H/, function(t) {
                if (t.length === 2 && e.getHours() < 10) {
                    return "0" + e.getHours()
                } else {
                    return e.getHours()
                }
            }).replace(/hh|h/, function(t) {
                var i = e.getHours();
                if (i > 11) {
                    n = "PM"
                } else {
                    n = "AM"
                }
                i = i > 12 ? i - 12 : i;
                if (t.length === 2 && i < 10) {
                    return "0" + i
                } else {
                    return i
                }
            }).replace(/mm/, function(t) {
                if (e.getMinutes() < 10) {
                    return "0" + e.getMinutes()
                } else {
                    return e.getMinutes()
                }
            }).replace(/ss/, function(t) {
                if (e.getSeconds() < 10) {
                    return "0" + e.getSeconds()
                } else {
                    return e.getSeconds()
                }
            }).replace("tt", n);
            return i
        },
        jumpto: function(e) {
            require.async("./user", function(t) {
                var i = {
                    sid: t.getSid(),
                    B_UID: t.getUin()
                };
                window.location.href = r.appendUrlParam(e, i)
            })
        },
        getUrlParam: function(e, t) {
            t = t || window.location;
            var i = new RegExp("(\\?|#|&)" + e + "=(.*?)(&|#|$)");
            var n = (t.href || "").match(i);
            return r.encodeHtml(decodeURIComponent(n ? n[2] : ""))
        },
        getAntiCsrfToken: function() {
            var e = 5381
              , t = n.get("skey");
            for (var i = 0, r = t.length; i < r; ++i) {
                e += (e << 5) + t.charAt(i).charCodeAt()
            }
            return e & 2147483647
        },
        formatNumber: function(e) {
            var e = e + "";
            if (e.length > 3) {
                return e.substr(0, e.length % 3) + (e.length % 3 ? "," : "") + e.substring(e.length % 3, e.length).match(/\d{3}/g).join(",")
            } else {
                return e
            }
        },
        formatQua: function(e) {
            var t = e.split("_");
            var i = /^(AND|IOS|IPH)$/;
            var n = /^(SQ|QZ)$/;
            var r = /^\d+\.\d+\.\d+$/;
            var o = /^\d+$/;
            var a;
            if (t.length == 7 && i.test(t[1]) && n.test(t[2]) && r.test(t[3]) && o.test(t[4])) {
                a = {
                    os: t[1],
                    version: t[3],
                    subVersion: t[4],
                    appType: t[5],
                    meybeQua: e
                }
            } else {
                a = {}
            }
            return a
        },
        base64: function() {
            var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            var t = function(e) {
                var t = {};
                for (var i = 0, n = e.length; i < n; i++)
                    t[e.charAt(i)] = i;
                return t
            }(e);
            var i = String.fromCharCode;
            var n = function(e) {
                if (e.length < 2) {
                    var t = e.charCodeAt(0);
                    return t < 128 ? e : t < 2048 ? i(192 | t >>> 6) + i(128 | t & 63) : i(224 | t >>> 12 & 15) + i(128 | t >>> 6 & 63) + i(128 | t & 63)
                } else {
                    var t = 65536 + (e.charCodeAt(0) - 55296) * 1024 + (e.charCodeAt(1) - 56320);
                    return i(240 | t >>> 18 & 7) + i(128 | t >>> 12 & 63) + i(128 | t >>> 6 & 63) + i(128 | t & 63)
                }
            };
            var r = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
            var o = function(e) {
                return e.replace(r, n)
            };
            var a = function(t) {
                var i = [0, 2, 1][t.length % 3]
                  , n = t.charCodeAt(0) << 16 | (t.length > 1 ? t.charCodeAt(1) : 0) << 8 | (t.length > 2 ? t.charCodeAt(2) : 0)
                  , r = [e.charAt(n >>> 18), e.charAt(n >>> 12 & 63), i >= 2 ? "=" : e.charAt(n >>> 6 & 63), i >= 1 ? "=" : e.charAt(n & 63)];
                return r.join("")
            };
            var s = function(e) {
                return e.replace(/[\s\S]{1,3}/g, a)
            };
            var c = function(e) {
                return s(o(e))
            };
            var l = function(e, t) {
                return !t ? c(e) : c(e).replace(/[+\/]/g, function(e) {
                    return e == "+" ? "." : "*"
                }).replace(/=/g, "")
            };
            var u = function(e) {
                return l(e, true)
            };
            var d = new RegExp(["[À-ß][-¿]", "[à-ï][-¿]{2}", "[ð-÷][-¿]{3}"].join("|"),"g");
            var p = function(e) {
                switch (e.length) {
                case 4:
                    var t = (7 & e.charCodeAt(0)) << 18 | (63 & e.charCodeAt(1)) << 12 | (63 & e.charCodeAt(2)) << 6 | 63 & e.charCodeAt(3)
                      , n = t - 65536;
                    return i((n >>> 10) + 55296) + i((n & 1023) + 56320);
                case 3:
                    return i((15 & e.charCodeAt(0)) << 12 | (63 & e.charCodeAt(1)) << 6 | 63 & e.charCodeAt(2));
                default:
                    return i((31 & e.charCodeAt(0)) << 6 | 63 & e.charCodeAt(1))
                }
            };
            var f = function(e) {
                return e.replace(d, p)
            };
            var m = function(e) {
                var n = e.length
                  , r = n % 4
                  , o = (n > 0 ? t[e.charAt(0)] << 18 : 0) | (n > 1 ? t[e.charAt(1)] << 12 : 0) | (n > 2 ? t[e.charAt(2)] << 6 : 0) | (n > 3 ? t[e.charAt(3)] : 0)
                  , a = [i(o >>> 16), i(o >>> 8 & 255), i(o & 255)];
                a.length -= [0, 0, 2, 1][r];
                return a.join("")
            };
            var g = function(e) {
                return e.replace(/[\s\S]{1,4}/g, m)
            };
            var h = function(e) {
                return f(g(e))
            };
            var v = function(e) {
                return h(e.replace(/[\.\*]/g, function(e) {
                    return e == "." ? "+" : "/"
                }).replace(/[^A-Za-z0-9\+\/]/g, ""))
            };
            var _ = {
                atob: g,
                btoa: s,
                fromBase64: v,
                toBase64: l,
                utob: o,
                encode: l,
                encodeURI: u,
                btou: f,
                decode: v
            };
            return _
        },
        base62: function() {
            return {
                decode: function(e) {
                    return r.base64().decode(e.replace(/ic/g, "/").replace(/ib/g, "+").replace(/ia/g, "i"))
                },
                encode: function(e) {
                    return r.base64().encode(e).replace(/[=i\+\/]/g, function(e) {
                        switch (e) {
                        case "=":
                            return "";
                        case "i":
                            return "ia";
                        case "+":
                            return "ib";
                        case "/":
                            return "ic";
                        default:
                            return ""
                        }
                    })
                }
            }
        },
        transferUbbToImg: function() {
            var e = window.devicePixelRatio > 1 ? "@2x" : "";
            return function(t) {
                var i = new RegExp("\\[em\\]e(\\d{3,10})\\[\\/em\\]","g"), n = t, r, o;
                while (r = i.exec(t)) {
                    o = "<img class='i-emoji-m' src='//qzonestyle.gtimg.cn/qzone/em/e" + r[1] + e + (r[1] < 200 ? ".png" : ".gif") + "' alt='表情' >";
                    n = n.replace(r[0], o)
                }
                return n
            }
        }(),
        hasWsAuth: function(e) {
            if (!e)
                return false;
            var t = ["fcg_qzact_count", "fcg_qzact_get_addr", "fcg_qzact_lottery", "fcg_qzact_lucky", "fcg_qzact_present", "fcg_qzact_set_addr"];
            var i = t.some(function(t) {
                return e.indexOf(t) >= 0
            });
            return i && n.get("wx_meteor")
        }
    };
    return r
});
define.pack("./webapp", [], function(require, e, t) {
    e.flatObj = function(e) {
        var t = {};
        var i = function(e, n) {
            var r = Object.prototype.toString.call(n), o, a;
            if (r !== "[object Object]" && r !== "[object Array]") {
                if (!e) {
                    t = n
                } else {
                    t[e] = n
                }
                return
            }
            for (var o in n) {
                a = (!!e ? e + "." : "") + (r === "[object Array]" ? "_Array" : "") + o;
                i(a, n[o])
            }
        };
        i("", e);
        return t
    }
});
define.pack("./tmpl", [], function(require, e, t) {
    var i = {
        encodeHtml: function(e) {
            return (e + "").replace(/[\x26\x3c\x3e\x27\x22\x60]/g, function(e) {
                return "&#" + e.charCodeAt(0) + ";"
            })
        },
        captchaDialog: function(e) {
            var t = []
              , i = function(e) {
                t.push(e)
            }
              , n = i;
            t.push('    <div id="captchaDialog">\n        <ul style="padding: 12px 0 11px 0;">\n            <li style="padding: 7px 0;display: list-item; text-align: -webkit-match-parent; ">\n                <span for="code" style="width: 83px; float: left; text-align: right; padding-right: 5px; padding-top: 7px;">\n                    <u id="label_vcode" style="text-decoration: none; white-space: nowrap; font-size: 12px">验证码：</u>\n                </span>\n                <input name="verifycode" type="text" style="ime-mode:disabled;padding: 5px;" class="inputstyle" id="verifycode" value="" maxlength="4" tabindex="3">\n            </li>\n            <li style="padding: 7px 0;">\n                <span style="width: 83px; float: left; text-align: right; padding-right: 5px; padding-top: 7px;">&nbsp;</span>\n                <u id="label_vcode_tip">请输入图中的字符不区分大小写</u>\n            </li>\n            <li  style="padding: 7px 0;">\n                <span for="pic" style="width: 83px; float: left; text-align: right; padding-right: 5px; padding-top: 7px;">&nbsp;</span>\n                <img class="j_imgVerify" width="130" height="53" src="');
            i(e.imgUrl);
            t.push('">\n                <label style="padding:0 0 0 8px; color: #535353; position: absolute; margin-top: 10px;"><a class="j_changeimg" tabindex="6" href="javascript:void(0);">看不清，换一张</a></label>\n            </li>\n        </ul>\n    </div>');
            return t.join("")
        },
        mtips: function(e) {
            var t = []
              , i = function(e) {
                t.push(e)
            }
              , n = i;
            if (!e.icon) {
                t.push('<div class="gb-tips" id="q_Msgbox"  ><div class="gb-tips-layer no-icon">');
                i(e.content);
                t.push("</div></div>")
            } else {
                t.push('<div class="gb-tips" id="q_Msgbox"  ><div class="gb-tips-layer"><i class="icon-');
                i(e.icon);
                t.push('"></i>');
                i(e.content);
                t.push("</div></div>")
            }
            t.push("");
            return t.join("")
        },
        mtips_css: function(e) {
            var t = []
              , i = function(e) {
                t.push(e)
            }
              , n = i;
            t.push(".gb-tips {position:fixed;width:100%;top:30%;text-align:center;z-index:9999;font-size:14px}\n.gb-tips .gb-tips-layer{position:relative;display:inline-block;max-width:54%;padding:8px 10px 8px 38px;text-align:left;line-height:22px;background:rgba(0,0,0,.7);color:#fff;border-radius:5px;max-width:220px}\n.gb-tips .gb-tips-layer.no-icon{padding:8px 10px}\n.gb-tips .gb-tips-layer .icon-hook{position:absolute;top:12px;left:12px;width:17px;height:12px;background-image:url(//qzonestyle.gtimg.cn/qz-act/public/mobile/img/tick-white.png?max_age=19830212&d=20130918105242);background-size:17px 12px}\n.gb-tips .gb-tips-layer .icon-info{position:absolute;top:7px;left:7px;width:24px;height:24px;background-image:url(//qzonestyle.gtimg.cn/qz-act/public/mobile/img/info-white.png?max_age=19830212&d=20130918105242);background-size:24px 24px}\n.gb-tips .gb-tips-layer .icon-cancel{position:absolute;left:12px;top:11px;width:16px;height:16px;background-image:url(//qzonestyle.gtimg.cn/qz-act/public/mobile/img/close-white.png?max_age=19830212&d=20130918105242);background-size:16px 16px}\n.gb-tips .gb-tips-layer .icon-loading{position:absolute;top:3px;left:3px;height:32px;width:32px;background:url(//qzonestyle.gtimg.cn/qz-act/public/mobile/img/loading.png?max_age=19830212&d=20130918105242) center center no-repeat;background-size:20px 20px;-webkit-animation:mask 600ms infinite step-start;-moz-animation:mask 600ms infinite step-start;-ms-animation:mask 600ms infinite step-start;-o-animation:mask 600ms infinite step-start;animation:mask 600ms infinite step-start}");
            return t.join("")
        },
        tips: function(e) {
            var t = []
              , i = function(e) {
                t.push(e)
            }
              , n = i;
            t.push('<div id="q_Msgbox" class="qz-tips-box-wrap" style="top:50%;left:0;display:block;z-index:10120;">\n    <div class="qz-tips-box">\n        <div class="tips-box-txt');
            i(e.type == "loading" ? " tips-loading" : "");
            t.push('">\n            <i class="icon-');
            i(e.type);
            t.push('"></i>');
            i(e.content);
            t.push("        </div>\n    </div>\n</div>");
            return t.join("")
        },
        tips_css: function(e) {
            var t = []
              , i = function(e) {
                t.push(e)
            }
              , n = i;
            t.push(".qz-tips-box-wrap {position:fixed;_position:absolute;top:50%;left:0;width:100%;height:0;text-align:center;overflow:visible;}\n.qz-tips-box {display:inline-block;*zoom:1;*display:inline;margin-top:-30px;padding:14px 25px;border:1px solid #d5d5d5;color:#404040;font-size:14px;vertical-align:top;background-color:#fff;_float:left;}\n.qz-tips-box > div {position:relative;}\n.qz-tips-box .tips-box-txt {float:left;height:30px;line-height:30px;padding-left:40px;}\n.qz-tips-box .tips-box-txt i {height:30px;width:30px;position:absolute;left:0;top:0;background-image:url(//qzonestyle.gtimg.cn/aoi/sprite/qz-tips-box-coi131225101404.png?max_age=19830212);}\n.qz-tips-box .tips-box-txt .icon-succeed {background-position:0 0;}\n.qz-tips-box .tips-box-txt .icon-fail {background-position:-31px 0;}\n.qz-tips-box .tips-box-txt .icon-warning {background-position:-62px 0;}\n.qz-tips-box .tips-box-txt .icon-info {background-position:-93px 0;}\n.qz-tips-box .tips-loading {padding-left:0;text-align:center;}\n.qz-tips-box .tips-loading .icon-loading {margin:0 10px 0 0;vertical-align:middle;display:inline-block;*zoom:1;*display:inline;position:relative;width:30px;height:30px;background-image:url(//qzonestyle.gtimg.cn/aoi/img/icenter/loading30.gif?max_age=19830212);}");
            return t.join("")
        },
        shareArrow: function(e) {
            var t = []
              , i = function(e) {
                t.push(e)
            }
              , n = i;
            t.push('    <div class="pop_share" style="top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,.8);position:fixed;z-index:10011">\n        <span class="wxicon_share" style="position:absolute;top:0;right:15px;background:url(//qzonestyle.gtimg.cn/qz-act/mobile/20140826_festival/img/share_laybg.png?max_age=19830212&d=20140828205946) no-repeat;width:159px;height:138px;background-size:159px 138px;text-indent:-9999px"></span>\n    </div>');
            return t.join("")
        },
        shareDialogMobile: function(e) {
            var t = []
              , i = function(e) {
                t.push(e)
            }
              , n = i;
            t.push('\t<div class="dialog dialog-m" id="J_share_dialog" style="top:');
            i(e.height);
            t.push('">\n\t\t<div class="dl_inner">\n\t\t\t<div class="hd">\n                <img src="');
            i(e.info.pic);
            t.push('" class="cover">\n                <div class="txt">\n                    <h3 class="title">');
            i(e.util.encodeHtml(e.info.title));
            t.push('</h3>\n                    <p class="sub-title">');
            i(e.util.encodeHtml(e.info.summary));
            t.push('</p>\n                </div>\n\t\t\t</div>\n\t\t\t<div class="bd">\n                \x3c!--<input type="text" class="txt-input" value="评论一番吧" />--\x3e\n                \x3c!--<textarea class="txt-input" value="评论一番吧">评论一番吧</textarea>--\x3e\n                \x3c!--<a class="ico-emoji" style="background-color: #333;"></a>--\x3e\n\t\t\t</div>\n            <div class="ft">\n                <a class="btn btn-cancel" id="J_share_cancel">取消</a>\n                <a class="btn btn-ok" id="J_share_ok">确定</a>\n            </div>\n\t\t</div>\n\t</div>');
            return t.join("")
        },
        shareDialogPc: function(e) {
            var t = []
              , i = function(e) {
                t.push(e)
            }
              , n = i;
            t.push('    <div class="dialog dialog-share" id="J_share_dialog" style="top:');
            i(e.height);
            t.push('">\n        <div class="dl_inner">\n            <div class="hd">\n                <a class="i-close" id="J_share_close">×</a>\n                <h3>分享活动</h3>\n            </div>\n            <div class="bd">\n                <img src="');
            i(e.info.pic);
            t.push('" class="cover">\n                <div class="txt">\n                    <h3 class="title">');
            i(e.util.encodeHtml(e.info.title));
            t.push('</h3>\n                    <p class="sub-title">');
            i(e.util.encodeHtml(e.info.summary));
            t.push('</p>\n                </div>\n            </div>\n            <div class="ft">\n                <a class="btn btn-cancel" id="J_share_cancel">取消</a>\n                <a class="btn btn-ok" id="J_share_ok">确定</a>\n            </div>\n        </div>\n    </div>');
            return t.join("")
        }
    };
    return i
});
