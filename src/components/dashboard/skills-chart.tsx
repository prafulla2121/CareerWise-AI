"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface SkillsChartProps {
  skills: string[];
}

const chartConfig = {
  count: {
    label: "Count",
  },
} satisfies ChartConfig;

export function SkillsChart({ skills }: SkillsChartProps) {
    const chartData = skills.map(skill => ({ skill, count: 1 }));

    if (skills.length === 0) {
        return (
            <div className="flex h-[350px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
                <p className="text-muted-foreground">No skills data available.</p>
                <p className="text-sm text-muted-foreground">Analyze your resume to see your skills distribution.</p>
            </div>
        )
    }

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer>
        <BarChart layout="vertical" accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
          <YAxis
            dataKey="skill"
            type="category"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <XAxis
            type="number"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            hide={true}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--accent))", radius: "4px" }}
            content={<ChartTooltipContent hideLabel indicator="dot" />}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
