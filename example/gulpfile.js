var gulp = require("gulp"),
    less = require("gulp-less"),
    jade = require("gulp-jade"),
    autoprefixer = require("gulp-autoprefixer"),
    cssmin = require("gulp-clean-css"),
    uglify = require("gulp-uglify"),
    babel = require("gulp-babel"),
    concat = require("gulp-concat"),
    htmlmin = require("gulp-htmlmin"),
    sourcemaps = require("gulp-sourcemaps"),
    notify = require("gulp-notify"),
    plumber = require("gulp-plumber"),
    imgmin = require("gulp-imagemin"),
    pngmin = require("gulp-pngquant"),
    rev = require("gulp-rev"),
    browsersync = require('browser-sync').create();

var config = {
    "browsersync_conf": {
        "files": [
            '*.html',
            'css/*.css',
            'js/*.js'
        ],
        "server": {
            baseDir: "./"
        }
    },
    "autoprefixer_conf": ["chrome 30", "Firefox < 20", "ios_saf 8", "safari 8", 'Android >= 2.3'],
    "htmlmin_conf": {
        removeComments: true, //清除HTML注释
        collapseWhitespace: false, //压缩HTML
        collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
        minifyJS: true, //压缩页面JS
        minifyCSS: true //压缩页面CSS
    }
};

/*
!以下为单功能模块
 */
//browsersync
gulp.task('browsersync', function() {
    browsersync.init(config["browsersync_conf"]["files"], config["browsersync_conf"]["server"]);
});

//babel
gulp.task('babel', () => {
    return gulp.src('es6js/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(sourcemaps.write('../maps/es6'))
        .pipe(gulp.dest('js'));
});

//autoprefixer
gulp.task('autofx', function() {
    gulp.src("css/*.css")
        .pipe(autoprefixer({
            browsers: config["autoprefixer_conf"], //不同浏览器的版本号，数组；
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(gulp.dest('css'));
});


//clean-css
gulp.task('cssmin', function() {
    gulp.src("css/*.css")
        .pipe(cssmin({
            advanced: true, //类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: 'ie8', //保留ie8及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: true, //类型：Boolean 默认：false [是否保留换行]
            keepSpecialComments: '*'
            //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }))
        .pipe(gulp.dest("css"));
});

//concat
gulp.task('concatcss', function() {
    gulp.src('css/*.css')
        .pipe(concat('all_css.css')) //合并后的文件名
    .pipe(gulp.dest('./css'));
});
gulp.task('concatjs', function() {
    gulp.src('js/*.js')
        .pipe(concat('all_js.js')) //合并后的文件名
    .pipe(gulp.dest('js'));
});
//htmlmin
gulp.task('htmlmin', function() {
    gulp.src('*.html')
        .pipe(htmlmin(htmlmin_conf))
        .pipe(gulp.dest('PATH'));
});
//imagemin
gulp.task('imgmin', function() {
    gulp.src("img /*.{png,jpg,gif,ico}")
        .pipe(cache(imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
            svgoPlugins: [{
                removeViewBox: false
            }], //不要移除svg的viewbox属性
            use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
        })))
        .pipe(gulp.dest('img'));
});
//jade
gulp.task('jade', function() {
    return gulp.src('jade/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(''));
});
//less
gulp.task('less', function() {
    gulp.src("less/*.less")
        .pipe(sourcemaps.init())
        .pipe(plumber({
            errorHandler: notify.onError('Error: <%= error.message %>')
        })) //错误处理
    .pipe(less())
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest('css'));
});
//uglify
gulp.task('jsmin', function() {
    gulp.src("js/*.js")
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest('js'));
});


//rev
//仅添加md5后缀
gulp.task('rev', function() {
    return gulp.src('*.css')
        .pipe(rev())
        .pipe(gulp.dest('css'));
});
/*
!以下为复合能模块
 */
//less-->cssmin-->autoprefixer-->sourcemaps;
gulp.task('less_all', function() {
    gulp.src("less/*.less")
        .pipe(sourcemaps.init()) //sourcemaps
    .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
    })) //错误处理
    .pipe(less()) //less编译
    .pipe(cssmin()) //cssmin
    .pipe(autoprefixer({
        browsers: config["autoprefixer_conf"],
        cascade: true,
        remove: true,
        map: true
    })) //autoprefixer
    .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('css'));
});
//less-->concat-->cssmin-->autoprefixer-->sourcemaps;
gulp.task('less_allin', function() {
    return gulp.src("less/*.less")
        .pipe(sourcemaps.init()) //sourcemaps
    .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
    })) //错误处理
    .pipe(less()) //less编译
    .pipe(concat("index.min.css"))
    .pipe(cssmin()) //cssmin
    .pipe(autoprefixer({
        browsers: config["autoprefixer_conf"],
        cascade: true,
        remove: true,
        map: true
    })) //autoprefixer
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('css'));
});
//块级注释内可以选择性开启或者关闭cssmin/autoprefixer
gulp.task('less_alternertive', function() {
    gulp.src("less/*.less")
        .pipe(sourcemaps.init()) //sourcemaps
    .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
    })) //错误处理
    .pipe(less()) //less编译
    /*
        .pipe(cssmin())//cssmin
        */
    /*
        .pipe(autoprefixer({
            browsers: config["autoprefixer_conf"],
            cascade: true, 
            remove:true,
            map: true
        }))//autoprefixer
        */
    .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('css'));
});
//babel-->es5-->uglify-->sourcemaps
gulp.task('babel_alternertive', () => {
    return gulp.src('es6js/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('../maps/es6'))
        .pipe(gulp.dest('js'));
});