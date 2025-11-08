"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

interface PersonalityChartProps {
    scores: {
        openness: number,
        conscientiousness: number,
        extraversion: number,
        agreeableness: number,
        neuroticism: number,
    }
}

const chartConfig = {
    score: {
        label: "Score",
        color: "hsl(var(--primary))",
    }
} satisfies ChartConfig

export function PersonalityChart({ scores }: PersonalityChartProps) {
    const chartData = [
        { trait: "Openness", score: scores.openness },
        { trait: "Consc.", score: scores.conscientiousness },
        { trait: "Extraver.", score: scores.extraversion },
        { trait: "Agreeable.", score: scores.agreeableness },
        { trait: "Neurotic.", score: scores.neuroticism },
    ]

     if (Object.values(scores).every(score => score === 0 || isNaN(score))) {
        return (
            <div className="flex h-[250px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
                <p className="text-muted-foreground">No personality data.</p>
                <p className="text-sm text-muted-foreground">Complete the assessment.</p>
            </div>
        )
    }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <ResponsiveContainer>
            <RadarChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                 <ChartTooltip
                    cursor={{fill: "hsla(var(--primary), 0.1)"}}
                    content={<ChartTooltipContent hideIndicator />}
                />
                <PolarGrid />
                <PolarAngleAxis dataKey="trait" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Radar
                    name="Personality"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                />
            </RadarChart>
        </ResponsiveContainer>
    </ChartContainer>
  )
}
