"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var paths_1 = __importDefault(require("./paths"));
// Make sure that including paths.js after env.js will read .env variables.
delete require.cache[require.resolve("./paths")];
var NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
    throw new Error("The NODE_ENV environment variable is required but was not specified.");
}
// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
var dotenvFiles = [
    paths_1["default"].dotenv + "." + NODE_ENV + ".local",
    paths_1["default"].dotenv + "." + NODE_ENV,
    // Don't include `.env.local` for `test` environment
    // since normally you expect tests to produce the same
    // results for everyone
    NODE_ENV !== "test" && paths_1["default"].dotenv + ".local",
    paths_1["default"].dotenv,
].filter(Boolean);
// Load environment variables from .env* files. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.  Variable expansion is supported in .env files.
// https://github.com/motdotla/dotenv
// https://github.com/motdotla/dotenv-expand
dotenvFiles.forEach(function (dotenvFile) {
    if (!dotenvFile) {
    }
    else if (fs_1["default"].existsSync(dotenvFile)) {
        require("dotenv-expand")(require("dotenv").config({
            path: dotenvFile
        }));
    }
});
// We support resolving modules according to `NODE_PATH`.
// This lets you use absolute paths in imports inside large monorepos:
// https://github.com/facebook/create-react-app/issues/253.
// It works similar to `NODE_PATH` in Node itself:
// https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
// Note that unlike in Node, only *relative* paths from `NODE_PATH` are honored.
// Otherwise, we risk importing Node.js core modules into an app instead of webpack shims.
// https://github.com/facebook/create-react-app/issues/1023#issuecomment-265344421
// We also resolve them to make sure all tools using them work consistently.
var appDirectory = fs_1["default"].realpathSync(process.cwd());
process.env.NODE_PATH = (process.env.NODE_PATH || "")
    .split(path_1["default"].delimiter)
    .filter(function (folder) { return folder && !path_1["default"].isAbsolute(folder); })
    .map(function (folder) { return path_1["default"].resolve(appDirectory, folder); })
    .join(path_1["default"].delimiter);
// Grab NODE_ENV and REACT_APP_* environment variables and prepare them to be
// injected into the application via DefinePlugin in webpack configuration.
var REACT_APP = /^REACT_APP_/i;
function getClientEnvironment(publicUrl) {
    var defaultEnv = {
        // Useful for determining whether we’re running in production mode.
        // Most importantly, it switches React into the correct mode.
        NODE_ENV: process.env.NODE_ENV || "development",
        // Useful for resolving the correct path to static assets in `public`.
        // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
        // This should only be used as an escape hatch. Normally you would put
        // images into the `src` and `import` them in code to get their paths.
        PUBLIC_URL: publicUrl,
        // We support configuring the sockjs pathname during development.
        // These settings let a developer run multiple simultaneous projects.
        // They are used as the connection `hostname`, `pathname` and `port`
        // in webpackHotDevClient. They are used as the `sockHost`, `sockPath`
        // and `sockPort` options in webpack-dev-server.
        WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
        WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
        WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT
    };
    var raw = Object.keys(process.env).reduce(function (env, key) {
        env[key] = process.env[key];
        return env;
    }, defaultEnv);
    // Stringify all values so we can feed into webpack DefinePlugin
    var stringified = {
        "process.env": Object.keys(raw).reduce(function (env, key) {
            env[key] = JSON.stringify(raw[key]);
            return env;
        }, {})
    };
    return { raw: raw, stringified: stringified };
}
exports["default"] = getClientEnvironment;
