"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const tabs = [
  {
    id: "code",
    label: "Code",
    video: "/videos/code-demo.mp4",
    description:
      "Analyze app reviews with AI-powered insights and sentiment analysis.",
  },
  {
    id: "analyze",
    label: "Analyze",
    video: "/videos/analyze-demo.mp4",
    description:
      "Track user sentiment trends and identify key issues automatically.",
  },
  {
    id: "collaborate",
    label: "Collaborate",
    video: "/videos/collaborate-demo.mp4",
    description:
      "Share insights with your team and coordinate responses efficiently.",
  },
];

export default function HeroCarousel() {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="relative mt-16">
      {/* Video Display */}
      <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-[16/9] max-w-4xl mx-auto">
        <video
          key={activeTab.video}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/video-poster.jpg"
        >
          <source src={activeTab.video} type="video/mp4" />
        </video>
      </div>

      {/* Tab Controls */}
      <div className="mt-8 flex flex-col items-center">
        <div className="flex space-x-1 rounded-full p-1 bg-gray-100 dark:bg-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab)}
              className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab.id === tab.id
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {activeTab.id === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white dark:bg-gray-700 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
          {activeTab.description}
        </p>
      </div>
    </div>
  );
}
