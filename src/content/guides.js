// Editorial guides — Chocly's authority layer. Each guide is structured
// content rendered server-side with Article JSON-LD. Add a guide here and it
// automatically appears at /guides/[slug], in the guides index, and in the
// sitemap.
//
// Editorial voice: knowledgeable friend, not encyclopedia. Every guide should
// answer the questions people actually type, state concrete facts an AI
// engine can extract, and link into Chocly's own category/maker pages.

export const guides = [
  {
    slug: 'madagascar-chocolate-guide',
    title: 'Madagascar Chocolate: Why It Tastes Like Red Fruit',
    description:
      'Why Madagascar chocolate is famous for raspberry and citrus notes: the Sambirano Valley, Criollo-Trinitario genetics, and what to look for on the label.',
    updated: '2026-07-07',
    heroEmoji: '🍓',
    sections: [
      {
        heading: 'The short answer',
        body: [
          'Madagascar chocolate tastes noticeably bright — think raspberry, cherry, citrus, sometimes a wine-like tang — because of where and how its cacao grows. Most Malagasy cacao comes from the Sambirano Valley in the island’s northwest, where old Criollo and Trinitario hybrid trees, mineral-rich alluvial river soil, and careful fermentation produce beans with unusually high fruity acidity.',
          'If you’ve only ever had mass-market dark chocolate, a good Madagascar bar is the fastest way to understand why people talk about chocolate the way they talk about wine.',
        ],
      },
      {
        heading: 'Where the flavor comes from',
        body: [
          'Three things stack up. First, genetics: the Sambirano Valley is one of the few places outside the Americas growing significant amounts of ancient Criollo and fine Trinitario varieties, prized for delicate, complex flavor rather than yield. Second, terroir: the valley’s rivers deposit mineral-rich soil, and its microclimate lets cacao ripen slowly. Third, fermentation: Madagascar’s better estates ferment in small, carefully-turned batches, which preserves the fruit-forward acids that industrial processing typically flattens out.',
          'The result is chocolate with pronounced brightness — tasters consistently report red berry, dried fruit, and citrus notes even in bars with nothing added but cacao and sugar.',
        ],
      },
      {
        heading: 'What to look for on the label',
        body: [
          'Look for "Sambirano" or "Madagascar" as a stated bean origin (not just where the bar was made), a cacao percentage between 65% and 75% for the clearest fruit expression, and a short ingredient list: cacao, sugar, maybe cocoa butter. Bars labeled "single origin" or "single estate" tell you the maker considered the beans worth showcasing rather than blending away.',
          'Higher percentages (85%+) trade some of the fruitiness for intensity; milk chocolate made with Malagasy beans is rarer but can taste like chocolate-covered berries.',
        ],
      },
      {
        heading: 'Quick facts',
        facts: [
          ['Main growing region', 'Sambirano Valley, northwest Madagascar'],
          ['Typical varieties', 'Criollo and Trinitario hybrids'],
          ['Signature tasting notes', 'Raspberry, cherry, citrus, red wine'],
          ['Sweet spot to try first', '65–75% dark, single origin'],
          ['Compare against', 'Ghana (classic fudgy cocoa) or Ecuador (floral)'],
        ],
      },
    ],
    related: [
      { label: 'Browse Madagascar chocolate on Chocly', href: '/category/origin/madagascar' },
      { label: 'What does cacao percentage mean?', href: '/guides/cacao-percentage-explained' },
      { label: 'Best dark chocolate', href: '/category/type/dark' },
    ],
  },
  {
    slug: 'cacao-percentage-explained',
    title: 'What Does Cacao Percentage Actually Mean?',
    description:
      'What 70% on a chocolate bar really measures, why two 70% bars can taste completely different, and how to pick a percentage you’ll actually enjoy.',
    updated: '2026-07-07',
    heroEmoji: '🎯',
    sections: [
      {
        heading: 'The short answer',
        body: [
          'The percentage on a chocolate bar is the share of the bar, by weight, that comes from the cacao bean — cocoa solids plus cocoa butter combined. A 70% bar is 70% cacao-derived material; most of the remaining 30% is sugar. It is a measure of how much of the bar is chocolate, not how good, how bitter, or how healthy it is.',
        ],
      },
      {
        heading: 'Why two 70% bars taste nothing alike',
        body: [
          'Because the number hides the ratio inside it. "70% cacao" could be 50% cocoa solids and 20% added cocoa butter (smooth, mellow, round) or nearly all ground whole beans (intense, complex). It also says nothing about which beans: a 70% Madagascar bar can taste like raspberries while a 70% Ghana bar tastes like deep fudge, purely because of origin and fermentation.',
          'This is why serious chocolate lovers stop shopping by percentage alone and start paying attention to origin and maker — the two things the number can’t tell you.',
        ],
      },
      {
        heading: 'A practical guide to picking your number',
        body: [
          'Under 50%: milk chocolate territory — dairy and sugar share the stage. 55–65%: approachable dark, sweet enough for milk-chocolate fans crossing over. 65–75%: the fine-chocolate sweet spot, where origin character shows most clearly with enough sugar to carry it. 80–90%: intense, best eaten slowly, rewards palates that already love dark. 100%: pure cacao, no sugar at all — bracing, but revelatory from a great origin.',
        ],
      },
      {
        heading: 'Quick facts',
        facts: [
          ['What the % measures', 'Cocoa solids + cocoa butter, by weight'],
          ['What it does NOT measure', 'Quality, bitterness, bean origin, or ethics'],
          ['Most of the remainder', 'Sugar'],
          ['Fine-chocolate sweet spot', '65–75%'],
          ['Legal minimum for "dark" (US)', 'No fixed %; "sweet/semisweet" needs 35% chocolate liquor'],
        ],
      },
    ],
    related: [
      { label: 'Browse 70% chocolate', href: '/category/percentage/70' },
      { label: 'Browse 85% chocolate', href: '/category/percentage/85' },
      { label: 'Madagascar chocolate guide', href: '/guides/madagascar-chocolate-guide' },
    ],
  },
  {
    slug: 'bean-to-bar-explained',
    title: 'Bean-to-Bar vs. Mass-Market Chocolate: A Field Guide',
    description:
      'What "bean-to-bar" and "craft chocolate" actually mean, how they differ from industrial chocolate, and how to spot the real thing on a shelf.',
    updated: '2026-07-07',
    heroEmoji: '🫘',
    sections: [
      {
        heading: 'The short answer',
        body: [
          '"Bean-to-bar" means one maker controls the whole journey from raw cacao beans to finished bar: sourcing, roasting, grinding, conching, tempering. Mass-market chocolate is usually made from pre-processed industrial chocolate liquor or couverture bought in bulk. The difference shows up in flavor (distinctive vs. deliberately uniform), sourcing (often direct-trade, single-origin) and price.',
        ],
      },
      {
        heading: 'Why it matters for flavor',
        body: [
          'Industrial chocolate is engineered for consistency: high-yield cacao (mostly bulk Forastero from West Africa), heavy roasting to standardize flavor, and recipes designed to taste identical batch after batch. That’s an achievement — but it erases everything that makes cacao interesting.',
          'Craft makers do the opposite. They buy beans for their character, roast lighter to preserve it, and adjust each batch to showcase the origin. It’s the difference between a single-vineyard wine and a reliable house blend.',
        ],
      },
      {
        heading: 'How to spot real bean-to-bar on a shelf',
        body: [
          'Signals worth trusting: a stated bean origin (country, region, or estate), a short ingredient list (cacao, sugar, cocoa butter — little else), a maker who talks about harvests or farm partners, and often a roast date or batch number. Signals that mean little: "premium," "artisanal," or "handcrafted" with no origin stated, and packaging romance with a 40-ingredient list.',
          'Price is a signal too: genuinely craft bars usually cost more because fine cacao pays farmers a multiple of commodity prices — that premium is most of what you’re paying for.',
        ],
      },
      {
        heading: 'Quick facts',
        facts: [
          ['Bean-to-bar means', 'One maker processes raw beans into finished bars'],
          ['Mass-market means', 'Bars made from bulk industrial chocolate'],
          ['Flavor goal: craft', 'Showcase the origin’s character'],
          ['Flavor goal: industrial', 'Identical taste in every batch'],
          ['Trust signals', 'Stated origin, short ingredients, batch info, direct trade'],
        ],
      },
    ],
    related: [
      { label: 'Browse makers A–Z', href: '/maker' },
      { label: 'What does cacao percentage mean?', href: '/guides/cacao-percentage-explained' },
      { label: 'Browse all chocolate', href: '/browse' },
    ],
  },
];

export function getGuide(slug) {
  return guides.find((g) => g.slug === slug) || null;
}
