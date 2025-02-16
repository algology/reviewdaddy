"use client";

import { useState, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import {
  ChevronDownIcon,
  SearchIcon,
  BarChartIcon,
  MessagesSquareIcon,
} from "lucide-react";

const features = [
  {
    name: "Sentiment Analysis",
    description: "Understand user emotions and feedback trends.",
    href: "/features/sentiment",
    icon: BarChartIcon,
  },
  {
    name: "Keyword Tracking",
    description: "Track specific terms and phrases across reviews.",
    href: "/features/keywords",
    icon: SearchIcon,
  },
  {
    name: "Bulk Review Processing",
    description: "Process thousands of reviews simultaneously.",
    href: "/features/bulk-processing",
    icon: MessagesSquareIcon,
  },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed w-full top-4 z-50">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="bg-accent-1/40 backdrop-blur-xl border border-accent-2 rounded-2xl">
          <div className="flex items-center justify-between py-4 px-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#00ff8c] to-[#00cf8a] rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                  <Image
                    src="/globe.svg"
                    alt="ReviewDaddy Logo"
                    width={32}
                    className="relative rounded-full border border-accent-2"
                    height={32}
                    color="white"
                  />
                </div>
                <span className="text-xl font-bold ml-3">ReviewDaddy</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Popover className="relative">
                <PopoverButton className="flex items-center gap-x-1 text-sm font-medium leading-6 text-gray-400 hover:text-white transition-colors">
                  Features
                  <ChevronDownIcon
                    className="h-4 w-4 opacity-50"
                    aria-hidden="true"
                  />
                </PopoverButton>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <PopoverPanel className="absolute left-1/2 z-10 mt-4 flex w-screen max-w-max -translate-x-1/2 px-4">
                    <div className="w-screen max-w-md overflow-hidden rounded-2xl bg-black border border-accent-2 shadow-2xl">
                      <div className="p-3">
                        {features.map((item) => (
                          <div
                            key={item.name}
                            className="group relative flex gap-x-6 rounded-xl p-4 hover:bg-accent-2/50 transition-colors"
                          >
                            <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-[#00ff8c]/10 group-hover:bg-[#00ff8c]/20">
                              <item.icon className="h-6 w-6 text-[#00ff8c]" />
                            </div>
                            <div>
                              <a
                                href={item.href}
                                className="font-medium text-white"
                              >
                                {item.name}
                                <span className="absolute inset-0" />
                              </a>
                              <p className="mt-1 text-sm text-gray-400">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverPanel>
                </Transition>
              </Popover>

              <Link
                href="/pricing"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Documentation
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/auth"
                className="text-sm font-medium px-4 py-2 rounded-xl hover:bg-accent-2/50 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth?signup=true"
                className="text-sm font-medium px-4 py-2 rounded-xl bg-[#00ff8c] text-black hover:bg-[#00cf8a] transition-colors"
              >
                Get started
              </Link>
            </div>

            <button
              className="md:hidden relative group"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="relative flex overflow-hidden items-center justify-center w-[50px] h-[50px] transform transition-all bg-accent-2/50 ring-0 ring-gray-300 hover:ring-8 group-focus:ring-4 ring-opacity-30 duration-200 shadow-md rounded-xl">
                <div className="flex flex-col justify-between w-[20px] h-[20px] transform transition-all duration-300 origin-center overflow-hidden">
                  <div
                    className={`bg-white h-[2px] w-7 transform transition-all duration-300 origin-left ${
                      isMenuOpen ? "rotate-[42deg] translate-x-px" : ""
                    }`}
                  />
                  <div
                    className={`bg-white h-[2px] w-7 rounded transform transition-all duration-300 ${
                      isMenuOpen ? "opacity-0" : ""
                    }`}
                  />
                  <div
                    className={`bg-white h-[2px] w-7 transform transition-all duration-300 origin-left ${
                      isMenuOpen ? "-rotate-[42deg] translate-x-px" : ""
                    }`}
                  />
                </div>
              </div>
            </button>
          </div>
        </div>

        <Transition
          show={isMenuOpen}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 -translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-1"
        >
          <div className="md:hidden mt-2 p-4 bg-accent-1/40 backdrop-blur-xl rounded-2xl border border-accent-2">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/features"
                className="font-medium text-gray-400 hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="font-medium text-gray-400 hover:text-white transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="font-medium text-gray-400 hover:text-white transition-colors"
              >
                Documentation
              </Link>
              <hr className="border-accent-2" />
              <Link
                href="/auth"
                className="font-medium text-center py-2 rounded-xl hover:bg-accent-2/50 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth?signup=true"
                className="font-medium text-center py-2 rounded-xl bg-[#00ff8c] text-black hover:bg-[#00cf8a] transition-colors"
              >
                Get started
              </Link>
            </nav>
          </div>
        </Transition>
      </div>
    </header>
  );
}
