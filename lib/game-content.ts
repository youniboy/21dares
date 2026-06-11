import type { TruthCard, DareCard, DoubleDareCard, SituationCard, BurningHouseCard, GameMode } from '@/types/game';

const defaultInteraction = {
  cardPhase: 'setup' as const,
  customChallenge: '',
  respondStartedAt: null,
  response: '',
  verdict: 'pending' as const,
  consequence: '',
  consequenceStartedAt: null,
  proof: '',
  mediaPath: null,
};

// ── Normal content ────────────────────────────────────────────────────────────

const TRUTH_SUGGESTIONS = [
  "What's the most embarrassing thing you've done in public?",
  "Have you ever lied to get out of plans with someone in this group?",
  "What's the pettiest thing you've ever done to someone?",
  "What's the most embarrassing text you've sent to the wrong person?",
  "What's a bad habit you have that nobody knows about?",
  "Who was your first crush and does anyone here know them?",
  "What's the worst thing you've said about someone behind their back?",
  "Have you ever pretended to be sick to avoid something?",
  "What's the dumbest thing you've ever spent money on?",
  "What's the most childish thing you still secretly do?",
  "What's the most embarrassing thing in your search history right now?",
  "What's something you've done that you're genuinely ashamed of?",
  "What's your most irrational fear?",
  "When's the last time you cried and why?",
  "What's something you pretend to like but actually can't stand?",
];

const DARE_SUGGESTIONS = [
  "Do your best impression of someone in this room.",
  "Let someone else post an Instagram story from your phone right now.",
  "Text your most recent contact 'I have a confession to make'.",
  "Do a 30-second stand-up comedy routine.",
  "Show the last 5 photos in your camera roll.",
  "Call a family member and tell them you have big news.",
  "Speak in an accent chosen by the group for the next 3 rounds.",
  "Do your best catwalk walk.",
  "Read the last text conversation you had out loud.",
  "Let the group change your lock screen photo for 10 minutes.",
  "Sing the chorus of whatever song the group picks.",
  "Do 20 jumping jacks without stopping.",
  "Act out a movie scene without words until someone guesses it.",
  "Do your best villain monologue from any movie.",
];

const DOUBLE_DARE_SUGGESTIONS: [string, string][] = [
  [
    "Post a dramatic selfie with the caption 'Feeling cute, might delete later 🤔'",
    "Call your last contact and speak only in rhymes for 1 minute.",
  ],
  [
    "Let someone draw anything they want on your arm with a marker.",
    "Do a dramatic reading of your most embarrassing text conversation.",
  ],
  [
    "Text an ex or old friend: 'I saw you in a dream lol'",
    "Put your phone on full speaker for the next 5 minutes.",
  ],
  [
    "Dramatically cry to a sad song chosen by the group.",
    "Walk like a penguin for the next 2 rounds.",
  ],
  [
    "Stand up and do your best superhero landing pose.",
    "Let the group rename one of your contacts for 10 minutes.",
  ],
];

const SITUATION_SUGGESTIONS = [
  "You accidentally like a 3-year-old photo on your crush's Instagram. What do you do?",
  "You're at a party and spill a full drink on the host. What's your next move?",
  "You see your ex at the same restaurant with their new partner — and they notice you.",
  "You're mid-presentation and your phone blares the most embarrassing ringtone imaginable.",
  "You accidentally send a gossip text about someone to that exact person.",
  "You're in an elevator with your boss and start randomly tearing up. How do you explain it?",
  "A bird poops directly on your head in front of your date. You still have 2 hours left.",
  "You walk into completely the wrong meeting room but everyone looks interesting so you sit down.",
  "Your card is declined at the supermarket with a long line behind you.",
  "You wave enthusiastically at someone who wasn't waving at you — and they start walking over.",
  "You accidentally send 'I love you' to your entire group chat.",
  "You join the wrong Zoom call and realize they've been talking about you for 3 minutes.",
];

