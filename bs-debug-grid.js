/// Bootstrap debug grid

'use strict';


(function () {

    var base = {
            css: '@./build/grid.css',
            html: '@./build/grid.html'
        },
        options = {
            hotkey: 0x71, // F2
            show: 0,
            fluid: 0,
            css: ''
        };

    var $ = window.jQuery,
        lastWidth = 0,
        updateTimer = 0;


    function $$(name) {
        var $q = $('#bs-debug-grid' + (name ? '-' + name : ''));
        return $q.length ? $q : null;
    }

    function update() {
        var $g = $$('grid'), $r = $$('ruler');

        if ($g && $g.is(':visible')) {
            var w = $g.find('.col-xs-1')[0].offsetWidth;
            if (w !== lastWidth) {
                lastWidth = w;
                $g.find('.col-xs-1').each(function () {
                    var t = this;
                    $(t).find('div').text(
                        t.offsetWidth + '/' + t.firstChild.offsetWidth
                    );
                });
            }
        }

        if ($r && $r.is(':visible')) {
            var l = $r[0].offsetLeft,
                t = $r[0].offsetTop,
                w = $r[0].offsetWidth,
                h = $r[0].offsetHeight,
                r = $g ? $g[0].offsetLeft : 0;
            $r.find('div').html(
                'x=' + l + '(' + (l - r) + ')&nbsp;y=' + t + '&nbsp;' + w + '&times;' + h
            )
        }
    }

    function eventXY(e) {
        if ('clientX' in e) {
            return {x: e.clientX, y: e.clientY};
        }
        e = e.originalEvent;
        if (e && e.touches && e.touches.length) {
            return {x: e.touches[0].clientX, y: e.touches[0].clientY};
        }
        return {x: 0, y: 0};
    }

    function rulerEvent(e) {

        var snap = {
            points: [0],
            distance: 8,
            on: false,
            x: function (x) {
                if (!snap.on)
                    return x;
                for (var i = 0; i < snap.points.length; i++) {
                    if (Math.abs(x - snap.points[i]) < snap.distance) {
                        return snap.points[i];
                    }
                }
                return x;
            },
            y: function (y) {
                if (!snap.on)
                    return y;
                return Math.floor(y / 5) * 5;
            }
        };

        $$('grid').find('.col-xs-1').each(function () {
            var $t = $(this), x = $t.offset().left, d = $t[0].firstChild;
            snap.points.push(x,
                x + d.offsetLeft,
                x + d.offsetLeft + d.offsetWidth,
                x + $t[0].offsetWidth);
        });

        var $t = $(this),
            start = eventXY(e),
            anchor = {x: $t[0].offsetLeft, y: $t[0].offsetTop},
            resize = $(e.target).is('i');


        e.preventDefault();

        $(document).on('mousemove.bs-debug-grid touchmove.bs-debug-grid', function (e) {
            var p = eventXY(e);
            snap.on = !e.shiftKey;

            if (resize) {
                $t.css({
                    width: Math.max(10, snap.x(p.x) - anchor.x),
                    height: Math.max(10, snap.y(p.y) - anchor.y)
                });
            } else {
                $t.css({
                    left: snap.x(p.x + anchor.x - start.x),
                    top: snap.y(p.y + anchor.y - start.y)
                });
            }
        });

        $(document).on('mouseup.bs-debug-grid touchend.bs-debug-grid touchcancel.bs-debug-grid', function () {
            $(document).off('.bs-debug-grid');
        });
    }

    function create() {
        $('body').prepend('<style>' + base.css + '\n' + options.css + '</style>' + base.html);

        $$('btn-ruler').on('click', toggleRuler);
        $$('btn-fluid').on('click', toggleFluid);
        $$('btn-grid').on('click', toggleGrid);
        $$('btn-highlight').on('click', toggleHighlight);
        $$('btn-hide').on('click', toggle);

        $$('nav p').on('click', function () {
            $$('nav').toggleClass('bs-debug-grid-active');
        });

        $$('ruler').on('mousedown touchstart', rulerEvent)
    }

    function updateNav() {
        var cls = 'bs-debug-grid-active';

        $$('btn-ruler').toggleClass(cls, $$('ruler').is(':visible'));
        $$('btn-grid').toggleClass(cls, $$('grid').is(':visible'));
        $$('btn-fluid').toggleClass(cls, $$('grid > div').is('.container-fluid'));
        $$('btn-highlight').toggleClass(cls,
            $('body').hasClass('bs-debug-grid-highlight'));
    }

    function toggle() {
        $('body').toggleClass('bs-debug-grid-on');
        if ($$().is(':visible')) {
            updateTimer = setInterval(update, 500);
        } else {
            clearInterval(updateTimer);
        }
        updateNav();
    }

    function toggleRuler() {
        $$('ruler').toggle();
        updateNav();
    }

    function toggleGrid() {
        $$('grid').toggle();
        updateNav();
    }

    function toggleFluid() {
        var $t = $$('grid > div'),
            cls = $t.is('.container-fluid') ? 'container' : 'container-fluid';
        $t.removeClass().addClass(cls);
        updateNav();
    }

    function toggleHighlight() {
        $('body').toggleClass('bs-debug-grid-highlight');
        updateNav();
    }

    function parseOptions() {
        $('script').each(function () {
            var src = $(this).attr('src'),
                m = (src || '').match(/bs-debug-grid.+?\?(.+)/);
            if (m) {
                m[1].replace(/(\w+)=(\w+)/g, function (_, $1, $2) {
                    options[$1] = isNaN($2) ? $2 : parseInt($2);
                });
            }
        });
    }

    function parseKey(e) {
        var k = e.keyCode;
        if (e.shiftKey) k |= 0x1000;
        if (e.ctrlKey)  k |= 0x2000;
        if (e.altKey)   k |= 0x4000;
        if (e.metaKey)  k |= 0x8000;
        return k;
    }

    function init() {
        parseOptions();
        if (!$$())
            create();
        if (options.fluid)
            toggleFluid();
        if (options.show)
            toggle();

        $(document).on('keydown', function (e) {
            if (parseKey(e) === options.hotkey)
                toggle();
        });
    }

    if (document.readyState == 'interactive' || document.readyState == 'complete')
        init();
    else
        $(init);

    $.bsDebugGridToggle = toggle;

})();
