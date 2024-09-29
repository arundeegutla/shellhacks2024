import { readFileSync } from 'fs';
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
    const fileContent: string = readFileSync('./src/word-utils/words.txt', 'utf-8');
    const dictionary: string[] = fileContent.split('\n');
    console.log(dictionary.slice(0, 10));
    return dictionary.includes(word.toLowerCase());
}
