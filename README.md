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
