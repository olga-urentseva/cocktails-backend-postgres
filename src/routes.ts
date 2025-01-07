import * as controllers from "./controllers";

// type MyType = Extract<Fn | { a: 1; b: 9; c: 8 } | { j: 5 }, { a: 1 }>;
function defineRoutes<
  const TControllers extends {
    [ControllerName in keyof typeof controllers]: {
      method: "get" | "post";
      url: string;
      controller: ControllerName;
      action: keyof InstanceType<(typeof controllers)[ControllerName]>;
    };
  }[keyof typeof controllers][],
>(routes: TControllers) {
  return routes;
}

export const routes = defineRoutes([
  {
    method: "get",
    url: "/cocktails",
    controller: "GetCocktailsController",
    action: "handle",
  },
  {
    method: "get",
    url: "/cocktails/:id",
    controller: "GetCocktailController",
    action: "handle",
  },
  {
    method: "get",
    url: "/collections/:id",
    controller: "GetCollectionController",
    action: "handle",
  },
  {
    method: "get",
    url: "/ingredients",
    controller: "GetIngredientsController",
    action: "handle",
  },
]);
