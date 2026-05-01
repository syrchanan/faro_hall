import React from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import styles from '../src/styles/rules.module.css';

const TERMS = [
  {
    term: 'Soda',
    desc: 'The very first card turned face-up from the deck at the start of the game. No bets are settled on the soda card — it simply reveals one card and is tracked on the casekeeper.',
  },
  {
    term: 'Hock (Last Turn)',
    desc: 'The final card remaining in the deck after all turns have been dealt. Like the soda, no bets are settled on the hock card. When only one card remains, the game ends.',
  },
  {
    term: 'Coppering',
    desc: 'Placing a copper token on top of your bet to reverse its meaning. A coppered bet wins when its rank appears as the loser card instead of the winner — letting players bet against a rank.',
  },
  {
    term: 'Split (Doublet)',
    desc: 'When the loser and winner cards in a single turn share the same rank. In a split, the house takes half of all bets placed on that rank.',
  },
  {
    term: 'Casekeeper (Case-keep)',
    desc: 'A device that tracks how many cards of each rank have been drawn. With 4 cards per rank in the deck, the casekeeper shows remaining card counts, helping players make informed bets.',
  },
];

const STEPS: Array<{
  label: string;
  content?: React.ReactNode;
  subItems?: React.ReactNode[];
}> = [
  {
    label: 'Start',
    content: <>The deck is shuffled. The top card is turned face-up as the <em>soda</em> card — no bets resolve on it.</>,
  },
  {
    label: 'Place Bets',
    content: <>Players select a rank on the betting board and place chips. Optionally toggle <em>copper</em> to bet against that rank.</>,
  },
  {
    label: 'Deal',
    content: <>The banker draws two cards — the first is the <strong>loser</strong>, the second is the <strong>winner</strong>.</>,
  },
  {
    label: 'Resolve',
    subItems: [
      <>Bets on the <strong>winner&apos;s rank</strong> win and pay even money (1:1).</>,
      <>Bets on the <strong>loser&apos;s rank</strong> lose — the house keeps the stake.</>,
      <>Bets on <strong>other ranks</strong> remain on the board untouched for the next turn.</>,
      <><strong>Coppered</strong> bets reverse win/loss — winning when the rank is the loser.</>,
      <><strong>Splits</strong> — both cards share the same rank; house takes half the bet.</>,
    ],
  },
  {
    label: 'Repeat',
    content: <>Continue until only one card remains (the <em>hock</em>). The game is over.</>,
  },
];

const TIPS = [
  'Watch the casekeeper — bet on ranks with more remaining cards for better odds.',
  'Avoid ranks that are "dead" (all 4 cards already drawn).',
  'Use coppering strategically when you believe a rank is more likely to appear as the loser.',
  'Splits hurt — be cautious betting on ranks with exactly 2 remaining cards.',
];

const Rules: NextPage = () => {
  return (
    <div className="faro-app">
      <header className="faro-header">
        <h1 className="faro-title">Faro Hall — Rules</h1>
        <Link href="/" className="faro-btn">Back to Game</Link>
      </header>

      <main className={styles.rulesContent}>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Overview</h2>
          <p className={styles.body}>
            Faro is one of the oldest banking card games, popular in saloons and gambling halls from the 18th through early 20th centuries. The game is played between a <strong>banker</strong> (the house) and one or more <strong>punters</strong> (players) using a standard 52-card deck.
          </p>
          <p className={styles.body}>
            The object is to bet on which <strong>rank</strong> (Ace through King) will appear as the winning card each turn. The banker draws two cards per turn — the first is the <strong>loser</strong>, the second is the <strong>winner</strong>.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Key Terms</h2>
          <dl className={styles.termList}>
            {TERMS.map(({ term, desc }) => (
              <div key={term} className={styles.termItem}>
                <dt className={styles.term}>{term}</dt>
                <dd className={styles.desc}>{desc}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>How to Play</h2>
          <ol className={styles.stepList}>
            {STEPS.map(({ label, content, subItems }, i) => (
              <li key={label} className={styles.step}>
                <span className={styles.stepNum}>{i + 1}</span>
                <div className={styles.stepBody}>
                  <strong>{label}:</strong>{content && <> {content}</>}
                  {subItems && (
                    <ul className={styles.subList}>
                      {subItems.map((item, j) => (
                        <li key={j} className={styles.subItem}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>The Casekeeper</h2>
          <p className={styles.body}>
            The casekeeper tracks the 13 ranks (A through K), each with 4 cards in the deck. As cards are drawn each turn, the count updates. This is the most important tool for serious Faro players — knowing which ranks still have cards in the deck directly informs betting strategy.
          </p>
          <p className={styles.body}>
            For example, if 3 of the 4 Kings have already been drawn, there is only one King left in the deck. Betting on King is risky (low chance of appearing) but the information helps you weigh the odds.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Strategy Tips</h2>
          <ul className={styles.tipList}>
            {TIPS.map((tip) => (
              <li key={tip} className={styles.tip}>
                <span className={styles.tipDot} aria-hidden="true" />
                {tip}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.cta}>
          <Link href="/" className="faro-btn btn-deal">Play Faro</Link>
        </section>

      </main>
    </div>
  );
};

export default Rules;
