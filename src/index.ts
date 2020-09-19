/**
 * Required External Modules
 */
require("dotenv").config();
import express from "express";
import applyMiddleware from "./middleware/applyMiddleware";

import users from "./modules/users";

/**
 * App Variables
 */
if (!process.env.PORT) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();
// /**
//  *  App Configuration
applyMiddleware({ to: app });

// /**
//  * Server Activation
//  */
app.get("/", function (req, res) {
  res.send(users);
});
const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
// /**
//  * Webpack HMR Activation
//  */

type ModuleId = string | number;

interface WebpackHotModule {
  hot?: {
    data: any;
    accept(
      dependencies: string[],
      callback?: (updatedDependencies: ModuleId[]) => void
    ): void;
    accept(dependency: string, callback?: () => void): void;
    accept(errHandler?: (err: Error) => void): void;
    dispose(callback: (data: any) => void): void;
  };
}

declare const module: WebpackHotModule;
if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => server.close());
}
