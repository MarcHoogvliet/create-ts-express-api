"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var chalk_1 = __importDefault(require("chalk"));
var webpack_1 = __importDefault(require("webpack"));
var formatWebpackMessages_1 = __importDefault(require("react-dev-utils/formatWebpackMessages"));
// Since we build for production, we fill in production for the factory
// Create the production build and print the deployment instructions.
function compile(_a) {
    var config = _a.using, previousFileSizes = _a["with"];
    // We used to support resolving modules according to `NODE_PATH`.
    // This now has been deprecated in favor of jsconfig/tsconfig.json
    // This lets you use absolute paths in imports inside large monorepos:
    if (process.env.NODE_PATH) {
        console.log(chalk_1["default"].yellow("Setting NODE_PATH to resolve modules absolutely has been deprecated in favor of setting baseUrl in jsconfig.json (or tsconfig.json if you are using TypeScript) and will be removed in a future major release of create-react-app."));
        console.log();
    }
    console.log("Creating an optimized production build...");
    var compiler = webpack_1["default"](config);
    return new Promise(function (resolve, reject) {
        compiler.run(function (err, stats) {
            var messages;
            if (err) {
                if (!err.message) {
                    return reject(err);
                }
                var errMessage = err.message;
                // Add additional information for postcss errors
                messages = formatWebpackMessages_1["default"]({
                    errors: [errMessage],
                    warnings: []
                });
            }
            else {
                messages = formatWebpackMessages_1["default"](stats.toJson({ all: false, warnings: true, errors: true }));
            }
            if (messages.errors.length) {
                // Only keep the first error. Others are often indicative
                // of the same problem, but confuse the reader with noise.
                if (messages.errors.length > 1) {
                    messages.errors.length = 1;
                }
                return reject(new Error(messages.errors.join("\n\n")));
            }
            if (process.env.CI &&
                (typeof process.env.CI !== "string" ||
                    process.env.CI.toLowerCase() !== "false") &&
                messages.warnings.length) {
                console.log(chalk_1["default"].yellow("\nTreating warnings as errors because process.env.CI = true.\n" +
                    "Most CI servers set it automatically.\n"));
                return reject(new Error(messages.warnings.join("\n\n")));
            }
            return resolve({
                stats: stats,
                previousFileSizes: previousFileSizes,
                warnings: messages.warnings
            });
        });
    });
}
exports["default"] = compile;
