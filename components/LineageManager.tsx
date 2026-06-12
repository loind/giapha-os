"use client";

import { Person, Relationship } from "@/types";
import {
  computeBirthOrders,
  computeGenerations,
  computeInLaws,
} from "@/utils/lineage";
import { createClient } from "@/utils/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

interface LineageManagerProps {
  persons: Person[];
  relationships: Relationship[];
}

interface ComputedUpdate {
  id: string;
  full_name: string;
  old_generation: number | null;
  new_generation: number | null;
  old_birth_order: number | null;
  new_birth_order: number | null;
  old_is_in_law: boolean;
  new_is_in_law: boolean;
  gender: string;
  changed: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LineageManager({
  persons,
  relationships,
}: LineageManagerProps) {
  const supabase = createClient();

  const [updates, setUpdates] = useState<ComputedUpdate[] | null>(null);
  const [computing, setComputing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const handleCompute = () => {
    setComputing(true);
    setApplied(false);
    setError(null);

    try {
      const genMap = computeGenerations(persons, relationships);
      const orderMap = computeBirthOrders(persons, relationships);
      const inLawMap = computeInLaws(persons, relationships);

      const result: ComputedUpdate[] = persons.map((p) => {
        const newGen = genMap.has(p.id) ? genMap.get(p.id)! : null;
        const newOrder = orderMap.has(p.id) ? orderMap.get(p.id)! : null;
        const newInLaw = inLawMap.get(p.id) ?? false;

        return {
          id: p.id,
          full_name: p.full_name,
          old_generation: p.generation,
          new_generation: newGen,
          old_birth_order: p.birth_order,
          new_birth_order: newOrder,
          old_is_in_law: p.is_in_law,
          new_is_in_law: newInLaw,
          gender: p.gender,
          changed:
            newGen !== p.generation ||
            newOrder !== p.birth_order ||
            newInLaw !== p.is_in_law,
        };
      });

      // Sort: changed first, then by new generation, then by new birth_order
      result.sort((a, b) => {
        if (a.changed !== b.changed) return a.changed ? -1 : 1;
        const gA = a.new_generation ?? 999;
        const gB = b.new_generation ?? 999;
        if (gA !== gB) return gA - gB;
        const oA = a.new_birth_order ?? 999;
        const oB = b.new_birth_order ?? 999;
        return oA - oB;
      });

      setUpdates(result);
    } catch (err) {
      setError((err as Error).message || "Lỗi tính toán.");
    } finally {
      setComputing(false);
    }
  };

  const handleApply = async () => {
    if (!updates) return;
    setApplying(true);
    setError(null);

    try {
      const changedOnly = updates.filter((u) => u.changed);
      // Batch update in chunks of 20
      const CHUNK = 20;
      for (let i = 0; i < changedOnly.length; i += CHUNK) {
        const chunk = changedOnly.slice(i, i + CHUNK);
        // Update each person individually (Supabase doesn't support bulk upsert with different values easily)
        await Promise.all(
          chunk.map((u) =>
            supabase
              .from("persons")
              .update({
                generation: u.new_generation,
                birth_order: u.new_birth_order,
                is_in_law: u.new_is_in_law,
              })
              .eq("id", u.id),
          ),
        );
      }
      setApplied(true);
    } catch (err) {
      setError((err as Error).message || "Lỗi khi cập nhật dữ liệu.");
    } finally {
      setApplying(false);
    }
  };

  const changedCount = updates?.filter((u) => u.changed).length ?? 0;
  const displayedRows = showAll
    ? (updates ?? [])
    : (updates ?? []).slice(0, 20);

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleCompute}
          disabled={computing || applying}
          className="btn-secondary"
        >
          {computing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {computing ? "Đang tính..." : "Tính toán"}
        </button>

        {updates && changedCount > 0 && !applied && (
          <button
            onClick={handleApply}
            disabled={applying}
            className="btn-primary"
          >
            {applying ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            {applying
              ? "Đang cập nhật..."
              : `Áp dụng (${changedCount} thay đổi)`}
          </button>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 text-sm font-medium"
          >
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success */}
      <AnimatePresence>
        {applied && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-4 text-sm font-semibold"
          >
            <CheckCircle2 className="size-5 shrink-0" />
            Đã áp dụng thành công {changedCount} thay đổi! Tải lại trang để xem
            kết quả.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview table */}
      {updates && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-stone-500 font-medium">
              <span className="text-stone-800 font-bold">{changedCount}</span>{" "}
              thành viên sẽ được cập nhật /&nbsp;
              <span className="text-stone-800 font-bold">
                {updates.length}
              </span>{" "}
              tổng
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                    <tr className="bg-stone-50 border-b border-stone-200/80">
                      <th className="text-left px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">
                        Tên
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">
                        Thế hệ
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">
                        Thứ tự
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">
                        Dâu/Rể
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-stone-600">
                        Trạng thái
                      </th>
                    </tr>
                </thead>
                <tbody>
                  {displayedRows.map((u, i) => (
                    <tr
                      key={u.id}
                      className={`border-b border-stone-100 last:border-0 transition-colors ${
                        u.changed ? "bg-amber-50/40" : ""
                      } ${i % 2 === 0 && !u.changed ? "bg-white" : !u.changed ? "bg-stone-50/30" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium text-stone-800">
                        {u.full_name}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-stone-400">
                          {u.old_generation ?? "—"}
                        </span>
                        {u.old_generation !== u.new_generation && (
                          <>
                            <span className="mx-2 text-stone-300">→</span>
                            <span className="font-bold text-amber-700">
                              {u.new_generation ?? "—"}
                            </span>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-stone-400">
                          {u.old_birth_order ?? "—"}
                        </span>
                        {u.old_birth_order !== u.new_birth_order && (
                          <>
                            <span className="mx-2 text-stone-300">→</span>
                            <span className="font-bold text-amber-700">
                              {u.new_birth_order ?? "—"}
                            </span>
                          </>
                        )}
                      </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={
                              u.old_is_in_law !== u.new_is_in_law
                                ? "text-stone-400"
                                : ""
                            }
                          >
                            {u.old_is_in_law
                              ? u.gender === "male"
                                ? "Rể"
                                : "Dâu"
                              : "—"}
                          </span>
                          {u.old_is_in_law !== u.new_is_in_law && (
                            <>
                              <span className="mx-2 text-stone-300">→</span>
                              <span className="font-bold text-amber-700">
                                {u.new_is_in_law
                                  ? u.gender === "male"
                                    ? "Rể"
                                    : "Dâu"
                                  : "Máu thịt"}
                              </span>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {u.changed ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200/60">
                              Cập nhật
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-400 border border-stone-200/60">
                              Không đổi
                            </span>
                          )}
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {updates.length > 20 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-amber-700 transition-colors mx-auto"
            >
              {showAll ? (
                <>
                  <ChevronUp className="size-4" /> Thu gọn
                </>
              ) : (
                <>
                  <ChevronDown className="size-4" /> Xem tất cả {updates.length}{" "}
                  thành viên
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
