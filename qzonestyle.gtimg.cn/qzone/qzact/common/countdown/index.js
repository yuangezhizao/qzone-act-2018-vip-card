(function(a, b) {
    "function" === typeof a.define ? define(function() {
        return b()
    }) : "undefined" !== typeof a.module && a.module.exports ? a.module.exports = b() : window.Countdown = b()
}
)("undefined" !== typeof window ? window : this, function() {
    return {
        start: function(a) {
            a.serverSyncTime = a.serverSyncTime || 0;
            a.localSyncTime = a.localSyncTime || 0;
            a.interval = a.interval || 1E3;
            var b = a.targetTime - a.serverSyncTime + a.localSyncTime;
            (function() {
                var c = b - +new Date;
                0 >= c ? (a.onChange && a.onChange(0),
                a.onEnd && a.onEnd()) : (a.onChange && a.onChange(c),
                setTimeout(arguments.callee, a.interval))
            }
            )()
        },
        formatLeftTime: function(a, b, c) {
            b = b || "h";
            a = {
                ms: a,
                s: 0,
                m: 0,
                h: 0,
                d: 0
            };
            "ms" !== b && (1E3 <= a.ms && (a.s = Math.floor(a.ms / 1E3),
            a.ms %= 1E3),
            "s" !== b && (60 <= a.s && (a.m = Math.floor(a.s / 60),
            a.s %= 60),
            "m" !== b && (60 <= a.m && (a.h = Math.floor(a.m / 60),
            a.m %= 60),
            "h" !== b && 24 <= a.h && (a.d = Math.floor(a.h / 24),
            a.h %= 24))));
            c && (10 > a.s && (a.s = "0" + a.s),
            10 > a.m && (a.m = "0" + a.m),
            10 > a.h && (a.h = "0" + a.h));
            return a
        }
    }
});
