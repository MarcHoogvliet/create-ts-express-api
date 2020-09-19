"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var paths_1 = __importDefault(require("./paths"));
var chalk_1 = __importDefault(require("chalk"));
var resolve_1 = __importDefault(require("resolve"));
/**
 * Get additional module paths based on the baseUrl of a compilerOptions object.
 *
 * @param {Object} options
 */
function getAdditionalModulePaths(options) {
    if (options === void 0) { options = {}; }
    var baseUrl = options.baseUrl;
    // We need to explicitly check for null and undefined (and not a falsy value) because
    // TypeScript treats an empty string as `.`.
    if (baseUrl == null) {
        // If there's no baseUrl set we respect NODE_PATH
        // Note that NODE_PATH is deprecated and will be removed
        // in the next major release of create-react-app.
        var nodePath = process.env.NODE_PATH || "";
        return nodePath.split(path_1["default"].delimiter).filter(Boolean);
    }
    var baseUrlResolved = path_1["default"].resolve(paths_1["default"].appPath, baseUrl);
    // We don't need to do anything if `baseUrl` is set to `node_modules`. This is
    // the default behavior.
    if (path_1["default"].relative(paths_1["default"].appNodeModules, baseUrlResolved) === "") {
        return null;
    }
    // Allow the user set the `baseUrl` to `appSrc`.
    if (path_1["default"].relative(paths_1["default"].appSrc, baseUrlResolved) === "") {
        return [paths_1["default"].appSrc];
    }
    // If the path is equal to the root directory we ignore it here.
    // We don't want to allow importing from the root directly as source files are
    // not transpiled outside of `src`. We do allow importing them with the
    // absolute path (e.g. `src/Components/Button.js`) but we set that up with
    // an alias.
    if (path_1["default"].relative(paths_1["default"].appPath, baseUrlResolved) === "") {
        return null;
    }
    // Otherwise, throw an error.
    throw new Error(chalk_1["default"].red.bold("Your project's `baseUrl` can only be set to `src` or `node_modules`." +
        " Create React App does not support other values at this time."));
}
/**
 * Get webpack aliases based on the baseUrl of a compilerOptions object.
 *
 * @param {*} options
 */
function getWebpackAliases(options) {
    if (options === void 0) { options = {}; }
    var baseUrl = options.baseUrl;
    if (!baseUrl) {
        return {};
    }
    var baseUrlResolved = path_1["default"].resolve(paths_1["default"].appPath, baseUrl);
    if (path_1["default"].relative(paths_1["default"].appPath, baseUrlResolved) === "") {
        return {
            src: paths_1["default"].appSrc
        };
    }
}
/**
 * Get jest aliases based on the baseUrl of a compilerOptions object.
 *
 * @param {*} options
 */
function getJestAliases(options) {
    if (options === void 0) { options = {}; }
    var baseUrl = options.baseUrl;
    if (!baseUrl) {
        return {};
    }
    var baseUrlResolved = path_1["default"].resolve(paths_1["default"].appPath, baseUrl);
    if (path_1["default"].relative(paths_1["default"].appPath, baseUrlResolved) === "") {
        return {
            "^src/(.*)$": "<rootDir>/src/$1"
        };
    }
}
function getModules() {
    // Check if TypeScript is setup
    var hasTsConfig = fs_1["default"].existsSync(paths_1["default"].appTsConfig);
    var config;
    // If there's a tsconfig.json we assume it's a
    // TypeScript project and set up the config
    // based on tsconfig.json
    if (hasTsConfig) {
        var ts = require(resolve_1["default"].sync("typescript", {
            basedir: paths_1["default"].appNodeModules
        }));
        config = ts.readConfigFile(paths_1["default"].appTsConfig, ts.sys.readFile).config;
        // Otherwise we'll check if there is jsconfig.json
        // for non TS projects.
    }
    config = config || {};
    var options = config.compilerOptions || {};
    var additionalModulePaths = getAdditionalModulePaths(options);
    return {
        additionalModulePaths: additionalModulePaths,
        webpackAliases: getWebpackAliases(options),
        jestAliases: getJestAliases(options),
        hasTsConfig: hasTsConfig
    };
}
exports["default"] = getModules();
