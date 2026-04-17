"use client"

import { useState } from "react"
import { Sidebar } from "@/app/government/components/dashboard/sidebar"
import { ContentCard } from "@/app/government/components/dashboard/content-card"
import { MetricCard } from "@/app/government/components/dashboard/metric-card"
import { Button } from "@/app/government/components/ui/button"
import { Badge } from "@/app/government/components/ui/badge"
import { Checkbox } from "@/app/government/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/government/components/ui/tabs"
import { Progress } from "@/app/government/components/ui/progress"
import { Textarea } from "@/app/government/components/ui/textarea"
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Zap,
  Target,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  Sparkles,
  Activity,
  Users,
  FileText,
  Bell,
  Calendar,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/app/government/lib/utils"

const predictions = [
  {
    id: "pred-1",
    title: "Dengue Outbreak Surge - Kothrud",
    probability: 87,
    timeframe: "Next 14 days",
    severity: "high",
    description: "Based on rainfall patterns, mosquito breeding indices, and current case trajectory, a 40-60% increase in dengue cases is predicted.",
    factors: ["Heavy rainfall last week", "High Breteau Index (>50)", "Temperature 25-30°C optimal range"],
    recommended: ["Pre-position medical supplies", "Intensify vector control", "Public awareness campaign"],
  },
  {
    id: "pred-2",
    title: "Respiratory Illness Cluster - Industrial Zone",
    probability: 72,
    timeframe: "Next 7 days",
    severity: "medium",
    description: "Air quality deterioration combined with seasonal patterns suggest increased respiratory admissions.",
    factors: ["AQI >200 for 5 consecutive days", "Winter onset", "Previous year patterns"],
    recommended: ["Alert pulmonology departments", "Stock bronchodilators", "Issue health advisory"],
  },
  {
    id: "pred-3",
    title: "Waterborne Disease Risk - Hadapsar",
    probability: 65,
    timeframe: "Next 21 days",
    severity: "medium",
    description: "Recent infrastructure issues and water quality reports indicate elevated risk of cholera/typhoid cases.",
    factors: ["Water main repairs ongoing", "Contamination detected in samples", "Crowded locality"],
    recommended: ["Water quality monitoring", "ORS distribution", "Sanitation inspection"],
  },
]

const interventionTasks = [
  { id: "int-1", task: "Deploy mobile testing units to Kothrud", priority: "critical", status: "pending", assignedTo: "Field Team A", dueDate: "2026-04-12" },
  { id: "int-2", task: "Alert local hospitals for bed capacity", priority: "critical", status: "in-progress", assignedTo: "Hospital Coordinator", dueDate: "2026-04-11" },
  { id: "int-3", task: "Initiate contact tracing in affected zones", priority: "high", status: "completed", assignedTo: "Surveillance Team", dueDate: "2026-04-10" },
  { id: "int-4", task: "Stock emergency medical supplies", priority: "high", status: "pending", assignedTo: "Logistics", dueDate: "2026-04-13" },
  { id: "int-5", task: "Coordinate with municipal water department", priority: "medium", status: "in-progress", assignedTo: "Public Health", dueDate: "2026-04-14" },
  { id: "int-6", task: "Deploy fumigation teams to hotspots", priority: "high", status: "pending", assignedTo: "Vector Control", dueDate: "2026-04-12" },
]

const aiInsights = [
  { icon: AlertTriangle, text: "47% spike in respiratory cases in Kothrud-Shivajinagar corridor over 72 hours", severity: "high", time: "2 hours ago" },
  { icon: TrendingUp, text: "Dengue transmission rate (R0) increased to 2.3 from baseline 1.4", severity: "high", time: "4 hours ago" },
  { icon: MapPin, text: "New cluster identified: 23 cases within 500m radius of Hadapsar industrial area", severity: "medium", time: "6 hours ago" },
  { icon: TrendingDown, text: "Malaria cases showing 15% week-over-week decline in treated zones", severity: "positive", time: "8 hours ago" },
  { icon: Shield, text: "Vaccination coverage reached 78% in priority districts - exceeds target", severity: "positive", time: "12 hours ago" },
]

