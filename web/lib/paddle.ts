import { Environments, initializePaddle } from "@paddle/paddle-js";
import {
  Environment,
  LogLevel,
  Paddle,
  PaddleOptions,
} from "@paddle/paddle-node-sdk";

export function getPaddleInstance() {
  const paddleOptions: PaddleOptions = {
    environment:
      (process.env.NEXT_PUBLIC_PADDLE_ENV as Environment) ??
      Environment.sandbox,
    logLevel: LogLevel.error,
  };

  if (!process.env.PADDLE_API_KEY) {
    console.error("Paddle API key is missing");
  }

  return new Paddle(process.env.PADDLE_API_KEY!, paddleOptions);
}

// this paddle works only in client files.
export const paddle = initializePaddle({
  token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
  environment:
    (process.env.NEXT_PUBLIC_PADDLE_ENV as Environments) ?? Environment.sandbox,
  eventCallback: console.log,
});
