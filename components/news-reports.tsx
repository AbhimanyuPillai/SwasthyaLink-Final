"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Newspaper, Calendar, MapPin, ExternalLink, Search, AlertTriangle, HeartPulse, Syringe, TrendingUp } from "lucide-react"

interface NewsReportsProps {
  onBack: () => void
}

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  date: string
  location: string
  category: "alert" | "health" | "vaccination" | "general"
  url: string
}

const mockNews: NewsItem[] = [
  {
    id: "news-001",
    title: "Dengue Cases on the Rise in Mumbai Metropolitan Region",
    summary: "Health authorities report a 30% increase in dengue cases this monsoon season. Residents are advised to take preventive measures and eliminate standing water sources.",
    source: "Maharashtra Health Department",
    date: "2024-03-15",
    location: "Mumbai, Maharashtra",
    category: "alert",
    url: "#",
  },
  {
    id: "news-002",
    title: "Free Health Camp Organized at Community Center",
    summary: "A free health checkup camp will be organized next week offering blood pressure screening, diabetes testing, and general health consultations for senior citizens.",
    source: "Municipal Corporation",
    date: "2024-03-14",
    location: "Andheri, Mumbai",
    category: "health",
    url: "#",
  },
  {
    id: "news-003",
    title: "COVID-19 Booster Vaccination Drive Extended",
    summary: "The government has extended the free booster dose vaccination program until the end of the month. All adults are eligible for the updated vaccine at government hospitals.",
    source: "Ministry of Health",
    date: "2024-03-13",
    location: "Pan India",
    category: "vaccination",
    url: "#",
  },
  {
    id: "news-004",
    title: "New Telemedicine Guidelines Released for Remote Consultations",
    summary: "The Medical Council has issued updated guidelines for telemedicine practice, allowing doctors to prescribe a wider range of medications through video consultations.",
    source: "Medical Council of India",
    date: "2024-03-12",
    location: "National",
    category: "general",
    url: "#",
  },
  {
    id: "news-005",
    title: "Air Quality Index Reaches Hazardous Levels - Health Advisory Issued",
    summary: "Due to poor air quality, residents with respiratory conditions are advised to stay indoors. N95 masks are recommended for outdoor activities.",
    source: "Pollution Control Board",
    date: "2024-03-11",
    location: "Delhi NCR",
    category: "alert",
    url: "#",
  },
  {
    id: "news-006",
    title: "Free Eye Checkup Camp for School Children",
    summary: "Vision screening program for government school students will be conducted throughout the district. Free spectacles will be provided to children with refractive errors.",
    source: "District Health Office",
    date: "2024-03-10",
    location: "Pune, Maharashtra",
    category: "health",
    url: "#",
  },
]

const categoryConfig = {
  alert: { 
    icon: AlertTriangle, 
    color: "bg-destructive text-destructive-foreground", 
    label: "Health Alert",
    cardBorder: "border-l-4 border-l-destructive"
  },
  health: { 
    icon: HeartPulse, 
    color: "bg-secondary text-secondary-foreground", 
    label: "Health News",
    cardBorder: "border-l-4 border-l-secondary"
  },
  vaccination: { 
    icon: Syringe, 
    color: "bg-primary text-primary-foreground", 
    label: "Vaccination",
    cardBorder: "border-l-4 border-l-primary"
  },
  general: { 
    icon: Newspaper, 
    color: "bg-accent text-accent-foreground", 
    label: "General",
    cardBorder: "border-l-4 border-l-accent"
  },
}

export function NewsReports({ onBack }: NewsReportsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredNews = mockNews.filter((news) => {
    const matchesSearch =
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || news.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["alert", "health", "vaccination", "general"] as const

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="border-border/50 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-accent to-accent/80 p-6 lg:p-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent-foreground/20 flex items-center justify-center">
              <Newspaper className="w-7 h-7 text-accent-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl lg:text-2xl text-accent-foreground mb-1">
                Healthcare News
              </CardTitle>
              <p className="text-accent-foreground/80 text-sm lg:text-base">
                Local healthcare updates and health alerts
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-4 lg:p-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search news by title, content, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base bg-muted/30 border-border/50"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="rounded-full px-4"
            >
              All News
            </Button>
            {categories.map((cat) => {
              const config = categoryConfig[cat]
              return (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="rounded-full px-4 gap-1.5"
                >
                  <config.icon className="w-3.5 h-3.5" />
                  {config.label}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {mockNews.filter(n => n.category === "alert").length}
              </p>
              <p className="text-xs text-muted-foreground">Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {mockNews.filter(n => n.category === "health").length}
              </p>
              <p className="text-xs text-muted-foreground">Health News</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Syringe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {mockNews.filter(n => n.category === "vaccination").length}
              </p>
              <p className="text-xs text-muted-foreground">Vaccinations</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{mockNews.length}</p>
              <p className="text-xs text-muted-foreground">Total Updates</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {filteredNews.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Newspaper className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">No News Found</p>
              <p className="text-muted-foreground">
                No articles match your search criteria
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNews.map((news) => {
            const config = categoryConfig[news.category]
            return (
              <Card 
                key={news.id} 
                className={`border-border/50 hover:shadow-lg transition-all ${config.cardBorder} overflow-hidden`}
              >
                <CardContent className="p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <Badge className={`${config.color} w-fit`}>
                      <config.icon className="w-3 h-3 mr-1.5" />
                      {config.label}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(news.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground text-lg leading-tight mb-2">
                    {news.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {news.summary}
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-border/50">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {news.location}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Source: <span className="font-medium">{news.source}</span>
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary gap-1.5 -mr-2">
                      Read Full Article
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
