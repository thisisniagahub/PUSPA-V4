import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { ToolDefinition } from "./types";

export const getCaseStatsTool: ToolDefinition = {
  name: "get_case_stats",
  description: "Dapatkan statistik kes asnaf mengikut status dan bulan",
  parameters: z.object({
    status: z.enum(["aktif", "selesai", "gantung"]).optional(),
    month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  }),
  rolesAllowed: ["admin", "developer"],
  async execute({ status, month }) {
    try {
      const where: any = {};
      if (status) where.status = status;
      if (month) {
        const start = new Date(`${month}-01T00:00:00Z`);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        where.createdAt = { gte: start, lt: end };
      }
      const count = await prisma.case.count({ where });
      return { success: true, data: { count, status: status ?? "semua", month: month ?? "semua" }, message: `Jumlah kes: ${count}` };
    } catch (error) {
      return { success: false, error: "Gagal capai database", details: error };
    }
  },
};
