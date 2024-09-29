import { DICTIONARY } from './words';
const MIN_WORD_LENGTH = 4, MAX_WORD_LENGTH = 15;

export function isWordValid(word: string): boolean
{
    return !(
        word.length < MIN_WORD_LENGTH || 
        word.length > MAX_WORD_LENGTH || 
        /[^A-Z]/.test(word.toUpperCase()) ||
        !isWordInDictionary(word)
    );
}

export function isWordInDictionary(word: string): boolean
{
    return DICTIONARY.includes(word.toLowerCase());
}