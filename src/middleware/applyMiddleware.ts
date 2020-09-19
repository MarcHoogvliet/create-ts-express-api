import { Express, json } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";

import RateLimit from "express-rate-limit";
import RateLimitRedisStore from "rate-limit-redis";

const applyMiddlewware = ({ to: server }: { to: Express }) => {
  server.use(helmet());
  server.use(cors());
  server.use(bodyParser.json());
  server.use(morgan("dev"));
  server.use(json());
  return server;
};

export default applyMiddlewware;
