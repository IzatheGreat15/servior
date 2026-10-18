"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BranchDetailsForm from "./BranchDetailForm";
import SportsCourtsPanel, { createInitialSports } from "./SportsCourtsPanel";
import type {
  BranchDetails,
  BranchRecord,
  SportGroupData,
} from "./types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const defaultBranch: BranchDetails = {
  name: "Greenfield Sports Center",
  address: "123 Greenfield Avenue, Cebu City",
  phone: "+63 917 123 4567",
  email: "greenfield@example.com",
  openingTime: "06:00",
  closingTime: "22:00",
};

function serializeSports(sports: SportGroupData[]) {
  return sports.map((sport) => ({
    id: sport.id,
    name: sport.name,
    courts: sport.courts.map((court) => ({
      id: court.id,
      name: court.name,
      active: court.active,
      rules: court.rules,
      photoUrl: court.removePhoto ? null : court.photoUrl ?? null,
    })),
  }));
}

async function readError(response: Response, fallback: string) {
  const result = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;
  return result?.error ?? fallback;
}

export default function BranchEditor({
  branchId: initialBranchId,
}: {
  branchId?: string;
}) {
  const router = useRouter();
  const [branchId, setBranchId] = useState(initialBranchId);
  const [branch, setBranch] = useState<BranchDetails>(defaultBranch);
  const [sports, setSports] = useState<SportGroupData[]>(createInitialSports);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(initialBranchId));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!initialBranchId) return;
    const controller = new AbortController();

    async function loadBranch() {
      try {
        const response = await fetch(`/api/branches/${initialBranchId}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          setMessage(
            response.status === 401 || response.status === 403
              ? "Sign in with staff access to edit this branch."
              : "Branch details could not be loaded.",
          );
          return;
        }

        const record = (await response.json()) as BranchRecord;
        setBranch({
          name: record.name,
          address: record.address,
          phone: record.phone,
          email: record.email,
          openingTime: record.openingTime,
          closingTime: record.closingTime,
        });
        setSports(record.sports);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMessage("Branch details could not be loaded.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadBranch();
    return () => controller.abort();
  }, [initialBranchId]);

  async function uploadCourtPhotos(saved: BranchRecord) {
    const updatedSports = saved.sports.map((sport) => ({
      ...sport,
      courts: sport.courts.map((court) => ({ ...court })),
    }));
    const supabase = createSupabaseBrowserClient();

    for (const sourceSport of sports) {
      const savedSport = updatedSports.find(
        (item) => item.name.toLowerCase() === sourceSport.name.toLowerCase(),
      );
      if (!savedSport) continue;

      for (const sourceCourt of sourceSport.courts) {
        if (!sourceCourt.photoFile) continue;
        const savedCourt = savedSport.courts.find(
          (item) => item.name.toLowerCase() === sourceCourt.name.toLowerCase(),
        );
        if (!savedCourt) {
          throw new Error(`Could not resolve the saved court "${sourceCourt.name}".`);
        }

        const uploadResponse = await fetch(
          `/api/branches/${saved.id}/court-photo-uploads`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contentType: sourceCourt.photoFile.type,
              sizeBytes: sourceCourt.photoFile.size,
            }),
          },
        );
        if (!uploadResponse.ok) {
          throw new Error(await readError(uploadResponse, "Photo upload could not be prepared."));
        }

        const upload = (await uploadResponse.json()) as {
          path: string;
          token: string;
          publicUrl: string;
        };
        const { error } = await supabase.storage
          .from("court-photos")
          .uploadToSignedUrl(upload.path, upload.token, sourceCourt.photoFile, {
            contentType: sourceCourt.photoFile.type,
            upsert: false,
          });
        if (error) throw new Error(error.message);

        savedCourt.photoUrl = upload.publicUrl;
      }
    }

    return updatedSports;
  }

  async function save() {
    setMessage("");
    setIsSaving(true);

    try {
      const method = branchId ? "PATCH" : "POST";
      const url = branchId ? `/api/branches/${branchId}` : "/api/branches";
      const payload = { branch, sports: serializeSports(sports) };
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setMessage(await readError(response, "Branch could not be saved."));
        return;
      }

      let saved = (await response.json()) as BranchRecord;
      setBranchId(saved.id);

      const hasPhotoChanges = sports.some((sport) =>
        sport.courts.some((court) => court.photoFile || court.removePhoto),
      );
      if (hasPhotoChanges) {
        const updatedSports = await uploadCourtPhotos(saved);
        const photoSaveResponse = await fetch(`/api/branches/${saved.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            branch,
            sports: serializeSports(
              updatedSports.map((sport) => ({
                ...sport,
                courts: sport.courts.map((court) => ({
                  ...court,
                  removePhoto: false,
                  photoFile: null,
                })),
              })),
            ),
          }),
        });
        if (!photoSaveResponse.ok) {
          setMessage("Branch saved, but court photos could not be attached.");
          return;
        }
        saved = (await photoSaveResponse.json()) as BranchRecord;
      }

      setSports(
        saved.sports.map((sport) => ({
          ...sport,
          courts: sport.courts.map((court) => ({
            ...court,
            photoFile: null,
            removePhoto: false,
          })),
        })),
      );
      setMessage("Branch saved.");
      router.replace(`/branches/${saved.id}/edit`);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Branch could not be saved: ${error.message}`
          : "Branch could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f8f5] font-sans text-[#102d29]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <h2 className="pb-4 text-2xl font-medium">
          {branchId ? branch.name : "Add New Branch"}
        </h2>
        {isLoading ? (
          <p role="status" className="py-8 text-sm text-slate-500">
            Loading branch...
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.45fr)]">
              <BranchDetailsForm value={branch} onChange={setBranch} />
              <SportsCourtsPanel sports={sports} onChange={setSports} />
            </div>

            {message && (
              <p role="status" className="mt-5 text-sm text-slate-600">
                {message}
              </p>
            )}

            <footer className="mt-8 flex flex-row items-center justify-center gap-3 rounded-2xl sm:justify-end">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="rounded-xl border border-[#d8e2dc] px-5 py-3 text-sm font-bold text-[#29483e] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={isSaving}
                  className="rounded-xl bg-[#13834e] px-5 py-3 text-sm font-bold text-white hover:bg-[#0f6d40] disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save branch"}
                </button>
              </div>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
