$(function() {

    var replaceTags = [];
    var options = {
        hotkey: 0,
        show: 0,
        fluid: 0,
        theme: ''
    };

    $('.replaceURL').each(function() {
       replaceTags.push([this, $(this).text(), $(this).attr('href')]);
    });


    function parseKey(e) {
        var k = e.keyCode;
        if (e.shiftKey) k |= 0x1000;
        if (e.ctrlKey)  k |= 0x2000;
        if (e.altKey)   k |= 0x4000;
        if (e.metaKey)  k |= 0x8000;
        return k;
    }

    function updateURL() {
        var url = document.location.href.replace(/\/[^\/]*$/, '') + '/bs-debug-grid.min.js',
            qs = [];


        Object.keys(options).forEach(function(k) {
            if(options[k])
                qs.push(k + '=' + options[k]);
        });

        if(qs.length)
            url += '?' + qs.join('&amp;');

        $.each(replaceTags, function() {
            var tag = $(this[0]);
            if(this[1])
                tag.text(this[1].replace(/__URL__/g, url));
            if(this[2])
                tag.attr('href', 'javascript:' + encodeURIComponent(this[2].replace(/__URL__/g, url)));
        });
    }

    $('#options-hotkey').on('keydown', function(e) {
        e.preventDefault();
        $(this).val(options.hotkey = parseKey(e));
        updateURL();
    });

    $('#options-show').on('change', function() {
        options.show = this.checked ? 1 : 0;
        updateURL();
    });

    $('#options-fluid').on('change', function() {
        options.fluid = this.checked ? 1 : 0;
        updateURL();
    });

    updateURL();


})