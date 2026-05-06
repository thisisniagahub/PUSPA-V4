// Tool Definition Type for Hermes AI Tools
import { z } from "zod";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodSchema;
  rolesAllowed?: string[];
  execute: (args: Record<string, unknown>) => Promise<ToolResult>;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  message?: string;
  error?: string;
  details?: unknown;
}

export type ToolRegistry = Map<string, ToolDefinition>;
