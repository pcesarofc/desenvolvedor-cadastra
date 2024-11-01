const path = require("path");

const { series, src, dest, parallel, watch } = require("gulp");
const webpack = require("webpack");
const del = require("del");
const autoprefixer = require("gulp-autoprefixer");
const sass = require("gulp-sass")(require("sass"));
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();

const webpackConfig = require("./webpack.config.js");

const paths = {
  scripts: {
    src: "src/ts/index.ts",
    watch: "src/ts/**/*.ts",
  },
  styles: {
    src: "src/scss/main.scss",
  },
  img: {
    src: "src/img/**/*",
    dest: 'dist/img'
  },
  html: {
    src: "src/index.html",
  },
  dest: "dist",
  temp: ".tmp",
};

function clean() {
  return del([paths.dest, paths.temp]);
}

function server() {
  browserSync.init({
    server: {
      baseDir: "./dist",
    },
  });
}

function styles() {
  return src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(sourcemaps.write())
    .pipe(dest(paths.dest))
    .pipe(browserSync.stream());
}

function scripts() {
  return new Promise((resolve) =>
    webpack(webpackConfig(paths), (err, stats) => {
      if (err) console.log("Webpack", err);

      console.log(
        stats.toString({
          all: false,
          modules: true,
          maxModules: 0,
          errors: true,
          warnings: true,
          moduleTrace: true,
          errorDetails: true,
          colors: true,
          chunks: true,
        })
      );

      resolve();
    })
  );
}

function html() {
  return src(paths.html.src).pipe(browserSync.stream()).pipe(dest(paths.dest));
}

async function optimizeImages() {
  const imagemin = (await import("gulp-imagemin")).default;
  return src(paths.img.src)
    .pipe(
      imagemin({
        optimizationLevel: 7,
        progressive: true,
        interlaced: true,
      })
    )
    .pipe(dest(paths.img.dest));
}

function img() {
  optimizeImages();
}

const build = series(clean, parallel(styles, scripts, html, img));
const dev = () => {
  watch(paths.scripts.watch, { ignoreInitial: false }, scripts).on(
    "change",
    browserSync.reload
  );
  watch(paths.styles.src, { ignoreInitial: false }, styles);
  watch(paths.img.src, { ignoreInitial: false }, img);
  watch(paths.html.src, { ignoreInitial: false }, html).on(
    "change",
    browserSync.reload
  );
  server();
};

exports.build = build;
exports.server = server;
exports.styles = styles;
exports.scripts = scripts;
exports.default = dev;