export const BURNING_HOUSE_OPTION_SETS: [string, string, string][] = [
  ['Kiss', 'Marry', 'Kill'],
  ['Save from a burning house', 'Leave behind', 'Forget you ever met'],
  ['Stuck in an elevator with for 24 hours', 'Have as your boss', 'Never see again'],
  ['Go backpacking with for a month', 'Have as a roommate', 'Only ever text, never meet'],
  ['Fight alongside in a zombie apocalypse', 'Leave as bait', 'Trust with your life'],
  ['Text for relationship advice', 'Text for money advice', 'Text at 3am when bored'],
  ['Have cook every meal for a week', 'Have pick all your outfits', 'Have plan every weekend'],
  ['Stranded on a desert island with', 'Have as your therapist', 'Owe money to'],
];

// ── Spicy content (18+) ───────────────────────────────────────────────────────

const SPICY_TRUTH_SUGGESTIONS = [
  "What's something you've always wanted to try but have been too nervous to ask for?",
  "Have you ever been attracted to someone in this room? Be honest.",
  "What's the most forward thing you've ever said to get someone's attention?",
  "What's a fantasy you've never admitted to anyone before tonight?",
  "What physical feature do you notice first about a potential partner?",
  "Have you ever sent a message you immediately regretted to a romantic interest?",
  "What's the most intimate thing you've done somewhere you probably shouldn't have?",
  "Describe the most attractive person you've ever met and what made them irresistible.",
  "What's the biggest relationship red flag you've ignored because you were attracted to someone?",
  "What's the most spontaneous romantic thing you've ever done?",
  "What's one thing a partner has done that you'd never admit turned you on?",
  "When was the last time you were genuinely flustered by someone and what happened?",
  "What's your love language and are you getting enough of it right now?",
  "What's the most embarrassing thing you've done while trying to impress someone you liked?",
  "Have you ever had feelings for someone you absolutely shouldn't have? What happened?",
];

const SPICY_DARE_SUGGESTIONS = [
  "Give someone in the room a 60-second shoulder massage.",
  "Whisper the most romantic thing you can think of in someone's ear.",
  "Do your most convincing seductive walk across the room and back.",
  "Maintain unbroken eye contact with the person across from you for 30 seconds without laughing.",
  "Say three genuinely flattering things about someone in this room.",
  "Feed someone in the room a snack using only your hands.",
  "Let the group scroll through your dating app for 30 seconds.",
  "Do your best impression of someone hopelessly in love.",
  "Describe someone in this room using only compliments for 30 seconds straight.",
  "Act out a first kiss scene with a willing partner or a pillow as stand-in.",
  "Give your partner (or the person next to you) a genuine hand massage.",
  "Speak only in whispers for the next 3 rounds.",
  "Show the group the most romantic or flirtatious text you've ever sent.",
  "Hold someone's hand without explanation for the duration of the next round.",
];

const SPICY_DOUBLE_DARE_SUGGESTIONS: [string, string][] = [
  [
    "Send your partner or a past flame a voice note saying 'I was thinking about you today.'",
    "Let the group pick a pickup line you have to deliver with full commitment.",
  ],
  [
    "Give a genuine compliment to every single person in the room right now.",
    "Let someone give you a makeover for the next 10 minutes.",
  ],
  [
    "Describe your ideal type in exhausting detail while everyone listens.",
    "Hold eye contact with someone the group picks for a full 45 seconds.",
  ],
  [
    "Slow dance with a willing person in the room for one full song.",
    "Confess the last time you had a crush on someone and what you did about it.",
  ],
  [
    "Let someone trace a message on your back with their finger — you have to guess what it says.",
    "Whisper something you find genuinely attractive about the person to your left.",
  ],
];

const SPICY_SITUATION_SUGGESTIONS = [
  "You're on a perfect date and realize you have feelings for their best friend too. How do you handle the rest of the evening?",
  "Your partner surprises you with a romantic weekend away and your ex is staying at the same hotel.",
  "You accidentally call your new partner by your ex's name in front of a group. How do you recover?",
  "A stranger at a restaurant sends you a drink. Your partner is sitting right next to you.",
  "Your partner reads a private journal entry where you wrote about someone else. What do you say?",
  "You plan a perfect romantic surprise but your partner accidentally finds all the evidence the day before.",
  "You're watching a movie together and a very steamy scene comes on right as your parents call for a video chat.",
  "You wake up and realize you sent a very flirty message to the wrong person last night.",
  "Your partner's friends ask you directly whether you're serious about them — on only your third date.",
  "You're in the middle of a deep, vulnerable conversation and you accidentally let out the most embarrassing noise.",
];

