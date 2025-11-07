"use client"

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { type ChartConfig } from "@/components/ui/chart"

interface AtsScoreChartProps {
    score: number;
}

export function AtsScoreChart({ score }: AtsScoreChartProps) {
    const data = [
        { name: 'Score', value: score, fill: 'hsl(var(--primary))' },
        { name: 'Remaining', value: 100 - score, fill: 'hsl(var(--muted))' },
    ];

    const chartConfig = {
        score: {
            label: "ATS Score",
        },
    } satisfies ChartConfig;

    return (
        <div className="relative h-24 w-full">
            <ChartContainer
                config={chartConfig}
                className="absolute inset-0"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Tooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel hideIndicator />}
                        />
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="70%"
                            outerRadius="100%"
                            startAngle={90}
                            endAngle={450}
                            strokeWidth={0}
                        >
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{score}</span>
                <span className="text-xs text-muted-foreground">out of 100</span>
            </div>
        </div>
    );
}
