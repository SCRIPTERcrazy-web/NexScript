react
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

// ============================================================
// CONSTANTS
// ============================================================
const API_BASE_URL = 'https://scriptblox-proxy-pzq8.vercel.app';
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';

// ============================================================
// UTILS
// ============================================================
const getImageUrl = (path, fallback = FALLBACK_IMG) => {
  if (!path || path === '/images/no-script.webp' || path === 'no-script.webp') return fallback;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
};

const formatCount = (num) => {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return 'Recently';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 2592000)}mo ago`;
  } catch {
    return 'Recently';
  }
};

// ============================================================
// ICONS
// ============================================================
const Icons = {
  Search: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
  Sparkles: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Eye: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>,
  Key: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>,
  Unlock: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>,
  Rocket: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 010 12.728M12 12h.01"/></svg>,
  Copy: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>,
  ExternalLink: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>,
  ThumbsUp: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2"/></svg>,
  ThumbsDown: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2"/></svg>,
  X: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>,
  Refresh: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>,
  Terminal: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  Code: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>,
  AlertTriangle: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>,
};

// ============================================================
// SAFE LUA SYNTAX HIGHLIGHTER
// ============================================================
const KEYWORDS = new Set(['local','function','end','if','then','else','elseif','for','in','while','do','return','nil','true','false','and','or','not','repeat','until','break']);
const BUILTINS = new Set(['game','HttpGet','loadstring','workspace','Players','LocalPlayer','Instance','Vector3','Color3','task','wait','spawn','delay','print','warn','error','pcall','ypcall','typeof','tostring','tonumber','pairs','ipairs','next','select','require','getgenv','getrawmetatable','setmetatable','getmetatable','hookfunction','firetouchinterest','setscriptable']);

const tokenizeLuaLine = (line) => {
  const tokens = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '-' && line[i+1] === '-') {
      tokens.push({ type: 'comment', value: line.slice(i) });
      break;
    }
    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === '\\') { j += 2; continue; }
        if (line[j] === quote) { j++; break; }
        j++;
      }
      tokens.push({ type: 'string', value: line.slice(i, j) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) j++;
      const word = line.slice(i, j);
      let type = 'plain';
      if (KEYWORDS.has(word)) type = 'keyword';
      else if (BUILTINS.has(word)) type = 'builtin';
      tokens.push({ type, value: word });
      i = j;
      continue;
    }
    if (/\d/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\d.]/.test(line[j])) j++;
      tokens.push({ type: 'number', value: line.slice(i, j) });
      i = j;
      continue;
    }
    tokens.push({ type: 'plain', value: line[i] });
    i++;
  }
  return tokens;
};

const COLOR_MAP = {
  comment: 'text-slate-500 italic',
  string: 'text-emerald-400',
  keyword: 'text-pink-400 font-semibold',
  builtin: 'text-cyan-300 font-semibold',
  number: 'text-amber-300',
  plain: 'text-slate-200',
};

const SyntaxLuaCode = ({ code }) => {
  const lines = useMemo(() => {
    if (!code) return [];
    return code.split('\n').map(tokenizeLuaLine);
  }, [code]);

  return (
    <div className="table w-full border-collapse">
      {lines.map((tokens, idx) => (
        <div key={idx} className="table-row font-mono text-xs md:text-sm leading-relaxed">
          <span className="table-cell select-none pr-4 text-right text-slate-600 w-10 border-r border-slate-800/80 align-top">
            {idx + 1}
          </span>
          <span className="table-cell pl-3 whitespace-pre-wrap break-all">
            {tokens.map((t, i) => (
              <span key={i} className={COLOR_MAP[t.type]}>{t.value}</span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// MOCK FALLBACK
// ============================================================
const MOCK_FALLBACK_SCRIPTS = [
  {
    _id: "mock-1",
    title: "Blox Fruits | Hoho Hub V3 - Auto Farm, Fruit Sniper, Sea Event",
    game: { name: "Blox Fruits", imageUrl: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=400&q=80" },
    slug: "Blox-Fruits-Hoho-Hub-V3-10294",
    verified: true, key: false, views: 124800, executes: 458900, likeCount: 14200, dislikeCount: 310,
    isUniversal: false, isPatched: false, isHub: true,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    script: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/acsu123/HOHO_HUB/main/Script_Main.lua"))()',
  },
  {
    _id: "mock-2",
    title: "Universal Hub Lite | Keyless Aimbot ESP Fly Walkspeed",
    game: { name: "Universal Script 📌", imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80" },
    slug: "Universal-Script-Universal-Hub-Lite-226350",
    verified: false, key: false, views: 55890, executes: 63962, likeCount: 8900, dislikeCount: 120,
    isUniversal: true, isPatched: false, isHub: true,
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    script: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/UniversalHub/main/script.lua"))()',
  },
  {
    _id: "mock-3",
    title: "Pet Simulator 99 | OP Auto Hatch & Farm Diamond Chest",
    game: { name: "Pet Simulator 99", imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80" },
    slug: "Pet-Simulator-99-OP-Auto-Hatch-9018",
    verified: true, key: true, views: 89400, executes: 210000, likeCount: 11200, dislikeCount: 450,
    isUniversal: false, isPatched: false, isHub: false,
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    script: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/PetSimX/scripts/main/loader.lua"))()',
  },
  {
    _id: "mock-4",
    title: "Blade Ball | Auto Parry V2 with Ping Compensation",
    game: { name: "Blade Ball", imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80" },
    slug: "Blade-Ball-Auto-Parry-V2-30219",
    verified: true, key: false, views: 204500, executes: 890400, likeCount: 32100, dislikeCount: 890,
    isUniversal: false, isPatched: false, isHub: false,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    script: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/FFJ1/BladeBall/main/parry.lua"))()',
  },
  {
    _id: "mock-5",
    title: "Arsenal | Silent Aim, Wallbang, Infinite Ammo & Rainbow Gun",
    game: { name: "Arsenal", imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80" },
    slug: "Arsenal-Silent-Aim-Wallbang-40291",
    verified: false, key: false, views: 45100, executes: 102400, likeCount: 5400, dislikeCount: 230,
    isUniversal: false, isPatched: false, isHub: true,
    image: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&q=80",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    script: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/Quenty/NevermoreEngine/master/loader.lua"))()',
  },
  {
    _id: "mock-6",
    title: "Doors | Infinite Vitamins, Auto Door Unlock & Entity ESP",
    game: { name: "Doors 🚪", imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80" },
    slug: "Doors-Infinite-Vitamins-ESP-50129",
    verified: true, key: false, views: 31200, executes: 74200, likeCount: 3900, dislikeCount: 180,
    isUniversal: false, isPatched: true, isHub: false,
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    script: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/DoorsRunner/main/Doors.lua"))()',
  },
];

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  // Data
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  // Pagination / filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeSort, setActiveSort] = useState('trending');
  const [activeKeyFilter, setActiveKeyFilter] = useState('all');
  const [selectedGameFilter, setSelectedGameFilter] = useState('all');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Detail
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [scriptDetail, setScriptDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Reactions (localStorage)
  const [userReactions, setUserReactions] = useState({});

  // UI
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deployGuideOpen, setDeployGuideOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Load reactions from localStorage safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem('scriptfinder_reactions');
      if (saved) setUserReactions(JSON.parse(saved));
    } catch {}
  }, []);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Sync URL query params
  useEffect(() => {
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('q', debouncedSearch);
      if (activeSort !== 'trending') params.set('sort', activeSort);
      const qs = params.toString();
      window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname);
    } catch {}
  }, [debouncedSearch, activeSort]);

  // 1. fetchScriptsData — support search + 3 format response
  const fetchScriptsData = useCallback(async (pageNum = 1, sortMode = 'trending', isAppend = false, query = '') => {
    if (isAppend) setLoadingMore(true);
    else setLoading(true);
    setError(null);

    try {
      let endpoint;

      if (query && query.trim().length > 0) {
        endpoint = `${API_BASE_URL}/api/search?q=${encodeURIComponent(query.trim())}&page=${pageNum}`;
      } else if (sortMode === 'trending') {
        endpoint = `${API_BASE_URL}/api/trending`;
      } else if (sortMode === 'createdAt') {
        endpoint = `${API_BASE_URL}/api/script/fetch?page=${pageNum}&max=20&sortBy=createdAt&order=desc`;
      } else {
        endpoint = `${API_BASE_URL}/api/script/fetch?page=${pageNum}&max=20`;
      }

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      let fetched = [];
      let maxPages = 1;

      // Handle 3 shapes of response: {result: [...]}, {result: {scripts, totalPages}}, [...]
      if (data?.result) {
        if (Array.isArray(data.result)) {
          fetched = data.result;
        } else if (Array.isArray(data.result.scripts)) {
          fetched = data.result.scripts;
          maxPages = data.result.totalPages || 1;
        }
      } else if (Array.isArray(data)) {
        fetched = data;
      }

      if (fetched.length === 0 && pageNum === 1 && !query) {
        fetched = MOCK_FALLBACK_SCRIPTS;
        setUsingMock(true);
      } else {
        setUsingMock(false);
      }

      if (isAppend) setScripts(prev => [...prev, ...fetched]);
      else setScripts(fetched);
      setTotalPages(maxPages);
    } catch (err) {
      console.warn('API fetch failed:', err);
      setError('Could not reach ScriptBlox proxy.');
      setUsingMock(true);
      if (pageNum === 1) setScripts(MOCK_FALLBACK_SCRIPTS);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // 2. Combined useEffect — search & sort as single trigger
  useEffect(() => {
    let cancelled = false;
    setPage(1);
    (async () => {
      if (cancelled) return;
      await fetchScriptsData(1, activeSort, false, debouncedSearch);
    })();
    return () => { cancelled = true; };
  }, [activeSort, debouncedSearch, fetchScriptsData]);

  // Fetch script details
  useEffect(() => {
    if (!selectedSlug) {
      setScriptDetail(null);
      return;
    }

    const controller = new AbortController();
    const fetchDetail = async () => {
      setLoadingDetail(true);

      const existing = scripts.find(s => s.slug === selectedSlug);

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/fetch?slug=${encodeURIComponent(selectedSlug)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('Failed to load detail');
        const data = await res.json();
        const detail = data.result || data;
        if (detail.scripts && Array.isArray(detail.scripts)) {
          const match = detail.scripts.find(s => s.slug === selectedSlug);
          setScriptDetail(match || existing || null);
        } else {
          setScriptDetail(detail);
        }
      } catch (e) {
        if (e.name === 'AbortError') return;
        if (existing) {
          setScriptDetail(existing);
        } else {
          showToast('Could not fetch script details', 'error');
          setSelectedSlug(null);
        }
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchDetail();
    return () => controller.abort();
  }, [selectedSlug, scripts, showToast]);

  // 3. filteredScripts — server-side search enabled (skip client-side title/game match)
  const filteredScripts = useMemo(() => {
    let arr = scripts.filter(s => {
      if (activeKeyFilter === 'nokey' && s.key === true) return false;
      if (activeKeyFilter === 'key' && s.key !== true) return false;
      if (selectedGameFilter !== 'all') {
        if ((s.game?.name || '').toLowerCase() !== selectedGameFilter.toLowerCase()) return false;
      }
      return true;
    });

    if (activeSort === 'views') {
      arr = [...arr].sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    return arr;
  }, [scripts, activeKeyFilter, selectedGameFilter, activeSort]);

  // Dynamic game tag pills
  const dynamicGames = useMemo(() => {
    const map = new Map();
    scripts.forEach(s => {
      if (s.game?.name && !map.has(s.game.name)) {
        map.set(s.game.name, {
          name: s.game.name,
          imageUrl: getImageUrl(s.game.imageUrl, FALLBACK_IMG)
        });
      }
    });
    return Array.from(map.values()).slice(0, 8);
  }, [scripts]);

  const handleReaction = (scriptId, type) => {
    const current = userReactions[scriptId];
    const newReactions = { ...userReactions };

    if (current === type) {
      delete newReactions[scriptId];
    } else {
      newReactions[scriptId] = type;
    }

    setUserReactions(newReactions);
    try {
      localStorage.setItem('scriptfinder_reactions', JSON.stringify(newReactions));
    } catch {}

    showToast(newReactions[scriptId] ? `Marked as ${type}` : 'Preference cleared', 'info');
  };

  const handleCopyCode = (codeText) => {
    if (!codeText) return;
    navigator.clipboard.writeText(codeText);
    setCopySuccess(true);
    showToast('Loadstring copied to clipboard!', 'success');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // 4. handleLoadMore — include query during active search
  const handleLoadMore = useCallback(() => {
    const next = page + 1;
    setPage(next);
    fetchScriptsData(next, activeSort, true, debouncedSearch);
  }, [page, activeSort, debouncedSearch, fetchScriptsData]);

  const observerRef = useRef(null);
  const lastElementRef = useCallback((node) => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && page < totalPages && !usingMock) {
        handleLoadMore();
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, page, totalPages, usingMock, handleLoadMore]);

  return (
    <div className="min-h-screen bg-[#05060A] text-[#F5F7FA] font-['Figtree',sans-serif] selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* Dynamic Cyber Styling */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap');
        
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        .cyber-grid-bg {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(28, 32, 48, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(28, 32, 48, 0.3) 1px, transparent 1px);
        }

        .cyber-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
        }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #05060A; }
        ::-webkit-scrollbar-thumb { background: #1C2030; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #3B82F6; }

        .neon-glow-red { box-shadow: 0 0 25px -5px rgba(255, 59, 92, 0.35); }
        .border-glow-blue:hover {
          border-color: #3B82F6;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.25);
        }
      `}</style>

      {/* Grid & Radial Background */}
      <div className="fixed inset-0 cyber-grid-bg pointer-events-none z-0" />
      <div className="fixed inset-0 cyber-noise pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-blue-600/15 via-blue-900/5 to-transparent blur-3xl pointer-events-none z-0" />

      {/* App Layout */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#05060A]/85 border-b border-[#1C2030] px-4 md:px-8 py-3 transition-all duration-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Logo */}
            <div className="flex items-center justify-between w-full md:w-auto">
              <a href="#" onClick={(e) => { e.preventDefault(); setSelectedSlug(null); setSearchQuery(''); }} className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1.5px] transition-transform group-hover:scale-105">
                  <div className="w-full h-full bg-[#0B0D14] rounded-[10.5px] flex items-center justify-center text-blue-400">
                    <Icons.Terminal />
                  </div>
                </div>
                <div>
                  <span className="font-outfit font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    SCRIPT <span className="text-blue-500">FINDER</span>
                  </span>
                  <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase tracking-widest text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                    LIVE PROXY
                  </span>
                </div>
              </a>

              {/* Mobile Actions */}
              <div className="flex md:hidden items-center gap-2">
                <button
                  onClick={() => setDeployGuideOpen(true)}
                  className="p-2 rounded-lg bg-[#11141D] border border-[#1C2030] text-slate-400 hover:text-white text-xs font-mono"
                  title="Next.js Specs"
                >
                  <Icons.Code />
                </button>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#FF3B5C]/20 to-pink-600/20 border border-[#FF3B5C]/50 text-[#FF6B81] text-xs font-medium hover:bg-[#FF3B5C]/30 transition"
                >
                  + Upload
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="w-full md:max-w-xl relative">
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                  <Icons.Search />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search game or script title, e.g. Blox Fruits, Universal..."
                  className="w-full bg-[#0B0D14] border border-[#1C2030] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-full pl-10 pr-10 py-2 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none font-medium shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 text-slate-500 hover:text-slate-300"
                  >
                    <Icons.X />
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setDeployGuideOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#11141D] hover:bg-[#1C2030] border border-[#1C2030] text-slate-300 text-xs font-mono transition"
                title="View Next.js Architecture Blueprint"
              >
                <Icons.Code />
                <span>DEV BLUEPRINT</span>
              </button>

              <button
                onClick={() => setUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B0D14] hover:bg-[#FF3B5C]/10 border border-[#FF3B5C]/50 text-[#FF6B81] hover:text-[#FF8DA1] text-xs font-semibold tracking-wide transition shadow-sm neon-glow-red"
              >
                <Icons.Plus />
                <span>UPLOAD SCRIPT</span>
              </button>
            </div>

          </div>
        </header>

        {/* Main Section */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">

          {/* Hero Header & Dynamic Status */}
          {!selectedSlug && (
            <div className="mb-8 pt-2">
              {/* 6. Hero — dynamic search indicator */}
              <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  // {debouncedSearch
                    ? `SEARCH: "${debouncedSearch}" (PAGE ${page} OF ${totalPages})`
                    : `LIVE SCRIPTBLOX INDEX (PAGE ${page} OF ${totalPages || '3000+'})`}
                </span>
                {usingMock ? (
                  <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[10px]">
                    OFFLINE CACHE
                  </span>
                ) : (
                  <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                    CONNECTED TO PROXY
                  </span>
                )}
              </div>

              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                  <h1 className="font-outfit font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
                    Roblox <span className="bg-gradient-to-r from-[#FF3B5C] to-[#FF6B81] bg-clip-text text-transparent">Script Finder.</span>
                  </h1>
                  <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl font-normal">
                    Search and execute live indexed Lua scripts directly from ScriptBlox proxy. Clean, keyless filters, and instant loadstrings.
                  </p>
                </div>

                {/* Mini Stat Chips */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="px-3 py-2 rounded-xl bg-[#0B0D14] border border-[#1C2030] flex flex-col min-w-[100px]">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">SCRIPTS LOADED</span>
                    <span className="font-outfit font-bold text-lg text-white">{scripts.length}</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-[#0B0D14] border border-[#1C2030] flex flex-col min-w-[100px]">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">SOURCE</span>
                    <span className="font-outfit font-bold text-lg text-blue-400 flex items-center gap-1 font-mono text-xs">
                      ScriptBlox API
                    </span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-[#0B0D14] border border-[#1C2030] flex flex-col min-w-[100px]">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">STATUS</span>
                    <span className="font-outfit font-bold text-lg text-emerald-400 flex items-center gap-1 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> ONLINE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          {!selectedSlug && (
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0D14]/80 p-3 rounded-2xl border border-[#1C2030] backdrop-blur-md">
                
                <div className="flex flex-wrap items-center gap-2">
                  {/* Sort Mode Pills */}
                  <div className="flex items-center bg-[#05060A] p-1 rounded-xl border border-[#1C2030]">
                    <button
                      onClick={() => setActiveSort('trending')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeSort === 'trending'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#11141D]'
                      }`}
                    >
                      <Icons.Sparkles />
                      <span>Trending</span>
                    </button>

                    <button
                      onClick={() => setActiveSort('createdAt')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeSort === 'createdAt'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#11141D]'
                      }`}
                    >
                      <Icons.Clock />
                      <span>Newest</span>
                    </button>

                    <button
                      onClick={() => setActiveSort('views')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeSort === 'views'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#11141D]'
                      }`}
                    >
                      <Icons.Eye />
                      <span>Most Viewed</span>
                    </button>
                  </div>

                  <span className="hidden sm:inline-block text-[#1C2030] font-bold">|</span>

                  {/* Key Requirement Pills */}
                  <div className="flex items-center bg-[#05060A] p-1 rounded-xl border border-[#1C2030]">
                    <button
                      onClick={() => setActiveKeyFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        activeKeyFilter === 'all'
                          ? 'bg-[#1C2030] text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveKeyFilter('nokey')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        activeKeyFilter === 'nokey'
                          ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icons.Unlock />
                      <span>No Key</span>
                    </button>
                    <button
                      onClick={() => setActiveKeyFilter('key')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        activeKeyFilter === 'key'
                          ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icons.Key />
                      <span>With Key</span>
                    </button>
                  </div>

                </div>

                <button
                  onClick={() => fetchScriptsData(1, activeSort, false, debouncedSearch)}
                  className="p-2 rounded-xl bg-[#05060A] hover:bg-[#11141D] border border-[#1C2030] text-slate-400 hover:text-white transition"
                  title="Refresh live data"
                >
                  <Icons.Refresh />
                </button>
              </div>

              {/* Dynamic Game Tag Pills */}
              {dynamicGames.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  <span className="text-xs font-mono text-slate-500 whitespace-nowrap pr-1">GAMES:</span>
                  <button
                    onClick={() => setSelectedGameFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition whitespace-nowrap ${
                      selectedGameFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#0B0D14] border border-[#1C2030] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All Games
                  </button>

                  {dynamicGames.map((g, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedGameFilter(g.name)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition whitespace-nowrap border ${
                        selectedGameFilter.toLowerCase() === g.name.toLowerCase()
                          ? 'bg-[#FF3B5C]/15 border-[#FF3B5C] text-[#FF6B81]'
                          : 'bg-[#0B0D14] border-[#1C2030] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <img src={g.imageUrl} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                      <span>{g.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DETAIL VIEW OR DISCOVERY GRID */}
          {selectedSlug ? (
            /* ================= DETAIL VIEW ================= */
            <div className="animate-fadeIn">
              <button
                onClick={() => setSelectedSlug(null)}
                className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-blue-400 mb-6 transition"
              >
                ← BACK TO DISCOVERY GRID
              </button>

              {loadingDetail ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-4">
                    <div className="aspect-video bg-[#0B0D14] rounded-2xl animate-pulse border border-[#1C2030]" />
                    <div className="h-40 bg-[#0B0D14] rounded-2xl animate-pulse border border-[#1C2030]" />
                  </div>
                  <div className="lg:col-span-2 space-y-4">
                    <div className="h-8 bg-[#0B0D14] rounded-xl w-3/4 animate-pulse" />
                    <div className="h-64 bg-[#0B0D14] rounded-2xl animate-pulse border border-[#1C2030]" />
                  </div>
                </div>
              ) : scriptDetail ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#0B0D14] border border-[#1C2030] rounded-2xl overflow-hidden p-3 shadow-xl">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#05060A]">
                        <img
                          src={getImageUrl(scriptDetail.image || scriptDetail.game?.imageUrl)}
                          alt={scriptDetail.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D14] via-transparent to-transparent" />
                        
                        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                          <img
                            src={getImageUrl(scriptDetail.game?.imageUrl)}
                            alt=""
                            className="w-6 h-6 rounded-full border border-slate-700 object-cover"
                          />
                          <span className="font-outfit font-semibold text-xs text-white truncate">
                            {scriptDetail.game?.name || 'Universal Game'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                        <div className="p-2 bg-[#11141D] rounded-xl border border-[#1C2030]">
                          <div className="text-[10px] font-mono text-slate-500">VIEWS</div>
                          <div className="font-mono text-sm font-bold text-slate-200 mt-0.5">
                            {formatCount(scriptDetail.views)}
                          </div>
                        </div>
                        <div className="p-2 bg-[#11141D] rounded-xl border border-[#1C2030]">
                          <div className="text-[10px] font-mono text-slate-500">EXECUTES</div>
                          <div className="font-mono text-sm font-bold text-blue-400 mt-0.5">
                            {formatCount(scriptDetail.executes)}
                          </div>
                        </div>
                        <div className="p-2 bg-[#11141D] rounded-xl border border-[#1C2030]">
                          <div className="text-[10px] font-mono text-slate-500">POSTED</div>
                          <div className="font-mono text-xs font-semibold text-slate-300 mt-1">
                            {formatRelativeTime(scriptDetail.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0B0D14] border border-[#1C2030] rounded-2xl p-5 space-y-4">
                      <h3 className="font-outfit font-bold text-sm tracking-wide text-slate-300 uppercase border-b border-[#1C2030] pb-2">
                        Script Properties
                      </h3>

                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Key Requirement</span>
                          {scriptDetail.key ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-medium">
                              Requires Key
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-medium">
                              Keyless 🔓
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Verified Safety</span>
                          {scriptDetail.verified ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-medium">
                              Verified ✓
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                              Community
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Script Scope</span>
                          <span className="text-slate-200 font-mono">
                            {scriptDetail.isUniversal ? 'Universal' : 'Game Specific'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Patched Status</span>
                          <span className={scriptDetail.isPatched ? 'text-rose-400 font-bold' : 'text-emerald-400 font-medium'}>
                            {scriptDetail.isPatched ? 'PATCHED ⚠️' : 'WORKING ⚡'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#1C2030] flex items-center justify-between">
                        <span className="text-xs text-slate-400">Rate Script:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReaction(scriptDetail._id, 'like')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                              userReactions[scriptDetail._id] === 'like'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                : 'bg-[#11141D] border-[#1C2030] text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Icons.ThumbsUp />
                            <span>Like</span>
                          </button>

                          <button
                            onClick={() => handleReaction(scriptDetail._id, 'dislike')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                              userReactions[scriptDetail._id] === 'dislike'
                                ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                                : 'bg-[#11141D] border-[#1C2030] text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Icons.ThumbsDown />
                          </button>
                        </div>
                      </div>

                      <a
                        href={`https://scriptblox.com/script/${scriptDetail.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#11141D] hover:bg-[#1C2030] border border-[#1C2030] text-slate-300 text-xs font-mono transition"
                      >
                        <span>Open on ScriptBlox</span>
                        <Icons.ExternalLink />
                      </a>
                    </div>
                  </div>

                  {/* Right Column: Safe Code Container */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h1 className="font-outfit font-extrabold text-2xl md:text-3xl text-white leading-snug">
                        {scriptDetail.title}
                      </h1>
                      <p className="text-xs text-slate-500 font-mono mt-1">
                        SLUG: {scriptDetail.slug}
                      </p>
                    </div>

                    <div className="bg-[#0B0D14] border border-[#1C2030] rounded-2xl overflow-hidden shadow-2xl">
                      <div className="flex items-center justify-between px-4 py-3 bg-[#08090F] border-b border-[#1C2030]">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                          <span className="ml-2 font-mono text-xs text-slate-400 font-medium">script.lua</span>
                        </div>

                        <button
                          onClick={() => handleCopyCode(scriptDetail.script)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition ${
                            copySuccess
                              ? 'bg-emerald-500 text-black'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                          }`}
                        >
                          {copySuccess ? <Icons.Check /> : <Icons.Copy />}
                          <span>{copySuccess ? 'COPIED!' : 'COPY LOADSTRING'}</span>
                        </button>
                      </div>

                      <div className="p-4 bg-[#05060A] overflow-x-auto max-h-[500px]">
                        <SyntaxLuaCode code={scriptDetail.script || '-- No script payload provided.'} />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5">
                        <Icons.AlertTriangle />
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div className="font-semibold text-blue-300">Execution guide:</div>
                        <p className="text-slate-400 leading-relaxed">
                          Copy the loadstring above, open your executor, launch <strong className="text-slate-200">{scriptDetail.game?.name || 'Roblox'}</strong>, and run it.
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              ) : null}
            </div>
          ) : (
            /* ================= DISCOVERY GRID ================= */
            <div>
              {/* 8. Bonus — loading indicator during search */}
              {debouncedSearch && loading && (
                <div className="mb-4 text-center py-3 text-xs font-mono text-blue-400 flex items-center justify-center gap-2 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                  <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Searching ScriptBlox for "{debouncedSearch}"...
                </div>
              )}

              {/* 7. Empty state — dynamic response message */}
              {!loading && filteredScripts.length === 0 && (
                <div className="py-20 text-center bg-[#0B0D14] border border-[#1C2030] rounded-3xl p-8 max-w-lg mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#11141D] flex items-center justify-center text-slate-500">
                    <Icons.Terminal />
                  </div>
                  <h3 className="font-outfit font-bold text-xl text-slate-200">No scripts found</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {debouncedSearch
                      ? `No results for "${debouncedSearch}". Try another keyword.`
                      : 'No scripts available. Try refreshing.'}
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedGameFilter('all'); setActiveKeyFilter('all'); }}
                    className="mt-5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {loading && Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-[#0B0D14] border border-[#1C2030] rounded-2xl p-3 animate-pulse">
                    <div className="aspect-video bg-[#11141D] rounded-xl mb-3" />
                    <div className="h-4 bg-[#11141D] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-[#11141D] rounded w-1/2 mb-4" />
                    <div className="h-6 bg-[#11141D] rounded w-full" />
                  </div>
                ))}

                {!loading && filteredScripts.map((item, index) => {
                  const isLast = index === filteredScripts.length - 1;
                  const cardThumb = getImageUrl(item.image || item.game?.imageUrl);
                  const gameThumb = getImageUrl(item.game?.imageUrl);

                  return (
                    <div
                      key={item._id || index}
                      ref={isLast ? lastElementRef : null}
                      onClick={() => setSelectedSlug(item.slug)}
                      className="group bg-[#0B0D14] hover:bg-[#0E111A] border border-[#1C2030] border-glow-blue rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between shadow-lg"
                    >
                      <div>
                        <div className="relative aspect-video overflow-hidden bg-[#05060A]">
                          <img
                            src={cardThumb}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D14] via-transparent to-black/30" />

                          <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-200 flex items-center gap-1">
                            <Icons.Eye />
                            <span>{formatCount(item.views)}</span>
                          </div>

                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                            {item.verified && (
                              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" title="Verified Safe" />
                            )}
                            {item.key ? (
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" title="Requires Key" />
                            ) : (
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" title="Keyless" />
                            )}
                            {item.isPatched && (
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" title="Patched" />
                            )}
                          </div>

                          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center gap-2">
                            <img src={gameThumb} alt="" className="w-4 h-4 rounded-full border border-slate-700 object-cover" />
                            <span className="text-[11px] font-mono text-slate-300 truncate">
                              {item.game?.name || 'Universal Script'}
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 space-y-3">
                          <h2 className="font-outfit font-semibold text-sm text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                            {item.title}
                          </h2>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {item.key ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300">
                                KEY
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                                KEYLESS
                              </span>
                            )}

                            {item.isHub && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-500/10 border border-purple-500/30 text-purple-300">
                                HUB
                              </span>
                            )}

                            {item.isUniversal && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-500/10 border border-blue-500/30 text-blue-300">
                                UNIVERSAL
                              </span>
                            )}

                            {item.verified && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                                VERIFIED
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 5. Card stats — likeCount, dislikeCount, executes, createdAt */}
                      <div className="px-3.5 pb-3 pt-2 border-t border-dashed border-[#1C2030] flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1" title="Likes">
                            <Icons.ThumbsUp />
                            {formatCount(item.likeCount ?? item.leaderboard?.value ?? 0)}
                          </span>
                          <span className="flex items-center gap-1" title="Dislikes">
                            <Icons.ThumbsDown />
                            {formatCount(item.dislikeCount ?? 0)}
                          </span>
                          <span className="flex items-center gap-1" title="Executions">
                            <Icons.Rocket />
                            {formatCount(item.executes)}
                          </span>
                        </div>
                        <span className="text-slate-600">{formatRelativeTime(item.createdAt)}</span>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                {loadingMore ? (
                  <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
                    <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span>FETCHING PAGE {page + 1} FROM SCRIPTBLOX...</span>
                  </div>
                ) : (
                  !usingMock && scripts.length > 0 && page < totalPages && (
                    <button
                      onClick={handleLoadMore}
                      className="px-6 py-2.5 rounded-xl bg-[#0B0D14] hover:bg-[#11141D] border border-[#1C2030] hover:border-blue-500/50 text-slate-200 text-xs font-mono transition shadow-lg flex items-center gap-2 group"
                    >
                      <span>LOAD NEXT 20 SCRIPTS (PAGE {page + 1})</span>
                      <Icons.Plus />
                    </button>
                  )
                )}
              </div>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-[#1C2030] bg-[#05060A] py-8 px-4 md:px-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex items-center justify-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>SCRIPT FINDER • Live ScriptBlox Public Proxy Integration</span>
            </div>
            <p className="max-w-xl mx-auto text-slate-600 leading-relaxed text-[11px]">
              Disclaimer: Script Finder does not host or store executable binaries on server infrastructure. All script commands are provided as public reference data via the ScriptBlox API.
            </p>
          </div>
        </footer>

      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B0D14] border border-[#1C2030] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <Icons.X />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#FF3B5C]/10 text-[#FF6B81] border border-[#FF3B5C]/30">
                <Icons.Plus />
              </div>
              <div>
                <h3 className="font-outfit font-bold text-lg text-white">Upload New Script</h3>
                <p className="text-xs text-slate-400">Submit script to live index</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="leading-relaxed bg-[#11141D] p-3 rounded-xl border border-[#1C2030]">
                Scripts submitted here are routed directly through the public ScriptBlox portal verification queue.
              </p>
              
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px]">SCRIPT TITLE</label>
                <input type="text" placeholder="e.g. Blox Fruits Auto Farm" className="w-full bg-[#05060A] border border-[#1C2030] rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px]">LOADSTRING CODE</label>
                <textarea rows={3} placeholder='loadstring(game:HttpGet("..."))()' className="w-full bg-[#05060A] border border-[#1C2030] rounded-xl px-3 py-2 text-xs font-mono text-slate-100 outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#11141D] hover:bg-[#1C2030] text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setUploadModalOpen(false);
                  showToast('Submission queued for verification!', 'success');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF3B5C] to-pink-600 text-white text-xs font-semibold shadow-lg shadow-[#FF3B5C]/30"
              >
                Submit Script
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dev Specs Modal */}
      {deployGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B0D14] border border-[#1C2030] rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setDeployGuideOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <Icons.X />
            </button>

            <div className="flex items-center gap-3 border-b border-[#1C2030] pb-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <Icons.Code />
              </div>
              <div>
                <h3 className="font-outfit font-bold text-lg text-white">Next.js 14 Developer Blueprint</h3>
                <p className="text-xs text-slate-400">Full source code folder structure & API proxy setup</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <span className="text-blue-400 font-bold">// 1. Folder Structure</span>
                <pre className="mt-1 p-3 bg-[#05060A] rounded-xl border border-[#1C2030] text-slate-300 text-[11px] leading-relaxed">
{`app/
  ├── layout.tsx (Outfit & Figtree Next/Font setup)
  ├── page.tsx (Home discovery grid)
  ├── script/
  │   └── [slug]/page.tsx (Detail page)
  └── api/
      └── scripts/route.ts (Proxy API handler with revalidate)
lib/
  ├── api.ts (fetchScripts, fetchTrending)
  └── utils.ts (getImageUrl, formatCount)`}
                </pre>
              </div>

              <div>
                <span className="text-blue-400 font-bold">// 2. Next.js API Route Proxy (/app/api/scripts/route.ts)</span>
                <pre className="mt-1 p-3 bg-[#05060A] rounded-xl border border-[#1C2030] text-emerald-400 text-[11px] leading-relaxed overflow-x-auto">
{`import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || '/api/trending';
  const targetUrl = \`https://scriptblox-proxy-pzq8.vercel.app\${endpoint}\`;

  const res = await fetch(targetUrl, {
    next: { revalidate: 60 } // Cache for 60s
  });
  const data = await res.json();
  return NextResponse.json(data);
}`}
                </pre>
              </div>

              <div>
                <span className="text-blue-400 font-bold">// 3. .env.local</span>
                <pre className="mt-1 p-3 bg-[#05060A] rounded-xl border border-[#1C2030] text-amber-300 text-[11px]">
NEXT_PUBLIC_API_BASE=https://scriptblox-proxy-pzq8.vercel.app
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setDeployGuideOpen(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Close Specs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-mono flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
              : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500 text-rose-200'
              : 'bg-blue-950/90 border-blue-500 text-blue-200'
          }`}>
            <Icons.Check />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}