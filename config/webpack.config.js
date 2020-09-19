"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
//import fs from "fs";
var path_1 = __importDefault(require("path"));
var resolve_1 = __importDefault(require("resolve"));
// @ts-ignore
var pnp_webpack_plugin_1 = __importDefault(require("pnp-webpack-plugin"));
//import HtmlWebpackPlugin from "html-webpack-plugin";
// import CaseSensitivePathsPlugin from "case-sensitive-paths-webpack-plugin";
//import InlineChunkHtmlPlugin from "react-dev-utils/InlineChunkHtmlPlugin";
// import TerserPlugin from "terser-webpack-plugin";
//import MiniCssExtractPlugin from "mini-css-extract-plugin";
//import OptimizeCSSAssetsPlugin from "optimize-css-assets-webpack-plugin";
//import safePostCssParser from "postcss-safe-parser";
//import ManifestPlugin from "webpack-manifest-plugin";
//import InterpolateHtmlPlugin from "react-dev-utils/InterpolateHtmlPlugin";
//import WorkboxWebpackPlugin from "workbox-webpack-plugin";
// import WatchMissingNodeModulesPlugin from "react-dev-utils/WatchMissingNodeModulesPlugin";
var ModuleScopePlugin_1 = __importDefault(require("react-dev-utils/ModuleScopePlugin"));
//import getCSSModuleLocalIdent from "react-dev-utils/getCSSModuleLocalIdent";
var paths_1 = __importDefault(require("./paths"));
var modules_1 = __importDefault(require("./modules"));
var env_1 = __importDefault(require("./env"));
var ModuleNotFoundPlugin_1 = __importDefault(require("react-dev-utils/ModuleNotFoundPlugin"));
var fork_ts_checker_webpack_plugin_1 = __importDefault(require("fork-ts-checker-webpack-plugin"));
var typescriptFormatter_1 = __importDefault(require("../typeFixed/typescriptFormatter"));
var appPackageJson = require(paths_1["default"].appPackageJson);
// Source maps are resource heavy and can cause out of memory issue for large source files.
var shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== "false";
// Some apps do not need the benefits of saving a web request, so not inlining the chunk
// makes for a smoother build process.
var shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== "false";
var isExtendingEslintConfig = process.env.EXTEND_ESLINT === "true";
var imageInlineSizeLimit = parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || "10000");
// Check if TypeScript is setup
//  Since this is an ts only boilerplate, should probably give an error
var useTypeScript = true;
var webpackConfigFactory = function (webpackEnv) {
    var isEnvDevelopment = webpackEnv === "development";
    var isEnvProduction = webpackEnv === "production";
    // Variable used for enabling profiling in Production
    // passed into alias object. Uses a flag if passed into the build command
    var isEnvProductionProfile = isEnvProduction && process.argv.includes("--profile");
    // We will provide `paths.publicUrlOrPath` to our app
    // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
    // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
    // Get environment variables to inject into our app.
    var env = env_1["default"](paths_1["default"].publicUrlOrPath.slice(0, -1));
    //  This pack contains nothing on
    return {
        target: "node",
        mode: isEnvProduction ? "production" : "development",
        // Stop compilation early in production
        bail: isEnvProduction,
        devtool: isEnvProduction
            ? shouldUseSourceMap
                ? "source-map"
                : false
            : "cheap-module-source-map",
        entry: [
            // Include an alternative client for WebpackDevServer. A client's job is to
            // connect to WebpackDevServer by a socket and get notified about changes.
            // When you save a file, the client will either apply hot updates (in case
            // of CSS changes), or refresh the page (in case of JS changes). When you
            // make a syntax error, this client will display a syntax error overlay.
            // Note: instead of the default WebpackDevServer client, we use a custom one
            // to bring better experience for Create React App users. You can replace
            // the line below with these two lines if you prefer the stock client:
            // require.resolve("webpack-dev-server/client") + "?/",
            // require.resolve("webpack/hot/dev-server"),
            // //isEnvDevelopment &&
            // require.resolve("react-dev-utils/webpackHotDevClient"),
            // Finally, this is your app's code:
            paths_1["default"].appIndexTs,
        ].filter(Boolean),
        output: {
            // The build folder.
            path: isEnvProduction ? paths_1["default"].appBuild : undefined,
            // Add /* filename */ comments to generated require()s in the output.
            pathinfo: isEnvDevelopment,
            // There will be one main bundle, and one file per asynchronous chunk.
            // In development, it does not produce real files.
            filename: "server.js",
            // isEnvProduction
            //   ? "server/js/[name].[contenthash:8].js"
            //   : "server/js/bundle.js",
            // TODO: remove this when upgrading to webpack 5
            futureEmitAssets: true,
            // There are also additional JS chunk files if you use code splitting.
            chunkFilename: isEnvProduction
                ? "[name].[contenthash:8].chunk.js"
                : "[name].chunk.js",
            // webpack uses `publicPath` to determine where the app is being served from.
            // It requires a trailing slash, or the file assets will get an incorrect path.
            // We inferred the "public path" (such as / or /my-project) from homepage.
            publicPath: paths_1["default"].publicUrlOrPath,
            // Point sourcemap entries to original disk location (format as URL on Windows)
            devtoolModuleFilenameTemplate: isEnvProduction
                ? function (info) {
                    return path_1["default"]
                        .relative(paths_1["default"].appSrc, info.absoluteResourcePath)
                        .replace(/\\/g, "/");
                }
                : function (info) { return path_1["default"].resolve(info.absoluteResourcePath).replace(/\\/g, "/"); },
            // Prevents conflicts when multiple webpack runtimes (from different apps)
            // are used on the same page.
            jsonpFunction: "webpackJsonp" + appPackageJson.name,
            // this defaults to 'window', but by setting it to 'this' then
            // module chunks which are built will work in web workers as well.
            globalObject: "this"
        },
        optimization: {
            minimize: false,
            minimizer: [
            // This is only used in production mode
            // new TerserPlugin({
            //   terserOptions: {
            //     parse: {
            //       // We want terser to parse ecma 8 code. However, we don't want it
            //       // to apply any minification steps that turns valid ecma 5 code
            //       // into invalid ecma 5 code. This is why the 'compress' and 'output'
            //       // sections only apply transformations that are ecma 5 safe
            //       // https://github.com/facebook/create-react-app/pull/4234
            //       ecma: 8,
            //     },
            //     compress: {
            //       ecma: 5,
            //       warnings: false,
            //       // Disabled because of an issue with Uglify breaking seemingly valid code:
            //       // https://github.com/facebook/create-react-app/issues/2376
            //       // Pending further investigation:
            //       // https://github.com/mishoo/UglifyJS2/issues/2011
            //       comparisons: false,
            //       // Disabled because of an issue with Terser breaking valid code:
            //       // https://github.com/facebook/create-react-app/issues/5250
            //       // Pending further investigation:
            //       // https://github.com/terser-js/terser/issues/120
            //       inline: 2,
            //     },
            //     mangle: {
            //       safari10: true,
            //     },
            //     // Added for profiling in devtools
            //     keep_classnames: isEnvProductionProfile,
            //     keep_fnames: isEnvProductionProfile,
            //     output: {
            //       ecma: 5,
            //       comments: false,
            //       // Turned on because emoji and regex is not minified properly using default
            //       // https://github.com/facebook/create-react-app/issues/2488
            //       ascii_only: true,
            //     },
            //   },
            //   sourceMap: shouldUseSourceMap,
            // }),
            ]
        },
        resolve: {
            // This allows you to set a fallback for where webpack should look for modules.
            // We placed these paths second because we want `node_modules` to "win"
            // if there are any conflicts. This matches Node resolution mechanism.
            // https://github.com/facebook/create-react-app/issues/253
            modules: ["node_modules", paths_1["default"].appNodeModules].concat(modules_1["default"].additionalModulePaths || []),
            // These are the reasonable defaults supported by the Node ecosystem.
            // We also include JSX as a common component filename extension to support
            // some tools, although we do not recommend using it, see:
            // https://github.com/facebook/create-react-app/issues/290
            // `web` extension prefixes have been added for better support
            // for React Native Web.
            extensions: paths_1["default"].moduleFileExtensions
                .map(function (ext) { return "." + ext; })
                .filter(function (ext) { return true; }),
            alias: __assign({}, (modules_1["default"].webpackAliases || {})),
            plugins: [
                // Adds support for installing with Plug'n'Play, leading to faster installs and adding
                // guards against forgotten dependencies and such.
                pnp_webpack_plugin_1["default"],
                // Prevents users from importing files from outside of src/ (or node_modules/).
                // This often causes confusion because we only process files within src/ with babel.
                // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
                // please link the files into your node_modules/ and let module-resolution kick in.
                // Make sure your source files are compiled, as they will not be processed in any way.
                new ModuleScopePlugin_1["default"](paths_1["default"].appSrc, [paths_1["default"].appPackageJson]),
            ]
        },
        resolveLoader: {
            plugins: [
                // Also related to Plug'n'Play, but this time it tells webpack to load its loaders
                // from the current package.
                pnp_webpack_plugin_1["default"].moduleLoader(module),
            ]
        },
        module: {
            strictExportPresence: true,
            rules: [
                // Disable require.ensure as it's not a standard language feature.
                { parser: { requireEnsure: false } },
                // First, run the linter.
                // It's important to do this before Babel processes the JS.
                {
                    test: /\.(js|mjs|jsx|ts|tsx)$/,
                    enforce: "pre",
                    use: [
                        {
                            options: {
                                cache: true,
                                formatter: require.resolve("react-dev-utils/eslintFormatter"),
                                eslintPath: require.resolve("eslint"),
                                resolvePluginsRelativeTo: __dirname
                            },
                            loader: require.resolve("eslint-loader")
                        },
                    ],
                    include: paths_1["default"].appSrc
                },
                {
                    test: /\.(js|mjs|jsx|ts|tsx)$/,
                    use: "ts-loader",
                    exclude: /node_modules/
                },
            ]
        },
        plugins: [
            // This gives some necessary context to module not found errors, such as
            // the requesting resource.
            new ModuleNotFoundPlugin_1["default"](paths_1["default"].appPath),
            // Makes some environment variables available to the JS code, for example:
            // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
            // It is absolutely essential that NODE_ENV is set to production
            // during a production build.
            // Otherwise React will be compiled in the very slow development mode.
            //new webpack.DefinePlugin(env.stringified),
            // This is necessary to emit hot updates (currently CSS only):
            //isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
            // Watcher doesn't work well if you mistype casing in a path so we use
            // a plugin that prints an error when you attempt to do this.
            // See https://github.com/facebook/create-react-app/issues/240
            //isEnvDevelopment && new CaseSensitivePathsPlugin(),
            // If you require a missing module and then `npm install` it, you still have
            // to restart the development server for webpack to discover it. This plugin
            // makes the discovery automatic so you don't have to restart.
            // See https://github.com/facebook/create-react-app/issues/186
            // isEnvDevelopment &&
            //  new WatchMissingNodeModulesPlugin(paths.appNodeModules),
            // Moment.js is an extremely popular library that bundles large locale files
            // by default due to how webpack interprets its code. This is a practical
            // solution that requires the user to opt into importing specific locales.
            // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
            // You can remove this if you don't use Moment.js:
            // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            // Generate a service worker script that will precache, and keep up to date,
            // the HTML & assets that are part of the webpack build.
            // TypeScript type checking
            /*useTypeScript &&*/
            new fork_ts_checker_webpack_plugin_1["default"]({
                typescript: resolve_1["default"].sync("typescript", {
                    basedir: paths_1["default"].appNodeModules
                }),
                async: isEnvDevelopment,
                useTypescriptIncrementalApi: true,
                checkSyntacticErrors: true,
                resolveModuleNameModule: process.versions.pnp
                    ? __dirname + "/pnpTs.js"
                    : undefined,
                resolveTypeReferenceDirectiveModule: process.versions
                    .pnp
                    ? __dirname + "/pnpTs.js"
                    : undefined,
                tsconfig: paths_1["default"].appTsConfig,
                reportFiles: [
                    "**",
                    "!**/__tests__/**",
                    "!**/?(*.)(spec|test).*",
                    "!**/src/setupProxy.*",
                    "!**/src/setupTests.*",
                ],
                silent: true,
                // The formatter is invoked directly in WebpackDevServerUtils during development
                formatter: isEnvProduction ? typescriptFormatter_1["default"] : undefined
            }),
        ].filter(Boolean)
    };
};
exports["default"] = webpackConfigFactory;
