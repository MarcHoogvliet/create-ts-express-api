"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.moduleFileExtensions = void 0;
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var getPublicUrlOrPath_1 = __importDefault(require("react-dev-utils/getPublicUrlOrPath"));
// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
var appDirectory = fs_1["default"].realpathSync(process.cwd());
var resolveApp = function (relativePath) {
    return path_1["default"].resolve(appDirectory, relativePath);
};
// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
var publicUrlOrPath = getPublicUrlOrPath_1["default"](process.env.NODE_ENV === "development", require(resolveApp("package.json")).homepage, process.env.PUBLIC_URL);
// Resolve file paths in the same order as webpack
var resolveModule = function (resolveFn, filePath) {
    var extension = exports.moduleFileExtensions.find(function (extension) {
        return fs_1["default"].existsSync(resolveFn(filePath + "." + extension));
    });
    if (extension) {
        return resolveFn(filePath + "." + extension);
    }
    return resolveFn(filePath + ".js");
};
exports.moduleFileExtensions = [
    "web.mjs",
    "mjs",
    "web.js",
    "js",
    "web.ts",
    "ts",
    "web.tsx",
    "tsx",
    "json",
    "web.jsx",
    "jsx",
];
// config after eject: we're in ./config/
exports["default"] = {
    dotenv: resolveApp(".env"),
    appPath: resolveApp("."),
    appBuild: resolveApp("build"),
    //appIndexJs: resolveModule(resolveApp, "src/index"),
    appIndexTs: resolveModule(resolveApp, "src/index"),
    appPackageJson: resolveApp("package.json"),
    appSrc: resolveApp("src"),
    appTsConfig: resolveApp("tsconfig.json"),
    testsSetup: resolveModule(resolveApp, "src/setupTests"),
    proxySetup: resolveApp("src/setupProxy.js"),
    appNodeModules: resolveApp("node_modules"),
    publicUrlOrPath: publicUrlOrPath,
    moduleFileExtensions: exports.moduleFileExtensions
};
