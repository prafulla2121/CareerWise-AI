"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
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
        { trait: "Conscientiousness", score: scores.conscientiousness },
        { trait: "Extraversion", score: scores.extraversion },
        { trait: "Agreeableness", score: scores.agreeableness },
        { trait: "Neuroticism", score: scores.neuroticism },
    ]

     if (Object.values(scores).every(score => score === 0)) {
        return (
            <div className="flex h-[350px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
                <p className="text-muted-foreground">No personality data available.</p>
                <p className="text-sm text-muted-foreground">Complete the career assessment to see your traits.</p>
            </div>
        )
    }

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
        <ResponsiveContainer>
            <RadarChart data={chartData}>
                 <ChartTooltip
                    cursor={{fill: "hsla(var(--primary), 0.1)"}}
                    content={<ChartTooltipContent />}
                />
                <PolarGrid />
                <PolarAngleAxis dataKey="trait" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
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