export const SPICY_BURNING_HOUSE_OPTION_SETS: [string, string, string][] = [
  ['Kiss passionately', 'Go on a date with', 'Marry immediately'],
  ['Spend one unforgettable night with', 'Have a long-distance relationship with', 'Stay just friends with forever'],
  ['Go on a romantic trip with', 'Move in with', 'Introduce to your family'],
  ['Slow dance with in the rain', 'Watch the sunrise with', 'Skinny dip with'],
  ['Be your soulmate', 'Be your best friend with history', 'Be the one that got away'],
  ['Serenade you in public', 'Write you love letters for a year', 'Plan every date forever'],
];

// ── NSFW content (21+, explicit) ─────────────────────────────────────────────

const NSFW_TRUTH_SUGGESTIONS = [
  "Have you ever accidentally sent a sext to the wrong person?",
  "What's your biggest roleplay fantasy?",
  "Where's the craziest place you've ever hooked up — or want to?",
  "What's the weirdest thing anyone has ever said to you during sex?",
  "What's the weirdest thing you've ever said to someone during sex?",
  "How many one-night stands have you had?",
  "What's your steamiest sexual fantasy?",
  "Have you ever faked an orgasm? Give the full story.",
  "Have you ever slept with a co-worker?",
  "Would you rather be dominant or submissive?",
  "When was the last time you touched yourself — and what were you thinking about?",
  "What was your first sexual fantasy?",
  "What's your kinkiest turn-on?",
  "Have you ever been to a sex club — or would you want to?",
  "What's the most embarrassing thing that's happened to you during sex?",
  "Have you ever had sex in a public place? Where?",
  "What's your favorite sex position?",
  "How often do you masturbate?",
  "Have you ever made a sex tape?",
  "Where's the most unusual place you've ever had sex?",
  "Have you ever had sex with other people in the room?",
  "What's the dirtiest thing you've ever done — or want someone to do to you?",
  "Have you ever had an orgy — or would you want to?",
  "What's the most embarrassing thing that's happened to you during sex?",
  "Have you ever fantasized about someone in this room?",
  "How old were you when you had sex for the first time?",
  "What's your biggest sexual guilty pleasure?",
  "What's your biggest turn-off that would surprise people?",
  "Have you ever had sex in your parents' bed?",
  "Have you ever been turned on at work — and what did you do about it?",
];

const NSFW_DARE_SUGGESTIONS = [
  "Give a lap dance to a person of your choice for one full song.",
  "Perform a striptease for 30 seconds. Group rates it out of 10.",
  "Twerk to the sexiest song you can think of.",
  "Fake an orgasm convincingly for one minute.",
  "Pretend to give oral sex to the nearest object you can find.",
  "Transfer an ice cube from your mouth to a willing person's mouth.",
  "Lick whipped cream, peanut butter, or chocolate sauce off someone else's finger.",
  "Remove one item of clothing chosen by group vote — or take a shot.",
  "Snap a photo of a mystery body part and let the group guess what it is.",
  "Hand your dating app over to the group for two minutes.",
  "Read an erotic story out loud for one minute in your best dramatic voice.",
  "Send a sexy selfie to someone in your contacts right now and show the room.",
  "Perform a pole dance using a broom, door frame, or anything that works.",
  "Balance an ice cube on your belly button for as long as you can bear it.",
  "Describe your ultimate fantasy in explicit detail while everyone listens.",
  "Act out your go-to move on a pillow while everyone watches.",
  "Put on someone else's underwear and do a catwalk.",
  "Spell out what you want to do to someone in the room using only emojis — show the group.",
];

const NSFW_DOUBLE_DARE_SUGGESTIONS: [string, string][] = [
  [
    "Give a willing partner a 3-minute sensual massage wherever they want.",
    "Tell the group your top 3 explicit sexual bucket list items in detail.",
  ],
  [
    "Let someone tie your hands together for the duration of the next round.",
    "Describe your perfect night with someone in this room — spare no detail.",
  ],
  [
    "Kiss someone in the room the way you'd kiss someone you're insanely attracted to.",
    "Let the group dare you to send a very explicit text to someone of their choosing.",
  ],
  [
    "Remove one item of clothing that the group votes on. It stays off.",
    "Let someone trace a message on your inner thigh with their finger — you guess it.",
  ],
  [
    "Let the group decide one thing you have to do with a willing partner right now.",
    "Confess the most explicit sexual experience you've had that would shock this room.",
  ],
];

