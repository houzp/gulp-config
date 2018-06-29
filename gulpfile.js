/*
## Gulp工程化构建项目说明

### 项目流程评价：
 - 1. 开发文件 --> 编译输出(dis)
 - 2. 编译输出 --> 打包上线(bundle)
 - 3. 开发文件 --> 编译输出(dis) --> 打包上线(bundle)

 - *注1:为保证开发与打包的一致性，建议开发与打包两个流程互斥，即开发完再打包上线，打包上线时不能再更改文件，
 - *注2:开发/打包时应移除打包过的所有文件，同时减少系统资源消耗，提升编译速度。如果编译系统宿主性能足够，或可同时进行。

### 项目文件夹
    / root   
        .git/
        .eslintrc.js
        .gitignore
        gulpfile.js
        package.json

        node_module/

        local/ 杂项
            doc/
            psd/
            xy/

        src/ ---- 原代码
            views/

            styles/
                includes/
                *.less/*.scss
            scripts/
                modules/
                *.js
            img/
                sprite/

            *.pug

        dis/ 编译输出-开发
            *.html
            img/
            css/
            js/

        bundle/ 打包/压缩上线
            img/
            css/
            js/

            *.html

### 子过程
 - dis:
  - scss/less --> css --> autoprefixer
  - es6/js --> js
  - pug --> html
  - img --> imgmin
  - browsersyncBuild

 - bundle:
  - css --> css min
  - js --> js min
  - img --> min/tinypng img - tinypng需人工干预，以确保所有图片都进行了压缩
  - html --> htmlmin 
  - browsersyncBundle 

### 预置文件
 - pre.pug
  - 基础的页面结构
  - 含qq聊天窗口抓取链接内容的meta标签，需要按需修改
  - 移动端初始化css的引用，已注释
  - 引用了jq swiper基础 
  - 通过条件注释引用了对ie8 9的兼容法
  - 微信分享的引用
  - 非阻塞脚本的引用示例
 - index.scss
  - 对include文件夹内容的引用，建议保留
 - index.less
  - pre.less：内含常用类，建议保留

### 文件与命名约定
 - 首页的pug/js/scss/less资源使用 index.*命名，同时页面也进行对应引用
 - 其余页面按照文件名-资源名的对应关系进行命名和引入，比如有页面名叫erji.html,则建议引用的css/js为erji.css / erji.js
 - 如果是公共资源，建议使用commonpart.js的方式单独引入
 - 非阻塞脚本建议使用async属性提前加载


### dis/bundle两个cli命令---此部分暂停开发
 - dis: gulp
 - bundle: npm run bundle
 - *注：建议两个过程互斥

### 关于gulpfile.js测试
 - 准备src文件夹下各种文件 
 - 进行单任务测试 / 文件依赖关系测试
  - 测试单pug文件编译, 
  - 测试pug include pug文件编译, 
  - 单less / 单sass 文件编译, 
  - less/scss @import 文件编译, 
  - js / es 文件编译 
  - css min 测试 
  - js min测试 
  - html replace测试 
  - img min / tiny png 测试 
  - dis 目录 / bundle 目录检查 
  - map文件检查 
  - 其他具体识gulp.task数量而定
 - 进行复合模块测试
 - 进行mult模块测试
 - 进行项目模拟测试
 - 进行项目测试


### 三个服务器，对应场景
 - dis
 - local 用于干杂活
 - bundle

### 合并 与 压缩,dis/bundle区别
 - 合并/打包更适用于模块聚合和模块/组件开发较多的场景
 - 如果应用于spa 则可以将所有js/css合并压缩
 - 如果应用于各个不同的页面，比如首页和各个二级，只能分页面资源压缩合并，此时task就需要传参按需修改
 - bundle更进一步压缩。因为pug，sass，browserify已经进行了部分合并操作。
 - 在news.cn的业务中，不适合将所有资源打包合并，顾暂不进行打包合并操作

### 其他补充
 - 预置文件可酌情使用
 - 在bash on win / win10子系统 中使用browser-sync需要在宿主防火墙中开放相应端口


*/

//根据传参执行不同任务，主要区分开发版和线上版本
// var passIn = process.argv.splice(2),
//     bundleCli = "bundle" //执行bundle时传入的命令，暂定为bundle 
// ;

// if (passIn == bundleCli) {
//     //do bundle
    

//     css concat  min --> 为了易于维护和区别，暂时不做concat
//     js concat uglify 
//     html htmlmin md5
//     img min

//     bundle server
//     local server

    
//     toBundle();
//     console.log("bundleing....")
// } else {
//     //do dev
//     /*
//     less/scss --> css --> autoprefixer
//     scripts --> js
//     pug --> html

