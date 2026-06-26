'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormDatePickerProps {
  label: string;
  id?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function FormDatePicker({ label, id, required, value, onChange, error }: FormDatePickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-semibold text-foreground">{label}</Label>
      <Input
        id={id}
        type="date"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('h-11 rounded-xl bg-muted/40', error && 'border-destructive focus-visible:ring-destructive/50')}
      />
      {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
    </div>
  );
}
