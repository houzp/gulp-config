var gulp=require('gulp'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	autoprefixer = require('gulp-autoprefixer'),
	cleanCSS = require('gulp-clean-css'),
	htmlmin = require('gulp-htmlmin'),
    browserSync = require('browser-sync').create(),
	revCollector = require('gulp-rev-collector'),
	runSequence = require('run-sequence');



gulp.task('browser-sync', function() {
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
/*gulp.task('testConcat', function () {
    gulp.src('js/*.js')
        .pipe(concat('all.js'))//合并后的文件名
        .pipe(gulp.dest('dist/js/concat'));
});*/

gulp.task('jsmin', function () {
    gulp.src(['js/content.js'])
        .pipe(uglify({
            mangle: false,//类型：Boolean 默认：true 是否修改变量名
            compress: true,//类型：Boolean 默认：true 是否完全压缩
            preserveComments: 'none' //保留所有注释
        }))
        .pipe(gulp.dest('bundle/js'));
});

gulp.task('autoFx', function () {
    gulp.src('css/content.css')
        .pipe(autoprefixer({
            browsers: [ "chrome 30", "Firefox < 20","ios_saf 8", "safari 8",'Android >= 2.3'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(gulp.dest('css'));
});
// [ "chrome 30", "Firefox < 20","ios_saf 8", "safari 8",'Android >= 2.3','ie 6-8','Opera <= 20']
// [ "chrome 30", "Firefox < 20","ios_saf 8", "safari 8",'Android >= 2.3']

gulp.task('cssmin', function() {
  return gulp.src('css/content.css')
  .pipe(autoprefixer({
	  browsers: [ "chrome 30", "Firefox < 20","ios_saf 8", "safari 8",'Android >= 2.3'],
	  cascade: true, //是否美化属性值 默认：true 像这样：
	  //-webkit-transform: rotate(45deg);
	  //        transform: rotate(45deg);
	  remove:true //是否去掉不必要的前缀 默认：true
  }))
  .pipe(gulp.dest('css'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('bundle/css'));
});

/*gulp.task('testImagemin', function () {
    gulp.src('app_ys/img/*.{png,jpg,gif,ico}')
        .pipe(imagemin({
            optimizationLevel: 3, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
            use: [pngquant()]
        }))
        .pipe(gulp.dest('app_ys/img'));
});*/

gulp.task('htmlmin', function () {
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: false,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
    gulp.src('*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('dist'));
});

gulp.task('rev',function() {
	gulp.src(['rev-manifest.json', 'content.html'])//- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector())                                   //- 执行文件内css名的替换
        .pipe(gulp.dest('./build/'));                     //- 替换后的文件输出的目录
});
gulp.watch('css/centent.css',['rev']);

/*gulp.task('build', function(callback) {
  runSequence(
              ['autoFx','jsmin'],
              'cssmin',
              callback);
});
*/

// gulp.task('watch', function() {
//
//   // 看守所有.scss档
//   gulp.watch('src/styles/**/*.scss', ['styles']);
//
//   // 看守所有.js档
//   gulp.watch('src/scripts/**/*.js', ['scripts']);
//
//   // 看守所有图片档
//   gulp.watch('src/images/**/*', ['images']);
//
// });


gulp.task('default',['autoFx','cssmin']);
　　
