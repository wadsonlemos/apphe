'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createEntry } from '@/app/lib/actions';
import { useRef } from 'react';

export default function EntryForm() {
    const formRef = useRef<HTMLFormElement>(null);

    async function action(formData: FormData) {
        await createEntry(formData);
        formRef.current?.reset();
    }

    return (
        <form ref={formRef} action={action} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" required />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input id="startTime" name="startTime" type="time" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input id="endTime" name="endTime" type="time" required />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Project X deadline..." />
            </div>
            <Button type="submit">Add Entry</Button>
        </form>
    );
}
