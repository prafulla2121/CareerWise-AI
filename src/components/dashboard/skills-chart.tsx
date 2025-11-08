
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface SkillsChartProps {
  skills: string[];
}

const chartConfig = {
  count: {
    label: "Skill Count",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

// A simple categorization function - this can be expanded
const categorizeSkill = (skill: string): string => {
    const lowerSkill = skill.toLowerCase().trim();
    if (['javascript', 'python', 'java', 'c#', 'c++', 'typescript', 'php', 'swift', 'go', 'ruby', 'kotlin', 'html', 'css'].includes(lowerSkill)) return 'Languages';
    if (['react', 'angular', 'vue.js', 'next.js', 'node.js', 'express', 'django', 'flask', 'asp.net', 'spring boot'].includes(lowerSkill)) return 'Frameworks';
    if (['ios', 'android', 'react native', 'flutter'].includes(lowerSkill)) return 'Mobile';
    if (['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase'].includes(lowerSkill)) return 'Databases';
    if (['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd'].includes(lowerSkill)) return 'DevOps/Cloud';
    if (['machine learning', 'data analysis', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch'].includes(lowerSkill)) return 'Data Science';
    if (['project management', 'agile', 'scrum', 'leadership', 'communication', 'teamwork'].includes(lowerSkill)) return 'Management';
    return 'Other';
};

export function SkillsChart({ skills }: SkillsChartProps) {
    const skillCounts = skills.reduce((acc, skill) => {
        const category = categorizeSkill(skill);
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(skillCounts).map(([name, count]) => ({
        category: name,
        count: count,
    })).sort((a, b) => b.count - a.count);

    if (skills.length === 0) {
        return (
            <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
                <p className="text-muted-foreground">No skills data available.</p>
                <p className="text-sm text-muted-foreground">Analyze your resume to see your skills distribution.</p>
            </div>
        )
    }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer>
        <BarChart accessibilityLayer data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
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
            allowDecimals={false}
            width={20}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--accent))", radius: "4px" }}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
