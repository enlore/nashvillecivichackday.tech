/* jshint node: true, esversion: 6 */
"user strict";

const path = require("path");

const g = require("gulp");
const gp = require("gulp-load-plugins")(g);
const spawn = require("child_process").spawn;

const src = g.src.bind(g);
const dest = g.dest.bind(g);
const watch = g.watch.bind(g);
const task = g.task.bind(g);

const paths = {
    layout: "site/layout.jade",
    pages: [
        "site/index.jade",
        "site/mediakit/index.jade",
        "site/submissions/index.jade"
    ],
    index: "site/index.jade",
    mediakit: "site/mediakit/index.jade",
    submissions: "site/submissions/index.jade",
    stylus: "index.styl",
    js: "site/j/scripts.js",
    sass: "sass/**/*.scss",
    dist: "dist",
    distJs: "dist/j",
    distCss: "dist/s",
    distImg: "dist/i",
    distVendor: "dist/s"
};

const defaultTasks = [
    "compileJade",
    "compileSass",
    //"copyCSS",
    //"compileStylus",
    //"mvJs",
    "copyImg",
    "deps",
    "serve",
    "watchStuff"
];

task("default", defaultTasks);
task("build", ["compileJade", "compileStylus", "mvJs", "deps", "copyCSS", "copyImg"]);
task("ship", ["build"], shipIt);
task("compileJade", compileJade);
task("compileStylus", compileStylus);
task("copyImg", copyImg);
task("mvJs", mvJs);
task("deps", deps);
task("serve", serve);
task("watchStuff", watchStuff);
task("compileSass", compileSass);

function copyImg () {
    src("site/i/**/*", { base: "i" })
        .pipe(dest(paths.distImg));
}

function shipIt () {
    const sync = spawn(path.join(__dirname, "sync.sh"));
    sync.stdout.on("data", (data) => process.stdout.write(data));
    sync.stderr.on("data", (data) => process.stderr.write(data));
}

function compileSass () {
    src(paths.sass)
    .pipe(gp["sass"]().on("error", gp["sass"].logError))
    .pipe(dest(paths.distCss));
}

function copyCSS () {

}

function compileJade () {
    const jadeConfig = {
        pretty: true
    };

    src(paths.pages, { base : "site"})
    .pipe(gp["jade"](jadeConfig))
    .pipe(dest(paths.dist))
    .pipe(gp["connect"].reload());
}

function compileStylus () {
    const stylusConfig = {};

    src(paths.stylus)
    .pipe(gp["stylus"](stylusConfig))
    .pipe(dest(paths.distCss))
    .pipe(gp["connect"].reload());
}

function mvJs () {}

function deps () {
    src("node_modules/skeleton-framework/dist/skeleton.css")
    .pipe(dest(paths.distVendor));

    src("node_modules/normalize.css/normalize.css")
    .pipe(dest(paths.distVendor));
}

function serve () {
    const serveConfig = {
        root: paths.dist,
        livereload: true,
        port: process.env.PORT || 3000,
        //debug: true,
    };

    gp["connect"].server(serveConfig);
}

function watchStuff () {
    watch(paths.stylus, ["compileStylus"]);
    watch(paths.layout, ["compileJade"]);
    watch(paths.sass, ["compileSass"]);
    watch("site/**/*.jade", ["compileJade", "copyImg"]);
}
