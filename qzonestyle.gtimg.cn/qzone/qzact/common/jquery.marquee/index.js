define(["jquery"], function(l, q, r) {
    function p() {
        var a = document.createElement("p"), c, d = {
            webkitTransform: "-webkit-transform",
            OTransform: "-o-transform",
            msTransform: "-ms-transform",
            MozTransform: "-moz-transform",
            transform: "transform"
        };
        document.body.insertBefore(a, null);
        for (var e in d)
            void 0 !== a.style[e] && (a.style[e] = "translate3d(1px,1px,1px)",
            c = window.getComputedStyle(a).getPropertyValue(d[e]));
        document.body.removeChild(a);
        return void 0 !== c && 0 < c.length && "none" !== c
    }
    var f = l("jquery");
    f.fn.marquee = function(a) {
        a = f.extend({}, f.fn.marquee.defaults, a);
        a.css3 = "auto" === a.css3 ? p() : a.css3;
        return this.each(function() {
            var c = f(this), d = c.height(), e, h = c.children();
            if (!(1 > h.length || c.parent().height() >= d)) {
                if (/\dx/g.test(a.unit)) {
                    var n = parseInt(a.unit) || 1;
                    if (n >= h.length)
                        a.unit = d;
                    else {
                        for (var k = 0, m = 1, l = h.length; m < l && !(k = h[m].offsetTop - h[0].offsetTop,
                        0 < k); ++m)
                            ;
                        a.unit = 0 < k ? n * k : d
                    }
                }
                this.innerHTML += this.innerHTML;
                e = c.height() - d;
                var g = function(b) {
                    return a.css3 ? {
                        "-webkit-transform": "translate3d(0, -" + b + "px, 0)",
                        "-moz-transform": "translate3d(0, -" + b + "px, 0)",
                        "-ms-transform": "translate3d(0, -" + b + "px, 0)",
                        "-o-transform": "translate3d(0, -" + b + "px, 0)",
                        transform: "translate3d(0, -" + b + "px, 0)"
                    } : {
                        "margin-top": -b
                    }
                };
                if (a.css3) {
                    var b = 0;
                    (function() {
                        var d = arguments.callee;
                        b >= e && (b -= e,
                        c.animate({
                            __adapter: b
                        }, 0).css(g(b)));
                        b += a.unit;
                        a.speed ? c.animate({
                            __adapter: b
                        }, {
                            duration: a.speed,
                            easing: a.easing,
                            step: function(a, b) {
                                c.css(g(a))
                            },
                            always: function() {
                                setTimeout(d, a.delay)
                            }
                        }) : (c.css(g(b)),
                        setTimeout(d, a.delay))
                    }
                    )()
                } else
                    b = 0,
                    function() {
                        var d = arguments.callee;
                        b >= e && (b -= e,
                        c.css(g(b)));
                        b += a.unit;
                        a.speed ? c.animate(g(b), a.speed, a.easing, function() {
                            setTimeout(d, a.delay)
                        }) : (c.css(g(b)),
                        setTimeout(d, a.delay))
                    }()
            }
        })
    }
    ;
    f.fn.marquee.defaults = {
        speed: 500,
        delay: 1E3,
        unit: "1x",
        easing: "linear",
        css3: "auto"
    };
    return f
});