function getPriorityColor(priority: string) {
  switch (priority) {
    case "critical": return "bg-red-100 text-red-700 border-red-200"
    case "high": return "bg-amber-100 text-amber-700 border-amber-200"
    case "medium": return "bg-sky-100 text-sky-700 border-sky-200"
    default: return "bg-slate-100 text-slate-700 border-slate-200"
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed": return <CheckCircle2 className="h-4 w-4 text-emerald" />
    case "in-progress": return <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
    default: return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

export default function AIIntelligencePage() {
  const [taskList, setTaskList] = useState(interventionTasks)
  const [queryText, setQueryText] = useState("")

  const toggleTask = (id: string) => {
    setTaskList(prev =>
      prev.map(t => t.id === id ? { ...t, status: t.status === "completed" ? "pending" : "completed" } : t)
    )
  }

  const completedTasks = taskList.filter(t => t.status === "completed").length
  const totalTasks = taskList.length

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[0.5rem] bg-gradient-to-br from-saffron/20 to-emerald/20">
                <Brain className="h-5 w-5 text-emerald" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">AI Intelligence Center</h1>
                <p className="text-sm text-muted-foreground">Predictive analytics and automated response recommendations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-emerald/10 text-emerald border-emerald/30">
                <Sparkles className="h-3 w-3 mr-1.5" />
                AI Models Active
              </Badge>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1.5" />
                Updated 5m ago
              </Badge>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {/* Top Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <MetricCard title="Predictions Generated" value="24" icon={Brain} trend="up" accentColor="saffron" />
            <MetricCard title="High Risk Alerts" value="3" icon={AlertTriangle} trend="up" accentColor="emerald" />
            <MetricCard title="Actions Recommended" value="12" icon={Target} trend="neutral" accentColor="saffron" />
            <MetricCard title="Model Accuracy" value="94%" icon={Zap} trend="up" accentColor="emerald" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Content - 2 columns */}
            <div className="xl:col-span-2 space-y-6">
              <Tabs defaultValue="predictions">
                <TabsList className="mb-4">
                  <TabsTrigger value="predictions" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Outbreak Predictions
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Intervention Tasks
                  </TabsTrigger>
                  <TabsTrigger value="query" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Query
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="predictions" className="space-y-4">
                  {predictions.map(pred => (
                    <ContentCard key={pred.id} title="" accentColor={pred.severity === "high" ? "saffron" : "emerald"}>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-foreground">{pred.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{pred.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className={cn(
                              "text-2xl font-bold",
                              pred.probability >= 80 ? "text-red-600" : pred.probability >= 60 ? "text-amber-600" : "text-emerald"
                            )}>
                              {pred.probability}%
                            </div>
                            <p className="text-xs text-muted-foreground">probability</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="outline" className={pred.severity === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>
                            {pred.severity.toUpperCase()} RISK
                          </Badge>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {pred.timeframe}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Contributing Factors</h4>
                            <ul className="space-y-1">
                              {pred.factors.map((factor, i) => (
                                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                  {factor}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Recommended Actions</h4>
                            <ul className="space-y-1">
                              {pred.recommended.map((action, i) => (
                                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                  <Target className="h-4 w-4 text-emerald shrink-0 mt-0.5" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                          <Button size="sm" className="bg-emerald hover:bg-emerald/90 text-white">
                            Accept Recommendations
                          </Button>
                          <Button size="sm" variant="outline">View Full Analysis</Button>
                          <Button size="sm" variant="outline">Dismiss</Button>
                        </div>
                      </div>
                    </ContentCard>
                  ))}
                </TabsContent>

                <TabsContent value="tasks">
                  <ContentCard title="Active Intervention Tasks" accentColor="emerald">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {completedTasks} of {totalTasks} tasks completed
                        </span>
                        <Progress value={(completedTasks / totalTasks) * 100} className="w-32 h-2" />
                      </div>
                      <Button size="sm" variant="outline">
                        <Bell className="h-4 w-4 mr-2" />
                        Send Reminders
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {taskList.map(task => (
                        <div
                          key={task.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-[0.5rem] border transition-colors",
                            task.status === "completed" ? "bg-muted/30 border-border" : "bg-card border-border hover:bg-muted/20"
                          )}
                        >
                          <Checkbox
                            checked={task.status === "completed"}
                            onCheckedChange={() => toggleTask(task.id)}
                            className="border-emerald data-[state=checked]:bg-emerald data-[state=checked]:border-emerald"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium",
                              task.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"
                            )}>
                              {task.task}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {task.assignedTo}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {task.dueDate}
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline" className={cn("text-xs shrink-0", getPriorityColor(task.priority))}>
                            {task.priority}
                          </Badge>
                          {getStatusIcon(task.status)}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <Button size="sm" className="w-full">
                        <Target className="h-4 w-4 mr-2" />
                        Add New Intervention Task
                      </Button>
                    </div>
                  </ContentCard>
                </TabsContent>

                <TabsContent value="query">
                  <ContentCard title="AI Health Intelligence Query" accentColor="saffron">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Ask questions about outbreak patterns, predictions, or get recommendations for specific scenarios.
                      </p>
                      <div className="relative">
                        <Textarea
                          placeholder="E.g., What is the predicted trajectory of dengue cases in Pune over the next month? What interventions would be most effective?"
                          value={queryText}
                          onChange={(e) => setQueryText(e.target.value)}
                          className="min-h-[120px] pr-12"
                        />
                        <Button size="sm" className="absolute bottom-3 right-3 bg-saffron hover:bg-saffron/90 text-foreground">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => setQueryText("Predict dengue spread in next 2 weeks")}>
                          Dengue forecast
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setQueryText("Recommend resource allocation for outbreak response")}>
                          Resource planning
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setQueryText("Identify high-risk zones for waterborne diseases")}>
                          Risk zones
                        </Button>
                      </div>

                      <div className="mt-6 p-4 rounded-[0.5rem] bg-muted/50 border border-border">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-saffron" />
                          <span className="text-sm font-medium text-foreground">Sample AI Response</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Based on current epidemiological data and environmental factors, the dengue transmission rate in Pune is expected to peak around April 20-25, with an estimated 35-50% increase in daily cases. Key recommendations include deploying additional vector control teams to Kothrud and Hadapsar, pre-positioning 500+ hospital beds, and initiating community awareness programs in high-density residential areas.
                        </p>
                      </div>
                    </div>
                  </ContentCard>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Real-time Insights */}
              <ContentCard title="Real-time AI Insights" accentColor="emerald">
                <div className="space-y-3">
                  {aiInsights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-[0.5rem] bg-muted/50">
                      <div className={cn(
                        "p-1.5 rounded-[0.5rem] shrink-0",
                        insight.severity === "high" ? "bg-red-100 text-red-600" :
                        insight.severity === "positive" ? "bg-emerald/20 text-emerald" :
                        "bg-amber-100 text-amber-600"
                      )}>
                        <insight.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">{insight.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ContentCard>

              {/* Model Performance */}
              <ContentCard title="AI Model Status" accentColor="saffron">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-foreground">Outbreak Prediction</span>
                      <span className="text-emerald font-medium">94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-foreground">Severity Classification</span>
                      <span className="text-emerald font-medium">91%</span>
                    </div>
                    <Progress value={91} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-foreground">Geographic Clustering</span>
                      <span className="text-amber-600 font-medium">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-foreground">Resource Optimization</span>
                      <span className="text-emerald font-medium">89%</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <Button size="sm" variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    View Model Reports
                  </Button>
                </div>
              </ContentCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
