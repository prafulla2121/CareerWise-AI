
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
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
    if (['javascript', 'python', 'java', 'c#', 'c++', 'typescript', 'php', 'swift', 'go', 'ruby', 'kotlin'].includes(lowerSkill)) return 'Languages';
    if (['react', 'angular', 'vue.js', 'next.js', 'node.js', 'express', 'django', 'flask', 'asp.net', 'html', 'css'].includes(lowerSkill)) return 'Web Dev';
    if (['ios', 'android', 'react native', 'flutter'].includes(lowerSkill)) return 'Mobile Dev';
    if (['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase'].includes(lowerSkill)) return 'Databases';
    if (['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd'].includes(lowerSkill)) return 'DevOps';
    if (['machine learning', 'data analysis', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch'].includes(lowerSkill)) return 'Data Science';
    if (['project management', 'agile', 'scrum', 'leadership', 'communication'].includes(lowerSkill)) return 'Soft Skills';
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
    }));

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
            allowDecimals={false}
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
