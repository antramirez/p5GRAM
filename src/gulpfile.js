const gulp = require('gulp');
const sass = require('gulp-sass');

// compile sass into css
gulp.task('sass', function() {
  return gulp.src('./sass/*.scss')  // source is any scss file in sass directory
        .pipe(sass()) // run sass function to convert scss to css
        .pipe(gulp.dest('./public/css'));  // destination is public css directory (if file exists, it updates it; else, it creates new css file named after .scss file)
});

// look for any changes in scss file, and apply it to css file
// without having to type 'gulp' in the commandline everytime
// a change is made
gulp.task('watch', function() {
   gulp.watch('./sass/*.scss', gulp.series('sass'));
});

// by setting default task, the user can simply type 'gulp' in the commandline,
// instead of 'gulp' and the task name
gulp.task('default', gulp.series('sass', 'watch'));
