import { serve } from "@hono/node-server";
import { createRoute, OpenAPIHono } from "hono-zod-openapi-patched";
import z, { type AnyZodObject } from "zod";

import { Db } from "./db";
import * as controllers from "./controllers";
import { routes } from "./routes";

import { GetCocktailUseCase } from "./services/get-cocktail-use-case";
import { GetCocktailsUseCase } from "./services/get-cocktails-use-case";
import { GetCollectionUseCase } from "./services/get-collection-use-case";
import { GetIngredientsUseCase } from "./services/get-ingredients-use-case";
import { GetCollectionsUseCase } from "./services/get-collections-use-case";

import { MyRequest } from "./my-request";
import { Controller } from "../lib/controller";
import { swaggerUI } from "@hono/swagger-ui";

export class Application {
  private readonly controllers;
  private readonly app: OpenAPIHono;

  constructor(private readonly db: Db) {
    this.app = new OpenAPIHono();
    this.controllers = this.createControllers();
    this.registerRoutes();
  }

  async run(host = "127.0.0.1", port = 9090) {
    serve({
      port: port,
      fetch: this.app.fetch,
      hostname: host,
    });
  }

  private createControllers(): {
    [k in keyof typeof controllers]: InstanceType<(typeof controllers)[k]>;
  } {
    const getCocktailUseCase = new GetCocktailUseCase(this.db);
    const getCocktailsUseCase = new GetCocktailsUseCase(this.db);
    const getCollectionUseCase = new GetCollectionUseCase(this.db);
    const getIngredientsUseCase = new GetIngredientsUseCase(this.db);
    const getCollectionsUseCase = new GetCollectionsUseCase(this.db);

    return {
      GetCocktailController: new controllers.GetCocktailController(
        getCocktailUseCase
      ),
      GetCocktailsController: new controllers.GetCocktailsController(
        getCocktailsUseCase
      ),
      GetCollectionController: new controllers.GetCollectionController(
        getCollectionUseCase
      ),
      GetIngredientsController: new controllers.GetIngredientsController(
        getIngredientsUseCase
      ),
      GetCollectionsController: new controllers.GetCollectionsController(
        getCollectionsUseCase
      ),
    };
  }

  private registerRoutes() {
    routes.forEach((routeData) => {
      const controller: Controller = this.controllers[routeData.controller];

      const route = createRoute({
        method: routeData.method,
        path: routeData.url,
        request: {
          ...(controller.request.paramsSchema
            ? { params: controller.request.paramsSchema }
            : {}),
          ...(controller.request.queryParamsSchema
            ? { query: controller.request.queryParamsSchema }
            : {}),
          ...(controller.request.body ? { body: controller.request.body } : {}),
          ...(controller.request.headersSchema
            ? { headers: controller.request.headersSchema }
            : {}),
        },
        responses: controller.responses,
      });

      this.app.openapi<
        typeof route,
        {
          in: {
            param: Record<string, string> | undefined;
            query: Record<string, string | string[]> | undefined;
            header: Record<string, string> | undefined;
          };
          out: {
            param: z.infer<AnyZodObject> | undefined;
            query: z.infer<AnyZodObject> | undefined;
            header: z.infer<AnyZodObject> | undefined;
          };
        }
      >(route, async (c) => {
        try {
          const params = c.req.valid("param");
          const queryParams = c.req.valid("query");
          const headers = c.req.valid("header");
          const body = c.get("validatedBody");

          const request = new MyRequest(params, queryParams, body, headers);

          const response = await controller.handle(request);

          if (!response) {
            return new Response(null, {
              status: 204,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(response.body, {
            status: response.status,
            headers: response.headers,
          });
        } catch (error) {
          return new Response(
            JSON.stringify({ error: "Internal Server Error", details: error }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      });
    });

    this.app.doc("/doc", {
      openapi: "3.0.0",
      info: {
        version: "1.0.0",
        title: "My API",
      },
    });

    this.app.get("/swagger", swaggerUI({ url: "/doc" }));
  }
}