//     dev server
//     local server

//     */
// }



var gulp = require("gulp"),
    less = require("gulp-less"),
    sass = require("gulp-sass"),
    pug = require("gulp-pug"),
    autoprefixer = require("gulp-autoprefixer"),
    babel = require("gulp-babel"),
    // browserify = require('browserify'),
    // babelify = require("babelify"),
    cssmin = require("gulp-clean-css"),
    uglify = require("gulp-uglify"),
    concat = require("gulp-concat"),
    clean = require('gulp-clean'),
    htmlmin = require("gulp-htmlmin"),
    sourcemaps = require("gulp-sourcemaps"),
    notify = require("gulp-notify"),
    plumber = require("gulp-plumber"),
    watch = require("gulp-watch"),
    imgmin = require("gulp-imagemin"),
    pngquant = require("gulp-pngquant"),
    rename = require('gulp-rename'), //把压缩的改为x.min.xx
    htmlreplace = require('gulp-html-replace'), //替换资源
    header = require('gulp-header'), //增加注释
    through = require('through2'),
    changed = require("gulp-changed"),//在任务中对比目标文件夹
    cache = require("gulp-cache"),
    spritesmith = require('gulp.spritesmith'),
    tinypng = require('gulp-tinypng-compress'),
    // browserify = require('gulp-browserify'),
    browsersync = require('browser-sync').create("s1"),
    reloadS1 = browsersync.reload,
    browsersyncLocal = require('browser-sync').create("s2"),
    reloadS2 = browsersyncLocal.reload,
    browsersyncBundle = require('browser-sync').create("s3"),
    reloadS3 = browsersyncBundle.reload;


var config = {
    "autoprefixer_conf": ["chrome 30", "Firefox < 20", "ios_saf 8", "safari 8", 'Android >= 2.1', 'IE 9', 'IE 10'],
    "htmlmin_conf": {
        removeComments: true, //清除HTML注释
        collapseWhitespace: false, //压缩HTML
        collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: false, //删除<style>和<link>的type="text/css"
        minifyJS: true, //压缩页面JS
        minifyCSS: true //压缩页面CSS
    },
    headerBanner: [
        '/**',
        '*',
        '@Author: hover-hou',
        '@Date: ' + (new Date()),
        '*',
        '*/'
    ].join('\n') + "\n",
    htmlReplaceConf:{
        css: {
            src: null,
            tpl: '<link rel="stylesheet" href="css/%f.min.css?v=' + (new Date() - 0) + '" />'
        },
        js: {
            src: null,
            tpl: '<script src="js/%f.min.js?v=' + (new Date() - 0) + '"></script>'
        }
    }
};

/*
!以下为单功能模块

*/



//browsersync
//开发用
//--- 注：bash on win / win10子系统 中使用browser-sync需要在宿主防火墙中开放相应端口
gulp.task('browsersync', function() {
    var files = [
        "*.html",
        "css/*.css",
        "js/*.js"
    ];

    browsersync.init(files, {
        server: {
            baseDir: "./dis"
        },
        notify: false,
        port: 3100,
        ui:{
            port:4100
        }
    });
});
//给local临时调试杂活用
gulp.task('browsersyncLocal', function() {
    var files = [
        "*.html",
        "*.css",
        "*.js"
    ];

    gulp.init(files, {
        server: {
            baseDir: "./local"
        },
        notify: false,
        port: 3300,
        ui:{
            port:4300
        }
    });
});
//bundle使用
gulp.task('browsersyncBundle', function() {
    var files = [
        "*.html",
        "css/*.css",
        "js/*.js"
    ];

    browsersyncBundle.init(files, {
        server: {
            baseDir: "./bundle"
        },
        notify: false,
        port: 3200,
        ui:{
            port:4200
        }
    });
});

gulp.task("browsersyncReload",function(){
    reloadS1();
})
gulp.task("browsersyncLocal",function(){
    reloadS2();
})
gulp.task("browsersyncBundle",function(){
    reloadS3();
})
/*
单任务单元
    输出说明 
        autoprefixer/less/scss/pug/babel 输出到开发文件夹
        cssclean/uglify/htmlmin/imgmin/tinypng/concat 基于编译好的文件 输出到 发布文件夹

        concat css实际上通过scss/less已经做了
        js只压缩 不合并 尤其是库文件 将来会使用类似以模块为单位按需加载 或者 treeshaking的方式合并

    单任务列表
        autoprefixer
        less
        scss
        pug
        concat
        uglify
        htmlmin
        cleancss
        tinypng
        imgmin
        babel
        clean
*/
//--------- clean ------------------
gulp.task('clean', function() {
    return gulp.src(['./dis','./bundle'], { read: false })
        .pipe(clean());
});

