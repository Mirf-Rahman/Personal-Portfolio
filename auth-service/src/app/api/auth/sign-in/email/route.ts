import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export const POST = handler.POST;
