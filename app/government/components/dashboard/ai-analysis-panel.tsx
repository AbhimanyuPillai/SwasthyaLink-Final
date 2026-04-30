"use client"

import { useState } from "react"
import { Brain, AlertTriangle, TrendingUp, MapPin } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Checkbox } from "@/app/government/components/ui/checkbox"

const insights = [
  {
    icon: AlertTriangle,
    text: "Dengue-like symptoms are rising near Hadapsar. We recommend checking construction sites for standing water.",
    severity: "high" as const,
  },
  {
    icon: TrendingUp,
    text: "Respiratory issues have increased by 18% around Kothrud over the last 7 days.",
    severity: "medium" as const,
  },
  {
    icon: MapPin,
    text: "A new cluster of 12 fever cases detected near Hinjewadi Phase-2 worker housing within the last 48 hours.",
    severity: "high" as const,
  },
  {
    icon: TrendingUp,
    text: "Waterborne diseases are stable near Sassoon Hospital. Local water chlorination levels are normal.",
    severity: "positive" as const,
  },
]

const initialInterventions = [
  {
    id: "intervention-1",
    task: "Deploy mobile fever clinic to Hadapsar industrial area.",
    completed: false,
  },
  {
    id: "intervention-2",
    task: "Request available bed counts from Ruby Hall and Jehangir Hospital.",
    completed: false,
  },
  {
    id: "intervention-3",
    task: "Notify PCMC health officials for cross-city contact tracing.",
    completed: false,
  },
]

type AIAnalysisPanelProps = {
  lastUpdated?: Date
}

export function AIAnalysisPanel({ lastUpdated }: AIAnalysisPanelProps) {
  const [interventions, setInterventions] = useState(initialInterventions)

  const toggleIntervention = (id: string) => {
    setInterventions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const syncLabel = lastUpdated
    ? formatDistanceToNow(lastUpdated, { addSuffix: true })
    : "just now"

  return (
    <div className="bg-card rounded-[0.5rem] border border-border shadow-sm h-full min-h-[320px] flex flex-col">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="p-2 rounded-[0.5rem] bg-emerald/15">
          <Brain className="h-4 w-4 text-emerald" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-card-foreground">
            AI Outbreak Analysis
          </h2>
          <p className="text-[11px] text-muted-foreground truncate">Live AI Insights</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-5 overflow-auto">
        <div className="p-4 rounded-[0.5rem] bg-destructive/10 border border-destructive/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-card-foreground mb-1">
                Recent Outbreak Alert
              </h3>
              <p className="text-sm text-card-foreground/80 leading-relaxed">
                The AI model has detected a 31% rise in fever cases around Shivajinagar and Viman Nagar, which points to a potential seasonal Dengue outbreak combined with respiratory issues due to poor air quality.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Key insights
          </h3>
          <ul className="space-y-3">
            {insights.map((insight, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 rounded-[0.5rem] bg-muted/50"
              >
                <div
                  className={`p-1.5 rounded-[0.5rem] mt-0.5 shrink-0 ${
                    insight.severity === "high"
                      ? "bg-destructive/15 text-destructive"
                      : insight.severity === "positive"
                      ? "bg-emerald/15 text-emerald"
                      : "bg-saffron/15 text-saffron"
                  }`}
                >
                  <insight.icon className="h-3.5 w-3.5" />
                </div>
                <p className="text-sm text-card-foreground/80 leading-relaxed">
                  {insight.text}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Recommended actions
          </h3>
          <ul className="space-y-2">
            {interventions.map((intervention) => (
              <li
                key={intervention.id}
                className="flex items-center gap-3 p-3 rounded-[0.5rem] bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <Checkbox
                  id={intervention.id}
                  checked={intervention.completed}
                  onCheckedChange={() => toggleIntervention(intervention.id)}
                  className="border-emerald data-[state=checked]:bg-emerald data-[state=checked]:border-emerald"
                />
                <label
                  htmlFor={intervention.id}
                  className={`text-sm cursor-pointer flex-1 leading-snug ${
                    intervention.completed
                      ? "text-muted-foreground line-through"
                      : "text-card-foreground"
                  }`}
                >
                  {intervention.task}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Model refresh {syncLabel}
        </p>
      </div>
    </div>
  )
}
