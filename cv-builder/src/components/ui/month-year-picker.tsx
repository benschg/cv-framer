'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

interface MonthYearPickerProps {
  value?: string; // Format: "YYYY-MM" or ""
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
  className?: string;
}

export function MonthYearPicker({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  minYear = 1950,
  maxYear = new Date().getFullYear() + 10,
  className,
}: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse the value (format: "YYYY-MM")
  const [selectedYear, selectedMonth] = React.useMemo(() => {
    if (!value) return [null, null];
    const parts = value.split('-');
    if (parts.length >= 2) {
      return [parts[0], parts[1]];
    }
    return [null, null];
  }, [value]);

  // Generate years array
  const years = React.useMemo(() => {
    const result = [];
    for (let year = maxYear; year >= minYear; year--) {
      result.push(year.toString());
    }
    return result;
  }, [minYear, maxYear]);

  const handleMonthChange = (month: string) => {
    const year = selectedYear || new Date().getFullYear().toString();
    onChange?.(`${year}-${month}`);
  };

  const handleYearChange = (year: string) => {
    const month = selectedMonth || '01';
    onChange?.(`${year}-${month}`);
  };

  // Format display value
  const displayValue = React.useMemo(() => {
    if (!selectedMonth || !selectedYear) return null;
    const monthObj = MONTHS.find((m) => m.value === selectedMonth);
    return monthObj ? `${monthObj.label} ${selectedYear}` : null;
  }, [selectedMonth, selectedYear]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !displayValue && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-4" align="start">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Month</label>
            <Select value={selectedMonth || ''} onValueChange={handleMonthChange}>
              <SelectTrigger>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Year</label>
            <Select value={selectedYear || ''} onValueChange={handleYearChange}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