//--------- autoprefixer -------------
gulp.task('autofx', function() {
    gulp.src("./dis/css/*.css")
        .pipe(plumber())
        .pipe(autoprefixer({
            browsers: config["autoprefixer_conf"], //不同浏览器的版本号，数组；
            cascade: true, //是否美化属性值 默认：true -- 按照冒号对齐
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(gulp.dest('./dis/css'));
});

//--------- pug -------------
gulp.task('pug', function() {
    return gulp.src("./src/*.pug")
        .pipe(changed("./dis"))
        .pipe(plumber())
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('./dis'));
});
//--------- sass -------------
gulp.task('sass', function() {
    return gulp.src("./src/styles/*.scss")
        .pipe(changed('./dis/css'))
        .pipe(sourcemaps.init())
        .pipe(header(config.headerBanner))
        .pipe(plumber({
            errorHandler: notify.onError('Error: <%= error.message %>')
        })) //错误处理
        .pipe(sass({
            outputStyle: 'expanded',
            precision: 18
        }))
        .pipe(autoprefixer({
            browsers: config["autoprefixer_conf"], //不同浏览器的版本号，数组；
            cascade: true, //是否美化属性值 默认：true -- 按照冒号对齐
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('./dis/css'));
});

//--------- less -------------
gulp.task('less', function() {
    return gulp.src("./src/styles/*.less")
        .pipe(changed('./dis/css'))
        .pipe(sourcemaps.init())
        .pipe(header(config.headerBanner))
        .pipe(plumber({
            errorHandler: notify.onError('Error: <%= error.message %>')
        })) //错误处理
        .pipe(less())
        .pipe(autoprefixer({
            browsers: config["autoprefixer_conf"], //不同浏览器的版本号，数组；
            cascade: true, //是否美化属性值 默认：true -- 按照冒号对齐
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('./dis/css'));
});


//--------- babel -------------
gulp.task('babel', function() {
    return gulp.src("./src/scripts/*.js")
    // .pipe(changed("./dis/js"))
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(header(config.headerBanner))
    .pipe(babel())
    .pipe(sourcemaps.write("maps"))
    .pipe(gulp.dest("./dis/js"))
})

//------ ---------

//--------- browserify -------------
// gulp.task('browserify', function() {
//     // return gulp.src("./src/scripts/*.js")
//     // // .pipe(changed("./dis/js"))
//     // .pipe(header(config.headerBanner))
//     // .pipe(sourcemaps.init())
//     // .pipe(babel())
//     // .pipe(sourcemaps.write("maps"))
//     // .pipe(gulp.dest("./dis/js"))
// })

//---- changeName -------------
//--------- clean-css ------------------
/*
!!!!!!!!!!!

*/
gulp.task('cssmin', function() {
    return gulp.src("./dis/css/*.css")
        // .pipe(changed("./bundle/css"))
        .pipe(plumber())
        .pipe(gulp.dest("./bundle/css"))
        .pipe(header(config.headerBanner))
        .pipe(cssmin({
            advanced: false, //类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: 'ie8', //保留ie8及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: true, //类型：Boolean 默认：false [是否保留换行]
            keepSpecialComments: '*'
            //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }))
        .pipe(header(config.headerBanner))
        .pipe(rename({ suffix: ".min" }))
        .pipe(gulp.dest("./bundle/css"));
});

//--------- uglify -------------
gulp.task('jsmin', function() {
    return gulp.src("./dis/js/*.js")
        // .pipe(changed("./bundle/js"))
        .pipe(plumber())
        .pipe(gulp.dest("./bundle/js"))
        .pipe(header(config.headerBanner))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('maps'))
        .pipe(rename({ suffix: ".min" }))
        .pipe(gulp.dest('./bundle/js'));
});

//--------- concat -------------

/*
gulp.task('concatcss', function() {
    return gulp.src('./dis/css/*.css')
        .pipe(concat('all.min.css')) //合并后的文件名
        .pipe(gulp.dest('./dis/css'));
});
gulp.task('concatjs', function() {
    return gulp.src('./dis/js/*.js')
        .pipe(concat('all.min.js')) //合并后的文件名
        .pipe(gulp.dest('./bundle/js/'));
});
gulp.task('concatminjs', function() {
    return gulp.src('js/*.js')
        .pipe(concat('all_js.js')) //合并后的文件名
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('out/js'));
});
*/
//--------- htmlmin -------------
gulp.task('htmlmin', function() {
    return gulp.src('./dis/*.{html,htm}')
        // .pipe(changed("./dis"))
        .pipe(plumber())
        .pipe(htmlreplace(config.htmlReplaceConf))
        .pipe(htmlmin(config.htmlmin_conf))
        .pipe(gulp.dest('./bundle'))
});


//--------- imagemin -------------
gulp.task("copyMedia",function(){
    return gulp.src("./src/img/*.{mp4,mp3}")
    .pipe(gulp.dest("./dis/img"))
})

gulp.task('imgmin', ["copyMedia"],function() {
    console.log("img-min");
    return gulp.src("./src/img/*.{png,jpg,gif,jpeg,ico,svg}")
        .pipe(changed("./dis/img"))
        .pipe(plumber())
        .pipe(cache(imgmin([
            imgmin.gifsicle({interlaced: true}),
            imgmin.jpegtran({progressive: true}),
            imgmin.optipng({optimizationLevel: 5}),
            imgmin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
                })])))
        .pipe(gulp.dest('./dis/img'));
});

//--------- tinypng -------------
gulp.task("svg2bundle",function(){
    return gulp.src('./dis/img/*.svg')
    .pipe(changed("./bundle/img"))
    .pipe(plumber())
    .pipe(gulp.dest('./bundle/img'));
})

gulp.task("tinypng",["svg2bundle"], function() {
    return gulp.src('./dis/img/*.{jpg,png,,gif,jpeg,ico}')
        .pipe(changed("./bundle/img"))
        .pipe(plumber())
        // .pipe(through.obj(function(file,enc,cb){
        //     console.log(file.relative);
        //     // console.log(file.path);
        //     if(file.relative.includes(".svg")){

        //         cb();
        //     }else{
        //         this.push(file);
        //         cb();
        //     }
        // })).on("end",function(){
        //     (gulp.dest('./bundle/img'))
        // })
        .pipe(tinypng({
            key: '1qm9vD051NqOIWIylcdsJeqTdaByduVU', //用的时候自己申请啊,
            sigFile: '',
            log: true
        })).on('error', function(err) {
            console.error(err.message);
        })
        .pipe(gulp.dest('./bundle/img'));
});

gulp.task("tinydev",function(){
    return gulp.src("./src/img/*.{jpg,png,gif,jpeg,icon}")
        .pipe(plumber())
        .pipe(tinypng({
            key: '1qm9vD051NqOIWIylcdsJeqTdaByduVU', //用的时候自己申请啊,
            sigFile: '',
            log: true
        }))
        .on('error', function(err) {
            console.error(err.message);
        })
        .pipe(gulp.dest("./src/img/tiny"))
})

//--------- gulp.spritesmith -------------
gulp.task('sprite', function() {
    var spriteData = gulp.src('./dis/img/sprite/*{.png,.jpg}').pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: "./spritecss/_sparite.css", //保存合并后对于css样式的地址
        padding: 4, //合并时两个图片的间距
        algorithm: 'top-down'
        // algorithm:"binary-tree"
    }));
    return 
        spriteData.pipe(gulp.dest('./dis/img/sprite'));
});

//--------- rev -------------
//仅添加md5后缀 -- 通过直接更改资源命名进行资源更新
// gulp.task('rev', function() {
//     return gulp.src('./dis/*.css')
//         .pipe(rev())
//         .pipe(gulp.dest('./bundle/revcss'));
// });




//----------------------------------------------

//集成任务模块/多任务模块 

//----------------------------------------------
//--------- scss --css,map,autoprefixer,cssmin,rename
gulp.task("sassAll", function() {
    return gulp.src("./src/styles/*.scss")
        // .pipe(changed('./dis/css'))
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded',
            precision: 18
        }))
        .pipe(autoprefixer({
            browsers: config["autoprefixer_conf"],
            cascade: true, //是否美化属性值 默认：true -- 按照冒号对齐
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(header(config.headerBanner))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest("./dis/css"))
        .pipe(gulp.dest("./bundle/css"))
        .pipe(cssmin({
            advanced: false,
            compatibility: 'ie8',
            keepBreaks: true,
            keepSpecialComments: '*'
        }))
        .pipe(rename({
            suffix:".min"
        }))
        // .pipe(concat('index.min.css'))
        .pipe(header(config.headerBanner))
        .pipe(gulp.dest("./bundle/css"))
})
//--------- less --css,map,autoprefixer,cssmin,rename
gulp.task("lessAll", function() {
    return gulp.src("./src/styles/*.less")
        // .pipe(changed('./dis/css'))
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer({
            browsers: config["autoprefixer_conf"],
            cascade: true, //是否美化属性值 默认：true -- 按照冒号对齐
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(header(config.headerBanner))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest("./dis/css"))
        .pipe(gulp.dest("./bundle/css"))
        .pipe(cssmin({
            advanced: false,
            compatibility: 'ie8',
            keepBreaks: true,
            keepSpecialComments: '*'
        }))
        .pipe(rename({
            suffix:".min"
        }))
        // .pipe(concat('index.min.css'))
        .pipe(header(config.headerBanner))
        .pipe(gulp.dest("./bundle/css"))
})

//--------- babelAll -------------
gulp.task('babelAll',["babel"], function() {
    return gulp.src("./dis/js/*.js")
    // .pipe(changed("./dis/js"))
    .pipe(plumber())
    .pipe(gulp.dest("./bundle/js"))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(header(config.headerBanner))
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest("./bundle/js"))
})

//--------- pugAll -------------
gulp.task('pugAll', function() {
    return gulp.src("./src/*.pug")
        .pipe(plumber())
        .pipe(changed("./dis"))
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('./dis'))
        .pipe(htmlreplace(config.htmlReplaceConf))
        .pipe(htmlmin(config.htmlmin_conf))
        .pipe(gulp.dest('./bundle'))
});

//--------- imageminAll -------------
gulp.task('imgminAll', function() {
    return gulp.src("./src/img/*.{png,jpg,gif,jpeg,ico,svg}")
        // .pipe(changed("./dis/img"))
        .pipe(plumber())
        .pipe(cache(imgmin([
            imgmin.gifsicle({interlaced: true}),
            imgmin.jpegtran({progressive: true}),
            imgmin.optipng({optimizationLevel: 5}),
            imgmin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
                })])))
        .pipe(gulp.dest('./dis/img'))
        .pipe(gulp.dest('./bundle/img'));
});

