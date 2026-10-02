import { marked } from "marked";
import { site } from "../config";

// GitHub data is fetched once per build. Set GITHUB_TOKEN in the build
// environment to lift the 60 requests/hour anonymous limit.

export interface Repo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
  topics: string[];
  license: string | null;
  url: string;
  homepage: string | null;
  defaultBranch: string;
}

export interface RepoDetail extends Repo {
  readmeHtml: string | null;
  latestRelease: string | null;
  commits: { sha: string; message: string; date: string; url: string }[];
}

const API = "https://api.github.com";

async function gh<T>(path: string): Promise<T | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": `${site.githubUser}-site`,
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`${API}${path}`, { headers });
    if (!res.ok) {
      if (res.status !== 404) console.warn(`[github] ${path} → ${res.status} ${res.statusText}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[github] ${path} failed:`, (err as Error).message);
    return null;
  }
}

function toRepo(r: any): Repo {
  return {
    name: r.name,
    description: r.description,
    language: r.language,
    stars: r.stargazers_count,
    pushedAt: r.pushed_at,
    topics: r.topics ?? [],
    license: r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : null,
    url: r.html_url,
    homepage: r.homepage || null,
    defaultBranch: r.default_branch,
  };
}

let reposPromise: Promise<Repo[]> | undefined;

/** The repos to show, in config order (or most recently pushed first). */
export function getRepos(): Promise<Repo[]> {
  reposPromise ??= (async () => {
    const all = await gh<any[]>(`/users/${site.githubUser}/repos?per_page=100&sort=pushed`);
    if (!all) return [];
    const repos = all
      // Skip forks, archived/private repos and the profile-README repo (named after the user).
      .filter((r) => !r.fork && !r.archived && !r.private && r.name.toLowerCase() !== site.githubUser.toLowerCase())
      .map(toRepo);
    if (site.projects.length) {
      return site.projects
        .map((name) => repos.find((r) => r.name.toLowerCase() === name.toLowerCase()))
        .filter((r): r is Repo => Boolean(r));
    }
    return repos.slice(0, site.maxProjects);
  })();
  return reposPromise;
}

const detailCache = new Map<string, Promise<RepoDetail>>();

export function getRepoDetail(repo: Repo): Promise<RepoDetail> {
  if (!detailCache.has(repo.name)) detailCache.set(repo.name, loadDetail(repo));
  return detailCache.get(repo.name)!;
}

async function loadDetail(repo: Repo): Promise<RepoDetail> {
  const base = `/repos/${site.githubUser}/${repo.name}`;
  const [readme, release, commits] = await Promise.all([
    gh<{ content: string }>(`${base}/readme`),
    gh<{ tag_name: string }>(`${base}/releases/latest`),
    gh<any[]>(`${base}/commits?per_page=3`),
  ]);
  return {
    ...repo,
    readmeHtml: readme ? renderReadmeIntro(Buffer.from(readme.content, "base64").toString("utf8"), repo) : null,
    latestRelease: release?.tag_name ?? null,
    commits: (commits ?? []).map((c) => ({
      sha: c.sha.slice(0, 7),
      message: c.commit.message.split("\n")[0],
      date: c.commit.committer?.date ?? c.commit.author?.date,
      url: c.html_url,
    })),
  };
}

/** Render the README up to its second section, dropping a leading H1 (the page already shows the name). */
function renderReadmeIntro(md: string, repo: Repo): string {
  const raw = `https://raw.githubusercontent.com/${site.githubUser}/${repo.name}/${repo.defaultBranch}/`;
  const blob = `${repo.url}/blob/${repo.defaultBranch}/`;
  const lines = md.replace(/\r\n/g, "\n").replace(/^\s*#\s+.*\n/, "").split("\n");
  const out: string[] = [];
  let headings = 0;
  let inFence = false;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (!inFence && /^#{1,2}\s/.test(line) && ++headings > 1) break;
    out.push(line);
  }
  const html = marked.parse(out.join("\n"), { async: false }) as string;
  // Point relative links/images at GitHub so they work off-site.
  return html
    .replace(/(<img[^>]+src=")(?!https?:|data:|\/\/)\.?\/?([^"]+)"/g, `$1${raw}$2"`)
    .replace(/(<a[^>]+href=")(?!https?:|mailto:|#|\/\/)\.?\/?([^"]+)"/g, `$1${blob}$2"`);
}
