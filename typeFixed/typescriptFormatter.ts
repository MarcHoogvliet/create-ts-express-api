/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

import os from "os";
import { codeFrameColumns as codeFrame } from "@babel/code-frame";
import chalk from "chalk";
import fs from "fs";

const types = { diagnostic: "TypeScript", lint: "TSLint" };

function formatter(message: any, useColors: boolean) {
  const { type, severity, file, line, content, code, character } =
    typeof message.getFile === "function"
      ? {
          type: message.getType(),
          severity: message.getSeverity(),
          file: message.getFile(),
          line: message.getLine(),
          content: message.getContent(),
          code: message.getCode(),
          character: message.getCharacter(),
        }
      : message;

  const colors = new (chalk as any).constructor({ enabled: useColors });
  const messageColor = message.isWarningSeverity() ? colors.yellow : colors.red;
  const fileAndNumberColor = colors.bold.cyan;

  const source = file && fs.existsSync(file) && fs.readFileSync(file, "utf-8");
  const frame = source
    ? codeFrame(
        source,
        { start: { line: line, column: character } },
        { highlightCode: useColors }
      )
        .split("\n")
        .map((str) => "  " + str)
        .join(os.EOL)
    : "";

  return [
    messageColor.bold(
      `${
        types[type as "lint" | "diagnostic"] as any
      } ${severity.toLowerCase()} in `
    ) +
      fileAndNumberColor(`${file}(${line},${character})`) +
      messageColor(":"),
    content +
      "  " +
      messageColor.underline((type === "lint" ? "Rule: " : "TS") + code),
    "",
    frame,
  ].join(os.EOL);
}

export default formatter;
