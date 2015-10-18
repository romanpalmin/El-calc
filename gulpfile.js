/**
 * Created by Roman on 27.09.2015.
 */
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'), //pretty output into console
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    cssmin = require('gulp-cssmin'),
    sass = require('gulp-sass'),
    imagemin = require('gulp-imagemin'),
    dust = require('gulp-dust');

var srcPath = './assets';
var buildPath = './build';
var paths = {
    js: [srcPath + '/js/*.js', '!' + srcPath + '/js/*.min.js'],
    sass: [srcPath + '/sass/*.scss'],
    css: [srcPath + '/css/*.css', '!' + srcPath + '/css/*.min.css']
};

gulp.task('jshint', function () {
    gulp.src(paths.js)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});


gulp.task('js-minifier', function () {
    gulp.src(paths.js)
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(srcPath + '/js'))
        .on('end', function () {
            jsConcat();
        });

});

var jsConcat = function(){
    return gulp.src([
        srcPath + '/js/view.min.js',
        srcPath + '/js/controller.min.js',
        srcPath + '/js/utils.min.js',
        srcPath + '/js/appRun.min.js'])
        .pipe(concat('main.all.min.js'))
        .pipe(gulp.dest(buildPath + '/assets/js'));
};

gulp.task('img-compress', function() {
    gulp.src(srcPath + '/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest(buildPath + '/assets/images'))
});


var cssMin = function () {
    return gulp.src(paths.css)
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(buildPath + '/assets/css'));
};

gulp.task('sass-compile', function () {
    gulp.src(paths.sass)
        .pipe(sass())
        .pipe(gulp.dest(buildPath + '/css'))
        .on('end', function () {
            cssMin();
        });
});

gulp.task('dust-compile', function () {
    gulp.src(srcPath + '/templates/*')
        .pipe(dust())
        .pipe(gulp.dest(buildPath + '/assets/templates'));

});

gulp.task('copy-to-build', function () {
    gulp.src('index.html')
        .pipe(gulp.dest(buildPath));

/*    gulp.src(srcPath + '/images/!*.*')
        .pipe(gulp.dest(buildPath + '/assets/images'));*/

    gulp.src(srcPath + '/data/*.*')
        .pipe(gulp.dest(buildPath + '/assets/data'));

    gulp.src(srcPath + '/js/vendor/*.*')
        .pipe(gulp.dest(buildPath + '/assets/js/vendor'));

    gulp.src(srcPath + '/css/vendor/**/*.*')
        .pipe(gulp.dest(buildPath + '/assets/css/vendor/'));
});


gulp.task('watch', function () {
    gulp.watch(paths.js, ['jshint', 'js-minifier']);
    gulp.watch(paths.sass, ['sass-compile']);
});

gulp.task('default', ['jshint', 'js-minifier', 'dust-compile', 'img-compress', 'sass-compile', 'copy-to-build', 'watch']);