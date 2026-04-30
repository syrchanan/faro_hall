import React from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';

const Rules: NextPage = () => {
  return (
    <div className="faro-app">
      <header className="faro-header">
        <h1 className="faro-title">Faro Hall — Rules</h1>
        <Link href="/" className="faro-btn">Back to Game</Link>
      </header>

      <main className="container" style={{ color: '#e8dcc8', maxWidth: 800 }}>
        <section>
          <h2>Overview</h2>
          <p>
            Faro is one of the oldest banking card games, popular in saloons and gambling halls from the 18th through early 20th centuries. The game is played between a <strong>banker</strong> (the house) and one or more <strong>punters</strong> (players). A standard 52-card deck is used.
          </p>
          <p>
            The object is simple: bet on which <strong>rank</strong> (Ace through King) will appear as the winning card each turn. The banker draws two cards per turn — the first is the <strong>loser</strong>, the second is the <strong>winner</strong>.
          </p>
        </section>

        <section>
          <h2>Key Terms</h2>
          <dl>
            <dt><strong>Soda</strong></dt>
            <dd>The very first card turned face-up from the deck at the start of the game. No bets are settled on the soda card — it simply reveals one card from the deck and is tracked on the casekeeper.</dd>

            <dt><strong>Hock (Last Turn)</strong></dt>
            <dd>The final card remaining in the deck after all turns. Like the soda, no bets are settled on the hock card. When only one card remains, the game ends.</dd>

            <dt><strong>Coppering</strong></dt>
            <dd>Placing a copper token on top of your bet to <em>reverse</em> its meaning. A coppered bet wins when its rank appears as the <strong>loser</strong> card instead of the winner. This lets players bet against a rank.</dd>

            <dt><strong>Split (Doublet)</strong></dt>
            <dd>When both the loser and winner cards in a single turn share the same rank. In a split, the house takes half of all bets on that rank.</dd>

            <dt><strong>Casekeeper (Case-keep)</strong></dt>
            <dd>A device (or display) that tracks how many cards of each rank have been drawn. With 4 cards per rank in the deck, the casekeeper shows the count of remaining cards for each rank, helping players make informed bets.</dd>
          </dl>
        </section>

        <section>
          <h2>How to Play</h2>
          <ol>
            <li><strong>Start:</strong> The deck is shuffled. The top card is turned face-up as the <em>soda</em> card — no bets resolve.</li>
            <li><strong>Place Bets:</strong> Players select a rank on the betting board and place chips. Optionally toggle <em>copper</em> to bet against the rank.</li>
            <li><strong>Deal:</strong> The banker draws two cards — the first is the <strong>loser</strong>, the second is the <strong>winner</strong>.</li>
            <li>
              <strong>Resolve:</strong>
              <ul>
                <li>Bets on the <strong>winner&apos;s rank</strong> win and pay even money (1:1).</li>
                <li>Bets on the <strong>loser&apos;s rank</strong> lose — the house keeps the stake.</li>
                <li>Bets on <strong>other ranks</strong> stay on the board for the next turn (stake returned).</li>
                <li><strong>Coppered</strong> bets reverse win/loss — winning when the rank is the loser.</li>
                <li><strong>Splits</strong> — house takes half the bet.</li>
              </ul>
            </li>
            <li><strong>Repeat</strong> until only one card remains (the <em>hock</em>). Game over.</li>
          </ol>
        </section>

        <section>
          <h2>The Casekeeper</h2>
          <p>
            The casekeeper tracks the 13 ranks (A through K), each with 4 cards in the deck. As cards are drawn each turn, the count updates. This is the most important tool for serious Faro players — knowing which ranks still have cards in the deck informs betting strategy.
          </p>
          <p>
            For example, if 3 of the 4 Kings have already been drawn, there is only one King left. Betting on King is risky (low chance of appearing) but the information helps you decide.
          </p>
        </section>

        <section>
          <h2>Strategy Tips</h2>
          <ul>
            <li>Watch the casekeeper — bet on ranks with more remaining cards for better odds.</li>
            <li>Avoid ranks that are &quot;dead&quot; (all 4 cards drawn).</li>
            <li>Use coppering strategically when you believe a rank is more likely to appear as the loser.</li>
            <li>Splits hurt — be cautious betting on ranks with exactly 2 remaining cards.</li>
          </ul>
        </section>

        <section style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid rgba(201,168,76,0.3)' }}>
          <Link href="/" className="faro-btn">Play Faro</Link>
        </section>
      </main>
    </div>
  );
};

export default Rules;
