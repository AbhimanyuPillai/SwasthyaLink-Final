"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Newspaper, Calendar, MapPin, ExternalLink, Search, AlertTriangle, HeartPulse, Syringe, TrendingUp, Loader2 } from "lucide-react"

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
  const [newsList, setNewsList] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAllNews() {
      try {
        const queries = [
          { cat: "alert", q: "Pune health alert" },
          { cat: "health", q: "Pune health medical" },
          { cat: "vaccination", q: "Pune vaccination" },
          { cat: "general", q: "Pune hospital health" }
        ] as const;

        const allItems: NewsItem[] = []
        const seenUrls = new Set<string>()

        // Fetch sequentially to avoid free proxy rate limits (which drop parallel requests)
        for (const { cat, q } of queries) {
          const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(`https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en`)}`
          try {
            const res = await fetch(url)
            const data = await res.json()
            
            if (data.status === "ok" && data.items) {
              data.items.forEach((item: any) => {
                const url = item.link
                if (!seenUrls.has(url)) {
                  seenUrls.add(url)
                  
                  const titleParts = item.title.split(" - ")
                  const source = titleParts.length > 1 ? titleParts.pop() : "Google News"
                  const cleanTitle = titleParts.join(" - ")
                  
                  const summaryText = item.description 
                    ? item.description.replace(/<[^>]*>?/gm, '').slice(0, 150) + "..."
                    : cleanTitle

                  allItems.push({
                    id: item.guid || url,
                    title: cleanTitle,
                    summary: summaryText,
                    source: source,
                    date: item.pubDate,
                    location: "Pune, Maharashtra",
                    category: cat as "alert" | "health" | "vaccination" | "general",
                    url: url
                  })
                }
              })
            }
          } catch (err) {
            console.error(`Error fetching ${cat}:`, err)
          }
        }

        // Sort by date descending
        allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setNewsList(allItems)
      } catch (error) {
        console.error("Failed to fetch news reports:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllNews()
  }, [])

  const filteredNews = newsList.filter((news) => {
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
                {newsList.filter(n => n.category === "alert").length}
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
                {newsList.filter(n => n.category === "health").length}
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
                {newsList.filter(n => n.category === "vaccination").length}
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
              <p className="text-lg font-bold text-foreground">{newsList.length}</p>
              <p className="text-xs text-muted-foreground">Total Updates</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="border-border/50">
            <CardContent className="py-16 text-center flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-primary/50 animate-spin mb-4" />
              <p className="text-lg font-medium text-foreground mb-1">Fetching Local Updates</p>
              <p className="text-muted-foreground">
                Retrieving data for Pune...
              </p>
            </CardContent>
          </Card>
        ) : filteredNews.length === 0 ? (
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
              <a 
                key={news.id} 
                href={news.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block outline-none"
              >
                <Card 
                  className={`border-border/50 hover:shadow-lg transition-all ${config.cardBorder} overflow-hidden group`}
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

                    <h3 className="font-semibold text-foreground text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
                      {news.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
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
                      <Button variant="ghost" size="sm" className="text-primary gap-1.5 -mr-2" asChild>
                        <span>
                          Read Full Article
                          <ExternalLink className="w-4 h-4" />
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </a>
            )
          })
        )}
      </div>
    </div>
  )
}
