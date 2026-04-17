'use client';
import dynamic from "next/dynamic"
import { Sidebar } from "@/app/government/components/dashboard/sidebar"
import { MetricCard } from "@/app/government/components/dashboard/metric-card"
import { ContentCard } from "@/app/government/components/dashboard/content-card"
import { AIAnalysisPanel } from "@/app/government/components/dashboard/ai-analysis-panel"
import { EpidemiologicalDataGrid } from "@/app/government/components/dashboard/epidemiological-data-grid"
import { AlertTriangle, MapPin, Activity, Users } from "lucide-react"

const RegionalHeatmap = dynamic(
  () => import("./components/dashboard/regional-heatmap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground bg-muted/10 rounded-lg">
        Loading map surveillance…
      </div>
    ),
  }
)

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Center Content */}
        <main className="flex-1 p-4 lg:p-6 space-y-6 overflow-auto">
          {/* Top Row: Metric Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
              title="Active Outbreaks"
              value="12"
              icon={AlertTriangle}
              trend="up"
              accentColor="saffron"
            />
            <MetricCard
              title="Critical Zones"
              value="5"
              icon={MapPin}
              trend="up"
              accentColor="emerald"
            />
            <MetricCard
              title="Cases Today"
              value="1,847"
              icon={Activity}
              trend="down"
              accentColor="saffron"
            />
            <MetricCard
              title="Population at Risk"
              value="2.3M"
              icon={Users}
              trend="neutral"
              accentColor="emerald"
            />
          </section>

          {/* Main Content: Two Large Cards */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
            <ContentCard
              title="Regional Disease Heatmap"
              className="min-h-[350px] lg:min-h-[400px]"
              accentColor="saffron"
            >
              <RegionalHeatmap />
            </ContentCard>

            <ContentCard
              title="Epidemiological Data Grid"
              className="min-h-[350px] lg:min-h-[400px]"
              accentColor="emerald"
            >
              <EpidemiologicalDataGrid />
            </ContentCard>
          </section>
        </main>

        {/* Right Panel */}
        <aside className="w-full lg:w-80 xl:w-96 p-4 lg:p-6 lg:pl-0">
          <AIAnalysisPanel />
        </aside>
      </div>
    </div>
  )
}
