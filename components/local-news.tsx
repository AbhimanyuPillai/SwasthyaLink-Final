"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Clock, MapPin, Wind, Thermometer, Droplets, Loader2, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface NewsItem {
  guid: string
  title: string
  pubDate: string
  link: string
  source: string
}

export function LocalNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [healthData, setHealthData] = useState({
    location: "Pune",
    lastUpdated: "--",
    summary: "Fetching current health conditions...",
    metrics: [
      { label: "AQI", value: "--", status: "Loading", icon: Wind, colorClass: "bg-card border-border" },
      { label: "Temp", value: "--", status: "Loading", icon: Thermometer, colorClass: "bg-card border-border" },
      { label: "Humidity", value: "--", status: "Loading", icon: Droplets, colorClass: "bg-card border-border" },
    ],
  })

  useEffect(() => {
    async function fetchHealthData() {
      try {
        const [weatherRes, aqiRes] = await Promise.all([
          fetch("https://api.open-meteo.com/v1/forecast?latitude=18.5204&longitude=73.8567&current=temperature_2m,relative_humidity_2m"),
          fetch("https://air-quality-api.open-meteo.com/v1/air-quality?latitude=18.5204&longitude=73.8567&current=us_aqi")
        ])
        
        const weatherData = await weatherRes.json()
        const aqiData = await aqiRes.json()

        const temp = Math.round(weatherData.current.temperature_2m)
        const humidity = Math.round(weatherData.current.relative_humidity_2m)
        const aqi = Math.round(aqiData.current.us_aqi)

        const getAqiColor = (val: number) => val <= 50 ? "bg-green-500/20 border-green-500/50" : val <= 100 ? "bg-yellow-500/20 border-yellow-500/50" : "bg-red-500/20 border-red-500/50"
        const getTempColor = (val: number) => val <= 30 ? "bg-green-500/20 border-green-500/50" : val <= 35 ? "bg-yellow-500/20 border-yellow-500/50" : "bg-red-500/20 border-red-500/50"
        const getHumidityColor = (val: number) => val <= 50 ? "bg-green-500/20 border-green-500/50" : val <= 70 ? "bg-yellow-500/20 border-yellow-500/50" : "bg-red-500/20 border-red-500/50"

        const now = new Date()
        const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

        setHealthData({
          location: "Pune",
          lastUpdated: `${dateStr}, ${timeStr}`,
          summary: `Current health conditions in Pune indicate an AQI of ${aqi}. The temperature is ${temp}°C with ${humidity}% humidity. Please take necessary precautions based on these realtime metrics.`,
          metrics: [
            { label: "AQI", value: aqi.toString(), status: aqi <= 50 ? "Good" : aqi <= 100 ? "Moderate" : "Poor", icon: Wind, colorClass: getAqiColor(aqi) },
            { label: "Temp", value: `${temp}°C`, status: temp <= 30 ? "Normal" : temp <= 35 ? "Warm" : "Hot", icon: Thermometer, colorClass: getTempColor(temp) },
            { label: "Humidity", value: `${humidity}%`, status: humidity <= 50 ? "Normal" : humidity <= 70 ? "Moderate" : "High", icon: Droplets, colorClass: getHumidityColor(humidity) },
          ]
        })
      } catch (error) {
        console.error("Failed to fetch health data:", error)
      }
    }

    async function fetchNews() {
      try {
        const url = "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3DPune%2Bhealth%2Bmedical%26hl%3Den-IN%26gl%3DIN%26ceid%3DIN%3Aen"
        const res = await fetch(url)
        const data = await res.json()
        
        if (data.status === "ok" && data.items) {
          const formattedNews = data.items.slice(0, 5).map((item: any) => {
            // Google News appends the source to the end of the title like " - Source Name"
            const titleParts = item.title.split(" - ")
            const source = titleParts.length > 1 ? titleParts.pop() : "Google News"
            const cleanTitle = titleParts.join(" - ")
            
            // Format date string
            const dateObj = new Date(item.pubDate)
            const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })

            return {
              guid: item.guid || item.link,
              title: cleanTitle,
              pubDate: dateStr,
              link: item.link,
              source: source,
            }
          })
          setNews(formattedNews)
        }
      } catch (error) {
        console.error("Failed to fetch local news:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHealthData()
    fetchNews()
  }, [])

  return (
    <div className="space-y-4">
      {/* Local Health Report */}
      <Card className="border-2 border-accent/40 bg-accent/5 shadow-sm">
        <CardHeader className="pb-2 pt-3 px-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-accent" />
              Health Report ({healthData.location})
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{healthData.location}</span>
            <span className="mx-0.5">|</span>
            <Clock className="h-3 w-3" />
            <span>{healthData.lastUpdated}</span>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {/* Health Metrics */}
          <div className="flex gap-2 mb-3">
            {healthData.metrics.map((metric) => (
              <div
                key={metric.label}
                className={`flex-1 p-2 rounded-md border text-center transition-colors ${metric.colorClass}`}
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
              {healthData.summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Community Updates */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2.5 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          Community Updates & News
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary/50" />
            <p className="text-xs">Fetching latest local health news...</p>
          </div>
        ) : news.length > 0 ? (
          <div className="space-y-2">
            {news.map((update) => (
              <a 
                key={update.guid} 
                href={update.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block outline-none"
              >
                <Card className="border bg-card shadow-sm hover:border-primary/40 hover:shadow-md transition-all group">
                  <CardContent className="p-2.5 relative">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                        Health News
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {update.pubDate}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors pr-4">
                      {update.title}
                    </h4>
                    <p className="text-[10px] font-medium text-foreground/70 flex items-center gap-1">
                      {update.source}
                    </p>
                    <ExternalLink className="h-3 w-3 absolute bottom-2.5 right-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center border rounded-lg bg-muted/20">
            <p className="text-xs text-muted-foreground">No recent health updates found for this region.</p>
          </div>
        )}
      </div>
    </div>
  )
}
