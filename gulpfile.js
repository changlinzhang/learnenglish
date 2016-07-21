var gulp = require('gulp'),
    fs = require('fs'),
    browserSync = require('browser-sync').create(),
    // sass = require('gulp-sass'), // has error when complie scss
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    jsonminify = require('gulp-jsonminify'),
    replace = require('gulp-replace'),
    uncss = require('gulp-uncss'),
    htmlmin = require('gulp-htmlmin'),
    swPrecache = require('sw-precache');

var lessonData = fs.readFileSync('app/data/listLessons.min.json') ? JSON.parse(fs.readFileSync('app/data/listLessons.min.json')) : '';

/**
 * Launch the Server
 */
gulp.task('browser-sync', function() {
    browserSync.init({
        // https: true,
        server: {
            baseDir: 'app'
        },
        online: true, // Will not attempt to determine your network status, assumes you're ONLINE.
        port: 8080,
        startPath: "/",
        ghostMode: false, // Clicks, Scrolls & Form inputs on any device will be mirrored to all others.
        notify: {
            styles: {
                top: 'auto',
                bottom: '20px',
                left: '0',
                width: '100px',
                fontSize: '0.5em',
                padding: "5px"
            }
        }
    });
});

/**
 * Compile sass
 */
gulp.task('styles', function() {
    return sass('app/css/main.scss', { style: 'compact' })
        .on('error', sass.logError)
        .pipe(autoprefixer({ browsers: ['last 2 versions', 'Firefox ESR', 'safari 5', 'ie 9', 'opera 12.1'] }))
        // .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('app/css'));
});

/**
 * Remove unused then minify css
 */
gulp.task('uncss', ['styles'], function() {
    return gulp.src(['app/css/main.css'])
        .pipe(uncss({
            html: ['app/main.html'],
            ignore: ['.lean-overlay', '#sidenav-overlay', '.drag-target', /^\#slideNav/, /^\#mainContent/, /^\#lessonContent/, /^\.waves/]
        }))
        .pipe(minifycss())
        .pipe(gulp.dest('app/css'));
});

/**
 * Compile sass, remove unused css then inline css to index.html
 */
gulp.task('html', ['uncss'], function() {
    var css = fs.readFileSync('app/css/main.css');
    return gulp.src(['app/main.html'])
        .pipe(replace('/**inlinecss**/', css))
        .pipe(htmlmin({ collapseWhitespace: true })) // no need to minify html
        .pipe(rename('index.html'))
        .pipe(gulp.dest('app'));
});

/**
 * bind data to main.js then minify it
 */
gulp.task('scripts', function() {
    return gulp.src(['app/js/*.js'])
        .pipe(replace('var lessonsDataJson', 'var lessonsDataJson=' + JSON.stringify(lessonData)))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('app/js/min'));
});

gulp.task('minifyjson', function() {
    return gulp.src(['app/data/*.json'])
        .pipe(jsonminify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('app/data'));
});

/**
 * Default task, running just `gulp` will compile the sass,
 * launch BrowserSync & watch files.
 * Watch scss files for changes & recompile
 * Watch files, reload BrowserSync
 */
gulp.task('default', ['html', 'scripts', 'browser-sync'], function() {
    gulp.watch('app/js/*.js', ['scripts']);
    // css will be inline in index.html so when the gulp-clean-css is changed -> build index.html
    gulp.watch('app/css/**/*.scss', ['html']);
    gulp.watch(['app/index.html', 'app/js/min/*.js', 'app/img/**']).on('change', browserSync.reload);
});

/**
 * generate service worker (sw.js) and minify it
 */
gulp.task('generate-service-worker', function() {
    var rootDir = 'app';

    swPrecache.write('app/sw.js', {
        staticFileGlobs: [
            rootDir + '/index.html',
            rootDir + '/data/lessons/*.json',
            rootDir + '/img/icon/android-chrome-192x192.png',
            rootDir + '/js/min/main.min.js'
        ],
        stripPrefix: rootDir,
        handleFetch: true,
        runtimeCaching: [{
            urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\//,
            handler: 'cacheFirst'
        }, {
            urlPattern: /^https:\/\/www\.google-analytics\.com\//,
            handler: 'networkFirst'
        }, {
            urlPattern: /^https:\/\/ajax\.cloudflare\.com\//,
            handler: 'cacheFirst'
        }]
    }, function(error, serviceWorkerString) {
        if (!error) {
            gulp.src('app/sw.js')
                .pipe(uglify())
                .pipe(gulp.dest('app'));
        }
    });
});


// run below command to deploy folder 'app' to gh-pages branch
// git subtree push --prefix app origin gh-pages
