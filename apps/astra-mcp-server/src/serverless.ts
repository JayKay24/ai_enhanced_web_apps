import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import express from "express";
import type { Request, Response } from "express";
import { AppModule } from "./app/app.module";

const server = express();
let isAppInitialized = false;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.enableCors();
  await app.init();
  isAppInitialized = true;
}

export default async function handler(req: Request, res: Response) {
  if (!isAppInitialized) {
    await bootstrap();
  }
  server(req, res);
}
