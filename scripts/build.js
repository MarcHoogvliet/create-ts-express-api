"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
/**
 * Build script based on react-app
 *
 * Removed all client side code as this is purely a server side boilerplate
 */
("use strict");
// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";
// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", function (err) {
    throw err;
});
// Ensure environment variables are read.
require("../config/env");
var path_1 = __importDefault(require("path"));
var chalk_1 = __importDefault(require("chalk"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var checkRequiredFiles_1 = __importDefault(require("react-dev-utils/checkRequiredFiles"));
var printHostingInstructions_1 = __importDefault(require("react-dev-utils/printHostingInstructions"));
var FileSizeReporter_1 = __importDefault(require("react-dev-utils/FileSizeReporter"));
var printBuildError_1 = __importDefault(require("react-dev-utils/printBuildError"));
var paths_1 = __importDefault(require("../config/paths"));
var webpack_config_1 = __importDefault(require("../config/webpack.config"));
var config = webpack_config_1["default"]("production");
var measureFileSizesBeforeBuild = FileSizeReporter_1["default"].measureFileSizesBeforeBuild;
var printFileSizesAfterBuild = FileSizeReporter_1["default"].printFileSizesAfterBuild;
var useYarn = false; //fs.existsSync(paths.yarnLockFile);
// These sizes are pretty large. We'll warn for bundles exceeding them.
var WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
var WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;
var isInteractive = process.stdout.isTTY;
//  Import the actual build process
var compile_1 = __importDefault(require("./compile"));
// Warn and crash if required files are missing
// NOTE: removed app html since we don't care about client side
if (!checkRequiredFiles_1["default"]([/*paths.appHtml,*/ paths_1["default"].appIndexTs])) {
    process.exit(1);
}
// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
var checkBrowsers = require("react-dev-utils/browsersHelper").checkBrowsers;
//  Check browser
checkBrowsers(paths_1["default"].appPath, isInteractive)
    .then(function () {
    // First, read the current file sizes in build directory.
    // This lets us display how much they changed later.
    return measureFileSizesBeforeBuild(paths_1["default"].appBuild);
})
    .then(function (previousFileSizes) {
    // Remove all content but keep the directory so that
    // if you're in it, you don't end up in Trash
    fs_extra_1["default"].emptyDirSync(paths_1["default"].appBuild);
    // Merge with the public folder
    //copyPublicFolder();
    // Start the webpack build
    return compile_1["default"]({ using: config, "with": previousFileSizes });
})
    .then(function (_a) {
    var _b, _c;
    var stats = _a.stats, previousFileSizes = _a.previousFileSizes, warnings = _a.warnings;
    if (warnings.length) {
        console.log(chalk_1["default"].yellow("Compiled with warnings.\n"));
        console.log(warnings.join("\n\n"));
        console.log("\nSearch for the " +
            chalk_1["default"].underline(chalk_1["default"].yellow("keywords")) +
            " to learn more about each warning.");
        console.log("To ignore, add " +
            chalk_1["default"].cyan("// eslint-disable-next-line") +
            " to the line before.\n");
    }
    else {
        console.log(chalk_1["default"].green("Compiled successfully.\n"));
    }
    console.log("File sizes after gzip:\n");
    printFileSizesAfterBuild(stats, previousFileSizes, paths_1["default"].appBuild, WARN_AFTER_BUNDLE_GZIP_SIZE, WARN_AFTER_CHUNK_GZIP_SIZE);
    console.log();
    var appPackage = require(paths_1["default"].appPackageJson);
    var publicUrl = paths_1["default"].publicUrlOrPath;
    var publicPath = (_c = (_b = config.output) === null || _b === void 0 ? void 0 : _b.publicPath) !== null && _c !== void 0 ? _c : "";
    var buildFolder = path_1["default"].relative(process.cwd(), paths_1["default"].appBuild);
    printHostingInstructions_1["default"](appPackage, publicUrl, publicPath, buildFolder, useYarn);
}, function (err) {
    var tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === "true";
    if (tscCompileOnError) {
        console.log(chalk_1["default"].yellow("Compiled with the following type errors (you may want to check these before deploying your app):\n"));
        printBuildError_1["default"](err);
    }
    else {
        console.log(chalk_1["default"].red("Failed to compile.\n"));
        printBuildError_1["default"](err);
        process.exit(1);
    }
})["catch"](function (err) {
    if (err && err.message) {
        console.log(err.message);
    }
    process.exit(1);
});