//----------------------------------------------------------------

//--------- dis -------------
gulp.task('default',["clean"], function() {
    gulp.start(["sass","less","pug","imgmin","babel","browsersync","browsersyncLocal"]);
    // gulp.watch("./src/styles/*.less", ['less','browsersyncReload']); //当所有less文件发生改变时，调用less任务
    // gulp.watch("./src/styles/*.scss", ['sass','browsersyncReload']); //当所有scss文件发生改变时，调用less任务
    // gulp.watch('./src/view/**/*.pug', ['pug','browsersyncReload']);
    // gulp.watch('./src/*.pug',["pug",'browsersyncReload']);
    // gulp.watch('./dis/js/*.js',["babel",'browsersyncReload'])
    // gulp.watch('./src/img/*.{png,jpg,jpeg,svg}',["imgmin",'browsersyncReload'])
    watch("./src/styles/*.less", function(){
        gulp.start(['less','browsersyncReload']);
    }); //当所有less文件发生改变时，调用less任务
    watch("./src/styles/*.scss", function(){
        gulp.start(['sass','browsersyncReload']);
    }); //当所有scss文件发生改变时，调用less任务
    watch('./src/view/**/*.pug',  function(){
        gulp.start(['pug','browsersyncReload']);
    });
    watch('./src/*.pug', function(){
        gulp.start(["pug",'browsersyncReload']);
    });
    watch('./src/scripts/*.js', function(){
        gulp.start(["babel",'browsersyncReload']);
    });
    watch('./src/img/*.{png,jpg,jpeg,svg}', function(){
        gulp.start(["imgmin",'browsersyncReload']);
    });
});

//--------- bundle -------------
gulp.task("bundle",function(){
    gulp.start(["tinypng","cssmin","htmlmin","jsmin","browsersyncBundle"]);
})

//---------- mult-moudle --------------
gulp.task("multMoudle",["clean"],function(){
    gulp.start(["pugAll","sassAll","lessAll",'babelAll','imgminAll',"browsersyncBundle","browsersync","browsersyncLocal"])
})

//---------- cli bundle -----------
// function toBundle(){
//     gulp.start(["sassAll","lessAll","htmlmin","browsersyncBundle"]);
// }


// gulp.task("test",function(){
//     watch('./src/*.pug',["pug",'browsersyncReload']);
//     watch('./dis/js/*.js',["babel",'browsersyncReload']);
// })
// gulp.task("log",function(){
//     console.log(" task has already run!");
// });
// gulp.task("check",function(){
//     console.log(" task has already check");
// });

// // console.log();
// gulp.start(["log","check"]);
//task list
// gulp.task("dev", ['autowatch', 'browsersync','browsersynclocal']);
// gulp.task("bundle", ['browsersynclocal']);