import Fastify from "fastify";
import qs from "qs";
import { hostname } from "node:os";

const fastify = Fastify({
  querystringParser: (str: string) => qs.parse(str),
  logger: true,
});

fastify.get("/health", (_, reply) => {
  reply.send({
    status: "ok",
    hostname: hostname(),
  });
});

await fastify.listen({
  port: process.env["NODE_PORT"] ? Number(process.env["NODE_PORT"]) : 9090,
  host: process.env["HOST"] ?? "127.0.0.1",
});
