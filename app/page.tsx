'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  QrCode,
  Map as MapIcon,
  Bot,
  BarChart3,
  Menu,
  X,
  Heart,
  Activity,
  ShieldAlert
} from 'lucide-react'
import './landing.css'

const OBJECTIVES = [
  {
    id: 'sovereignty',
    title: 'Unified Sovereignty',
    icon: QrCode,
    description: "Enable patients to own and control their health records via centralized 'Health Ledger' accessible through a simple QR code."
  },
  {
    id: 'mapping',
    title: 'Real-time Outbreak Mapping',
    icon: MapIcon,
    description: "Visualize symptom clusters at specific locations and region areas to detect emerging outbreaks with precision."
  },
  {
    id: 'triage',
    title: 'Multimodal AI Triage',
    icon: Bot,
    description: "Provide 24/7 symptom analysis (text and visual/rash images) to reduce unnecessary load on medical professionals."
  },
  {
    id: 'intelligence',
    title: 'Actionable Intelligence',
    icon: BarChart3,
    description: "Bridge the gap between data analytics and policy formulation with 'Hot Alerts' to healthcare authorities in real time."
  }
]

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"]
  })

  // Title Position Transformation
  const titleY = useTransform(scrollYProgress, [0, 0.25], ["0%", "-32vh"])
  const titleScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.45])

  // Frame Animation Index
  const frameCount = 40
  const frameIndex = useTransform(scrollYProgress, [0.0, 0.8], [1, frameCount])
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    // Preload images for smoother scrolling
    for (let i = 1; i <= frameCount; i++) {
      const img = new window.Image()
      img.src = `/images/frames/frame (${i}).jpg`
    }

    return frameIndex.on("change", (latest) => {
      const idx = Math.min(Math.max(Math.round(latest), 1), frameCount)
      if (imageRef.current) {
        imageRef.current.src = `/images/frames/frame (${idx}).jpg`
      }
    })
  }, [frameIndex, frameCount])

  // Logo Opacity - Solid transition
  const logoOpacity = useTransform(scrollYProgress, [0.0, 0.1, 0.8, 1], [0, 1, 1, 1])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="landing-container">
      {/* Header */}
      <nav className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logo-container">
          <Image src="/swasthyalink-logo.png" alt="Logo" width={32} height={32} className="logo-img" />
          <span className="logo-text">Swasthya<span style={{ color: '#3b82f6' }}>Link</span></span>
        </div>

        <div className="nav-buttons hidden md:flex">
          <Link href="/login" className="nav-btn">User Dashboard</Link>
          <Link href="/doctor" className="nav-btn">Doctors Dashboard</Link>
          <Link href="/government" className="nav-btn">Govt Dashboard</Link>
        </div>

        <button className="md:hidden p-2 text-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className="sticky-hero">
          <motion.div
            style={{
              y: titleY,
              scale: titleScale,
              position: 'absolute',
              zIndex: 100
            }}
            className="hero-title"
          >
            SwasthyaLink
          </motion.div>

          {/* Logo Frame Animation */}
          <motion.div
            style={{
              opacity: logoOpacity,
              scale: useTransform(scrollYProgress, [0.0, 0.3], [0.98, 1])
            }}
            className="frame-container"
          >
            <img
              ref={imageRef}
              src={`/images/frames/frame (1).jpg`}
              alt="Surveillance Animation"
              className="frame-img"
            />
          </motion.div>

          <motion.div
            style={{
              opacity: useTransform(scrollYProgress, [0.1, 0.2, 1], [0, 1, 1]),
              y: useTransform(scrollYProgress, [0.1, 0.2], [10, 0]),
              zIndex: 101
            }}
            className="post-animation-text"
          >
            Unified Healthcare Intelligence
          </motion.div>
        </div>
      </section>

      {/* Single-Column Objectives */}
      <section className="objectives-section">
        <div className="objectives-header">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="objectives-title"
          >
            Institutional Capabilities
          </motion.h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            A comprehensive overview of our core surveillance and intelligence infrastructure.
          </p>
        </div>

        <div className="objectives-grid">
          {OBJECTIVES.map((obj, idx) => (
            <motion.div
              key={obj.id}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
              viewport={{ once: true, margin: "-100px" }}
              className="objective-card"
            >
              <div className="objective-icon-wrapper">
                <obj.icon size={36} />
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="objective-title">{obj.title}</h3>
                <p className="objective-desc">{obj.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Portals Section */}
      <section className="portals-section">
        <h2 className="portals-title">Swasthya<span style={{ color: '#3b82f6' }}>Link</span></h2>
        <p className="portals-subtitle">Unified Healthcare Intelligence Layer</p>

        <div className="portals-grid">
          {/* Patient Portal */}
          <Link href="/login" className="portal-card patient">
            <div className="portal-icon-circle">
              <Heart className="portal-icon" fill="currentColor" />
            </div>
            <h3 className="portal-title">Patient Portal</h3>
            <p className="portal-desc">Login to access your digital medical records and AI assistant.</p>
          </Link>

          {/* Doctor Portal */}
          <Link href="/doctor" className="portal-card doctor">
            <div className="portal-icon-circle">
              <Activity className="portal-icon" />
            </div>
            <h3 className="portal-title">Doctor Portal</h3>
            <p className="portal-desc">Search patients via Swasthya ID and securely add new medical records.</p>
          </Link>

          {/* Govt Portal */}
          <Link href="/government" className="portal-card govt">
            <div className="portal-icon-circle">
              <ShieldAlert className="portal-icon" />
            </div>
            <h3 className="portal-title">Govt / Admin</h3>
            <p className="portal-desc">Monitor real-time epidemiological data and track regional outbreaks.</p>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer border-t border-slate-100">
        <div className="flex flex-col items-center gap-8">
          <div className="logo-container opacity-50">
            <Image src="/swasthyalink-logo.png" alt="Logo" width={24} height={24} />
            <span className="logo-text">Swasthya<span style={{ color: '#3b82f6' }}>Link</span></span>
          </div>
          <div className="flex flex-wrap gap-10 justify-center">
            <Link href="#" className="text-slate-500 hover:text-primary font-medium transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-slate-500 hover:text-primary font-medium transition-colors">Terms of Service</Link>
            <Link href="#" className="text-slate-500 hover:text-primary font-medium transition-colors">Contact Support</Link>
          </div>
          <p className="text-slate-400 text-sm">© 2024 SwasthyaLink Initiative. Built for resilience.</p>
        </div>
      </footer>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[1100] bg-white flex flex-col items-center justify-center gap-6 p-6"
          >
            <button className="absolute top-8 right-8" onClick={() => setIsMenuOpen(false)}><X size={32} /></button>
            <Link href="/login" className="nav-btn w-full max-w-xs" onClick={() => setIsMenuOpen(false)}>User Dashboard</Link>
            <Link href="/doctor" className="nav-btn w-full max-w-xs" onClick={() => setIsMenuOpen(false)}>Doctors Dashboard</Link>
            <Link href="/government" className="nav-btn w-full max-w-xs" onClick={() => setIsMenuOpen(false)}>Govt Dashboard</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}