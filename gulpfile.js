var gulp = require("gulp");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");

gulp.task("compress", function() {
  gulp.src("crawlify.js")
		.pipe(rename("crawlify.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("."));
});

gulp.task("default", ["compress"]);
