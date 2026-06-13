"use server";

import {
  computeGenerations,
  computeInLaws,
} from "@/utils/lineage";
import { getProfile, getSupabase } from "@/utils/supabase/queries";
import { revalidatePath } from "next/cache";

interface RecomputeSuccess {
  success: true;
  updatedCount: number;
  partialError?: string;
}

interface RecomputeFailure {
  success: false;
  error: string;
}

type RecomputeResult = RecomputeSuccess | RecomputeFailure;

/**
 * Recompute generation and is_in_law for all persons.
 *
 * Fetches all persons + relationships, runs compute functions,
 * diffs against current DB values, and batch-updates changed records.
 *
 * Note: birth_order is NOT auto-computed — managed manually by user.
 *
 * Called automatically after relationship mutations in RelationshipManager.
 */
export async function recomputeLineage(): Promise<RecomputeResult> {
  // Auth check: admin/editor only
  const profile = await getProfile();
  if (profile?.role !== "admin" && profile?.role !== "editor") {
    return {
      success: false,
      error: "Từ chối truy cập. Chỉ Admin hoặc Editor mới có quyền thực hiện.",
    };
  }

  const supabase = await getSupabase();

  try {
    // Fetch all persons (only fields needed for compute + diff)
    const { data: persons, error: personsError } = await supabase
      .from("persons")
      .select("id, full_name, generation, is_in_law, gender, birth_year");

    if (personsError) {
      console.error("recomputeLineage: fetch persons error:", personsError);
      return { success: false, error: "Lỗi truy vấn danh sách thành viên." };
    }

    // Fetch all relationships
    const { data: relationships, error: relsError } = await supabase
      .from("relationships")
      .select("type, person_a, person_b");

    if (relsError) {
      console.error("recomputeLineage: fetch relationships error:", relsError);
      return { success: false, error: "Lỗi truy vấn mối quan hệ." };
    }

    if (!persons || persons.length === 0) {
      return { success: true, updatedCount: 0 };
    }

    // Compute lineage values (skip birth_order — managed manually by user)
    const genMap = computeGenerations(persons, relationships ?? []);
    const inLawMap = computeInLaws(persons, relationships ?? []);

    // Diff: find persons whose values changed
    const updatePayloads: Array<{
      id: string;
      generation: number | null;
      is_in_law: boolean;
    }> = [];

    for (const p of persons) {
      const newGen = genMap.has(p.id) ? genMap.get(p.id)! : null;
      const newInLaw = inLawMap.get(p.id) ?? false;

      const genChanged = newGen !== p.generation;
      const inLawChanged = newInLaw !== p.is_in_law;

      if (genChanged || inLawChanged) {
        updatePayloads.push({
          id: p.id,
          generation: newGen,
          is_in_law: newInLaw,
        });
      }
    }

    if (updatePayloads.length === 0) {
      return { success: true, updatedCount: 0 };
    }

    // Batch update in chunks of 20
    const CHUNK = 20;
    let failedCount = 0;
    for (let i = 0; i < updatePayloads.length; i += CHUNK) {
      const chunk = updatePayloads.slice(i, i + CHUNK);
      const results = await Promise.all(
        chunk.map((u) =>
          supabase
            .from("persons")
            .update({
              generation: u.generation,
              is_in_law: u.is_in_law,
            })
            .eq("id", u.id),
        ),
      );
      // Count failures
      for (const r of results) {
        if (r.error) failedCount++;
      }
    }

    // Invalidate Next.js cache so next fetch gets fresh data
    revalidatePath("/dashboard");

    if (failedCount > 0) {
      return {
        success: true,
        updatedCount: updatePayloads.length - failedCount,
        partialError: `Cập nhật thất bại ${failedCount}/${updatePayloads.length} thành viên.`,
      };
    }

    return { success: true, updatedCount: updatePayloads.length };
  } catch (err) {
    console.error("recomputeLineage: unexpected error:", err);
    return {
      success: false,
      error: (err as Error).message || "Lỗi không xác định khi tính toán dòng họ.",
    };
  }
}
