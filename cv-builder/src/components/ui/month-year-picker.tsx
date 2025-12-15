'use client';

import * as React from 'react';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const MONTHS = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
];

const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
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
  const [view, setView] = React.useState<'month' | 'year'>('month');

  // Parse the value (format: "YYYY-MM")
  const [selectedYear, selectedMonth] = React.useMemo(() => {
    if (!value) return [null, null];
    const parts = value.split('-');
    if (parts.length >= 2) {
      return [parts[0], parts[1]];
    }
    return [null, null];
  }, [value]);

  // Current decade for year grid navigation
  const [decadeStart, setDecadeStart] = React.useState(() => {
    const year = selectedYear ? parseInt(selectedYear) : new Date().getFullYear();
    return Math.floor(year / 10) * 10;
  });

  // Generate years for current decade view (10 years)
  const decadeYears = React.useMemo(() => {
    const years = [];
    for (let i = 0; i < 10; i++) {
      const year = decadeStart + i;
      if (year >= minYear && year <= maxYear) {
        years.push(year.toString());
      }
    }
    return years;
  }, [decadeStart, minYear, maxYear]);

  const handleMonthSelect = (month: string) => {
    const year = selectedYear || new Date().getFullYear().toString();
    onChange?.(`${year}-${month}`);
  };

  const handleYearSelect = (year: string) => {
    const month = selectedMonth || '01';
    onChange?.(`${year}-${month}`);
    setView('month');
  };

  const goToPrevDecade = () => {
    if (decadeStart - 10 >= minYear) {
      setDecadeStart(decadeStart - 10);
    }
  };

  const goToNextDecade = () => {
    if (decadeStart + 10 <= maxYear) {
      setDecadeStart(decadeStart + 10);
    }
  };

  // Format display value
  const displayValue = React.useMemo(() => {
    if (!selectedMonth || !selectedYear) return null;
    const monthIndex = parseInt(selectedMonth) - 1;
    return `${MONTHS_FULL[monthIndex]} ${selectedYear}`;
  }, [selectedMonth, selectedYear]);

  // Reset view when opening
  React.useEffect(() => {
    if (open) {
      setView('month');
      if (selectedYear) {
        setDecadeStart(Math.floor(parseInt(selectedYear) / 10) * 10);
      }
    }
  }, [open, selectedYear]);

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
      <PopoverContent className="w-[280px] p-3" align="start">
        {view === 'month' ? (
          <div className="space-y-3">
            {/* Year selector header */}
            <Button
              variant="ghost"
              className="w-full justify-center font-semibold"
              onClick={() => setView('year')}
            >
              {selectedYear || new Date().getFullYear()}
            </Button>

            {/* Month grid - 4 columns x 3 rows */}
            <div className="grid grid-cols-4 gap-2">
              {MONTHS.map((month) => (
                <Button
                  key={month.value}
                  variant={selectedMonth === month.value ? 'default' : 'ghost'}
                  size="sm"
                  className="h-9"
                  onClick={() => handleMonthSelect(month.value)}
                >
                  {month.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Decade navigation header */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={goToPrevDecade}
                disabled={decadeStart - 10 < minYear}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold">
                {decadeStart} - {decadeStart + 9}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={goToNextDecade}
                disabled={decadeStart + 10 > maxYear}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Year grid - 5 columns x 2 rows */}
            <div className="grid grid-cols-5 gap-2">
              {decadeYears.map((year) => (
                <Button
                  key={year}
                  variant={selectedYear === year ? 'default' : 'ghost'}
                  size="sm"
                  className="h-9"
                  onClick={() => handleYearSelect(year)}
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
