import { serve } from "@hono/node-server";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import z, { type AnyZodObject } from "zod";

import { Db } from "./db";
import * as controllers from "./controllers";
import { routes } from "./routes";

import { GetCocktailUseCase } from "./services/get-cocktail-use-case";
import { GetCocktailsUseCase } from "./services/get-cocktails-use-case";
import { GetCollectionUseCase } from "./services/get-collection-use-case";

import { MyRequest } from "./my-request";
import { Controller } from "../lib/controller";
import { swaggerUI } from "@hono/swagger-ui";

import { GetIngredientsUseCase } from "./services/get-ingredients-use-case";
import { GetCollectionsUseCase } from "./services/get-collections-use-case";

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

      const action = controller.handle.bind(controller);

      const route = createRoute({
        method: routeData.method as
          | "get"
          | "post"
          | "put"
          | "delete"
          | "patch"
          | "head"
          | "options"
          | "trace",
        path: routeData.url as string,
        request: {
          ...(controller.requestSchemas.params
            ? {
                params: controller.requestSchemas.params,
              }
            : {}),
          ...(controller.requestSchemas.queryParams
            ? {
                query: controller.requestSchemas.queryParams,
              }
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
          };
          out: {
            param: z.infer<AnyZodObject> | undefined;
            query: z.infer<AnyZodObject> | undefined;
          };
        }
      >(route, async (c) => {
        try {
          const params = c.req.valid("param");
          const queryParams = c.req.valid("query");

          const request = new MyRequest<{
            params: typeof controller.requestSchemas.params;
            queryParams: typeof controller.requestSchemas.queryParams;
          }>(params, queryParams);

          const response = await action(request);

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
