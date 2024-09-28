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
    time_started: number,
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
    };
}