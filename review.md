## Gulp 配置 ##
###### 8/19/2016 10:45:36 AM 
###### 完成此文档时已发布node 6.3.0，但是推荐使用node 5.9.0以及淘宝npm镜像
###### Posted by Xh007 qq358914543
## 
### 功能、模块名称：
1. gulp
2. gulp-less
3. gulp-jade
4. gulp-autoprefixer
5. gulp-clean-css
6. gulp-uglify
7. gulp-babel
8. gulp-concat
9. gulp-htmlmin
10. gulp-sourcemaps
11. browser-sync
12. gulp-notify
13. gulp-plumber
14. gulp-imagemin
15. imagemin-pngquant(作为gulp-imagemin的png图片压缩插件)
16. gulp-rev(后期统一构建)
17. gulp-rev-append(gulp-rev-* 系列后期统一构建)
18. gulp-rev-collector(gulp-rev-* 系列后期统一构建)
19. gulp-eslint(待定)
20. 模块打包(待定CMD模块)
21. run-sequence
22. vinyl-source-stream
23. vinyl-buffer
24. event-stream
###### p.s.
- gulp-clean能够清空文件夹，需慎用;
- 有些插件需全局安装，如less和browser-sync;
- rev+collector用于修改文件名，gulp-rev-append仅增加版本号，视静态资源发布需求而定；
- less/sass以及js压缩、babel转换后默认开启sourcemaps;
- watch 的时候路径不要用 './xxx'，直接使用 'xxx' 即可，不然某个被 watch 的路径中新建文件是不能激活 watch 的。
- gulp 对于 one after one 的任务链，需要加 return，比如 gulp clean
##
### 流程预估
1. jade-->html-->htmlmin;
2. less-->css-->concat-->autoprefixer-->clean-css-->sourcemaps-->rev/rename;
3. babel-->es5-->concat-->uglify-->sourcemaps-->rev/rename;
4. img-->imagemin(imagemin-pngquant)-->rev/rename;
5. 并行：1,2,3,4并行；
6. 待定流程：html/css文件中引用路径的更改；
## 

### 目录结构
待定
##

### 配置
##### 1.gulpfile.js简单说明
    /*
	gulp.src(xxx)中，
	xxx是文件，多个文件使用数组，如["index.lsee","main.less"...];
	*：对应所有文件；
	**：所有文件夹，如less/**/path/*.less；
	{}：对应指定的文件，如less/{file1，file2}.less;
	*/
	/*
	gulp.task(TASKNAME，fn）
	TASKNAME即为在命令窗口调用的名字或者自动编译时调用的名字
	*/

##### 2.单模块配置

###### gulp-less

    //gulp-less
	//安装：npm install --save-dev gulp-less;

	var less=require("gulp-less");
	gulp.task('less', function() {
    	gulp.src(*.less.files)
		.pipe(sourcemaps.init())
        .pipe(less())
		.pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('PATH')); 
	});

	//自动监视less文件并进行编译
	gulp.task('autoless', function() {
	    gulp.watch(*.less.files, ['less']); 
	});

