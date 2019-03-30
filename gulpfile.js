const gulp = require('gulp');
const abs = require("abs");
const rename = require('gulp-rename');
const markdown = require('gulp-markdown');
const fileInclude = require('gulp-file-include');
const Gitdown = require('gitdown');
const splitFiles = require("gulp-split-files");

var src_path = "./src/";
var build_path = "./build/";
var dist_path = "./dist/";

// build whole markdown file
gulp.task('gitdown', function() {
    return Gitdown
        .readFile(abs(src_path + 'template.md'))
        .writeFile(abs(build_path + 'all.md'));
});

// split whole markdown file into TOC and BODY
gulp.task("split", ['gitdown'], function () {
    return gulp.src(build_path + "all.md")
    			.pipe(splitFiles())
    			.pipe(gulp.dest(build_path));
});

// TOC renderer
var renderer = new markdown.marked.Renderer();
renderer.list = function(body, ordered, start) {
  var type = ordered ? 'ol' : 'ul',
      startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
  var sectionstart = '<div class="searchable_section">\n';
  var sectionend = '</div>\n';
  return sectionstart + '<' + type + startatt + ' class="toc_section">\n' + body + '</' + type + '>\n' + sectionend;
};

renderer.listitem = function (text) {
    return '<li>- ' + text + '</li>\n';
};

gulp.task('md2html:toc', ['split'], function() {
	return gulp.src(build_path + 'toc.md')
		.pipe(markdown({
			renderer: renderer
		}))
		.pipe(rename({ extname: '.html' }))
		// .pipe(concat('markdown.html'))
		.pipe(gulp.dest(build_path));
});

// Body render
gulp.task('md2html:body', ['split'], function() {
	return gulp.src(build_path + 'body.md')
		.pipe(markdown())
		.pipe(rename({ extname: '.html' }))
	.pipe(gulp.dest(build_path));
});

// Merge split html into single one
gulp.task('mergeHtml', ['md2html:toc', 'md2html:body'], function() {
    return gulp.src(src_path + 'index.html')//主文件
        .pipe(fileInclude({
            prefix: '@@',//变量前缀 @@include
            basepath: './src/include',//引用文件路径
            indent: true//保留文件的缩进
        }))
        .pipe(gulp.dest(dist_path));//输出文件路径
});

// Default
gulp.task('default', ['mergeHtml']);