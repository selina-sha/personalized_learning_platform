'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type Props = {
    open: boolean;
    onClose: () => void;
    studentName: string;
    maxPoints: number;
    onSubmit: (grade: number, comment: string) => void;
};

export default function GradeModal({ open, onClose, studentName, maxPoints, onSubmit }: Props) {
    const [grade, setGrade] = useState('');
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        const gradeValue = parseFloat(grade);
        const roundedGrade = Math.round(gradeValue * 10) / 10;

        if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > maxPoints) {
            alert(`Grade must be between 0 and ${maxPoints}`);
            return;
        }

        onSubmit(roundedGrade, comment);
        setGrade('');
        setComment('');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Grade {studentName}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Grade (out of {maxPoints})
                        </label>
                        <Input
                            type="number"
                            step="0.1"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            min={0}
                            max={maxPoints}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Comment (optional)</label>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            placeholder="Add any comments..."
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>Submit Grade</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
