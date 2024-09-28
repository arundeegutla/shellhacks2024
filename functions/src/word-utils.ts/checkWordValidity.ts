const MIN_WORD_LENGTH = 4, MAX_WORD_LENGTH = 15;

export function isWordValid(word: string): boolean
{
    return !(
        word.length < MIN_WORD_LENGTH || 
        word.length > MAX_WORD_LENGTH || 
        word.search("[^A-Z]") !== -1 ||
        !isWordInDictionary(word)
    );
}

export function isWordInDictionary(word: string): boolean
{
    return true;
}