'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface OverviewProps {
  scores: {
    aptitude: number;
    personality: number;
    interests: number;
  };
}

const chartConfig = {
  score: {
    label: "Score",
  },
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
        { category: "Aptitude", score: scores.aptitude, fill: "var(--color-aptitude)" },
        { category: "Personality", score: scores.personality, fill: "var(--color-personality)" },
        { category: "Interests", score: scores.interests, fill: "var(--color-interests)" },
    ];

    if (scores.aptitude === 0 && scores.personality === 0 && scores.interests === 0) {
        return (
            <div className="flex h-[350px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
                <p className="text-muted-foreground">No test data available.</p>
                <p className="text-sm text-muted-foreground">Complete the career assessment to see your analytics.</p>
            </div>
        )
    }

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer>
        <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <XAxis
            dataKey="category"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            domain={[0, 100]}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--accent))", radius: "4px" }}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}