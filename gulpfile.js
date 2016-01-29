'use strict';

var
    fs = require('fs'),
    gulp = require('gulp'),
    jade = require('gulp-jade'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    stream = require('stream'),
    uglify = require('gulp-uglify')
    ;


function transform(fn) {
    var s = new stream.Transform({objectMode: true});
    s._transform = function (file, _, next) {
        file.contents = new Buffer(fn(file.contents.toString()));
        next(null, file);
    };
    return s;
}

function doIncludes(src) {
    return src.replace(/'@([^']+)'/g, function (_, path) {
        return JSON.stringify(
            fs.readFileSync(path, 'utf8')
                .replace(/ *\n+ */g, '')
                .replace(/"/g, "'")
                .replace(/: +/g, ':'));
    });
}

gulp.task('ruler', function() {
    return gulp.src('ruler.svg')
        .pipe(transform(function (src) {
            src = src.trim().replace(/\s+/g, ' ').replace(/> </g, '><');
            src = new Buffer(src).toString('base64');
            return 'data:image/svg+xml;base64,' + src;
        }))
        .pipe(gulp.dest('./build'))
        ;
});


gulp.task('sass', ['ruler'], function () {
    return gulp.src('*.sass')
        .pipe(transform(doIncludes))
        .pipe(sass())
        .pipe(gulp.dest('./build'))
        ;
});

gulp.task('jade', function () {
    return gulp.src('*.jade')
        .pipe(jade({pretty: true}))
        .pipe(gulp.dest('./build'))
        ;
});

gulp.task('js', ['jade', 'sass'], function () {
    return gulp.src('bs-debug-grid.js')
        .pipe(transform(doIncludes))
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest('.'))
        ;
});


gulp.task('index', ['js'], function () {
    return gulp.src('build/index.html')
        .pipe(gulp.dest('.'))
        ;
});

// 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMHB4IiBoZWlnaHQ9IjEwcHgiIHZpZXdCb3g9IjAgMCAxMCAxMCIgdmVyc2lvbj0iMS4xIj48cG9seWxpbmUgcG9pbnRzPSIwLDEwIDAsMCAxMCwwIiBzdHJva2U9IiNhYWFhYWEiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiLz48L3N2Zz4='

gulp.task('default', ['index']);
