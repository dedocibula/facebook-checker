module Facebook.Extensions {
    /**
     * Values obtained from https://www.piliapp.com/facebook-symbols/
     */
    export class EmoticonHelper {
        private static emojiClassSimpleMappings: { [emoji: string]: string };

        private static get EMOJI_CLASS_SIMPLE_MAPPINGS(): { [emoji: string]: string } {
            this.emojiClassSimpleMappings = this.emojiClassSimpleMappings || {
                "3:)": "emojidevil",
                "8-)": "emojiglasses",
                "(^^^)": "emojishark",
                "(y)": "emojilike",
                "-_-": "emojisquint",
                ":3": "emojicolonthree",
                ":'(": "emojicry",
                ":(": "emojifrown",
                ":)": "emojismile",
                ":*": "emojikiss",
                ":/": "emojiunsure",
                ":P": "emojitongue",
                ":o": "emojigasp",
                ":poop:": "emojipoop",
                ":putnam:": "emojiputnam",
                ":v": "emojipacman",
                ":|]": "emojirobot",
                ";)": "emojiwink",
                "<3": "emojiheart",
                "<(\")": "emojipenguin",
                "=D": "emojigrin",
                ":D": "emojigrin",
                ":-D": "emojigrin",
                ">:(": "emojigrumpy",
                ">:o": "emojiupset",
                "B|": "emojisunglasses",
                "O.o": "emojiconfused_rev",
                "O:)": "emojiangel",
                "^_^": "emojikiki",
                "o.O": "emojiconfused"
            };

            return this.emojiClassSimpleMappings;
        }

        private static emojiClassComplexMappings: { [emoji: string]: string };

        private static get EMOJI_CLASS_COMPLEX_MAPPINGS(): { [emoji: string]: string } {
            this.emojiClassComplexMappings = this.emojiClassComplexMappings || {
                "↖": "emoji2196",
                "↗": "emoji2197",
                "↘": "emoji2198",
                "↙": "emoji2199",
                "▪": "emoji25aa",
                "▫": "emoji25ab",
                "◻": "emoji25fb",
                "◼": "emoji25fc",
                "◽": "emoji25fd",
                "◾": "emoji25fe",
                "☀": "emoji2600",
                "☁": "emoji2601",
                "☎": "emoji260e",
                "☔": "emoji2614",
                "☕": "emoji2615",
                "☝": "emoji261d",
                "☺": "emoji263a",
                "♠": "emoji2660",
                "♣": "emoji2663",
                "♥": "emoji2665",
                "♦": "emoji2666",
                "♨": "emoji2668",
                "♿": "emoji267f",
                "⚠": "emoji26a0",
                "⚡": "emoji26a1",
                "⚪": "emoji26aa",
                "⚫": "emoji26ab",
                "⚽": "emoji26bd",
                "⚾": "emoji26be",
                "⛄": "emoji26c4",
                "⛔": "emoji26d4",
                "⛪": "emoji26ea",
                "⛲": "emoji26f2",
                "⛳": "emoji26f3",
                "⛵": "emoji26f5",
                "⛺": "emoji26fa",
                "⛽": "emoji26fd",
                "✂": "emoji2702",
                "✈": "emoji2708",
                "✉": "emoji2709",
                "✊": "emoji270a",
                "✋": "emoji270b",
                "✌": "emoji270c",
                "✖": "emoji2716",
                "✨": "emoji2728",
                "✳": "emoji2733",
                "✴": "emoji2734",
                "❌": "emoji274c",
                "❎": "emoji274e",
                "❓": "emoji2753",
                "❔": "emoji2754",
                "❕": "emoji2755",
                "❗": "emoji2757",
                "❤": "emoji2764",
                "➡": "emoji27a1",
                "➿": "emoji27bf",
                "⤴": "emoji2934",
                "⤵": "emoji2935",
                "⬅": "emoji2b05",
                "⬆": "emoji2b06",
                "⬇": "emoji2b07",
                "⬛": "emoji2b1b",
                "⬜": "emoji2b1c",
                "⭐": "emoji2b50",
                "⭕": "emoji2b55",
                "〽": "emoji303d",
                "㊗": "emoji3297",
                "㊙": "emoji3299",
                "🀄": "emoji1f004",
                "🆒": "emoji1f192",
                "🆙": "emoji1f199",
                "🆚": "emoji1f19a",
                "🈁": "emoji1f201",
                "🈂": "emoji1f202",
                "🈚": "emoji1f21a",
                "🈯": "emoji1f22f",
                "🈳": "emoji1f233",
                "🈵": "emoji1f235",
                "🈶": "emoji1f236",
                "🈷": "emoji1f237",
                "🈸": "emoji1f238",
                "🈹": "emoji1f239",
                "🈺": "emoji1f23a",
                "🉐": "emoji1f250",
                "🌀": "emoji1f300",
                "🌂": "emoji1f302",
                "🌃": "emoji1f303",
                "🌄": "emoji1f304",
                "🌅": "emoji1f305",
                "🌆": "emoji1f306",
                "🌇": "emoji1f307",
                "🌈": "emoji1f308",
                "🌊": "emoji1f30a",
                "🌙": "emoji1f319",
                "🌟": "emoji1f31f",
                "🌱": "emoji1f331",
                "🌴": "emoji1f334",
                "🌵": "emoji1f335",
                "🌷": "emoji1f337",
                "🌸": "emoji1f338",
                "🌹": "emoji1f339",
                "🌺": "emoji1f33a",
                "🌻": "emoji1f33b",
                "🌾": "emoji1f33e",
                "🍀": "emoji1f340",
                "🍁": "emoji1f341",
                "🍂": "emoji1f342",
                "🍃": "emoji1f343",
                "🍅": "emoji1f345",
                "🍆": "emoji1f346",
                "🍉": "emoji1f349",
                "🍊": "emoji1f34a",
                "🍎": "emoji1f34e",
                "🍓": "emoji1f353",
                "🍔": "emoji1f354",
                "🍘": "emoji1f358",
                "🍙": "emoji1f359",
                "🍚": "emoji1f35a",
                "🍛": "emoji1f35b",
                "🍜": "emoji1f35c",
                "🍝": "emoji1f35d",
                "🍞": "emoji1f35e",
                "🍟": "emoji1f35f",
                "🍡": "emoji1f361",
                "🍢": "emoji1f362",
                "🍣": "emoji1f363",
                "🍦": "emoji1f366",
                "🍧": "emoji1f367",
                "🍰": "emoji1f370",
                "🍱": "emoji1f371",
                "🍲": "emoji1f372",
                "🍳": "emoji1f373",
                "🍴": "emoji1f374",
                "🍵": "emoji1f375",
                "🍶": "emoji1f376",
                "🍸": "emoji1f378",
                "🍺": "emoji1f37a",
                "🍻": "emoji1f37b",
                "🎀": "emoji1f380",
                "🎁": "emoji1f381",
                "🎃": "emoji1f383",
                "🎄": "emoji1f384",
                "🎅": "emoji1f385",
                "🎈": "emoji1f388",
                "🎉": "emoji1f389",
                "🎌": "emoji1f38c",
                "🎍": "emoji1f38d",
                "🎎": "emoji1f38e",
                "🎏": "emoji1f38f",
                "🎐": "emoji1f390",
                "🎒": "emoji1f392",
                "🎓": "emoji1f393",
                "🎡": "emoji1f3a1",
                "🎢": "emoji1f3a2",
                "🎤": "emoji1f3a4",
                "🎥": "emoji1f3a5",
                "🎦": "emoji1f3a6",
                "🎧": "emoji1f3a7",
                "🎨": "emoji1f3a8",
                "🎩": "emoji1f3a9",
                "🎫": "emoji1f3ab",
                "🎬": "emoji1f3ac",
                "🎭": "emoji1f3ad",
                "🎯": "emoji1f3af",
                "🎱": "emoji1f3b1",
                "🎵": "emoji1f3b5",
                "🎶": "emoji1f3b6",
                "🎷": "emoji1f3b7",
                "🎸": "emoji1f3b8",
                "🎺": "emoji1f3ba",
                "🎼": "emoji1f3bc",
                "🎾": "emoji1f3be",
                "🎿": "emoji1f3bf",
                "🏀": "emoji1f3c0",
                "🏁": "emoji1f3c1",
                "🏆": "emoji1f3c6",
                "🏈": "emoji1f3c8",
                "🏠": "emoji1f3e0",
                "🏡": "emoji1f3e1",
                "🏢": "emoji1f3e2",
                "🏣": "emoji1f3e3",
                "🏥": "emoji1f3e5",
                "🏦": "emoji1f3e6",
                "🏧": "emoji1f3e7",
                "🏨": "emoji1f3e8",
                "🏩": "emoji1f3e9",
                "🏪": "emoji1f3ea",
                "🏫": "emoji1f3eb",
                "🏬": "emoji1f3ec",
                "🏭": "emoji1f3ed",
                "🏯": "emoji1f3ef",
                "🏰": "emoji1f3f0",
                "🐍": "emoji1f40d",
                "🐎": "emoji1f40e",
                "🐑": "emoji1f411",
                "🐒": "emoji1f412",
                "🐔": "emoji1f414",
                "🐗": "emoji1f417",
                "🐘": "emoji1f418",
                "🐙": "emoji1f419",
                "🐚": "emoji1f41a",
                "🐛": "emoji1f41b",
                "🐟": "emoji1f41f",
                "🐠": "emoji1f420",
                "🐡": "emoji1f421",
                "🐥": "emoji1f425",
                "🐦": "emoji1f426",
                "🐧": "emoji1f427",
                "🐨": "emoji1f428",
                "🐩": "emoji1f429",
                "🐫": "emoji1f42b",
                "🐬": "emoji1f42c",
                "🐭": "emoji1f42d",
                "🐮": "emoji1f42e",
                "🐯": "emoji1f42f",
                "🐰": "emoji1f430",
                "🐱": "emoji1f431",
                "🐳": "emoji1f433",
                "🐴": "emoji1f434",
                "🐵": "emoji1f435",
                "🐶": "emoji1f436",
                "🐷": "emoji1f437",
                "🐸": "emoji1f438",
                "🐹": "emoji1f439",
                "🐺": "emoji1f43a",
                "🐻": "emoji1f43b",
                "🐾": "emoji1f43e",
                "👀": "emoji1f440",
                "👂": "emoji1f442",
                "👃": "emoji1f443",
                "👄": "emoji1f444",
                "👅": "emoji1f445",
                "👆": "emoji1f446",
                "👇": "emoji1f447",
                "👈": "emoji1f448",
                "👉": "emoji1f449",
                "👊": "emoji1f44a",
                "👋": "emoji1f44b",
                "👌": "emoji1f44c",
                "👍": "emoji1f44d",
                "👎": "emoji1f44e",
                "👏": "emoji1f44f",
                "👐": "emoji1f450",
                "👑": "emoji1f451",
                "👒": "emoji1f452",
                "👔": "emoji1f454",
                "👕": "emoji1f455",
                "👗": "emoji1f457",
                "👘": "emoji1f458",
                "👙": "emoji1f459",
                "👜": "emoji1f45c",
                "👟": "emoji1f45f",
                "👠": "emoji1f460",
                "👡": "emoji1f461",
                "👢": "emoji1f462",
                "👦": "emoji1f466",
                "👧": "emoji1f467",
                "👨": "emoji1f468",
                "👩": "emoji1f469",
                "👫": "emoji1f46b",
                "👮": "emoji1f46e",
                "👯": "emoji1f46f",
                "👱": "emoji1f471",
                "👲": "emoji1f472",
                "👳": "emoji1f473",
                "👴": "emoji1f474",
                "👵": "emoji1f475",
                "👶": "emoji1f476",
                "👷": "emoji1f477",
                "👸": "emoji1f478",
                "👻": "emoji1f47b",
                "👼": "emoji1f47c",
                "👽": "emoji1f47d",
                "👾": "emoji1f47e",
                "👿": "emoji1f47f",
                "💀": "emoji1f480",
                "💂": "emoji1f482",
                "💃": "emoji1f483",
                "💄": "emoji1f484",
                "💅": "emoji1f485",
                "💈": "emoji1f488",
                "💉": "emoji1f489",
                "💊": "emoji1f48a",
                "💋": "emoji1f48b",
                "💌": "emoji1f48c",
                "💍": "emoji1f48d",
                "💎": "emoji1f48e",
                "💏": "emoji1f48f",
                "💐": "emoji1f490",
                "💑": "emoji1f491",
                "💒": "emoji1f492",
                "💓": "emoji1f493",
                "💔": "emoji1f494",
                "💖": "emoji1f496",
                "💗": "emoji1f497",
                "💘": "emoji1f498",
                "💙": "emoji1f499",
                "💚": "emoji1f49a",
                "💛": "emoji1f49b",
                "💜": "emoji1f49c",
                "💝": "emoji1f49d",
                "💞": "emoji1f49e",
                "💟": "emoji1f49f",
                "💠": "emoji1f4a0",
                "💡": "emoji1f4a1",
                "💢": "emoji1f4a2",
                "💣": "emoji1f4a3",
                "💤": "emoji1f4a4",
                "💦": "emoji1f4a6",
                "💧": "emoji1f4a7",
                "💨": "emoji1f4a8",
                "💩": "emoji1f4a9",
                "💪": "emoji1f4aa",
                "💰": "emoji1f4b0",
                "💲": "emoji1f4b2",
                "💴": "emoji1f4b4",
                "💵": "emoji1f4b5",
                "💺": "emoji1f4ba",
                "💻": "emoji1f4bb",
                "💼": "emoji1f4bc",
                "💽": "emoji1f4bd",
                "💾": "emoji1f4be",
                "💿": "emoji1f4bf",
                "📀": "emoji1f4c0",
                "📖": "emoji1f4d6",
                "📝": "emoji1f4dd",
                "📞": "emoji1f4de",
                "📠": "emoji1f4e0",
                "📡": "emoji1f4e1",
                "📢": "emoji1f4e2",
                "📣": "emoji1f4e3",
                "📨": "emoji1f4e8",
                "📩": "emoji1f4e9",
                "📪": "emoji1f4ea",
                "📫": "emoji1f4eb",
                "📬": "emoji1f4ec",
                "📭": "emoji1f4ed",
                "📮": "emoji1f4ee",
                "📱": "emoji1f4f1",
                "📲": "emoji1f4f2",
                "📳": "emoji1f4f3",
                "📴": "emoji1f4f4",
                "📶": "emoji1f4f6",
                "📷": "emoji1f4f7",
                "📺": "emoji1f4fa",
                "📻": "emoji1f4fb",
                "📼": "emoji1f4fc",
                "🔈": "emoji1f508",
                "🔍": "emoji1f50d",
                "🔎": "emoji1f50e",
                "🔏": "emoji1f50f",
                "🔐": "emoji1f510",
                "🔑": "emoji1f511",
                "🔒": "emoji1f512",
                "🔓": "emoji1f513",
                "🔔": "emoji1f514",
                "🔞": "emoji1f51e",
                "🔥": "emoji1f525",
                "🔨": "emoji1f528",
                "🔫": "emoji1f52b",
                "🔰": "emoji1f530",
                "🔱": "emoji1f531",
                "🔲": "emoji1f532",
                "🔳": "emoji1f533",
                "🔴": "emoji1f534",
                "🔵": "emoji1f535",
                "🔶": "emoji1f536",
                "🔷": "emoji1f537",
                "🔸": "emoji1f538",
                "🔹": "emoji1f539",
                "🗻": "emoji1f5fb",
                "🗼": "emoji1f5fc",
                "🗽": "emoji1f5fd",
                "😁": "emoji1f601",
                "😂": "emoji1f602",
                "😃": "emoji1f603",
                "😄": "emoji1f604",
                "😆": "emoji1f606",
                "😉": "emoji1f609",
                "😊": "emoji1f60a",
                "😌": "emoji1f60c",
                "😍": "emoji1f60d",
                "😏": "emoji1f60f",
                "😒": "emoji1f612",
                "😓": "emoji1f613",
                "😔": "emoji1f614",
                "😖": "emoji1f616",
                "😘": "emoji1f618",
                "😚": "emoji1f61a",
                "😜": "emoji1f61c",
                "😝": "emoji1f61d",
                "😞": "emoji1f61e",
                "😠": "emoji1f620",
                "😡": "emoji1f621",
                "😢": "emoji1f622",
                "😣": "emoji1f623",
                "😤": "emoji1f624",
                "😥": "emoji1f625",
                "😨": "emoji1f628",
                "😩": "emoji1f629",
                "😪": "emoji1f62a",
                "😫": "emoji1f62b",
                "😭": "emoji1f62d",
                "😰": "emoji1f630",
                "😱": "emoji1f631",
                "😲": "emoji1f632",
                "😳": "emoji1f633",
                "😵": "emoji1f635",
                "😷": "emoji1f637",
                "😸": "emoji1f638",
                "😹": "emoji1f639",
                "😺": "emoji1f63a",
                "😻": "emoji1f63b",
                "😼": "emoji1f63c",
                "😽": "emoji1f63d",
                "😿": "emoji1f63f",
                "🙀": "emoji1f640",
                "🙋": "emoji1f64b",
                "🙌": "emoji1f64c",
                "🙍": "emoji1f64d",
                "🙏": "emoji1f64f",
                "🚀": "emoji1f680",
                "🚃": "emoji1f683",
                "🚄": "emoji1f684",
                "🚅": "emoji1f685",
                "🚉": "emoji1f689",
                "🚌": "emoji1f68c",
                "🚏": "emoji1f68f",
                "🚑": "emoji1f691",
                "🚒": "emoji1f692",
                "🚓": "emoji1f693",
                "🚕": "emoji1f695",
                "🚗": "emoji1f697",
                "🚙": "emoji1f699",
                "🚚": "emoji1f69a",
                "🚢": "emoji1f6a2",
                "🚤": "emoji1f6a4",
                "🚥": "emoji1f6a5",
                "🚧": "emoji1f6a7",
                "🚬": "emoji1f6ac",
                "🚭": "emoji1f6ad",
                "🚲": "emoji1f6b2",
                "🚹": "emoji1f6b9",
                "🚺": "emoji1f6ba",
                "🚻": "emoji1f6bb",
                "🚼": "emoji1f6bc",
                "🚽": "emoji1f6bd",
                "🚾": "emoji1f6be",
                "🛀": "emoji1f6c0"
            };

            return this.emojiClassComplexMappings;
        }

        private static simpleTrie: Trie<string>;
        private static get SIMPLE_TRIE(): Trie<string> {
            if (!this.simpleTrie) {
                this.simpleTrie = new Trie<string>();
                $.map(this.EMOJI_CLASS_SIMPLE_MAPPINGS, (value, key) => this.simpleTrie.insertWord(key, value));
            }

            return this.simpleTrie;
        }

        private static complexTrie: Trie<string>;
        private static get COMPLEX_TRIE(): Trie<string> {
            if (!this.complexTrie) {
                this.complexTrie = new Trie<string>();
                $.map(this.EMOJI_CLASS_COMPLEX_MAPPINGS, (value, key) => this.complexTrie.insertWord(key, value));
            }

            return this.complexTrie;
        }

        public static identifyEmoticons(text: string): Entities.Pair<Entities.Range, string>[] {
            const emoticons: Entities.Pair<Entities.Range, string>[] = [];
            if (!text || text.length === 0)
                return emoticons;

            let currentTrie: Trie<string> = this.COMPLEX_TRIE;
            for (let i = 0; i < text.length; i++) {
                if (currentTrie.getNextTrie(text[i])) {
                    i = this.checkFrom(text, i, currentTrie, this.COMPLEX_TRIE.maxWordLength, emoticons);
                    currentTrie = this.COMPLEX_TRIE;
                }
            }
            currentTrie = this.SIMPLE_TRIE;
            let currentIndex: number = 0, possibleStart: boolean = true;
            const validVicinity: (string, number) => boolean = (fullText, index) => index < 0 || index === fullText.length ||
                fullText[index] === " " || fullText[index] === "\t" || fullText[index] === "\n" ||
                (currentIndex < emoticons.length && emoticons[currentIndex].first.from === index);
            for (let i = 0; i < text.length; i++) {
                if (!possibleStart || !currentTrie.getNextTrie(text[i])) {
                    possibleStart = validVicinity(text, i);
                    i = currentIndex < emoticons.length && emoticons[currentIndex].first.from === i ? emoticons[currentIndex++].first.to - 1 : i;
                } else {
                    i = this.checkFrom(text, i, currentTrie, this.SIMPLE_TRIE.maxWordLength, emoticons, validVicinity);
                    currentTrie = this.SIMPLE_TRIE;
                    possibleStart = false;
                }
            }

            emoticons.sort((firstEmoji, secondEmoji) => firstEmoji.first.from - secondEmoji.first.from);
            return emoticons;
        }

        private static checkFrom(text: string, from: number, currentTrie: Trie<string>, maxTo: number, results: Entities.Pair<Entities.Range, string>[], validEnding?: (string, number) => boolean): number {
            let to: number = from;
            while (to < Math.min(from + maxTo, text.length) && (currentTrie && !currentTrie.associatedValue))
                currentTrie = currentTrie.getNextTrie(text[to++]);
            if (currentTrie && currentTrie.associatedValue && (!validEnding || validEnding(text, to)))
                results.push(new Entities.Pair(new Entities.Range(from, to), currentTrie.associatedValue));
            return to - 1;
        }
    }

    export class Trie<T> {
        private leafs: { [prefix: string]: Trie<T> };

        private value: T;
        private maxLength: number;

        constructor() {
            this.leafs = {};

            this.maxLength = Number.MIN_VALUE;
        }

        public insertWord(word: string, value: T): void {
            let current: Trie<T> = this, next: Trie<T>;
            for (let i = 0; i < word.length; i++) {
                next = current.leafs[word[i]];
                if (!next) {
                    next = new Trie<T>();
                    current.leafs[word[i]] = next;
                }
                current = next;
            }
            current.value = value;
            this.maxLength = Math.max(this.maxLength, word.length);
        }

        public getNextTrie(prefix: string): Trie<T> {
            return this.leafs[prefix];
        }

        public get associatedValue(): T { return this.value; }

        public get maxWordLength(): number { return this.maxLength; }
    }
}