###### gulp-jade
	//jade
	//安装：npm install --save-dev gulp-jade;
	//jade 目前稳定版为1.1，之后改名为pug，兼容性有待测试；

	var jade = require('gulp-jade');
	gulp.task('jade', function() {
	    return gulp.src('jade/*.jade')
	    .pipe(jade({
	      pretty: true
    	}))
    	.pipe(gulp.dest(''));
	});
	//自动监视less并进行编译
	gulp.task('autojade', function() {
	    gulp.watch(*jade/*.jade, ['jade']); 
	});
	
###### gulp-autoprefixer
	//gulp-autoprefixer
	//安装：npm install --save-dev gulp-autoprefixer;
	//需一个数组，里面放置需要兼容的浏览器以及版本号；

	var autoprefixer = require('gulp-autoprefixer');
	var autoprefixerArr=[ "chrome 30", "Firefox < 20","ios_saf 8", "safari 8",'Android >= 2.3'];
	gulp.task('autofx', function () {
	    gulp.src("*.css")
	        .pipe(autoprefixer({
	            browsers: autoprefixerArr,
	            cascade: true, //是否美化属性值 默认：true 像这样：
	            //-webkit-transform: rotate(45deg);
	            //        transform: rotate(45deg);
	            remove:true //是否去掉不必要的前缀 默认：true
	        }))
	        .pipe(gulp.dest('css'));
	});

###### gulp-clean-css
	//gulp-clean-css
	//安装：npm install --save-dev gulp-clean-css;

	var cssmin = require('gulp-clean-css');
	gulp.task('cssmin', function () {
		gulp.src("*.css")
	    .pipe(cssmin({
	            advanced: true,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
	            compatibility: 'ie8',//保留ie8及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
	            keepBreaks: true,//类型：Boolean 默认：false [是否保留换行]
	            keepSpecialComments: '*'
	            //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
	      }))
	      .pipe(gulp.dest("PATH"));
	});

###### gulp-uglify
	//gulp-uglify
	//安装：npm install --save-dev gulp-uglify;

	var uglify = require('gulp-uglify');
	gulp.task('jsmin', function () {
     	gulp.src(js/*.js)
			.pipe(sourcemaps.init())
        	.pipe(uglify())
			.pipe(sourcemaps.write('maps'))
        	.pipe(gulp.dest('PATH'));
	});

###### gulp-babel
	//gulp-babel
	//安装：npm install --save-dev gulp-babel babel-preset-es2015;

	var babel = require('gulp-babel');
	gulp.task('babel', () => {
	    return gulp.src('*.js')
			.pipe(sourcemaps.init())
	        .pipe(babel({
	            presets: ['es2015']
	        }))
			.pipe(sourcemaps.write('maps/es6'))
	        .pipe(gulp.dest('PATH'));
	});

	
###### gulp-concat
	//gulp-concat
	//安装：npm install --save-dev gulp-concat;

	var concat = require('gulp-concat');
	//一搬作为cssmin和jsmin中的模块使用
	gulp.task('concat', function () {
	    gulp.src('*.js')
	        .pipe(concat('all.js'))//合并后的文件名
	        .pipe(gulp.dest('PATH'));
	});
###### gulp-htmlmin
	//gulp-htmlmin
	//安装：npm install --save-dev gulp-htmlmin;

	var htmlmin = require('gulp-htmlmin');
	gulp.task('htmlmin', function () {
	    var options = {
	        removeComments: true,//清除HTML注释
	        collapseWhitespace: true,//压缩HTML
	        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
	        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
	        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
	        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
	        minifyJS: true,//压缩页面JS
	        minifyCSS: true//压缩页面CSS
	    };
	    gulp.src('*.html')
	        .pipe(htmlmin(options))
	        .pipe(gulp.dest('PATH'));
	});
###### gulp-sourcemaps
	//gulp-sourcemaps
	//安装：npm install --save-dev gulp-sourcemaps;

	var sourcemaps = require('gulp-sourcemaps');
	//作为less,jsmin,babel中的模块使用；
###### browser-sync
	//browser-sync
	//安装：npm install --save-dev browser-sync;

	var browserSync = require('browser-sync').create();
	gulp.task('sync', function() {
	  var files = [
		    '*.html',
		    'css/*.css',
		    'js/*.js'
		  ];
	
	  browserSync.init(files,{
	    server: {
	      baseDir: "./"
	    }
	  });
	});

###### gulp-notify
	//gulp-notify
	//安装：npm install --save-dev gulp-notify;

	var notify = require('gulp-notify');
	//与less等编译器配合输出错误信息且不中断任务
###### gulp-plumber
	//gulp-plumber
	//安装：npm install --save-dev gulp-plumber;

	var plumber = require('gulp-plumber');
	//与less等编译器配合输出错误信息且不中断任务
	gulp.task('less', function() {
	    gulp.src(inputPath_less) //该任务针对的文件,多个用数组,!,*,**指子文件夹:less/**/{reset,test}.less,{}里面是文件名；
	        .pipe(sourcemaps.init())
	        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
	        .pipe(less()) //该任务调用的模块
	        .pipe(sourcemaps.write('.'))
	        .pipe(gulp.dest(outputPath_lessToCss)); //将会在css下生成css
	});
###### gulp-imagemin
	//gulp-imagemin
	//安装：npm install --save-dev gulp-imagemin;

	var imagemin = require('gulp-imagemin');
	具体使用见 imagemin-pngquant
###### imagemin-pngquant(作为gulp-imagemin的png图片压缩插件,需全局安装)
	//imagemin-pngquant
	//安装：npm install imagemin-pngquant --save-dev；

	var imagemin = require('gulp-imagemin')，
		pngquant = require('imagemin-pngquant');
	
	gulp.task('imgAllmin', function () {
     	gulp.src("img/*.{png,jpg,gif,ico}")
	         .pipe(cache(imagemin({
	             optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
	             progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
	             interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
	             multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
	             svgoPlugins: [{removeViewBox: false}],//不要移除svg的viewbox属性
	             use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
	        })))
        .pipe(gulp.dest('PATH'));
	});

###### gulp-rev(既可以添加md5后缀，也可以修改文件名)
	//gulp-rev
	//安装：npm install --save-dev gulp-rev;

	/*
	//仅添加md5后缀
	var rev = require('gulp-rev');
	gulp.task('default', function () {
	    return gulp.src('*.css')
	        .pipe(rev())
	        .pipe(gulp.dest('PATH'));
	});
	*/
	/*
	https://www.npmjs.com/package/gulp-rev/
	牵扯太多待定；
	*/
###### gulp-rev-collector 
	//gulp-rev-append
	//安装：npm install --save-dev gulp-rev-append;

	var rev = require('gulp-rev-append');
	//都是gulp-rev-* 系列的拓展插件，后期统一构建；
###### gulp-rev-append(gulp-rev-* 系列)
	//gulp-rev-append
	//安装：npm install --save-dev gulp-rev-append;

	var rev = require('gulp-rev-append');
	gulp.task('rev', function () {
	    gulp.src('*.css')
	        .pipe(rev())
	        .pipe(gulp.dest('PATH'));
	});
###### gulp-eslint
	//gulp-eslint
	//安装：npm install --save-dev gulp-eslint;

	var eslint = require('gulp-eslint');

###### 模块打包(待定CMD)

##### 3.复合模块
###### less-->css-->cssmin-->autoprefixer-->sourcemaps
	//
	gulp.task('less', function() {
        gulp.src(inputPath_less) 
        .pipe(sourcemaps.init())//sourcemaps
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))//错误处理
        .pipe(less())//less编译
        .pipe(cssmin())//cssmin
        .pipe(autoprefixer({
            browsers: [ "chrome 30", "Firefox < 20","ios_saf 8", "safari 8",'Android >= 2.3'],
            cascade: true, 
            remove:true,
            map: true
        }))//autoprefixer
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('PATH')); 
	});
    
###### 

	//多任务中的单任务
	gulp.task('autofx', function () {
     	gulp.src(inputPath_css)
        .pipe(autoprefixer({
            browsers: autoprefixerArr,
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:false //是否去掉不必要的前缀 默认：true
        }))
        .pipe(gulp.dest('css'));
	});
	/////////////////////////
###### cssmin-->autoprefixer
	gulp.task('cssmin', function() {
		gulp.src('css/*.css')
		.pipe(autoprefixer({
      			browsers: [ "chrome 30", "Firefox < 20","ios_saf 8", "safari 		8",'Android >= 2.3'],
      			cascade: true, //是否美化属性值 默认：true 
      	remove:true //是否去掉不必要的前缀 默认：true
		}))
	.pipe(gulp.dest('PATH'))
    .pipe(cssmin({compatibility: 'ie8'}))
    .pipe(gulp.dest('PATH'));
	});
###### less-->concat-->cssmin-->autoprefixer-->sourcemaps;
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
###### babel-->es5-->uglify-->sourcemaps
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

### 杂项
- 淘宝npm镜像安装：`npm install -g cnpm --registry=https://registry.npm.taobao.org；`
- gulp-if以及串行方式处理任务暂无，因此命令行传参暂无；