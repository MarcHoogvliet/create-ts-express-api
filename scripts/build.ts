import { Stats } from "webpack";
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
process.on("unhandledRejection", (err) => {
  throw err;
});

// Ensure environment variables are read.
import "../config/env";

import path from "path";
import chalk from "chalk";
import fs from "fs-extra";
import checkRequiredFiles from "react-dev-utils/checkRequiredFiles";
import printHostingInstructions from "react-dev-utils/printHostingInstructions";
import FileSizeReporter, {
  OpaqueFileSizes,
} from "react-dev-utils/FileSizeReporter";
import printBuildError from "react-dev-utils/printBuildError";

import paths from "../config/paths";

import configFactory from "../config/webpack.config";
const config = configFactory("production");

const measureFileSizesBeforeBuild =
  FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;
const useYarn = false; //fs.existsSync(paths.yarnLockFile);

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

const isInteractive = process.stdout.isTTY;

//  Import the actual build process
import compile from "./compile";

// Warn and crash if required files are missing
// NOTE: removed app html since we don't care about client side
if (!checkRequiredFiles([/*paths.appHtml,*/ paths.appIndexTs])) {
  process.exit(1);
}

// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
const { checkBrowsers } = require("react-dev-utils/browsersHelper");

//  Check browser
checkBrowsers(paths.appPath, isInteractive)
  .then(() => {
    // First, read the current file sizes in build directory.
    // This lets us display how much they changed later.
    return measureFileSizesBeforeBuild(paths.appBuild);
  })
  .then((previousFileSizes: OpaqueFileSizes) => {
    // Remove all content but keep the directory so that
    // if you're in it, you don't end up in Trash
    fs.emptyDirSync(paths.appBuild);
    // Merge with the public folder
    //copyPublicFolder();
    // Start the webpack build
    return compile({ using: config, with: previousFileSizes });
  })
  .then(
    ({
      stats,
      previousFileSizes,
      warnings,
    }: {
      previousFileSizes: OpaqueFileSizes;
      stats: Stats;
      warnings: string[];
    }) => {
      if (warnings.length) {
        console.log(chalk.yellow("Compiled with warnings.\n"));
        console.log(warnings.join("\n\n"));
        console.log(
          "\nSearch for the " +
            chalk.underline(chalk.yellow("keywords")) +
            " to learn more about each warning."
        );
        console.log(
          "To ignore, add " +
            chalk.cyan("// eslint-disable-next-line") +
            " to the line before.\n"
        );
      } else {
        console.log(chalk.green("Compiled successfully.\n"));
      }

      console.log("File sizes after gzip:\n");
      printFileSizesAfterBuild(
        stats,
        previousFileSizes,
        paths.appBuild,
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE
      );
      console.log();

      const appPackage = require(paths.appPackageJson);
      const publicUrl = paths.publicUrlOrPath;
      const publicPath = config.output?.publicPath ?? "";
      const buildFolder = path.relative(process.cwd(), paths.appBuild);
      printHostingInstructions(
        appPackage,
        publicUrl,
        publicPath,
        buildFolder,
        useYarn
      );
    },
    (err: Error) => {
      const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === "true";
      if (tscCompileOnError) {
        console.log(
          chalk.yellow(
            "Compiled with the following type errors (you may want to check these before deploying your app):\n"
          )
        );
        printBuildError(err);
      } else {
        console.log(chalk.red("Failed to compile.\n"));
        printBuildError(err);
        process.exit(1);
      }
    }
  )
  .catch((err: Error) => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
