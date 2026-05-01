import { z } from 'zod';

export const CardSchema = z.object({
  rank: z.number().int().min(1).max(13),
  suit: z.enum(['hearts','diamonds','clubs','spades'])
});

export const BetSchema = z.object({
  playerId: z.string().min(1),
  ranks: z.array(z.number().int().min(1).max(13)).min(1).max(4),
  coppered: z.boolean().optional().default(false),
  amount: z.number().int().min(1).max(100_000)
});

export const PlayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  bankroll: z.number().int().min(0).max(10_000_000),
  startingBankroll: z.number().int().min(0).max(10_000_000).optional(),
});

const CasekeepEntrySchema = z.object({ drawn: z.number().int().min(0).max(4), total: z.literal(4) });

export const GameStateSchema = z.object({
  seed: z.string(),
  deck: z.array(CardSchema),
  burnt: z.array(CardSchema),
  bets: z.array(BetSchema),
  players: z.array(PlayerSchema),
  casekeep: z.record(z.string(), CasekeepEntrySchema).optional(),
  sodaCard: CardSchema.nullable().optional(),
  turn: z.number().int().min(0).optional(),
});
