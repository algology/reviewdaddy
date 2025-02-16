import { NextResponse } from "next/server";
import gplay from "google-play-scraper";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    const results = await gplay.search({
      term: query,
      num: 10,
      country: "us",
      lang: "en",
      throttle: 5, // Add throttling to avoid 503 errors
    });

    const apps = await Promise.all(
      results.map(async (app: any) => {
        try {
          const details = await gplay.app({ appId: app.appId });
          return {
            id: app.appId,
            name: app.title,
            icon: details.icon.startsWith("//")
              ? `https:${details.icon}`
              : details.icon.replace(/^(https?)\/\//, "$1://"),
            developer: app.developer,
            rating: app.score || 0,
            reviews: details.reviews || 0,
            description: details.description || "",
            installs: details.installs || "0+",
            lastUpdated: new Date(details.updated || Date.now()).toISOString(),
          };
        } catch (error) {
          console.error(`Error details for ${app.appId}:`, error);
          return {
            id: app.appId,
            name: app.title,
            icon: app.icon.replace(/^(https?)\/\//, "$1://").startsWith("//")
              ? `https:${app.icon}`
              : app.icon,
            developer: app.developer,
            rating: app.score || 0,
            reviews: 0,
            description: "",
            installs: "0+",
            lastUpdated: new Date().toISOString(),
          };
        }
      })
    );

    return NextResponse.json({ apps });
  } catch (error) {
    console.error("Google Play Store search error:", error);
    return NextResponse.json(
      { error: "Failed to search Google Play Store" },
      { status: 500 }
    );
  }
}
