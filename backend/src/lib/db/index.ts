import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Get connection string - use placeholder during build, real value at runtime
const connectionString = process.env.DATABASE_URL || "postgres://app_user:app_pass@localhost:5433/portfolio_app";

// Create postgres connection
const client = postgres(connectionString);

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Export schema for use in queries
export { schema };
