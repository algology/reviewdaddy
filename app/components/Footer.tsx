import Link from "next/link";
import { Twitter, Github, Linkedin } from "lucide-react";
import { useState, useEffect } from "react";

export default function Footer() {
  const [year, setYear] = useState("");

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-bold text-lg mb-4">ReviewDaddy</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Making app review analysis simple and powerful for developers and
              product teams.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                className="text-gray-600 hover:text-primary"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://github.com"
                className="text-gray-600 hover:text-primary"
              >
                <Github size={20} />
              </a>
              <a
                href="https://linkedin.com"
                className="text-gray-600 hover:text-primary"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/features"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            © {year} ReviewDaddy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
