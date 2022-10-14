import gulp from 'gulp'
const { series, parallel, src, dest, task, watch } = gulp
import clean from 'gulp-clean'
import sourcemaps from 'gulp-sourcemaps'
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
const sass = gulpSass(dartSass)
import nunjucksRender from 'gulp-nunjucks-render'
import plumber from 'gulp-plumber'
import { create as bsCreate } from 'browser-sync'
const browserSync = bsCreate()
import rename from 'gulp-rename'
import postcss from 'gulp-postcss'
import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'
import stringReplace from 'gulp-string-replace'
import imagemin from 'gulp-imagemin'
// webpack
import webpack from 'webpack-stream'
import webpackConfig from './webpack.config.js'
import webpackMainConfig from './webpack.main.config.js'

const renderTemplates = {
  path: './src/html/modules',
  watch: false,
  envOptions: {
    tags: {
      blockStart: '<%',
      blockEnd: '%>',
      variableStart: '{@',
      variableEnd: '@}',
      commentStart: '{#',
      commentEnd: '#}',
    },
  },
}

const htmlDev = () =>
  src('./src/html/pages/*.htm')
    .pipe(
      nunjucksRender(renderTemplates).on('error', function (err) {
        console.error(err)
        this.emit('end')
      })
    )
    .on('error', function (err) {
      console.error(err)
      this.emit('end')
    })
    .pipe(dest('./public/html'))
    .on('end', function () {
      console.log('Html rendering process completed!')
    })

const htmlBuild = () => {
  const timestamp = new Date().getTime()

  return src('./src/html/pages/*.htm')
    .pipe(
      nunjucksRender(renderTemplates).on('error', function (err) {
        console.error(err)
        this.emit('end')
      })
    )
    .on('error', function (err) {
      console.error(err)
      this.emit('end')
    })

    .pipe(stringReplace('main.css', `main.min.css?t=${timestamp}`))
    .pipe(stringReplace('vendors.js', `vendors.min.js?t=${timestamp}`))
    .pipe(stringReplace('main.js', `main.min.js?t=${timestamp}`))
    .pipe(stringReplace('bundle.js', `bundle.min.js?t=${timestamp}`))
    .pipe(stringReplace('<div class="e-device-detector"></div>', ''))
    .pipe(
      stringReplace('http://localhost:8888/', 'http://hq.linakis.com:9100/hbc/')
    )
    .pipe(dest('./public/html'))
    .on('end', function () {
      console.log('Html rendering process completed!')
    })
}

const clear = () =>
  src('./public/*', {
    read: false,
  }).pipe(clean())

const imagesDev = () => src('./src/imgs/**/**').pipe(dest('./public/imgs'))

export const imagesBuild = () =>
  src('./src/imgs/**/**')
    .pipe(
      imagemin({
        verbose: true,
      })
    )
    .pipe(dest('./public/imgs'))

const fonts = () => src('./src/fonts/**/**').pipe(dest('./public/fonts'))

const staticMedia = () =>
  src('./src/static/**/**').pipe(dest('./public/static'))

const stylesDev = () =>
  src('./src/scss/*.scss')
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(plumber())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(dest('./public/css/'))

const stylesBuild = () =>
  src('./src/scss/*.scss')
    .pipe(plumber())
    .pipe(
      sass({
        outputStyle: 'expanded',
      })
    )
    .pipe(rename({ suffix: '.min' }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(dest('./public/css/'))

const scriptsVendors = () =>
  src('./src/js/vendors/*.js').pipe(dest('./public/js/vendors'))

const scriptsDev = () => {
  webpackMainConfig.mode = 'development'
  webpackMainConfig.watch = true

  return src('./src/js/main.js')
    .pipe(webpack(webpackMainConfig))
    .pipe(dest('./public/js'))
}

const scriptsBuild = () => {
  webpackConfig.mode = 'production'

  return src('./src/js/main.js')
    .pipe(webpack(webpackMainConfig))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('./public/js'))
}

const scriptsVueDev = () => {
  webpackConfig.mode = 'development'
  webpackConfig.watch = true

  return src('./src/js/vue/index.js')
    .pipe(webpack(webpackConfig))
    .pipe(dest('./public/js'))
}

const scriptsVueBuild = () => {
  webpackConfig.mode = 'production'

  return src('./src/js/vue/index.js')
    .pipe(webpack(webpackConfig))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('./public/js'))
}

const mockServer = () =>
  src('./src/static/json/**/**').pipe(dest('./src/mockServer'))

// BrowserSync
export const serve = (cb) => {
  browserSync.init({
    codeSync: true,
    server: {
      baseDir: './public',
      directory: true,
    },
  })
  cb()
}

// BrowserSync Reload
const reload = (cb) => {
  browserSync.reload()
  cb()
}

const watchFiles = (cb) => {
  watch('./src/scss/**/**', series(stylesDev, reload))
  watch('./src/js/**/**', series(reload))
  watch('./src/html/**/**', series(htmlDev, reload))
  watch('./src/imgs/**/**', imagesDev)
  watch('./src/fonts/**/**', fonts)
  watch('./src/static/**/**', staticMedia)
  watch('./src/static/json/**/**', mockServer)
  cb()
}

// Tasks to define the execution of the functions simultaneously or in series

export const dev = parallel(
  serve,
  htmlDev,
  scriptsVendors,
  scriptsDev,
  scriptsVueDev,
  stylesDev,
  imagesDev,
  fonts,
  staticMedia,
  mockServer,
  watchFiles
)

export const build = series(
  clear,
  parallel(
    htmlBuild,
    scriptsVendors,
    scriptsBuild,
    scriptsVueBuild,
    stylesBuild,
    imagesBuild,
    fonts,
    staticMedia,
    mockServer
  )
)

export default dev
