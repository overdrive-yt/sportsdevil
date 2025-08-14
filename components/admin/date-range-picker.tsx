'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'

interface DateRangePickerProps {
  dateRange: { from: Date; to: Date }
  onDateRangeChange: (range: { from: Date; to: Date }) => void
}

// V9.11.4: Date Range Picker Component
export default function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  const quickRanges = [
    { label: 'Today', days: 0 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 }
  ]

  const setQuickRange = (days: number) => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)
    onDateRangeChange({ from, to })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="min-w-[260px] justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(dateRange.from, 'PPP')} - {format(dateRange.to, 'PPP')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          <div className="border-r p-3">
            <p className="text-sm font-medium mb-3">Quick select</p>
            <div className="space-y-1">
              {quickRanges.map((range) => (
                <Button
                  key={range.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setQuickRange(range.days)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="p-3">
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range: DateRange | undefined) => {
                if (range?.from && range?.to) {
                  onDateRangeChange({ from: range.from, to: range.to })
                }
              }}
              numberOfMonths={2}
              initialFocus
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}