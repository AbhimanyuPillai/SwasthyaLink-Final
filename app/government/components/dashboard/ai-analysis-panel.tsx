"use client"

import { useState } from "react"
import { Brain, AlertTriangle, TrendingUp, MapPin } from "lucide-react"
import { Checkbox } from "@/app/government/components/ui/checkbox"

const insights = [
  {
    icon: AlertTriangle,
    text: "Unusual spike detected in District 7 respiratory cases",
    severity: "high",
  },
  {
    icon: TrendingUp,
    text: "Dengue cases trending 23% above seasonal average",
    severity: "medium",
  },
  {
    icon: MapPin,
    text: "New cluster identified near industrial zone",
    severity: "high",
  },
  {
    icon: TrendingUp,
    text: "Vaccination coverage improved by 8% this week",
    severity: "positive",
  },
]

const initialInterventions = [
  {
    id: "intervention-1",
    task: "Deploy mobile testing units to Kothrud",
    completed: false,
  },
  {
    id: "intervention-2",
    task: "Alert local hospitals for bed capacity",
    completed: false,
  },
  {
    id: "intervention-3",
    task: "Initiate contact tracing in affected zones",
    completed: false,
  },
]

export function AIAnalysisPanel() {
  const [interventions, setInterventions] = useState(initialInterventions)

  const toggleIntervention = (id: string) => {
    setInterventions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  return (
    <div className="bg-card rounded-[0.5rem] border border-border shadow-sm h-full flex flex-col">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="p-2 rounded-[0.5rem] bg-emerald/15">
          <Brain className="h-4 w-4 text-emerald" />
        </div>
        <h2 className="text-sm font-semibold text-card-foreground">
          AI Outbreak Analysis
        </h2>
      </div>

      <div className="flex-1 p-4 space-y-5 overflow-auto">
        {/* Summary Section */}
        <div className="p-4 rounded-[0.5rem] bg-destructive/10 border border-destructive/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-card-foreground mb-1">
                Recent Spike Alert
              </h3>
              <p className="text-sm text-card-foreground/80 leading-relaxed">
                A 47% increase in respiratory illness cases has been detected in the Kothrud and Shivajinagar areas over the past 72 hours. Pattern analysis suggests possible viral outbreak requiring immediate intervention.
              </p>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Key Insights
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

        {/* Intervention Tasks */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Recommended Actions
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
                  className={`text-sm cursor-pointer flex-1 ${
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
          Last updated: 2 minutes ago
        </p>
      </div>
    </div>
  )
}
