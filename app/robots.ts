import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// API routes and the per-guest booking steps have nothing to index.
const DISALLOW = ['/api/', '/alojamiento/*/*/reservar'];

// AI crawlers and assistants, named one by one: '*' already lets them in, but
// some only act on a rule with their own name. They can also read /llms.txt.
const AI_AGENTS = [
  // OpenAI
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  // Anthropic
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'anthropic-ai',
  // Google (Gemini) and Apple
  'Google-Extended',
  'GoogleOther',
  'Applebot',
  'Applebot-Extended',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // Microsoft (Copilot) and DuckDuckGo
  'bingbot',
  'DuckAssistBot',
  // Meta, Amazon, Mistral, Cohere, You.com, ByteDance, Common Crawl
  'meta-externalagent',
  'meta-externalfetcher',
  'FacebookBot',
  'Amazonbot',
  'MistralAI-User',
  'cohere-ai',
  'YouBot',
  'Bytespider',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      { userAgent: AI_AGENTS, allow: ['/', '/llms.txt'], disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
