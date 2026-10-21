import * as cheerio from "cheerio";

export interface ExtractedUrlContent {
  title: string;
  description: string;
  content: string;
  characterCount: number;
  url: string;
}

export async function extractTextFromUrl(targetUrl: string): Promise<ExtractedUrlContent> {
  // 1. Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("URL must begin with http:// or https://");
    }
  } catch {
    throw new Error("Invalid URL format. Please provide a valid web address.");
  }

  // 2. Fetch page with realistic headers and timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

  try {
    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ExamPrepBot/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: HTTP ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      throw new Error("Target URL is not an HTML webpage.");
    }

    const html = await response.text();

    // 3. Parse with cheerio
    const $ = cheerio.load(html);

    // Remove unwanted non-content elements
    $("script, style, noscript, nav, header, footer, svg, iframe, form, button, [role='banner'], [role='navigation'], [aria-hidden='true']").remove();

    // Extract title & description
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text().trim() ||
      "Web Resource Document";

    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "";

    // Extract main content priority: <article>, <main>, .content, or body
    let rawContent = "";
    if ($("article").length > 0) {
      rawContent = $("article").text();
    } else if ($("main").length > 0) {
      rawContent = $("main").text();
    } else if ($(".content, #content, .post, .article").length > 0) {
      rawContent = $(".content, #content, .post, .article").text();
    } else {
      rawContent = $("body").text();
    }

    // Clean up excessive whitespace
    const cleanedContent = rawContent
      .replace(/\r\n|\r/g, "\n")
      .replace(/\t/g, " ")
      .replace(/[ ]{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!cleanedContent || cleanedContent.length < 80) {
      throw new Error("Could not extract sufficient text content from this webpage. Please try copy-pasting the text into the Direct Notes tab.");
    }

    // Limit to ~14,000 chars to avoid exceeding token limits while keeping rich context
    const truncatedContent = cleanedContent.slice(0, 14000);

    return {
      title,
      description,
      content: truncatedContent,
      characterCount: truncatedContent.length,
      url: targetUrl,
    };
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Connection timed out while fetching the webpage. Please verify the URL or try pasting notes directly.");
    }
    throw error;
  }
}
