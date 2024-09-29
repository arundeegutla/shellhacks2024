import { GameBoard } from "./GameBoard";

export type Round =
{
    has_started: boolean,
    has_finished: boolean,
    time_started: number,
    true_word: string,
    num_guesses_allowed: number,
    word_length: number,
    games: { [key: string]: GameBoard },
};
