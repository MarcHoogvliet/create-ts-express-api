"use strict";

//import fs from "fs";
import path from "path";
import webpack, { Plugin } from "webpack";
import resolve from "resolve";
// @ts-ignore
import PnpWebpackPlugin from "pnp-webpack-plugin";

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
import ModuleScopePlugin from "react-dev-utils/ModuleScopePlugin";
//import getCSSModuleLocalIdent from "react-dev-utils/getCSSModuleLocalIdent";
import paths from "./paths";
import modules from "./modules";
import getClientEnvironment from "./env";
import ModuleNotFoundPlugin from "react-dev-utils/ModuleNotFoundPlugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import typescriptFormatter from "../typeFixed/typescriptFormatter";

const appPackageJson = require(paths.appPackageJson);

// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== "false";
// Some apps do not need the benefits of saving a web request, so not inlining the chunk
// makes for a smoother build process.
const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== "false";

const isExtendingEslintConfig = process.env.EXTEND_ESLINT === "true";

const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || "10000"
);

// Check if TypeScript is setup
//  Since this is an ts only boilerplate, should probably give an error
const useTypeScript = true;
//fs.existsSync(paths.appTsConfig);

type WEBPACK_ENV = "production" | "development";

const webpackConfigFactory: (
  webpackEnv: WEBPACK_ENV
) => webpack.Configuration = (webpackEnv: WEBPACK_ENV) => {
  const isEnvDevelopment = webpackEnv === "development";
  const isEnvProduction = webpackEnv === "production";

  // Variable used for enabling profiling in Production
  // passed into alias object. Uses a flag if passed into the build command
  const isEnvProductionProfile =
    isEnvProduction && process.argv.includes("--profile");

  // We will provide `paths.publicUrlOrPath` to our app
  // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
  // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
  // Get environment variables to inject into our app.
  const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

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
    entry: ([
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
      paths.appIndexTs,
      // We include the app code last so that if there is a runtime error during
      // initialization, it doesn't blow up the WebpackDevServer client, and
      // changing JS code would still trigger a refresh.
    ].filter(Boolean) as unknown) as string[],
    output: {
      // The build folder.
      path: isEnvProduction ? paths.appBuild : undefined,
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
      publicPath: paths.publicUrlOrPath,
      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: isEnvProduction
        ? (info) =>
            path
              .relative(paths.appSrc, info.absoluteResourcePath)
              .replace(/\\/g, "/")
        : (info) => path.resolve(info.absoluteResourcePath).replace(/\\/g, "/"),
      // Prevents conflicts when multiple webpack runtimes (from different apps)
      // are used on the same page.
      jsonpFunction: `webpackJsonp${appPackageJson.name}`,
      // this defaults to 'window', but by setting it to 'this' then
      // module chunks which are built will work in web workers as well.
      globalObject: "this",
    },
    optimization: {
      minimize: false, //Since its server side, you do not want to minimze, you want to debug isEnvProduction,
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
      ],

      // Automatically split vendor and commons
      // https://twitter.com/wSokra/status/969633336732905474
      // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
      // splitChunks: {
      //   chunks: "all",
      //   name: false,
      // },
      // Keep the runtime chunk separated to enable long term caching
      // https://twitter.com/wSokra/status/969679223278505985
      // https://github.com/facebook/create-react-app/issues/5358
      // runtimeChunk: {
      //   name: (entrypoint: { name: string }) => `runtime-${entrypoint.name}`,
      // },
    },
    resolve: {
      // This allows you to set a fallback for where webpack should look for modules.
      // We placed these paths second because we want `node_modules` to "win"
      // if there are any conflicts. This matches Node resolution mechanism.
      // https://github.com/facebook/create-react-app/issues/253
      modules: ["node_modules", paths.appNodeModules].concat(
        modules.additionalModulePaths || []
      ),
      // These are the reasonable defaults supported by the Node ecosystem.
      // We also include JSX as a common component filename extension to support
      // some tools, although we do not recommend using it, see:
      // https://github.com/facebook/create-react-app/issues/290
      // `web` extension prefixes have been added for better support
      // for React Native Web.
      extensions: paths.moduleFileExtensions
        .map((ext: string) => `.${ext}`)
        .filter((ext: string) => true), // useTypeScript || !ext.includes("ts")),
      alias: ({
        // Support React Native Web
        // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
        // "react-native": "react-native-web",
        // // Allows for better profiling with ReactDevTools
        // ...(isEnvProductionProfile && {
        //   "react-dom$": "react-dom/profiling",
        //   "scheduler/tracing": "scheduler/tracing-profiling",
        // }),
        ...(modules.webpackAliases || {}),
      } as unknown) as { [key: string]: string },
      plugins: [
        // Adds support for installing with Plug'n'Play, leading to faster installs and adding
        // guards against forgotten dependencies and such.
        PnpWebpackPlugin,
        // Prevents users from importing files from outside of src/ (or node_modules/).
        // This often causes confusion because we only process files within src/ with babel.
        // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
        // please link the files into your node_modules/ and let module-resolution kick in.
        // Make sure your source files are compiled, as they will not be processed in any way.
        new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
      ],
    },
    resolveLoader: {
      plugins: [
        // Also related to Plug'n'Play, but this time it tells webpack to load its loaders
        // from the current package.
        PnpWebpackPlugin.moduleLoader(module),
      ],
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
                resolvePluginsRelativeTo: __dirname,
              },
              loader: require.resolve("eslint-loader"),
            },
          ],
          include: paths.appSrc,
        },
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        // {
        //   // "oneOf" will traverse all following loaders until one will
        //   // match the requirements. When no loader matches it will fall
        //   // back to the "file" loader at the end of the loader list.
        //   oneOf: [
        //     // "url" loader works like "file" loader except that it embeds assets
        //     // smaller than specified limit in bytes as data URLs to avoid requests.
        //     // A missing `test` is equivalent to a match.
        //     // {
        //     //   test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        //     //   loader: require.resolve("url-loader"),
        //     //   options: {
        //     //     limit: imageInlineSizeLimit,
        //     //     name: "static/media/[name].[hash:8].[ext]",
        //     //   },
        //     // },
        //     // Process application JS with Babel.
        //     // The preset includes JSX, Flow, TypeScript, and some ESnext features.
        //     {
        //       test: /\.(js|mjs|jsx|ts|tsx)$/,
        //       include: paths.appSrc,
        //       loader: require.resolve("babel-loader"),
        //       options: {
        //         customize: require.resolve(
        //           "babel-preset-react-app/webpack-overrides"
        //         ),

        //         plugins: [
        //           [
        //             require.resolve("babel-plugin-named-asset-import"),
        //             {
        //               loaderMap: {
        //                 svg: {
        //                   ReactComponent:
        //                     "@svgr/webpack?-svgo,+titleProp,+ref![path]",
        //                 },
        //               },
        //             },
        //           ],
        //         ],
        //         // This is a feature of `babel-loader` for webpack (not Babel itself).
        //         // It enables caching results in ./node_modules/.cache/babel-loader/
        //         // directory for faster rebuilds.
        //         cacheDirectory: true,
        //         // See #6846 for context on why cacheCompression is disabled
        //         cacheCompression: false,
        //         compact: isEnvProduction,
        //       },
        //     },
        //     // Process any JS outside of the app with Babel.
        //     // Unlike the application JS, we only compile the standard ES features.
        //     {
        //       test: /\.(js|mjs)$/,
        //       exclude: /@babel(?:\/|\\{1,2})runtime/,
        //       loader: require.resolve("babel-loader"),
        //       options: {
        //         babelrc: false,
        //         configFile: false,
        //         compact: false,
        //         presets: [
        //           [
        //             require.resolve("babel-preset-react-app/dependencies"),
        //             { helpers: true },
        //           ],
        //         ],
        //         cacheDirectory: true,
        //         // See #6846 for context on why cacheCompression is disabled
        //         cacheCompression: false,

        //         // Babel sourcemaps are needed for debugging into node_modules
        //         // code.  Without the options below, debuggers like VSCode
        //         // show incorrect code and set breakpoints on the wrong lines.
        //         sourceMaps: shouldUseSourceMap,
        //         inputSourceMap: shouldUseSourceMap,
        //       },
        //     },

        // "file" loader makes sure those assets get served by WebpackDevServer.
        // When you `import` an asset, you get its (virtual) filename.
        // In production, they would get copied to the `build` folder.
        // This loader doesn't use a "test" so it will catch all modules
        // that fall through the other loaders.
        // {
        //   loader: require.resolve("file-loader"),
        //   // Exclude `js` files to keep "css" loader working as it injects
        //   // its runtime that would otherwise be processed through "file" loader.
        //   // Also exclude `html` and `json` extensions so they get processed
        //   // by webpacks internal loaders.
        //   exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
        //   options: {
        //     name: "static/media/[name].[hash:8].[ext]",
        //   },
        // },
        // ** STOP ** Are you adding a new loader?
        // Make sure to add the new loader(s) before the "file" loader.
        //   ],
        // },
      ],
    },
    plugins: ([
      // This gives some necessary context to module not found errors, such as
      // the requesting resource.
      new ((ModuleNotFoundPlugin as unknown) as FunctionConstructor)(
        paths.appPath
      ),
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
      new ForkTsCheckerWebpackPlugin({
        typescript: resolve.sync("typescript", {
          basedir: paths.appNodeModules,
        }),
        async: isEnvDevelopment,
        useTypescriptIncrementalApi: true,
        checkSyntacticErrors: true,
        resolveModuleNameModule: ((process.versions as unknown) as any).pnp
          ? `${__dirname}/pnpTs.js`
          : undefined,
        resolveTypeReferenceDirectiveModule: ((process.versions as unknown) as any)
          .pnp
          ? `${__dirname}/pnpTs.js`
          : undefined,
        tsconfig: paths.appTsConfig,
        reportFiles: [
          "**",
          "!**/__tests__/**",
          "!**/?(*.)(spec|test).*",
          "!**/src/setupProxy.*",
          "!**/src/setupTests.*",
        ],
        silent: true,
        // The formatter is invoked directly in WebpackDevServerUtils during development
        formatter: isEnvProduction ? typescriptFormatter : undefined,
      }),
    ].filter(Boolean) as unknown) as Plugin[],
  };
};
export default webpackConfigFactory;
