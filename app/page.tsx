"use client";

import { ArrowRight, Brain, LineChart, Target, Sparkles } from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroCarousel from "./components/HeroCarousel";
import Link from "next/link";
export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Background layers */}
      <div className="fixed inset-0 grid-pattern opacity-20" />
      <div className="fixed inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80" />

      {/* Content */}
      <div className="relative z-10">
        <Header />

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 py-20">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent-1/50 border border-accent-2 mb-8">
                <Sparkles className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm font-mono text-gray-400">
                  APP REVIEW ANALYSIS
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl font-normal mb-8 leading-tight tracking-tight">
                Understand Your
                <span className="gradient-text block mt-2">App Reviews</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
                AI-powered review analysis that helps you understand user
                sentiment and discover actionable insights from your app
                reviews.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <Link
                  href="/auth?signup=true"
                  className="group px-8 py-4 bg-[#00ff8c] text-black rounded-full hover:bg-[#00cf8a] transition-colors duration-200 font-medium flex items-center gap-2 text-lg"
                >
                  Get Started
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="w-12 h-px bg-gray-800" />
                  <span className="text-sm">No credit card required</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Carousel */}
        <HeroCarousel />

        {/* Features Grid */}
        <section className="py-32 bg-background/30 backdrop-blur-[2px]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Everything you need to
                <span className="gradient-text block mt-2">
                  Understand Your Users
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Our platform combines AI-powered analysis with powerful
                visualization tools to help you make sense of your app reviews.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Brain className="w-8 h-8" />}
                title="Sentiment Analysis"
                description="Understand the emotional tone of your reviews with AI-powered sentiment analysis"
              />
              <FeatureCard
                icon={<LineChart className="w-8 h-8" />}
                title="Trend Analysis"
                description="Track sentiment trends and identify patterns in your reviews over time"
              />
              <FeatureCard
                icon={<Target className="w-8 h-8" />}
                title="Issue Detection"
                description="Automatically detect and categorize common issues and feature requests"
              />
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-accent-1/50 backdrop-blur-sm border border-accent-2 rounded-2xl p-8 hover:border-[#00ff8c]/50 transition-colors">
      <div className="w-16 h-16 rounded-full bg-[#00ff8c]/10 border border-[#00ff8c]/20 flex items-center justify-center mb-6 text-[#00ff8c]">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
