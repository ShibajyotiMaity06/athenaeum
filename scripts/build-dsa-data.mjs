import fs from 'node:fs';
import path from 'node:path';

const dsaDir = path.join(process.cwd(), 'dsa');
const outDir = path.join(process.cwd(), 'data');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function titleFromSlug(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function detectPlatform(url) {
  if (url.includes('leetcode.com')) return 'LeetCode';
  if (url.includes('codeforces.com')) return 'Codeforces';
  if (url.includes('cses.fi')) return 'CSES';
  if (url.includes('geeksforgeeks.org')) return 'GeeksforGeeks';
  if (url.includes('spoj.com')) return 'SPOJ';
  if (url.includes('atcoder.jp')) return 'AtCoder';
  return 'Competitive';
}

function cleanTitle(rawTitle, url) {
  let t = (rawTitle || '').trim();
  t = t.replace(/^(\d+[\.\:\)]?|\-|\*)\s*/, '');
  t = t.replace(/^(LeetCode\s*\d+[\.\:\)]?|Codeforces\s*[A-Z0-9]+[\.\:\)]?|CSES[\.\:\)]?)\s*/i, '');
  t = t.replace(/\s*\(\s*Do only when all above are green\s*\)/i, '');
  t = t.replace(/\s*\d+\s*\/\s*\d+/g, '');
  t = t.trim();

  if (t && !t.startsWith('http') && t.length > 1) {
    return t;
  }

  const lcMatch = url.match(/problems\/([^\/\?#]+)/);
  if (lcMatch) return titleFromSlug(lcMatch[1]);
  const cfMatch = url.match(/problem\/([^\/]+)\/([^\/]+)/);
  if (cfMatch) return `Codeforces ${cfMatch[1]}${cfMatch[2]}`;
  const csesMatch = url.match(/task\/(\d+)/);
  if (csesMatch) return `CSES Task #${csesMatch[1]}`;
  const gfgMatch = url.match(/problems\/([^\/\?#]+)/);
  if (gfgMatch) return gfgMatch[1].replace(/[-_]/g, ' ');
  return url;
}

// 1. All DSA (dsa.txt)
const dsaRaw = fs.readFileSync(path.join(dsaDir, 'dsa.txt'), 'utf8');
const dsaLines = dsaRaw.split('\n').map((l) => l.trim()).filter(Boolean);
const allDsa = [];
for (let i = 0; i < dsaLines.length; i++) {
  const line = dsaLines[i];
  const m = line.match(/^(\d+)\.\s*(https?:\/\/[^\s]+)/);
  if (m) {
    const num = parseInt(m[1], 10);
    const url = m[2];
    allDsa.push({
      id: `all-${num}`,
      index: num,
      title: cleanTitle('', url),
      url,
      platform: detectPlatform(url),
      category: 'Curated 316 Problems'
    });
  }
}

// 2. Google Top Questions (google.txt)
const googleRaw = fs.readFileSync(path.join(dsaDir, 'google.txt'), 'utf8');
const googleBlocks = googleRaw.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
const googleQuestions = [];
let googleIdx = 1;
for (const block of googleBlocks) {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length >= 2) {
    const titleMatch = lines[0].match(/^(\d+)\.\s*(.+)/);
    const title = titleMatch ? titleMatch[2] : lines[0];
    const acc = lines.find((l) => l.includes('%')) || '';
    const diff = lines.find((l) => /^(Easy|Med\.?|Medium|Hard)$/i.test(l)) || 'Medium';
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const url = `https://leetcode.com/problems/${slug}/`;
    googleQuestions.push({
      id: `google-${googleIdx}`,
      index: googleIdx,
      title,
      url,
      platform: 'LeetCode',
      difficulty: diff.replace('Med.', 'Medium'),
      acceptance: acc,
      category: 'Top Google Questions'
    });
    googleIdx++;
  }
}

// 3. Dynamic Programming (dp.txt)
const dpRaw = fs.readFileSync(path.join(dsaDir, 'dp.txt'), 'utf8');
const dpLines = dpRaw.split('\n').map((l) => l.trim()).filter(Boolean);
const dpQuestions = [];
let currentDpCat = 'Core Dynamic Programming';

for (const line of dpLines) {
  if (
    [
      'BitMask DP',
      'Digit DP',
      'Meet-in-the-middle',
      'Leetcode Medium',
      'Leetcode Hard',
      'CP Problems',
      'Best Time to Buy and Sell Stock'
    ].some((c) => line.includes(c))
  ) {
    if (line.includes('Best Time to Buy and Sell Stock') && !line.includes('http')) {
      currentDpCat = 'Buy & Sell Stock Series';
    } else if (line.includes('BitMask DP')) {
      currentDpCat = 'BitMask DP';
    } else if (line.includes('Digit DP')) {
      currentDpCat = 'Digit DP';
    } else if (line.includes('Meet-in-the-middle')) {
      currentDpCat = 'Meet In The Middle DP';
    } else if (line.includes('Leetcode Medium')) {
      currentDpCat = 'LeetCode Medium DP';
    } else if (line.includes('Leetcode Hard')) {
      currentDpCat = 'LeetCode Hard DP';
    } else if (line.includes('CP Problems')) {
      currentDpCat = 'Competitive Programming DP';
    }
    if (!line.includes('http')) continue;
  }
  if (line.includes('CSES Problem Set') || line.includes('You can find solutions')) {
    currentDpCat = 'CSES DP Problem Set';
    continue;
  }
  if (line.includes('github.com/shivam-bhadani')) continue;

  const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
  if (urlMatch) {
    const url = urlMatch[1];
    const rawTitle = line.replace(url, '').trim();
    dpQuestions.push({
      id: `dp-${dpQuestions.length + 1}`,
      index: dpQuestions.length + 1,
      title: cleanTitle(rawTitle, url),
      url,
      platform: detectPlatform(url),
      category: currentDpCat
    });
  }
}

// 4. Graph (graph.txt - deduplicated)
const graphRaw = fs.readFileSync(path.join(dsaDir, 'graph.txt'), 'utf8');
const graphLines = graphRaw.split('\n').map((l) => l.trim()).filter(Boolean);
const graphQuestions = [];
const seenGraphUrls = new Set();
let currentGraphCat = 'Graph Medium 1';

for (const line of graphLines) {
  if (line === 'Easy') {
    currentGraphCat = 'Graph Easy';
    continue;
  } else if (line.startsWith('Medium 1')) {
    currentGraphCat = 'Graph Medium 1';
    continue;
  } else if (line.startsWith('Medium 2')) {
    currentGraphCat = 'Graph Medium 2';
    continue;
  } else if (line.startsWith('Hard 1')) {
    currentGraphCat = 'Graph Hard 1';
    continue;
  } else if (line.startsWith('Hard 2')) {
    currentGraphCat = 'Graph Hard 2';
    continue;
  } else if (line.includes('Optional')) {
    currentGraphCat = 'Graph Optional / Advanced';
    continue;
  }

  const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
  if (urlMatch) {
    const url = urlMatch[1];
    const normUrl = url.replace(/\/description\/?$/, '').replace(/\/$/, '');
    if (seenGraphUrls.has(normUrl)) continue;
    seenGraphUrls.add(normUrl);

    const isPremium = line.includes('(Premium)');
    let rawTitle = line.replace(url, '').replace(/^\(Premium\)\s*/i, '').trim();

    graphQuestions.push({
      id: `graph-${graphQuestions.length + 1}`,
      index: graphQuestions.length + 1,
      title: cleanTitle(rawTitle, url),
      url,
      platform: detectPlatform(url),
      category: currentGraphCat,
      premium: isPremium
    });
  }
}

// 5. Segment Tree (segment.txt)
const segRaw = fs.readFileSync(path.join(dsaDir, 'segment.txt'), 'utf8');
const segLines = segRaw.split('\n').map((l) => l.trim()).filter(Boolean);
const segmentQuestions = [];
const seenSegUrls = new Set();

for (const line of segLines) {
  if (line.includes('Segment Tree') || line.includes('Description:')) continue;
  const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
  if (urlMatch) {
    const url = urlMatch[1];
    const normUrl = url.replace(/\/$/, '');
    if (seenSegUrls.has(normUrl)) continue;
    seenSegUrls.add(normUrl);

    const rawTitle = line.replace(url, '').trim();
    segmentQuestions.push({
      id: `segment-${segmentQuestions.length + 1}`,
      index: segmentQuestions.length + 1,
      title: cleanTitle(rawTitle, url),
      url,
      platform: detectPlatform(url),
      category: 'Segment Tree & Range Queries'
    });
  }
}

// 6. Binary Search (binary.txt)
const binRaw = fs.readFileSync(path.join(dsaDir, 'binary.txt'), 'utf8');
const binLines = binRaw.split('\n').map((l) => l.trim()).filter(Boolean);
const binaryQuestions = [];
let currentBinCat = 'Binary Search on Array';

for (const line of binLines) {
  if (line.includes('7.1 Binary Search on Array')) {
    currentBinCat = 'Binary Search on Array';
    continue;
  } else if (line.includes('7.2 Binary Search on Answer')) {
    currentBinCat = 'Binary Search on Answer';
    continue;
  }
  if (line.includes('Description:') || line === '16') continue;

  const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
  if (urlMatch) {
    const url = urlMatch[1];
    const rawTitle = line.replace(url, '').trim();
    binaryQuestions.push({
      id: `binary-${binaryQuestions.length + 1}`,
      index: binaryQuestions.length + 1,
      title: cleanTitle(rawTitle, url),
      url,
      platform: detectPlatform(url),
      category: currentBinCat
    });
  }
}

// 7. Top 10 Greedy (greedy.txt)
const greedyRaw = fs.readFileSync(path.join(dsaDir, 'greedy.txt'), 'utf8');
const greedyLines = greedyRaw.split('\n').map((l) => l.trim()).filter(Boolean);
const greedyQuestions = [];
for (const line of greedyLines) {
  const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
  if (urlMatch) {
    const url = urlMatch[1];
    const rawTitle = line.replace(url, '').trim();
    greedyQuestions.push({
      id: `greedy-${greedyQuestions.length + 1}`,
      index: greedyQuestions.length + 1,
      title: cleanTitle(rawTitle, url),
      url,
      platform: detectPlatform(url),
      category: 'Top 10 Greedy'
    });
  }
}

// 8. Top 10 Two Pointers (two.txt)
const twoRaw = fs.readFileSync(path.join(dsaDir, 'two.txt'), 'utf8');
const twoLines = twoRaw.split('\n').map((l) => l.trim()).filter(Boolean);
const twoQuestions = [];
for (const line of twoLines) {
  const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
  if (urlMatch) {
    const url = urlMatch[1];
    const rawTitle = line.replace(url, '').trim();
    twoQuestions.push({
      id: `two-${twoQuestions.length + 1}`,
      index: twoQuestions.length + 1,
      title: cleanTitle(rawTitle, url),
      url,
      platform: detectPlatform(url),
      category: 'Top 10 Two Pointers'
    });
  }
}

// 9. Top 10 Sliding Window (sliding.txt)
const slidingRaw = fs.readFileSync(path.join(dsaDir, 'sliding.txt'), 'utf8');
const slidingLines = slidingRaw.split('\n').map((l) => l.trim()).filter(Boolean);
const slidingQuestions = [];
for (const line of slidingLines) {
  const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
  if (urlMatch) {
    const url = urlMatch[1];
    const rawTitle = line.replace(url, '').trim();
    slidingQuestions.push({
      id: `sliding-${slidingQuestions.length + 1}`,
      index: slidingQuestions.length + 1,
      title: cleanTitle(rawTitle, url),
      url,
      platform: detectPlatform(url),
      category: 'Top 10 Sliding Window'
    });
  }
}

// 10. Top Medium LeetCode Questions (medium.txt)
const medRaw = fs.readFileSync(path.join(dsaDir, 'medium.txt'), 'utf8');
const medBlocks = medRaw.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
const mediumQuestions = [];
let medIdx = 1;
for (const block of medBlocks) {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length >= 1) {
    const urlMatch = lines[0].match(/(https?:\/\/[^\s]+)/);
    const url = urlMatch ? urlMatch[1] : '';
    const titlePart = lines[0].replace(url, '').trim();
    const titleMatch = titlePart.match(/^(\d+)\.\s*(.+)/);
    const title = titleMatch ? titleMatch[2] : titlePart;
    const acc = lines.find((l) => l.includes('%')) || '';
    const diff = lines.find((l) => /^(Easy|Med\.?|Medium|Hard)$/i.test(l)) || 'Medium';

    mediumQuestions.push({
      id: `medium-${medIdx}`,
      index: medIdx,
      title: cleanTitle(title, url),
      url: url || `https://leetcode.com/problems/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`,
      platform: 'LeetCode',
      difficulty: diff.replace('Med.', 'Medium'),
      acceptance: acc,
      category: 'Top Medium LeetCode'
    });
    medIdx++;
  }
}

const dsaData = {
  tracks: [
    {
      id: 'all',
      name: 'All 316 Curated DSA',
      shortName: 'All 316',
      badge: 'COMPLETE COLLECTION',
      description: '316 Handpicked high-yield LeetCode problems covering all core data structures and algorithmic paradigms.',
      count: allDsa.length,
      questions: allDsa
    },
    {
      id: 'google',
      name: 'Top Google Questions',
      shortName: 'Top Google',
      badge: 'TOP TIER-1 COMPANY',
      description: '50 Most frequent LeetCode questions asked in Google SWE technical rounds with acceptance rates and difficulties.',
      count: googleQuestions.length,
      questions: googleQuestions
    },
    {
      id: 'dp',
      name: 'Dynamic Programming Top Questions',
      shortName: 'DP Masterclass',
      badge: 'SYSTEMATIC PATTERNS',
      description: 'Comprehensive DP problems categorized by Core DP, Stock series, Grid 2D, Bitmask, Digit DP, Meet-in-the-Middle, CSES, and CP.',
      count: dpQuestions.length,
      questions: dpQuestions
    },
    {
      id: 'graph',
      name: 'Graph Top Questions',
      shortName: 'Graph & Trees',
      badge: 'DEDUPLICATED SET',
      description: 'Essential graph interview problems spanning BFS, DFS, Dijkstra, Topo Sort, Union-Find, and MST sorted Easy to Hard.',
      count: graphQuestions.length,
      questions: graphQuestions
    },
    {
      id: 'segment',
      name: 'Segment Tree & Range Queries',
      shortName: 'Segment Tree',
      badge: 'ADVANCED DATA STRUCTURE',
      description: 'Segment Tree, Fenwick/BIT, and range update query problems across LeetCode, Codeforces, and CSES.',
      count: segmentQuestions.length,
      questions: segmentQuestions
    },
    {
      id: 'binary',
      name: 'Binary Search Mastery',
      shortName: 'Binary Search',
      badge: 'O(LOG N) PARADIGMS',
      description: 'Binary search on sorted arrays and optimal value discovery via binary search on answer space.',
      count: binaryQuestions.length,
      questions: binaryQuestions
    },
    {
      id: 'greedy',
      name: 'Top 10 Greedy Questions',
      shortName: 'Top 10 Greedy',
      badge: 'HIGH-FREQUENCY',
      description: 'Top 10 fundamental greedy choice and interval scheduling problems across LeetCode and CSES.',
      count: greedyQuestions.length,
      questions: greedyQuestions
    },
    {
      id: 'two-pointers',
      name: 'Top 10 Two Pointers',
      shortName: 'Two Pointers',
      badge: 'TWO-POINTER PATTERN',
      description: 'Top 10 two-pointer and dual index optimization problems for array and string interviews.',
      count: twoQuestions.length,
      questions: twoQuestions
    },
    {
      id: 'sliding-window',
      name: 'Top 10 Sliding Window',
      shortName: 'Sliding Window',
      badge: 'WINDOW EXPANSION',
      description: 'Top 10 fixed and dynamic sliding window problems for substring and subarray queries.',
      count: slidingQuestions.length,
      questions: slidingQuestions
    },
    {
      id: 'medium',
      name: 'Top Medium Questions in LeetCode',
      shortName: 'LeetCode Mediums',
      badge: '59 HIGH-YIELD PROBLEMS',
      description: 'The definitive list of 59 top medium-tier LeetCode interview questions with verified acceptance rates.',
      count: mediumQuestions.length,
      questions: mediumQuestions
    }
  ]
};

const totalQuestions = dsaData.tracks.reduce((sum, t) => sum + t.count, 0);

fs.writeFileSync(path.join(outDir, 'dsa.json'), JSON.stringify(dsaData, null, 2), 'utf8');

console.log(`✅ Successfully generated data/dsa.json with ${dsaData.tracks.length} tracks and ${totalQuestions} total questions!`);
dsaData.tracks.forEach((t) => console.log(` - ${t.name}: ${t.count} questions`));
