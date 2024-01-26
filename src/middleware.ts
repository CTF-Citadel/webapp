import { auth } from "./lib/lucia";
import type { MiddlewareHandler } from "astro";

export const onRequest: MiddlewareHandler = async (context, next) => {
	context.locals.auth = auth.handleRequest(context);
	return await next();
};
