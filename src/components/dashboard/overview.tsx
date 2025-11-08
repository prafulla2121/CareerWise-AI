// This file is no longer used and can be removed.
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

interface OverviewProps {
  scores: {
    aptitude: number;
    personality: number;
    interests: number;
  };
}

const chartConfig = {
  aptitude: {
    label: "Aptitude",
    color: "hsl(var(--chart-1))",
  },
  personality: {
    label: "Personality",
    color: "hsl(var(--chart-2))",
  },
  interests: {
    label: "Interests",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function Overview({ scores }: OverviewProps) {
    const chartData = [
        { category: "Scores", aptitude: scores.aptitude, personality: scores.personality, interests: scores.interests },
    ];

    if (scores.aptitude === 0 && scores.personality === 0 && scores.interests === 0) {
        return (
            <div className="flex h-[250px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
                <p className="text-muted-foreground">No test data available.</p>
                <p className="text-sm text-muted-foreground">Complete the career assessment.</p>
            </div>
        )
    }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer>
        <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10 }}>
          <YAxis
            dataKey="category"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
            hide
          />
          <XAxis dataKey="interests" type="number" domain={[0, 100]} hide />
          <Tooltip
            cursor={{ fill: "hsl(var(--accent))", radius: "4px" }}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Legend content={<ChartLegendContent />} />
          <Bar dataKey="aptitude" stackId="a" fill="var(--color-aptitude)" radius={[4, 0, 0, 4]} />
          <Bar dataKey="personality" stackId="a" fill="var(--color-personality)" />
          <Bar dataKey="interests" stackId="a" fill="var(--color-interests)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

    