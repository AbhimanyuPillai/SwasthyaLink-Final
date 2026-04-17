"use client"

import { AlertTriangle, Clock, MapPin, Wind, Thermometer, Droplets } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const localHealthReport = {
  location: "Pune",
  lastUpdated: "08 Apr 2026, 10:30 AM",
  summary: `Current health conditions in Pune indicate moderate air quality with AQI at 142. The Maharashtra Health Department has issued a seasonal flu advisory as cases rose 15% in the past two weeks. Citizens are advised to maintain hand hygiene and wear masks in crowded areas. Dengue prevention measures should continue. No new COVID-19 cases reported in 7 days.`,
  metrics: [
    { label: "AQI", value: "142", status: "Moderate", icon: Wind },
    { label: "Temp", value: "32°C", status: "Normal", icon: Thermometer },
    { label: "Humidity", value: "65%", status: "High", icon: Droplets },
  ],
}

const communityUpdates = [
  {
    id: 1,
    title: "Free Health Camp at Shivajinagar PHC",
    excerpt: "Free check-ups including BP, sugar, and eye tests for senior citizens.",
    date: "10 Apr",
    category: "Health Camp",
    source: "PMC Health",
  },
  {
    id: 2,
    title: "Vaccination Drive for Children Under 5",
    excerpt: "Pulse Polio and routine immunization at all Anganwadi centers.",
    date: "12 Apr",
    category: "Vaccination",
    source: "District Health",
  },
  {
    id: 3,
    title: "Dengue Prevention Workshop",
    excerpt: "Community workshop on mosquito control at Hadapsar Hall.",
    date: "15 Apr",
    category: "Awareness",
    source: "PCMC",
  },
  {
    id: 4,
    title: "Blood Donation Camp at Ruby Hall",
    excerpt: "Emergency blood donation drive. All blood groups needed.",
    date: "18 Apr",
    category: "Blood Donation",
    source: "Red Cross",
  },
  {
    id: 5,
    title: "Mental Health Helpline Launched",
    excerpt: "New 24x7 mental health support helpline now available.",
    date: "05 Apr",
    category: "Mental Health",
    source: "State Health",
  },
]

export function LocalNews() {
  return (
    <div className="space-y-4">
      {/* Local Health Report */}
      <Card className="border-2 border-accent/40 bg-accent/5 shadow-sm">
        <CardHeader className="pb-2 pt-3 px-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-accent" />
              Health Report ({localHealthReport.location})
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{localHealthReport.location}</span>
            <span className="mx-0.5">|</span>
            <Clock className="h-3 w-3" />
            <span>{localHealthReport.lastUpdated}</span>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {/* Health Metrics */}
          <div className="flex gap-2 mb-3">
            {localHealthReport.metrics.map((metric) => (
              <div
                key={metric.label}
                className="flex-1 p-2 rounded-md bg-card border border-border text-center"
              >
                <metric.icon className="h-3.5 w-3.5 mx-auto text-primary mb-0.5" />
                <p className="text-sm font-bold text-foreground">{metric.value}</p>
                <p className="text-[10px] text-muted-foreground">{metric.label}</p>
              </div>
            ))}
          </div>

          {/* AI Generated Summary */}
          <div className="p-2.5 rounded-md bg-muted/50 border border-border">
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary text-primary-foreground mb-1.5">
              AI Report
            </span>
            <p className="text-[11px] text-foreground leading-relaxed">
              {localHealthReport.summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Community Updates */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2.5 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          Community Updates
        </h3>

        <div className="space-y-2">
          {communityUpdates.map((update) => (
            <Card
              key={update.id}
              className="border bg-card shadow-sm"
            >
              <CardContent className="p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    update.category === "Health Camp" 
                      ? "bg-secondary/20 text-secondary"
                      : update.category === "Vaccination"
                      ? "bg-primary/10 text-primary"
                      : update.category === "Awareness"
                      ? "bg-accent/20 text-accent-foreground"
                      : update.category === "Blood Donation"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {update.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {update.date}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-foreground mb-0.5 line-clamp-1">
                  {update.title}
                </h4>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mb-1">
                  {update.excerpt}
                </p>
                <p className="text-[10px] font-medium text-foreground/70">{update.source}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