const NSFW_SITUATION_SUGGESTIONS = [
  "You and a partner accidentally send an intimate video to your family group chat. It's been seen. What do you do?",
  "You're in the middle of an intimate moment and your partner's parents walk in without knocking.",
  "You match with your best friend's partner on a hookup app. They message first.",
  "You hook up with someone at a party and find out at breakfast they're your new boss starting Monday.",
  "You accidentally send a very explicit message to a work group chat. It's still unread by most people.",
  "Someone you've slept with shows up at a family gathering as your cousin's new partner.",
  "Your partner reveals they've been sharing intimate details of your sex life with their friends.",
  "You find someone in this room's explicit photos saved on a shared device.",
  "You're caught watching very explicit content on your laptop mid-video call with your team.",
  "You finish a one-night stand and they ask if you want to meet their parents tomorrow.",
  "You overhear two people discussing your sexual performance in detail at a party.",
  "Your partner confesses they've fantasized about someone in your friend group — and names them.",
];

export const NSFW_BURNING_HOUSE_OPTION_SETS: [string, string, string][] = [
  ['Have a one-night stand with', 'Have ongoing friends-with-benefits with', 'Be in a committed relationship with'],
  ['Be dominant with', 'Be submissive with', 'Take turns with'],
  ['Send explicit texts to every night', 'See just once a year but intensely', 'Have constant access to but no physical contact'],
  ['Do absolutely everything with once', 'Never touch but have deep emotional intimacy with', 'Do one specific thing on repeat forever'],
  ['Wake up next to every morning', 'Have a passionate secret affair with', 'Marry and settle down with'],
  ['Skinny dip with', 'Share a hotel room with for a week', 'Take a no-rules trip with'],
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function poolFor<T>(normal: T[], spicy: T[], nsfw: T[], mode: GameMode): T[] {
  if (mode === 'nsfw') return nsfw;
  if (mode === 'spicy') return spicy;
  if (mode === 'mix') return [...normal, ...spicy];
  return normal;
}

// ── Exports ───────────────────────────────────────────────────────────────────

export function getRandomTruth(mode: GameMode = 'normal'): TruthCard {
  return { type: 'truth', suggestion: pick(poolFor(TRUTH_SUGGESTIONS, SPICY_TRUTH_SUGGESTIONS, NSFW_TRUTH_SUGGESTIONS, mode)), ...defaultInteraction };
}

export function getRandomDare(mode: GameMode = 'normal'): DareCard {
  return { type: 'dare', suggestion: pick(poolFor(DARE_SUGGESTIONS, SPICY_DARE_SUGGESTIONS, NSFW_DARE_SUGGESTIONS, mode)), ...defaultInteraction };
}

export function getRandomDoubleDare(mode: GameMode = 'normal'): DoubleDareCard {
  const [s1, s2] = pick(poolFor(DOUBLE_DARE_SUGGESTIONS, SPICY_DOUBLE_DARE_SUGGESTIONS, NSFW_DOUBLE_DARE_SUGGESTIONS, mode));
  return { type: 'double-dare', suggestion1: s1, suggestion2: s2, completed: [], ...defaultInteraction };
}

export function getRandomSituation(mode: GameMode = 'normal'): SituationCard {
  return { type: 'situation', suggestion: pick(poolFor(SITUATION_SUGGESTIONS, SPICY_SITUATION_SUGGESTIONS, NSFW_SITUATION_SUGGESTIONS, mode)), ...defaultInteraction };
}

export function getRandomBurningHouse(mode: GameMode = 'normal'): BurningHouseCard {
  return {
    type: 'burning-house',
    options: pick(poolFor(BURNING_HOUSE_OPTION_SETS, SPICY_BURNING_HOUSE_OPTION_SETS, NSFW_BURNING_HOUSE_OPTION_SETS, mode)),
    names: null,
    assignments: null,
    ...defaultInteraction,
  };
}
