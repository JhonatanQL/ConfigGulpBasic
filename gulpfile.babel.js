import gulp, { series } from 'gulp'
import babel from 'gulp-babel'
import terser from 'gulp-terser'
import concat from 'gulp-concat'
import htmlmin from 'gulp-htmlmin'
import postcss from 'gulp-postcss'
import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'
import purgecss from 'gulp-purgecss'
import cacheBust from 'gulp-cache-bust'
import imagemin from 'gulp-imagemin'
import { init as server, stream, reload} from 'browser-sync'

//Constantes
const cssPlugins = [
  cssnano(),
  autoprefixer()
]

gulp.task('imgmin', () =>{
  return gulp
    .src('./src/assets/img/*')
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
          plugins: [
              {removeViewBox: true},
              {cleanupIDs: false}
          ]
      })
    ]))
    .pipe(gulp.dest('./public/assets/img'))
})

gulp.task('htmlmin', () =>{
  return gulp
    .src('./src/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(cacheBust({
      type: 'timestamp'
    }))
    .pipe(gulp.dest('./public'))
})

gulp.task('css', () =>{
  return gulp
    .src('./src/css/*.css')
    .pipe(concat('styles-min.css'))
    .pipe(postcss(cssPlugins))
    .pipe(gulp.dest('./public/css'))
    .pipe(stream())
})

gulp.task('purgecss', () =>{
  return gulp
    .src('./public/css/styles-min.css')
    .pipe(purgecss({
      content: ['./public/*.html']
    }))
    .pipe(gulp.dest('./public/css'))
})

gulp.task('babel', () =>{
  return gulp
    .src('./src/js/*.js')
    .pipe(concat('index.js'))
    .pipe(babel())
    .pipe(terser())
    .pipe(gulp.dest('./public/js'))
})

gulp.task('default', () =>{
  server({
    server: './public'
  })
  gulp.watch('./src/assets/img/*', gulp.series('imgmin'))
  gulp.watch('./src/*.html', gulp.series('htmlmin')).on('change', reload)
  gulp.watch('./src/css/*.css', gulp.series('css'))
  gulp.watch('./src/js/*.js', gulp.series('babel')).on('change', reload)
})