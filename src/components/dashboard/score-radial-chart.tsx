"use client"

import { PolarGrid, RadialBar, RadialBarChart, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

interface ScoreRadialChartProps {
    score: number;
    label: string;
    color: string;
}

export function ScoreRadialChart({ score, label, color }: ScoreRadialChartProps) {
    const chartData = [{ name: label, value: score, fill: color }];
    
    const chartConfig = {
        score: {
            label: label,
        },
    } satisfies ChartConfig;

    if (score === 0) {
        return (
             <div className="flex flex-col h-full items-center justify-center rounded-lg border-2 border-dashed border-border text-center p-4">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">No data</p>
            </div>
        )
    }

    return (
        <ChartContainer
            config={chartConfig}
            className="relative flex h-full w-full flex-col items-center justify-center pb-0"
        >
            <RadialBarChart
                data={chartData}
                startAngle={-90}
                endAngle={270}
                innerRadius="70%"
                outerRadius="100%"
                barSize={10}
                cy="50%"
            >
                <Tooltip
                    cursor={{
                        fill: "transparent",
                    }}
                    content={
                        <ChartTooltipContent
                            hideLabel
                            hideIndicator
                            formatter={(value) => (
                                <div className="flex min-w-[6rem] items-center text-xs text-muted-foreground">
                                    {label}
                                    <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground">
                                        {value}
                                        <span className="font-normal text-muted-foreground">/100</span>
                                    </div>
                                </div>
                            )}
                        />
                    }
                />
                <PolarGrid gridType="circle" />
                <RadialBar dataKey="value" background={{ fill: "hsl(var(--muted))" }} cornerRadius={5} />
            </RadialBarChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-xl font-bold" style={{ color }}>{score}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
            </div>
        </ChartContainer>
    );
}

    