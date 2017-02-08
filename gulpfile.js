
//npm install gulp-less --save-dev
//npm install gulp-concat --save-dev
//npm install gulp-uglify --save-dev
//npm install gulp-cssnano --save-dev
//npm install gulp-htmlmin --save-dev
//npm install browser-sync --save-dev

'use strict';

var gulp        = require('gulp');
var less        = require('gulp-less');
var cssnano     = require('gulp-cssnano');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var htmlmin     = require('gulp-htmlmin');
var browserSync = require('browser-sync');
var minifycss   = require('gulp-clean-css');
var rename      = require('gulp-rename'); // 文件重命名
var imagemin    = require('gulp-imagemin'); // 图片压缩
var clean       = require('gulp-clean'); // 文件清理
var changed 	= require('gulp-changed');// 只操作有过修改的文件
var watchPath   = require('gulp-watch-path');
//确保本地已安装imagemin-pngquant [npm install imagemin-pngquant --save-dev]
var pngquant    = require('imagemin-pngquant');

/* = 全局设置
 -------------------------------------------------------------- */
var srcPath = {
    html	: 'src',
    css		: 'src/css',
    script	: 'src/js',
    image	: 'src/images',
    lib     : 'src/lib'
};
var destPath = {
    html	: 'dist',
    css		: 'dist/css',
    script	: 'dist/js',
    image	: 'dist/images',
    lib     : 'dist/lib'
};

/* = 开发环境( Ddevelop Task )
 -------------------------------------------------------------- */
// HTML
gulp.task('html', function() {
    gulp.src(srcPath.html + '/*.html')
    .pipe(changed(destPath.html)) //先去比较是否改动
    .pipe(htmlmin({
        collapseWhitespace: true,//去除空格
        removeComments: true//删除注释
    }))
    .pipe(gulp.dest(destPath.html))
    .pipe(browserSync.reload({
        stream: true
    }));
});

// JS合并 压缩混淆
gulp.task('script', function() {
    gulp.src([srcPath.script + '/*.js','!'+srcPath.script+'/*min.js'])
    .pipe(changed(destPath.script))
    .pipe(concat('all.js'))
    .pipe(rename({ suffix: '.min' })) // 重命名
    .pipe(uglify({ preserveComments:'some' })) // 使用uglify进行压缩，并保留部分注释
    .pipe(gulp.dest(destPath.script))
    .pipe(browserSync.reload({
        stream: true
    }));
});

// 图片压缩
gulp.task('image', function() {
    gulp.src(srcPath.image + '/*.*')
    .pipe(changed(destPath.image)) //对比文件是否有过改动
    .pipe(imagemin({
        progressive: true, // 无损压缩JPG图片
        svgoPlugins: [{removeViewBox: false}], // 不移除svg的viewbox属性
        use: [pngquant()] // 使用pngquant插件进行深度压缩
    }))
    .pipe(gulp.dest(destPath.image))
    .pipe(browserSync.reload({
        stream: true
    }));
});

//LESS编译 压缩 --合并没有必要，一般预处理CSS都可以导包
// gulp.task('style', function() {
//     // 这里是在执行style任务时自动执行的
//     gulp.src(['src/app1/css/*.less', '!src/app1/css/_*.less'])
//     .pipe(less())
//     .pipe(cssnano())
//     .pipe(gulp.dest('dist/app1/css'))
//     .pipe(browserSync.reload({
//     stream: true
//     }));
// });

//css压缩
gulp.task('compress', function() {
    gulp.src([srcPath.css+'/*.css','!'+srcPath.css+'/*.min.css'])
    .pipe(concat('all.css'))
    .pipe(rename({ suffix: '.min' })) // 重命名
    .pipe(minifycss())
    .pipe(gulp.dest(destPath.css))
    .pipe(browserSync().reload({
         stream: true
    }));
});

gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: ['dist'],
      index: 'index.html'
    }
  }, function(err, bs) {
    console.log(bs.options.getIn(["urls", "local"]));
  });
});

// 监听任务
gulp.task('watch',function(){
    gulp.watch('src/css/*.css',['compress']);
    gulp.watch('src/js/*.js',['script']);
    gulp.watch('src/images/*.*',['image']);
    gulp.watch('src/*.html',['html']);
    gulp.watch('src/lib/**/*', function (event) {
        var paths = watchPath(event,'src/', 'dist/');
        gulp.src(paths.srcPath)
            .pipe(gulp.dest(paths.distDir))
    })
});

gulp.task('copy', function () {
    gulp.src('src/lib/**/*')
    .pipe(gulp.dest('dist/lib/'))
});

gulp.task('default', ['browserSync','watch','copy','html','script','image','compress','browserSync']);




/* = 发布环境( Release Task )  gulp release
 -------------------------------------------------------------- */
// 清理文件
gulp.task('clean', function() {
    return gulp.src( [destPath.css+'/maps',destPath.script+'/maps'], {read: false} ) // 清理maps文件
        .pipe(clean());
});
// 样式处理
gulp.task('sassRelease', function () {
    return sass( srcPath.css, { style: 'compressed' }) // 指明源文件路径、并进行文件匹配（编译风格：压缩）
        .on('error', function (err) {
            console.error('Error!', err.message); // 显示错误信息
        })
        .pipe(gulp.dest( destPath.css )); // 输出路径
});
// 脚本压缩&重命名
gulp.task('scriptRelease', function() {
    return gulp.src( [srcPath.script+'/*.js','!'+srcPath.script+'/*.min.js'] ) // 指明源文件路径、并进行文件匹配，排除 .min.js 后缀的文件
        .pipe(rename({ suffix: '.min' })) // 重命名
        .pipe(uglify({ preserveComments:'some' })) // 使用uglify进行压缩，并保留部分注释
        .pipe(gulp.dest( destPath.script )); // 输出路径
});
// 打包发布
gulp.task('release', ['clean'], function(){ // 开始任务前会先执行[clean]任务
    return gulp.start('sassRelease','scriptRelease','images'); // 等[clean]任务执行完毕后再执行其他任务
});




/* = 帮助提示( Help )
 -------------------------------------------------------------- */
gulp.task('help',function () {
    console.log('----------------- 开发环境 -----------------');
    console.log('gulp default		开发环境（默认任务）');
    console.log('gulp html		HTML处理');
    console.log('gulp sass		样式处理');
    console.log('gulp script		JS文件压缩&重命名');
    console.log('gulp images		图片压缩');
    console.log('gulp concat		文件合并');
    console.log('---------------- 发布环境 -----------------');
    console.log('gulp release		打包发布');
    console.log('gulp clean		清理文件');
    console.log('gulp sassRelease		样式处理');
    console.log('gulp scriptRelease	脚本压缩&重命名');
    console.log('---------------------------------------------');
});