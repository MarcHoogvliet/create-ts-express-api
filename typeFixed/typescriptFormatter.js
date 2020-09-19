/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var os_1 = __importDefault(require("os"));
var code_frame_1 = require("@babel/code-frame");
var chalk_1 = __importDefault(require("chalk"));
var fs_1 = __importDefault(require("fs"));
var types = { diagnostic: "TypeScript", lint: "TSLint" };
function formatter(message, useColors) {
    var _a = typeof message.getFile === "function"
        ? {
            type: message.getType(),
            severity: message.getSeverity(),
            file: message.getFile(),
            line: message.getLine(),
            content: message.getContent(),
            code: message.getCode(),
            character: message.getCharacter()
        }
        : message, type = _a.type, severity = _a.severity, file = _a.file, line = _a.line, content = _a.content, code = _a.code, character = _a.character;
    var colors = new chalk_1["default"].constructor({ enabled: useColors });
    var messageColor = message.isWarningSeverity() ? colors.yellow : colors.red;
    var fileAndNumberColor = colors.bold.cyan;
    var source = file && fs_1["default"].existsSync(file) && fs_1["default"].readFileSync(file, "utf-8");
    var frame = source
        ? code_frame_1.codeFrameColumns(source, { start: { line: line, column: character } }, { highlightCode: useColors })
            .split("\n")
            .map(function (str) { return "  " + str; })
            .join(os_1["default"].EOL)
        : "";
    return [
        messageColor.bold(types[type] + " " + severity.toLowerCase() + " in ") +
            fileAndNumberColor(file + "(" + line + "," + character + ")") +
            messageColor(":"),
        content +
            "  " +
            messageColor.underline((type === "lint" ? "Rule: " : "TS") + code),
        "",
        frame,
    ].join(os_1["default"].EOL);
}
exports["default"] = formatter;
