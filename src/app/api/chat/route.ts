// TODO: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import puppeteer from "puppeteer";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Utility function to truncate text
function truncateText(text: string, maxTokens: number = 1500): string {
  // Simple approximation of token count (1 token ≈ 4 characters)
  const tokens = Math.floor(text.length / 4);
  if (tokens <= maxTokens) return text;

  // Truncate and add ellipsis
  return text.slice(0, maxTokens * 4) + "... [content truncated]";
}

async function extractUrls(message: string): Promise<string[]> {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return (message.match(urlRegex) || []).map(url => url.trim());
}

async function scrapeWebsite(url: string) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });

    const text = await page.evaluate(() => {
      // Remove script, style, and other non-content elements
      const elementsToRemove = [
        "script",
        "style",
        "nav",
        "header",
        "footer",
        ".sidebar",
        "#sidebar",
        ".advertisement",
        ".ad",
        "iframe",
        "svg",
        "canvas",
      ];

      elementsToRemove.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });

      // Select content-rich elements
      const contentSelectors = [
        "article",
        "section",
        "main",
        "div.content",
        "div.article-body",
        "p",
      ];

      const elements = contentSelectors.flatMap(selector =>
        Array.from(document.querySelectorAll(selector))
      );

      // Extract and combine text
      return (
        elements
          .map(el => el.textContent?.trim())
          .filter(text => text && text.length > 50)
          .join("\n\n")
          .replace(/\s+/g, " ")
          .trim() ||
        document.body.textContent?.trim() ||
        ""
      );
    });

    await browser.close();
    // Truncate the scraped content
    const truncatedContent = truncateText(text);

    return {
      url,
      text: truncatedContent,
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return { url, text: "" };
  }
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Extract URLs from the message
    const extractedUrls = await extractUrls(message);

    // Scrape content from extracted URLs
    const scrapedContents = await Promise.all(extractedUrls.map(scrapeWebsite));
    const scrapedText = scrapedContents
      .map(scrapedContent => scrapedContent.text)
      .join(" ");

    console.log(`\nScraped content: ${scrapedText}`);

    // Remove URLs from the original message
    const cleanMessage = message.replace(/(https?:\/\/[^\s]+)/g, "").trim();

    // Generate response using Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant. Provide concise and accurate answers.",
        },
        {
          role: "user",
          content: `Question: ${cleanMessage}\n\nContext: ${scrapedText}`,
        },
      ],
      model: "llama-3.1-8b-instant",
      max_tokens: 8000,
    });

    // Extract response
    const response = chatCompletion.choices[0]?.message?.content || "";

    console.log(`\nResponse: ${response}`);

    return NextResponse.json({
      response,
      sources: scrapedContents.map(result => result.url),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
