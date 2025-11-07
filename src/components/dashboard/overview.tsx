"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { category: "Aptitude", score: 85, fill: "var(--color-aptitude)" },
  { category: "Personality", score: 72, fill: "var(--color-personality)" },
  { category: "Interests", score: 91, fill: "var(--color-interests)" },
]

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
    color: "hsl(var(--secondary))",
  },
} satisfies ChartConfig

export function Overview() {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
        <ResponsiveContainer>
            <BarChart accessibilityLayer data={chartData}>
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
                />
                <Tooltip
                    cursor={{ fill: "hsl(var(--accent))", radius: "4px" }}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
            </BarChart>
        </ResponsiveContainer>
    </ChartContainer>
  )
}
