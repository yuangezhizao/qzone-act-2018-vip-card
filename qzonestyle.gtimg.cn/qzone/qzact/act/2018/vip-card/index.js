"use strict";
(function() {
    var a = []
      , n = parseFloat(seajs.version);
    define(["vue", "lib"], function(require, t, s) {
        var i = s.uri || s.id, e = i.split("?")[0].match(/^(.+\/)([^\/]*?)(?:\.js)?$/i), c = e && e[1], o = e && "./" + e[2], r = 0, l = a.length, d, p;
        o = o.replace(/\.r[0-9]{15}/, "");
        for (; r < l; r++) {
            p = a[r];
            if (typeof p[0] === "string") {
                o === p[0] && (d = p[2]);
                p[0] = c + p[0].replace("./", "");
                n > 1 && define.apply(this, p)
            }
        }
        a = [];
        require.get = require;
        return typeof d === "function" ? d.apply(this, arguments) : require
    });
    define.pack = function() {
        a.push(arguments);
        n > 1 || define.apply(null, arguments)
    }
}
)();
define.pack("./index", ["vue", "lib", "./tmpl", "./util"], function(require, a, n) {
    var t = require("vue");
    var s = require("lib");
    var i = require("./tmpl");
    var e = require("./util");
    a.init = function() {
        var a = i.content()
          , n = void 0
          , c = void 0;
        new t({
            template: a,
            data: syncData,
            el: "#J_main",
            mounted: function a() {
                var n = this;
                e.initPage();
                require.async("qzact/common/jquery.marquee/index", function(a) {
                    n.setLuckyList(syncData.drawCardUserList, "#j_drawCardUsers", "免费领取了一张闪卡");
                    n.setLuckyList(syncData.drawLotteryUserList, "#j_drawLotteryUsers")
                });
                var t = document.getElementById("countdown-1");
                require.async("qzact/common/countdown/index", function(a) {
                    var n = new Date
                      , s = n.getHours() + 1
                      , i = n.toString()
                      , e = i.split(" ")
                      , c = e[4]
                      , o = i.replace(c, s + ":00:00")
                      , r = new Date(o) - n;
                    a.start({
                        targetTime: +n + r,
                        onChange: function n(s) {
                            var i = a.formatLeftTime(s, "h", true);
                            t.innerHTML = i.h + ":" + i.m + ":" + i.s
                        }
                    })
                });
                if (syncData.router == "share") {
                    s.stat.reportHotClick("qzact.vip-card.enterByShare")
                }
            },
            methods: {
                setLuckyList: function a(n, t, s) {
                    var i = "", e;
                    var c = "user-no"
                      , o = "desc";
                    if (n && n.length) {
                        for (var r = 0; r < n.length; r++) {
                            e = n[r];
                            var l = "overflow:hidden;white-space:nowrap;text-overflow:ellipsis;height:42px;";
                            if (e) {
                                i += '<li class="item" style="' + l + '">' + (e.avatar ? "<img src=" + e.avatar + " " + 'style="height:35px;width:35px;vertical-align:middle;border-radius:50%;margin-right:15px">' + "</img>" : "") + "<span class=" + c + ">" + e.uin + "</span>" + "<span class=" + o + ">" + (s || "领取了" + e.score + "天豪华黄钻") + "</span>" + "</li>"
                            }
                        }
                    }
                    if (!n.length) {
                        i += '<li class="item" style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">暂无获奖用户记录</li>'
                    }
                    $(t).html(i).marquee()
                },
                closeDialog: function a() {
                    syncData.drawCard = false;
                    clearInterval(n)
                },
                showRuleDialog: function a() {
                    syncData.showRule = true
                },
                closeRule: function a() {
                    syncData.showRule = false
                },
                closeNewShareDialog: function a() {
                    syncData.newShareDialog = false;
                    clearInterval(n)
                },
                share: function a() {
                    var n = this;
                    if (syncData.hasDrawedCard || syncData.sharedTime == 3) {
                        s.msg.show("今天已经完成分享任务，请明天再来吧~");
                        return
                    }
                    if (syncData.isSharedQzone == 0) {
                        syncData.needShareDialog = true
                    } else {
                        n.shareToFriend()
                    }
                    s.stat.reportHotClick("qzact.vip-card.share")
                },
                sharedSucc: function a(n, t, i) {
                    if (n) {
                        syncData.isSharedQzone = 1
                    }
                    syncData.sharedTime++;
                    if (t) {
                        syncData.needShareDialog = false;
                        syncData.drawCard = t;
                        syncData.getCard = i;
                        syncData.hasDrawedCard = true;
                        this.countdown10("getCardCount", "drawCard");
                        s.stat.reportHotClick("qzact.vip-card.finishShareTask")
                    }
                },
                shareToQzone: function a() {
                    console.log("shareToQzone");
                    var n = this;
                    var t = {
                        shareType: 1
                    };
                    n.shareAjax(t).done(function(a) {
                        if (a && a.code == 0) {
                            s.msg.show("succ", "分享成功");
                            if (a.data && a.data.this_hour_share_count == 3 && a.data.prize_list) {
                                n.sharedSucc(true, true, true)
                            } else {
                                n.sharedSucc(true)
                            }
                        } else if (a && a.code == -5004 && a.subcode == -18) {
                            s.msg.show(a.msg || "已经分享过qq空间了，本次分享不计数呦，分享给好友吧")
                        } else if (a && a.code == -5004 && a.subcode == -15) {
                            s.msg.show("succ", "分享成功");
                            n.sharedSucc(true, true, false)
                        } else {
                            s.msg.show("info", a && a.message || "系统繁忙，请稍后再试")
                        }
                    }).fail(function(a) {
                        s.msg.show(a.message || "系统繁忙，请稍后再试")
                    })
                },
                shareToFriend: function a() {
                    console.log("shareToFriend");
                    var n = this;
                    require.async("//h5.qzone.qq.com/proxy/domain/qzonestyle.gtimg.cn/qzone/qzact/common.m/friendSelector.V3/index", function(a) {
                        a && a.init({
                            env: "qzact",
                            forceH5: false,
                            limit: 1,
                            hide_div: "#J_main",
                            el: "J_friendList",
                            submitStr: "确定",
                            onResult: function a(t) {
                                var i = {
                                    shareType: 0
                                };
                                if (t && t.length && t[0]) {
                                    i.uin = t[0].uin;
                                    n.shareAjax(i).done(function(a) {
                                        if (a && a.code == -5004 && a.subcode == -15) {
                                            s.msg.show("succ", "分享成功");
                                            n.sharedSucc(false, true, false)
                                        } else if (a && a.code == -5004 && a.subcode == -16) {
                                            s.msg.show("TA已经看过了，分享给其他人吧")
                                        }
                                        if (a && a.code == 0) {
                                            s.msg.show("succ", "分享成功");
                                            if (a.data && a.data.this_hour_already_share_qzone && a.data.this_hour_share_count == 3 && a.data.prize_list) {
                                                n.sharedSucc(false, true, true)
                                            } else {
                                                n.sharedSucc(false)
                                            }
                                        } else {
                                            s.msg.show(a.message || "系统繁忙，请稍后再试")
                                        }
                                    }).fail(function(a) {
                                        s.msg.show(a.message || "系统繁忙，请稍后再试")
                                    })
                                } else {
                                    s.msg.show("分享失败,请稍后再试")
                                }
                            },
                            onCancel: function a() {
                                console.log("cancel")
                            }
                        })
                    })
                },
                shareAjax: function a(n) {
                    var t = $.Deferred();
                    var i = {
                        format: "json",
                        get_free_present_list: 1,
                        type: 2,
                        share_type: n.shareType
                    };
                    if (n.uin) {
                        i.share_target = n.uin
                    }
                    s.ajax.request({
                        url: "http://campaign.qzone.qq.com/fcg-bin/v2/fcg_yvip_flash_card_2018",
                        type: "GET",
                        data: i
                    }).done(function(a) {
                        t.resolve(a || {})
                    }).fail(function(a) {
                        t.reject(a || {})
                    });
                    return t
                },
                closeShareDialog: function a() {
                    syncData.needShareDialog = false;
                    if (syncData.newShareDialogCount == 1) {
                        syncData.newShareDialog = true;
                        this.countdown10("newShareDialog", "newShareDialog");
                        s.stat.reportHotClick("qzact.vip-card.showNewShare_" + syncData.userType)
                    }
                },
                closedrawLotterySucc: function a() {
                    syncData.drawLotterySucc = false;
                    if (syncData.drawLotteryStatus == "third" || syncData.drawLotteryStatus == "second") {
                        syncData.newDrawLottery = true;
                        s.stat.reportHotClick("qzact.vip-card.showNewDrawLottery");
                        this.countdown10("newDrawLotteryDialog", "newDrawLottery")
                    }
                },
                continueDrawLottery: function a() {
                    syncData.drawLotterySucc = false;
                    this.drawLottery()
                },
                closeNewDrawLottery: function a() {
                    syncData.newDrawLottery = false;
                    clearInterval(n)
                },
                countdown10: function a(t, s) {
                    var i = 10;
                    n = setInterval(function() {
                        console.log(i);
                        if (i > 0) {
                            i--
                        } else {
                            clearInterval(n);
                            syncData[s] = false
                        }
                        document.getElementById(t).innerHTML = i
                    }, 1e3)
                },
                drawLottery: function a() {
                    if (syncData.hasNoUseQuality && syncData.totalQuality && syncData.totalQuality != 0) {
                        var n = "";
                        for (var t in syncData.noUseQuality) {
                            if (syncData.noUseQuality[t] != 0) {
                                n = t;
                                break
                            }
                        }
                        s.data.post("http://activity.qzone.qq.com/fcg-bin/fcg_qzact_lottery", {
                            actid: syncData.actId,
                            ruleid: n
                        }).done(function(a) {
                            if (a.code == 0 && a.data && a.data[0]) {
                                syncData.lottery = a.data[0].name;
                                syncData.drawLotterySucc = true;
                                syncData.noUseQuality[n]--;
                                syncData.totalQuality--
                            } else {
                                s.msg.show(a && a.message || "抽奖失败，请稍后再试!")
                            }
                        }).fail(function(a) {
                            s.msg.show(a && a.message || "抽奖失败，请稍后再试!")
                        })
                    } else {
                        var i = {
                            3: "first",
                            2: "second",
                            1: "third",
                            0: "finished"
                        };
                        var e = {
                            first: syncData.platform == "ios" ? "9203" : "8281_097d879b4c6516ab31742c06b845d46c1699",
                            second: syncData.platform == "ios" ? "9204" : "8282_8228a1e5a08f2dc0f3c9f1e0affbe85b1699",
                            third: syncData.platform == "ios" ? "9205" : "8283_359d033b8b218697b87545912a36a1441699"
                        };
                        var c = {
                            first: "8284",
                            second: "8285",
                            third: "8286"
                        };
                        var o = {
                            first: "第一轮抽奖",
                            second: "第二轮抽奖",
                            third: "第三轮抽奖"
                        };
                        if (syncData.drawLotteryStatus == "finished") {
                            s.msg.show("今日抽奖机会已经用完啦~")
                        } else {
                            var r = {
                                ruleId: e[syncData.drawLotteryStatus] || "",
                                iapRuleId: e[syncData.drawLotteryStatus] || "",
                                pic: syncData.configInfo.cardUrl,
                                desc: "豪华黄钻闪卡",
                                name: o[syncData.drawLotteryStatus],
                                price: syncData.platform == "ios" ? "60" : "50",
                                succ: function a() {
                                    setTimeout(function() {
                                        s.data.post("http://activity.qzone.qq.com/fcg-bin/fcg_qzact_lottery", {
                                            actid: syncData.actId,
                                            ruleid: c[syncData.drawLotteryStatus]
                                        }).done(function(a) {
                                            if (a.code == 0) {
                                                if (a.data && a.data[0]) {
                                                    syncData.lottery = a.data[0].name;
                                                    syncData.drawLotterySucc = true;
                                                    syncData.leftChance = syncData.leftChance - 1;
                                                    syncData.drawLotteryStatus = i[syncData.leftChance]
                                                }
                                            } else {
                                                s.msg.show(a && a.message || "抽奖失败，请稍后再试!")
                                            }
                                        }).fail(function(a) {
                                            s.msg.show(a && a.message || "抽奖失败，请稍后再试!")
                                        })
                                    }, 500);
                                    s.stat.reportHotClick("qzact.vip-card." + syncData.drawLotteryStatus)
                                }
                            };
                            this.pay_h5_item(r)
                        }
                    }
                },
                buy: function a() {
                    var n = syncData.platform == "ios" ? syncData.configInfo.cardInfoIos.cardPayRuleId : syncData.configInfo.cardInfo.cardPayRuleId
                      , t = syncData.platform == "ios" ? syncData.configInfo.cardInfoIos.cardPrice : syncData.configInfo.cardInfo.cardPrice;
                    var i = {
                        ruleId: n,
                        iapRuleId: n,
                        pic: syncData.configInfo && syncData.configInfo.cardUrl,
                        desc: "豪华黄钻闪卡",
                        name: "三折购买",
                        price: t * 10,
                        succ: function a() {
                            s.msg.show("成功购买闪卡");
                            s.stat.reportHotClick("qzact.vip-card.discount_3")
                        }
                    };
                    this.pay_h5_item(i)
                },
                buyDiscount: function a() {
                    var n = syncData.platform == "ios" ? syncData.configInfo.discount_cardInfoIos.discount_cardPayRuleId : syncData.configInfo.discount_cardInfo.discount_cardPayRuleId
                      , t = syncData.platform == "ios" ? syncData.configInfo.discount_cardInfoIos.cardPrice : syncData.configInfo.discount_cardInfo.discount_cardPrice;
                    var i = {
                        ruleId: n,
                        iapRuleId: n,
                        pic: syncData.configInfo.cardUrl,
                        desc: "豪华黄钻闪卡",
                        name: "2折购买",
                        price: t * 10,
                        succ: function a() {
                            s.msg.show("成功购买闪卡");
                            syncData.drawCard = false;
                            s.stat.reportHotClick("qzact.vip-card.discount_2")
                        }
                    };
                    this.pay_h5_item(i)
                },
                newPay: function a() {
                    var n = {
                        type_1: syncData.platform == "ios" ? "9210" : "8807_9cc825222b81a933af3d0a0cf2cd3d9f1699",
                        type_2: syncData.platform == "ios" ? "9222" : "8809_d68f32416ef12ccfa02e52bb1854f1ad1699",
                        type_3: syncData.platform == "ios" ? "9209" : "8808_38a408c6268c3bfc21efe645f75fa4381699"
                    };
                    var t = {
                        type_1: "2元买五天豪华黄钻",
                        type_2: "1元升级豪华黄钻",
                        type_3: "5元买15天豪华黄钻+100点成长值"
                    };
                    var i = {
                        type_1: syncData.platform == "ios" ? 30 : 20,
                        type_2: 10,
                        type_3: syncData.platform == "ios" ? 60 : 50
                    };
                    var e = {
                        type_1: "成功购买五天豪华黄钻",
                        type_2: "成功升级豪华黄钻",
                        type_3: "成功购买15天豪华黄钻+100点成长值"
                    };
                    var c = {
                        pic: syncData.configInfo.cardUrl,
                        desc: "豪华黄钻闪卡",
                        name: t[syncData.userType],
                        price: i[syncData.userType],
                        succ: function a() {
                            s.msg.show(e[syncData.userType]);
                            syncData.newShareDialog = false;
                            syncData.newShareDialogCount = 0;
                            s.stat.reportHotClick("qzact.vip-card.clickNewShare_" + syncData.userType)
                        }
                    };
                    if (syncData.platform == "android") {
                        c.ruleId = n[syncData.userType]
                    } else if (syncData.platform == "ios") {
                        c.iapRuleId = n[syncData.userType]
                    }
                    this.pay_h5_item(c)
                },
                doublePay: function a() {
                    var n = {
                        "9天豪华黄钻": "8810_b14707d9d2d224b84c7a3597585936ca1699",
                        "10天豪华黄钻": "8811_a8f9c898c2638d95ec6dcd6d5741223a1699",
                        "11天豪华黄钻": "8812_290ebf2972c32af3f11b9c90bf91773f1699",
                        "12天豪华黄钻": "8813_5491c59804131c9e8208ff452427899e1699",
                        "13天豪华黄钻": "8814_9a4ae7e9690e47e5e49268834086b55c1699",
                        "14天豪华黄钻": "8815_277042d788f6dfb2c5ce4fe59f5c2d951699"
                    };
                    var t = {
                        "9天豪华黄钻": "9211",
                        "10天豪华黄钻": "9212",
                        "11天豪华黄钻": "9213",
                        "12天豪华黄钻": "9214",
                        "13天豪华黄钻": "9215",
                        "14天豪华黄钻": "9216"
                    };
                    var i = {
                        pic: syncData.configInfo.cardUrl,
                        desc: "豪华黄钻闪卡",
                        name: "翻倍",
                        price: 30,
                        succ: function a() {
                            s.msg.show("成功翻倍，获得" + syncData.lottery);
                            syncData.newShareDialog = false;
                            syncData.newShareDialogCount = 0;
                            s.stat.reportHotClick("qzact.vip-card.clickNewDrawLottery")
                        }
                    };
                    if (syncData.platform == "android") {
                        i.ruleId = n[syncData.lottery]
                    } else if (syncData.platform == "ios") {
                        i.iapRuleId = t[syncData.lottery]
                    }
                    this.pay_h5_item(i)
                },
                pay_h5_item: function a(n) {
                    s.pay.open({
                        type: "item",
                        ui: "mini",
                        itemType: "deluxe",
                        supportIap: true,
                        actId: syncData.actId,
                        iapRuleId: n.iapRuleId || "",
                        ruleId: n.ruleId || "",
                        canPayDialog: true,
                        itemPic: n.pic,
                        itemDesc: n.desc,
                        itemName: n.name,
                        count: "1",
                        itemPrice: n.price,
                        sandbox: syncData.sandbox,
                        as: 1,
                        onSuccess: n.succ
                    })
                }
            }
        })
    }
});
define.pack("./util", ["lib"], function(require, a, n) {
    var t = require("lib");
    var s = syncData.proj_name;
    a.openUrl = function(a) {
        if (t.browser.client === "qq" || t.browser.client === "qzone") {
            require.async(t.browser.client + "api", function() {
                if (window.mqq && mqq.invoke) {
                    mqq.invoke("ui", "openUrl", {
                        url: a,
                        target: 1,
                        style: 0
                    })
                } else {
                    location.href = a
                }
            })
        } else {
            location.href = a
        }
    }
    ;
    a.report = function(a) {
        t.stat.reportHotClick("qzact." + s + "." + a)
    }
    ;
    a.checkLogin = function() {
        if (!syncData.isLogin || !t.user.isLogin()) {
            t.user.showLogin();
            return false
        } else {
            return true
        }
    }
    ;
    a.initPage = function() {
        if (!(t.browser.client === "qq" && t.browser.client === "qzone")) {
            require.async("qzact/common.m/act.title/index", function(a) {
                a.init()
            })
        }
        t.share.initShare(syncData.shareInfo)
    }
});
define.pack("./tmpl", [], function(require, a, n) {
    var t = {
        encodeHtml: function a(n) {
            return (n + "").replace(/[\x26\x3c\x3e\x27\x22\x60]/g, function(a) {
                return "&#" + a.charCodeAt(0) + ";"
            })
        },
        content: function a(n) {
            var t = []
              , s = function a(n) {
                t.push(n)
            }
              , i = s;
            t.push('<div id="J_main">\n    <div class="vip-main">\n        <div class="vip-flash-card">\n            <div class="vip-card">\n              <div class="demo-img"><img :src="configInfo.cardUrl.replace(/https?:/,\'\')" alt=""></div>\n              <p class="card-benefit">{{configInfo.cardContent}}</p>\n              <div class="price">¥{{configInfo.cardOriginPrice || 30}}<span class="tag">限免</span></div>\n              <div class="detail"><span class="text gradient-text">每小时限量</span><span class="number gradient-text">{{configInfo.showCardNum || configInfo.free_card_num}}</span><span class="text gradient-text">张，分享成功免费领取</span><div class="rule-btn"><button @click="showRuleDialog()">活动规则</button></div></div>\n            </div>\n            <div class="mod-share">\n                <div class="countdown">\n                    <p class="title">距离活动结束仅剩</p>\n                    <div class="time"><strong id="countdown-1"></strong></div>\n                </div>\n                <button class="btn-big" @click="share()">成功分享三次，领取免费豪华黄钻</button>\n                <button class="btn-small" @click="buy()"><span class="text gradient-text">仅需{{platform == \'ios\' ? 4 : 3}}折，{{platform == \'ios\' ? configInfo.cardInfoIos && configInfo.cardInfoIos.cardPrice : configInfo.cardInfo && configInfo.cardInfo.cardPrice}}元购买</span></button>\n                <div class="user-tips" style="overflow:hidden;height:42px">\n                    <ul id="j_drawCardUsers"></ul>\n                </div>\n          </div>\n            \x3c!-- 试手气 --\x3e\n            <div class="mod-try">\n                <p class="title"><span class="text">试手气</span></p>\n                <p class="tips"><span class="gradient-text">{{platform == \'ios\'?6:5}}元抽豪华黄钻，最高得</span><span class="number">31</span><span class="gradient-text">天！每天抽3次，这次总比上次多！</span></p>\n                <button class="btn-big" @click="drawLottery()">立即抽取</button>\n                <p class="tips gradient-text"><span class="gradient-text" style="overflow: hidden;position: relative;">今日机会 × {{leftChance}}</span></p>\n                <div class="user-tips" style="overflow:hidden;height:42px;">\n                    <ul id="j_drawLotteryUsers"></ul>\n                </div>\n            </div>\n        </div>\n    </div>\n    \x3c!-- 领取闪卡的弹窗 --\x3e\n    <div class="dialog-jd dialog-a" v-if="drawCard">\n        <div class="inner">\n            <a class="close" @click="closeDialog()">x</a>\n            <div class="dialog-inner">\n                \x3c!-- 提示1 --\x3e\n                <div class="content" v-if="getCard">\n                    <div class="tips-hd">任务达成！</div>\n                    <div class="tips-bd">1张免费闪卡立即到账</div>\n                    <div class="ctrl-tuan"><button class="btn-big" @click="closeDialog()">确定</button></div>\n                </div>\n                \x3c!-- 提示2 --\x3e\n                <div class="content" v-if="!getCard">\n                    <div class="tips-bd">免费闪卡已抢完，<br>幸好还有2折优惠等着你，错过只有等下次哟~</div>\n                    <div class="card-info">\n                       <img :src="configInfo.cardUrl.replace(/https?:/,\'\')" alt="" class="card-img">\n                       <div class="card-title"><p>{{configInfo.cardContent}}</p><p><span class="highlight" id="getCardCount">10</span>秒后含泪错过</p></div>\n                    </div>\n                    <div class="ctrl-tuan">\n                        <button class="btn-big" @click="buyDiscount()"><span>{{platform == \'ios\'?configInfo.discount_cardInfoIos && configInfo.discount_cardInfoIos.discount_cardPrice:configInfo.discount_cardInfo && configInfo.discount_cardInfo.discount_cardPrice}}元购买</span> <del>原价30元</del></button>\n                        <button class="btn-big" @click="closeDialog()">取消</button>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n    \x3c!-- 抽奖的弹窗 --\x3e\n    <div class="dialog-jd dialog-a" v-if="drawLotterySucc">\n        <div class="inner">\n            <a href="javascript:;" class="close" @click="closedrawLotterySucc()">x</a>\n            <div class="dialog-inner">\n                \x3c!-- 提示 --\x3e\n                <div class="content">\n                    <div class="tips-hd">抽奖成功</div>\n                    <div class="tips-bd"><p>你获得了{{lottery}}</p><p v-if="(drawLotteryStatus != \'finished\')">连续抽奖能获得更多天数呦~</p></div>\n                    <div class="ctrl-tuan">\n                        <button class="btn-big" @click="continueDrawLottery()" v-if="(drawLotteryStatus != \'finished\')">继续抽奖</button>\n                        <button class="btn-big" @click="closedrawLotterySucc()" v-if="drawLotteryStatus == \'finished\'">确定</button>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n    \x3c!-- 抽奖挽留的弹窗 --\x3e\n    <div class="dialog-jd dialog-a" v-if="newDrawLottery">\n        <div class="inner">\n            <a class="close" onclick="" @click="closeNewDrawLottery()">x</a>\n            <div class="dialog-inner">\n                \x3c!-- 提示1 --\x3e\n                <div class="content">\n                    \x3c!--<div class="tips-hd">任务达成！</div>--\x3e\n                    <div class="tips-bd">\n                        <p class="tips tips-m">幸运来袭，送你豪华黄钻天数翻倍券，仅需<span class="highlight">3</span>元，即可将上次抽取的天数翻倍，本次你可额外获得</p>\n                        <p class="tips tips-l"><span class="highlight">{{lottery}}</span></p>\n                        <p class="tips tips-m">机会难得，紧紧把握哟~</p>\n                        <p class="tips"><span class="highlight" id="newDrawLotteryDialog">10</span>秒后含泪错过</p>\n                    </div>\n                    <div class="ctrl-tuan"><button class="btn-big btn-large" @click="doublePay()">3元翻倍</button></div>\n                </div>\n            </div>\n        </div>\n    </div>\n    \x3c!--关闭分享挽留的弹窗--\x3e\n    <div class="dialog-jd dialog-a" v-if="newShareDialog && userType == \'type_1\'">\n        <div class="inner">\n            <a class="close" onclick="" @click="closeNewShareDialog()">x</a>\n            <div class="dialog-inner">\n                \x3c!-- 提示1 --\x3e\n                <div class="content">\n                    \x3c!--<div class="tips-hd">任务达成！</div>--\x3e\n                    <div class="tips-bd">\n                        <p class="tips tips-m">今天难道有幸运女神眷顾？仅需<span class="highlight">{{platform == \'ios\'?3:2}}</span>元，至少得</p>\n                        <p class="tips tips-l"><span class="highlight">5</span>天豪华黄钻</p>\n                        <p class="tips tips-m">机会难得，紧紧把握哟~</p>\n                        <p class="tips"><span class="highlight" id="newShareDialog">10</span>秒后含泪错过</p>\n                    </div>\n                    <div class="ctrl-tuan"><button class="btn-big btn-large" @click="newPay()">{{platform == \'ios\'?3:2}}元立享</button></div>\n                </div>\n            </div>\n        </div>\n    </div>\n    <div class="dialog-jd dialog-a" v-if="newShareDialog && userType == \'type_2\'">\n        <div class="inner">\n            <a class="close" onclick="" @click="closeNewShareDialog()">x</a>\n            <div class="dialog-inner">\n                \x3c!-- 提示1 --\x3e\n                <div class="content">\n                    \x3c!--<div class="tips-hd">任务达成！</div>--\x3e\n                    <div class="tips-bd">\n                        <p class="tips tips-m">今天难道有幸运女神眷顾？仅需<span class="highlight">1</span>元，马上升级</p>\n                        <p class="tips tips-l"><span class="highlight">1</span>个月豪华黄钻</p>\n                        <p class="tips tips-m">机会难得，紧紧把握哟~</p>\n                        <p class="tips"><span class="highlight" id="newShareDialog">10</span>秒后含泪错过</p>\n                    </div>\n                    <div class="ctrl-tuan"><button class="btn-big btn-large" @click="newPay()">1元升级</button></div>\n                </div>\n            </div>\n        </div>\n    </div>\n    <div class="dialog-jd dialog-a" v-if="newShareDialog && userType == \'type_3\'">\n        <div class="inner">\n            <a class="close" onclick="" @click="closeNewShareDialog()">x</a>\n            <div class="dialog-inner">\n                \x3c!-- 提示1 --\x3e\n                <div class="content">\n                    \x3c!--<div class="tips-hd">任务达成！</div>--\x3e\n                    <div class="tips-bd">\n                        <p class="tips tips-m">今天难道有幸运女神眷顾？仅需<span class="highlight">{{platform == \'ios\'?6:5}}</span>元，立得</p>\n                        <p class="tips tips-l"><span class="highlight">15</span>天豪华黄钻+<span class="highlight">100</span>点成长值</p>\n                        <p class="tips tips-m">机会难得，紧紧把握哟~</p>\n                        <p class="tips"><span class="highlight" id="newShareDialog">10</span>秒后含泪错过</p>\n                    </div>\n                    <div class="ctrl-tuan"><button class="btn-big btn-large" @click="newPay()">{{platform == \'ios\'?6:5}}元购买</button></div>\n                </div>\n            </div>\n        </div>\n    </div>\n    \x3c!--活动规则弹窗--\x3e\n    <div class="dialog-jd dialog-c" v-if="showRule">\n        <div class="inner">\n            <a href="javascript:;" class="close" @click="closeRule()">x</a>\n            <div class="dialog-inner">\n                <div class="content">\n                    <h2 class="title-intro">活动规则</h2>\n                    <ul class="list-intro">\n                        <li><span>1</span><strong>本活动截止到期时间2018年12月31日；</strong></li>\n                        <li><span>2</span><strong>参与资格：</strong>所有的QQ用户；</li>\n                        <li><span>3</span>每天早10点-晚9点整点放出100个豪华黄钻闪卡，完成分享任务的用户可以免费领取，先到先得，领完为止；</li>\n                        <li><span>4</span>成功分享3次本活动则被视为完成分享任务，是否分享成功由活动判定，请关注页面提示；</li>\n                        <li><span>5</span>获得闪卡后，{{configInfo && configInfo.cardContent}}立即到账，专属装扮自动穿上；</li>\n                        <li><span>6</span>在本页面可以10元购买闪卡，完成分享任务但没有领到免费闪卡的用户有机会{{platform == \'ios\'?configInfo.discount_cardInfoIap && configInfo.discount_cardInfoIap.discount_cardPriceIap:configInfo.discount_cardInfo && configInfo.discount_cardInfo.discount_cardPrice}}元购买闪卡；</li>\n                        <li><span>7</span>重复购买闪卡的用户，豪华黄钻与成长值立即到账，专属装扮不会重复下发。</li>\n                        <li><span>8</span>每位用户每天可在活动抽取3次豪华黄钻天数，一天中每次抽取天数必定大于前一次，未使用的抽奖次数不保留，第二天重新刷新；</li>\n                        <li><span>9</span>关闭分享弹窗后，用户所得优惠开通机会每人每天仅限1次；</li>\n                        <li><span>10</span>本活动在法律允许范围内腾讯公司对上述内容拥有解释权。</li>\n                    </ul>\n                </div>\n            </div>\n        </div>\n    </div>\n    \x3c!-- 分享浮层弹窗 --\x3e\n    <div class="dialog-jd dialog-a" v-if="needShareDialog">\n        <div class="inner">\n            <a href="javascript:;" class="close" @click="closeShareDialog()">x</a>\n            <div class="dialog-inner">\n                <div class="content img-txt-style">\n                    <div class="card-info">\n                        <img :src="configInfo && configInfo.cardUrl && configInfo.cardUrl.replace(/https?:/,\'\')" alt="" class="card-img">\n                        <div class="card-title">{{configInfo && configInfo.shareDialogDes}}</div>\n                    </div>\n                    <div class="ctrl-tuan">\n                        <button class="btn-big" @click="shareToQzone()">分享到空间</button>\n                        <button class="btn-small" @click="shareToFriend()">分享给好友</button>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>');
            return t.join("")
        },
        frame: function a(n) {
            var t = []
              , s = function a(n) {
                t.push(n)
            }
              , i = s;
            var e = n;
            t.push('<!doctype html>\n<html>\n    <head>\n        <meta charset="utf-8">\n        <title>');
            s(n.title);
            t.push('</title>\n        <meta name="keywords" content="QQ空间,黄钻空间装扮,黄钻特权,开通黄钻,黄钻活动,QQ空间活动,QQ空间宠物,QQ空间交友,QQ空间明星,豪华版黄钻,年费黄钻,游戏特权,生活特权,基础特权,黄钻回馈" >\n        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">\n        <meta name="format-detection" content="telephone=no"/>\n        <link rel="Shortcut Icon" href="//h5.qzone.qq.com/proxy/domain/qzonestyle.gtimg.cn/qzone_v6/img/favicon.ico?max_age=31536000" type="image/x-icon">');
            s(n.act.render("css"));
            t.push("        ");
            if (n.act.get("isTest") || n.act.request.GET.vconsole === "1") {
                t.push("            <scr");
                t.push('ipt src="//qzonestyle.gtimg.cn/qzone/hybrid/common/vconsole/vconsole.min.js"></scr');
                t.push("ipt>")
            }
            t.push("        <scr");
            t.push("ipt type=\"text/javascript\">\n            (function (win, doc) {\n                if (!win.addEventListener) return;\n                var html = document.documentElement;\n                function setFont() {\n                    var cliWidth = html.clientWidth;\n                    if (cliWidth < 750) {\n                        html.style.fontSize = 100 * (cliWidth / 750) + 'px';\n                    } else {\n                        html.style.fontSize = 100 + 'px';\n                    }\n                }\n                win.addEventListener('resize', setFont, false);\n                setFont();\n            })(window, document);\n        </scr");
            t.push("ipt>\n    </head>\n    <body>\n        <content></content>");
            s(n.act.render("h5TestBar"));
            t.push("        ");
            s(n.act.render("jsError"));
            t.push("        ");
            s(n.act.render("seajs"));
            t.push("        ");
            s(n.act.render("common"));
            t.push("        ");
            s(n.act.render("syncData", n.syncData));
            t.push("        <scr");
            t.push("ipt>\n            seajs && seajs.use(['jquery', 'qzact/act/");
            s(n.act.actRelativePath);
            t.push("/index', 'vue', 'lib'], function($, mod, vue, lib) {\n                if ($ && mod && vue && lib) {\n                    mod.init();\n                }\n            });\n        </scr");
            t.push("ipt>\n    </body>\n</html>");
            return t.join("")
        }
    };
    return t
});
