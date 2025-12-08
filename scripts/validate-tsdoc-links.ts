import * as fs from 'fs/promises';
import * as path from 'path';

const PACKAGES_DIR = path.join(__dirname, '..', 'packages');
// eslint-disable-next-line no-useless-escape
const LINK_TAG_REGEX = /\{@link\s+(https?:\/\/[^\s\}]+)/g;
const TSDOC_COMMENT_REGEX = /\/\*\*[\s\S]*?\*\//g;

interface LinkLocation {
  file: string;
  line: number;
  column: number;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const files = await getTypeScriptFiles(PACKAGES_DIR);
  const linksByUrl = new Map<string, LinkLocation[]>();

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const links = extractLinksFromTSDoc(content, file);

    for (const link of links) {
      const existing = linksByUrl.get(link.url) || [];
      existing.push({ file: link.file, line: link.line, column: link.column });
      linksByUrl.set(link.url, existing);
    }
  }

  const urls = Array.from(linksByUrl.keys());

  const results = process.env.CI
    ? await checkLinksSerially(urls)
    : await checkLinksInParallel(urls);

  const brokenResults = results.filter((result) => !result.ok);

  if (brokenResults.length > 0) {
    for (const result of brokenResults) {
      const locations = linksByUrl.get(result.url) || [];
      console.error(`${result.url} - ${result.status}`);
      for (let i = 0; i < locations.length; i++) {
        const loc = locations[i];
        const prefix = i === locations.length - 1 ? '└──' : '├──';
        console.error(
          `${prefix} ${path.relative(process.cwd(), loc.file)}:${loc.line}:${loc.column}`
        );
      }
      console.error('');
    }
    process.exit(1);
  }
}

async function getTypeScriptFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const pattern = path.join(dir, '**/src/**/*.ts');

  for await (const file of fs.glob(pattern)) {
    files.push(file);
  }

  return files;
}

interface ExtractedLink {
  url: string;
  file: string;
  line: number;
  column: number;
}

function extractLinksFromTSDoc(content: string, file: string): ExtractedLink[] {
  const links: ExtractedLink[] = [];
  const seen = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = TSDOC_COMMENT_REGEX.exec(content)) !== null) {
    const comment = match[0];
    const commentStart = match.index;

    let linkMatch: RegExpExecArray | null;
    const linkRegex = new RegExp(LINK_TAG_REGEX.source, 'g');
    while ((linkMatch = linkRegex.exec(comment)) !== null) {
      const url = linkMatch[1];
      const absoluteIndex = commentStart + linkMatch.index;

      // Calculate line and column
      const textBefore = content.slice(0, absoluteIndex);
      const line = textBefore.split('\n').length;
      const lastNewline = textBefore.lastIndexOf('\n');
      const column = absoluteIndex - lastNewline;

      const key = `${url}:${file}`;
      if (!seen.has(key)) {
        seen.add(key);
        links.push({ url, file, line, column });
      }
    }
  }

  // Reset regex lastIndex for next file
  TSDOC_COMMENT_REGEX.lastIndex = 0;

  return links;
}

async function checkLinksSerially(
  urls: string[]
): Promise<{ url: string; ok: boolean; status: number | string }[]> {
  const results: { url: string; ok: boolean; status: number | string }[] = [];
  for (const url of urls) {
    const result = await checkLink(url);
    results.push({ url, ...result });
  }
  return results;
}

async function checkLinksInParallel(
  urls: string[]
): Promise<{ url: string; ok: boolean; status: number | string }[]> {
  return Promise.all(
    urls.map(async (url) => {
      const result = await checkLink(url);
      return { url, ...result };
    })
  );
}

async function checkLink(url: string): Promise<{ ok: boolean; status: number | string }> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      return { ok: true, status: response.status };
    }

    // Some servers don't support HEAD, try GET
    const getResponse = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    return { ok: getResponse.ok, status: getResponse.status };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, status: message };
  }
}
