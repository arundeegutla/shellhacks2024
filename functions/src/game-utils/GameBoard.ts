export enum Verdict
{
    BLANK=0,
    ABSENT=1,
    PRESENT=2,
    CORRECT=3,
};

export type Row =
{
    verdicts: Verdict[],
    guess?: string,
};

export type GameBoard =
{
    rows: Row[],
    guesses_left: number, 
    lie_cell?: Liar,
    is_done: boolean,
    
    // game constants
    num_guesses: number,
    word_length: number,
    time_started: number,
    true_word?: string,
};

export type Liar = {
    row_index: number,      // the row index (which guess that the lie is in)
    verdict_index: number,  // the col index (which character of the word the lie is on)
    true_verdict: Verdict,  // the original verdict, before the lie replaced it
};

export function createDefaultBoard(num_guesses: number, word_length: number): GameBoard
{
    const rows: Row[] = Array.from({ length: num_guesses }, () => ({
        verdicts: Array(word_length).fill(Verdict.BLANK)
    }));

    return {
        rows: rows,
        guesses_left: num_guesses,
        time_started: Date.now(),
        num_guesses: num_guesses,
        word_length: word_length,
        is_done: false,
    };
}