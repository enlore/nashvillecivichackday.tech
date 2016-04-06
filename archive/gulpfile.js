const path = require("path")

const g = require("gulp")
const gp = require("gulp-load-plugins")(g)
const spawn = require("child_process").spawn

const src = g.src.bind(g)
const dest = g.dest.bind(g)
const watch = g.watch.bind(g)
const task = g.task.bind(g)

const paths = {
    layout: "index.jade",
    stylus: "index.styl",
    js: "scripts.js",
    dist: "dist",
    distJs: "dist/js",
    distCss: "dist/css",
    distVendor: "dist/vendor"
}

const defaultTasks = [
    "compileJade",
    "compileStylus",
    "mvJs",
    "deps",
    "serve",
    "watchStuff"
]

task("default", defaultTasks)
task("build", ["compileJade", "compileStylus", "mvJs", "deps"])
task("ship", ["build"], shipIt)
task("compileJade", compileJade)
task("compileStylus", compileStylus)
task("mvJs", mvJs)
task("deps", deps)
task("serve", serve)
task("watchStuff", watchStuff)

function shipIt () {
    const sync = spawn(path.join(__dirname, "sync.sh"))
    sync.stdout.on("data", (data) => process.stdout.write(data))
    sync.stderr.on("data", (data) => process.stderr.write(data))
}

function compileJade () {
    const jadeConfig = {
        pretty: true
    }

    src(paths.layout)
    .pipe(gp["jade"](jadeConfig))
    .pipe(dest(paths.dist))
    .pipe(gp["connect"].reload())
}


function compileStylus () {
    const stylusConfig = {}

    src(paths.stylus)
    .pipe(gp["stylus"](stylusConfig))
    .pipe(dest(paths.distCss))
    .pipe(gp["connect"].reload())
}

function mvJs () {}

function deps () {
    src("node_modules/skeleton-framework/dist/skeleton.css")
    .pipe(dest(paths.distVendor))

    src("node_modules/normalize.css/normalize.css")
    .pipe(dest(paths.distVendor))
}

function serve () {
    const serveConfig = {
        root: paths.dist,
        livereload: true,
        port: 3000,
        //debug: true,
    }

    gp["connect"].server(serveConfig)
}

function watchStuff () {
    watch(paths.stylus, ["compileStylus"])
    watch(paths.layout, ["compileJade"])
}
