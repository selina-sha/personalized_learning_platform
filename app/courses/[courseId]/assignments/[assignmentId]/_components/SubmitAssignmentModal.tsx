'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  onClose: () => void;
  courseId: number;
  assignmentId: number;
  submissionName: string;
  isOverwrite: boolean;
};

export default function SubmitAssignmentModal({
  open,
  onClose,
  courseId,
  assignmentId,
  submissionName,
  isOverwrite,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileMismatch, setFileMismatch] = useState(false);

  console.log("aaaaaaaa")
  console.log(submissionName)

  useEffect(() => {
    if (!file) {
      setFileMismatch(false);
    } else {
      setFileMismatch(file.name !== submissionName);
    }
  }, [file, submissionName]);

  const handleSubmit = async () => {
    if (!file || fileMismatch) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}/submit`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Upload failed: " + err.error);
        return;
      }

      alert("Submission successful!");
      onClose(); // auto-close modal
    } catch (err) {
      console.error("Upload error", err);
      alert("Unexpected error occurred.");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isOverwrite ? "Overwrite Submission?" : "Submit Assignment"}
          </DialogTitle>
          <DialogDescription>
            {isOverwrite ? (
              <>
                You’ve already submitted <strong>{submissionName}</strong>. Uploading again will replace it.
              </>
            ) : (
              <>
                Please upload your assignment file named exactly <strong>{submissionName}</strong>.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <Input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        {fileMismatch && (
          <p className="text-sm text-red-500 mt-2">
            ⚠️ The selected file must be named exactly <strong>{submissionName}</strong>
          </p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!file || fileMismatch || uploading}
            onClick={handleSubmit}
          >
            {uploading ? "Uploading..." : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
