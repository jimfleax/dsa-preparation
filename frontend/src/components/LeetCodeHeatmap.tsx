import React, { useMemo } from "react";

interface LeetCodeHeatmapProps {
  submissionCalendar: string; // JSON string from LeetCode API
  className?: string;
  weeksToShow?: number;
}

export default function LeetCodeHeatmap({
  submissionCalendar,
  className = "",
  weeksToShow = 26, // default to half a year to fit nicely
}: LeetCodeHeatmapProps) {
  const { grid, monthLabels } = useMemo(() => {
    // Parse the submission data
    let submissions = {};
    try {
      submissions = JSON.parse(submissionCalendar);
    } catch (e) {
      console.error("Failed to parse submission calendar");
    }

    // Convert UNIX timestamps (seconds) to start-of-day timestamps (milliseconds)
    const subMap = new Map<number, number>();
    Object.entries(submissions).forEach(([unixStr, count]) => {
      const date = new Date(parseInt(unixStr, 10) * 1000);
      date.setHours(0, 0, 0, 0);
      subMap.set(date.getTime(), count as number);
    });

    // Determine the end date (today) and start date
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);

    // Shift endDate to the most recent Saturday so weeks align properly
    const endDay = endDate.getDay();
    const daysToAdd = 6 - endDay;
    const gridEndDate = new Date(endDate);
    gridEndDate.setDate(gridEndDate.getDate() + daysToAdd);

    const startDate = new Date(gridEndDate);
    startDate.setDate(gridEndDate.getDate() - weeksToShow * 7 + 1);

    const gridLayout: { date: Date; count: number; inFuture: boolean }[][] =
      Array(7)
        .fill(null)
        .map(() => []);

    const months: { label: string; weekIndex: number }[] = [];
    let currentMonth = -1;

    let currDate = new Date(startDate);
    let weekIndex = 0;

    while (currDate <= gridEndDate) {
      const dayOfWeek = currDate.getDay();

      // Track month changes for labels
      if (currDate.getDate() === 1 || currentMonth === -1) {
        months.push({
          label: currDate.toLocaleString("default", { month: "short" }),
          weekIndex: weekIndex,
        });
        currentMonth = currDate.getMonth();
      }

      gridLayout[dayOfWeek].push({
        date: new Date(currDate),
        count: subMap.get(currDate.getTime()) || 0,
        inFuture: currDate > endDate,
      });

      if (dayOfWeek === 6) {
        weekIndex++;
      }

      currDate.setDate(currDate.getDate() + 1);
    }

    // Remove the first month label if it's too close to the second one to prevent overlapping
    if (months.length > 1 && months[1].weekIndex - months[0].weekIndex < 3) {
      months.shift();
    }

    return { grid: gridLayout, monthLabels: months };
  }, [submissionCalendar, weeksToShow]);

  const getColor = (count: number) => {
    if (count === 0) return "#f5f5f5"; // neutral-100
    if (count <= 2) return "#c7d2fe"; // indigo-200
    if (count <= 5) return "#818cf8"; // indigo-400
    if (count <= 9) return "#6366f1"; // indigo-500
    return "#4338ca"; // indigo-700
  };

  const cellSize = 10;
  const cellGap = 3;
  const labelHeight = 20;
  const labelWidth = 30;

  // Add 15px extra padding to the right so the last month label doesn't get cut off
  const totalWidth = labelWidth + weeksToShow * (cellSize + cellGap) + 15;
  const totalHeight = labelHeight + 7 * (cellSize + cellGap);

  return (
    <div className={`flex flex-col ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        width={totalWidth}
        height={totalHeight}
        className="text-[9px] font-sans text-neutral-400"
      >
        {/* Month Labels */}
        <g transform={`translate(${labelWidth}, 10)`}>
          {monthLabels.map((month, i) => (
            <text
              key={i}
              x={month.weekIndex * (cellSize + cellGap)}
              y={0}
              className="fill-current"
            >
              {month.label}
            </text>
          ))}
        </g>

        {/* Day Labels */}
        <g transform={`translate(0, ${labelHeight})`}>
          <text y={0 * (cellSize + cellGap) + 8} className="fill-current">
            Sun
          </text>
          <text y={1 * (cellSize + cellGap) + 8} className="fill-current">
            Mon
          </text>
          <text y={2 * (cellSize + cellGap) + 8} className="fill-current">
            Tue
          </text>
          <text y={3 * (cellSize + cellGap) + 8} className="fill-current">
            Wed
          </text>
          <text y={4 * (cellSize + cellGap) + 8} className="fill-current">
            Thu
          </text>
          <text y={5 * (cellSize + cellGap) + 8} className="fill-current">
            Fri
          </text>
          <text y={6 * (cellSize + cellGap) + 8} className="fill-current">
            Sat
          </text>
        </g>

        {/* Heatmap Grid */}
        <g transform={`translate(${labelWidth}, ${labelHeight})`}>
          {grid.map((weekRow, dayIndex) => (
            <g
              key={dayIndex}
              transform={`translate(0, ${dayIndex * (cellSize + cellGap)})`}
            >
              {weekRow.map((day, weekIndex) => (
                <rect
                  key={weekIndex}
                  x={weekIndex * (cellSize + cellGap)}
                  y={0}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  ry={2}
                  fill={day.inFuture ? "transparent" : getColor(day.count)}
                  className={
                    day.inFuture ? "" : "transition-colors duration-300"
                  }
                >
                  <title>
                    {day.inFuture
                      ? ""
                      : `${day.count} submissions on ${day.date.toDateString()}`}
                  </title>
                </rect>
              ))}
            </g>
          ))}
        </g>
      </svg>

      <div className="flex items-center justify-end gap-1 mt-3 text-[10px] text-neutral-500 font-medium">
        <span>Less</span>
        <div className="w-2.5 h-2.5 rounded-[2px] bg-[#f5f5f5]"></div>
        <div className="w-2.5 h-2.5 rounded-[2px] bg-[#c7d2fe]"></div>
        <div className="w-2.5 h-2.5 rounded-[2px] bg-[#818cf8]"></div>
        <div className="w-2.5 h-2.5 rounded-[2px] bg-[#6366f1]"></div>
        <div className="w-2.5 h-2.5 rounded-[2px] bg-[#4338ca]"></div>
        <span>More</span>
      </div>
    </div>
  );
}
