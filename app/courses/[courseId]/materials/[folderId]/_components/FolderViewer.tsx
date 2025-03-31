'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
    folder: {
        id: number;
        name: string;
        children: { id: number; name: string }[];
        files: { id: number; filename: string; filePath: string }[];
    };
    courseId: number;
    userRole: string;
    folderPath: { id: number; name: string }[];
};

export default function FolderViewer({ folder, folderPath, courseId, userRole }: Props) {
    const router = useRouter();
    const isTeacher = userRole === "TEACHER";

    const [newFolderName, setNewFolderName] = useState("");
    const [creatingFolder, setCreatingFolder] = useState(false);

    const createFolder = async () => {
        if (!newFolderName.trim()) return;

        setCreatingFolder(true);

        const res = await fetch(`/api/courses/${courseId}/materials/create-folder`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: newFolderName,
                parentId: folder.id,
            }),
        });

        if (res.ok) {
            setNewFolderName("");
            router.refresh(); // refresh current folder view
        } else {
            alert("Failed to create folder.");
        }

        setCreatingFolder(false);
    };

    return (
        <div className="space-y-6">
            <nav className="text-sm text-muted-foreground">
                {folderPath.map((entry, i) => (
                    <span key={entry.id}>
                        {i > 0 && " / "}
                        <Link
                            href={`/courses/${courseId}/materials/${entry.id}`}
                            className="hover:underline text-foreground"
                        >
                            {entry.name}
                        </Link>
                    </span>
                ))}
            </nav>
            <h1 className="text-2xl font-bold">📁 {folder.name}</h1>

            {/* Subfolders */}
            <section>
                <h2 className="text-lg font-semibold">Folders</h2>
                {folder.children.length === 0 ? (
                    <p className="text-muted-foreground">No subfolders</p>
                ) : (
                    <ul className="list-disc pl-6 space-y-1">
                        {folder.children.map((child) => (
                            <li key={child.id}>
                                <Link
                                    href={`/courses/${courseId}/materials/${child.id}`}
                                    className="text-blue-600 hover:underline"
                                >
                                    {child.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Files */}
            <section>
                <h2 className="text-lg font-semibold">Files</h2>
                {folder.files.length === 0 ? (
                    <p className="text-muted-foreground">No files uploaded</p>
                ) : (
                    <ul className="list-disc pl-6 space-y-1">
                        {folder.files.map((file) => (
                            <li key={file.id}>
                                <span className="text-muted-foreground">{file.filename}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Teacher-only: Create folder */}
            {isTeacher && (
                <section className="space-y-2">
                    <h2 className="text-lg font-semibold">Create a New Folder</h2>
                    <div className="flex gap-2 items-center max-w-md">
                        <Input
                            placeholder="New folder name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                        />
                        <Button onClick={createFolder} disabled={creatingFolder}>
                            Create
                        </Button>
                    </div>
                </section>
            )}
        </div>
    );
}
