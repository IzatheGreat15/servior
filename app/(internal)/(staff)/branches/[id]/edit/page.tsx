
import { Suspense } from "react";
import BranchEditor from "@/components/internal/branches/BranchEditor";

async function BranchEditorWithParams({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BranchEditor branchId={id} />;
}

export default function BranchEditPage({
  params,
}: {
  params?: Promise<{ id: string }>;
}) {
  const safeParams = params ?? Promise.resolve({ id: "branch-1" });

  return (
    <Suspense fallback={<div className="p-4 text-sm text-slate-500">Loading branch editor...</div>}>
      <BranchEditorWithParams params={safeParams} />
    </Suspense>
  );
}
