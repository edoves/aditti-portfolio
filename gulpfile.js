const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const gulp = require("gulp");
const imagemin = require('gulp-imagemin');
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const maps = require('gulp-sourcemaps');



function copyHTML() {
    return gulp.src('./*.html')
        .pipe(gulp.dest('/src'))
        .pipe(gulp.dest('./dist'));
}

function img() {
    return gulp.src('./src/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/img'));
}


gulp.task('framework', function (cb) {

    // Bootstrap
    gulp.src([
        './node_modules/bootstrap/dist/**/*',
        '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
        '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
        .pipe(gulp.dest('./dist/framework/bootstrap'))

    // Font Awesome
    gulp.src([
        './node_modules/@fortawesome/**/*',
    ])
        .pipe(gulp.dest('./dist/framework'))

    // jQuery
    gulp.src([
        './node_modules/jquery/dist/*',
        '!./node_modules/jquery/dist/core.js'
    ])
        .pipe(gulp.dest('./dist/framework/jquery'))

    cb();

});


// CSS task
function css() {
    return gulp
        .src("./src/scss/*.scss")
        .pipe(maps.init())
        .pipe(plumber())
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: "expanded"
        }))
        .on("error", sass.logError)
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest("./dist/css")) // style.css
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(cleanCSS())
        .pipe(maps.write('./'))
        .pipe(gulp.dest("./dist/css")) // style.min.css
        .pipe(browsersync.stream());
}



// JS task
function js() {
    return gulp
        .src([
            './src/js/*.js',
            '!./src/js/*.min.js'
            // '!./js/contact_me.js',
            // '!./js/jqBootstrapValidation.js'
        ])
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist/js'))
        .pipe(browsersync.stream());
}

// Tasks
gulp.task("css", css);
gulp.task("js", js);
gulp.task('images', img);
gulp.task('html', copyHTML);

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "./"
        }
    });
    done();
}

// BrowserSync Reload
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

// Watch files
function watchFiles() {
    gulp.watch("./src/scss/**/*", css);
    gulp.watch(["./src/js/**/*.js", "!./js/*.min.js"], js);
    gulp.watch(["./src/img/*"], img)
    gulp.watch("./**/*.html", browserSyncReload);
}

gulp.task("default", gulp.parallel('framework', css, js, img, copyHTML));

// dev task
gulp.task("dev", gulp.parallel(watchFiles, browserSync, ['default']));
