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
  "What's the biggest lie you've told your parents?",
  "Have you ever cheated on a test or exam?",
  "What's your most embarrassing nickname and who gave it to you?",
  "Have you ever walked in on something you wish you could unsee?",
  "What's the worst fashion choice you've ever made?",
  "What's your most embarrassing drunk story?",
  "What's the cheapest thing you've ever done to save money?",
  "Have you ever ghosted someone and regretted it?",
  "What's the most embarrassing thing you've done to impress someone?",
  "What's the biggest secret you've kept from your best friend?",
  "What's the most awkward thing that's happened to you on public transport?",
  "Have you ever stolen something? What was it?",
  "What's the most embarrassing dream you've ever had?",
  "What's a conspiracy theory you secretly half-believe?",
  "What's the worst present you've ever received and what did you say?",
  "Have you ever eavesdropped on a conversation you weren't meant to hear?",
  "What's the most embarrassing thing you've done at work or school?",
  "Have you ever been caught lying? What was the lie?",
  "What's the longest you've gone without showering?",
  "What's something you're irrationally jealous of?",
  "Have you ever pretended to be someone else online?",
  "What's the most embarrassing thing you've ever done for money?",
  "What's something you've Googled that you'd be embarrassed to admit?",
  "Have you ever blamed someone else for something you did?",
  "What's the most cringe thing you've posted on social media and deleted?",
  "Have you ever been kicked out of somewhere? Where and why?",
  "What's a skill you claimed to have but definitely don't?",
  "Have you ever had a falling out with a friend and secretly think you were wrong?",
  "What's the most awkward situation you've been in at a family gathering?",
  "What's the worst date you've ever been on?",
  "Have you ever said 'I love you' and not meant it?",
  "What's the most embarrassing thing someone has walked in on you doing?",
  "What's the pettiest reason you've ever unfollowed or blocked someone?",
  "Have you ever faked being busy to avoid someone you know well?",
  "What's the most overdue thing on your to-do list right now?",
  "Have you ever said something behind someone's back that they later found out about?",
  "What's the most embarrassing thing you've done while nervous?",
  "What's the most embarrassing voicemail you've ever left?",
  "Have you ever laughed at the completely wrong moment? What happened?",
  "What's something you own that you're genuinely embarrassed about?",
  "Have you ever pretended to remember someone you had absolutely no memory of?",
  "What's the most ridiculous thing you've ever believed as a kid?",
  "Have you ever sent a risky text and immediately regretted it?",
  "What's the dumbest argument you've ever had — and did you win?",
  "What's an opinion you have that you know is unpopular?",
  "What's the most embarrassing autocorrect fail you've had?",
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
  "Do your best impression of a news anchor reporting breaking news.",
  "Narrate your life for the next 2 minutes in third person.",
  "Do your best robot dance for 30 seconds.",
  "Let the group read your last 10 sent messages.",
  "Try to sell an ordinary object in the room for 60 seconds as if it's priceless.",
  "Call a random contact and ask what they're having for dinner, then say 'nice' and hang up.",
  "Do your most dramatic death scene.",
  "Let the group give you a ridiculous nickname for the rest of the game.",
  "Demonstrate how you dance when no one's watching.",
  "Put your phone on shuffle and do an interpretive dance to the first song.",
  "Describe your personality as if you're a Yelp review.",
  "Do your best animal impression chosen by the group.",
  "Act like an enthusiastic tour guide showing tourists around the room.",
  "Read out the last 3 texts you sent with full dramatic emotion.",
  "Speak in only song lyrics for the next 2 rounds.",
  "Draw your self-portrait in 30 seconds using your non-dominant hand. Show everyone.",
  "Put on an accent and convince the group you're from a different country.",
  "Make a 30-second speech nominating yourself for a made-up award.",
  "Do your best pirate impression ordering at a restaurant.",
  "Recreate your most awkward moment as a performance piece.",
  "Let the group write a text to send from your phone — you must read it before sending.",
  "Impersonate your favourite teacher or boss for 60 seconds.",
  "Post a cryptic status: 'Not everything is what it seems.' Wait for replies and share them.",
  "Do a dramatic reading of the most boring Wikipedia article the group can find.",
  "Do your best Gordon Ramsay impression criticizing a meal someone describes.",
  "Show the group your most used emoji and explain it in 3 sentences.",
  "Try to make everyone laugh using only facial expressions for 1 minute.",
  "Let someone style your hair for the next 2 rounds with whatever's in the room.",
  "Record and send a voice note to a contact saying 'We need to talk about something'.",
  "Show your most embarrassing purchase on a shopping app or bank statement.",
  "Confess one thing to the group you've never told them before.",
  "Do 10 push-ups right now — the group counts out loud.",
  "Perform a weather forecast for an imaginary country for 45 seconds.",
  "Act out how you behave when you're pretending not to be upset.",
  "Let someone scroll through your social media following and roast you for 30 seconds.",
  "Speak only in questions for the next 2 rounds.",
  "Stand on one leg for the entire next round — if you put it down, you start over.",
  "Do your best impression of a toddler who didn't get what they wanted.",
  "Demonstrate exactly how you act when you're trying to be cool in front of someone you like.",
  "Let the group pick a word you cannot say for the rest of the game.",
  "Call someone and give a film recommendation without saying the film's name.",
  "Do a freestyle rap for 30 seconds about a topic the group picks.",
  "Text someone 'I owe you an apology' with no context and read the replies aloud.",
  "Do your best impression of your own voice as an AI assistant.",
  "Act out your morning routine in fast-forward in 30 seconds.",
  "Let someone send one message from your phone to whoever they choose.",
  "Perform the worst joke you know with full commitment and a bow at the end.",
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
  [
    "Call a random number and sing happy birthday to whoever answers.",
    "Let the group pick a word you have to use in every sentence for the next round.",
  ],
  [
    "Change your profile photo to one the group picks for 30 minutes.",
    "Do your best wildlife documentary narrator impression describing what's happening in the room.",
  ],
  [
    "Send a voice message to a friend of the group's choosing saying 'We need to talk.'",
    "Do a dramatic interpretive dance to describe your week.",
  ],
  [
    "Show your most embarrassing camera roll photo to the group.",
    "Let someone pick a song — you must lip sync it perfectly for 1 minute.",
  ],
  [
    "Write and perform a haiku about your most embarrassing memory.",
    "Let the group pick a phrase you must say to the next person you text.",
  ],
  [
    "Do your best impression of a cooking show host making toast.",
    "Let the group read your last 5 sent emails or DMs.",
  ],
  [
    "Speak in a different accent for the next 2 rounds.",
    "Let someone else reply to your next incoming text.",
  ],
  [
    "Impersonate your favourite boss or teacher for 60 seconds.",
    "Let someone ask you 3 personal questions you must answer 100% honestly.",
  ],
  [
    "Do your best impression of someone trying to be cool but failing.",
    "Let the group pick a dare for you that must be completed in the next 24 hours.",
  ],
  [
    "Record a 15-second voice note saying 'I just wanted to hear your voice' and send it to a contact.",
    "Do your best impression of a toddler who didn't get ice cream.",
  ],
  [
    "Act as a hotel receptionist while the group asks bizarre check-in questions.",
    "Let someone write a one-sentence Yelp review of you as a person.",
  ],
  [
    "Text someone 'I owe you an apology' with no context and read their reply aloud.",
    "Do your best sports commentator impression describing someone pouring a drink.",
  ],
  [
    "Let someone go through your Spotify or Apple Music listening history for 30 seconds.",
    "Do your best impression of your own voice as an AI assistant.",
  ],
  [
    "Act out your morning routine in fast-forward in 30 seconds.",
    "Let the group choose a word you cannot say for the rest of the game.",
  ],
  [
    "Send a group text to 3 people saying 'I can explain everything'.",
    "Do a freestyle rap for 30 seconds on a topic the group picks.",
  ],
  [
    "Show the group your most cringeworthy old photo.",
    "Narrate everything you're doing in a nature documentary voice for 2 minutes.",
  ],
  [
    "Stand on one leg for the entire next round.",
    "Do your best fake advertisement for a completely useless product.",
  ],
  [
    "Do your best impression of how you behave when you're nervous.",
    "Let someone go through your Amazon purchase history for 30 seconds.",
  ],
  [
    "Confess one thing to the group you've never admitted before.",
    "Put your phone screen-up on the table and let the group see 1 notification.",
  ],
  [
    "Do your best mime of getting stuck in an invisible box for 30 seconds.",
    "Let someone pick the background photo on your phone for the next round.",
  ],
  [
    "Tell the group your most embarrassing online purchase.",
    "Do your best impression of a politician giving a press conference about running out of snacks.",
  ],
  [
    "Perform a 30-second infomercial for the most boring object in the room.",
    "Let the group pick a random contact — you send them the crying laughing emoji with no context.",
  ],
  [
    "Describe your ideal life in 60 seconds like you're pitching it to investors.",
    "Let someone post one Instagram story from your phone.",
  ],
  [
    "Do your best slow-motion replay of the last thing you physically did.",
    "Let the group invent a rumour about you that you have to repeat as if true.",
  ],
  [
    "Act out how you look when you're pretending to listen but absolutely not.",
    "Let someone set a new alarm on your phone with a name they choose.",
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
  "You're walking confidently and trip flat on your face in front of a crowd.",
  "You answer your phone on speaker in a silent waiting room — it's your most embarrassing contact.",
  "You fall asleep on someone's shoulder on public transport. They wake you up 2 stops too late.",
  "You accidentally call your teacher or boss 'Mum' or 'Dad'.",
  "You're singing loudly in your car and realize the people next to you can see everything.",
  "You reply-all to an office email with something meant only for one person.",
  "You get caught in the middle of telling a lie — in real time, mid-sentence.",
  "You trip walking up the stairs at school or work, in front of everyone.",
  "Your Zoom background falls apart live on a call with 40 people watching.",
  "You forget someone's name immediately after being introduced and they keep talking to you.",
  "You fall asleep in a meeting and snore. You wake up to everyone staring.",
  "You walk out of a bathroom with toilet paper stuck to your shoe through a crowded restaurant.",
  "Your phone reads out your notifications on speaker while you're at a quiet dinner.",
  "You get on the wrong bus and ride it 45 minutes the wrong direction and are now very late.",
  "You confidently walk into a push door in front of a crowd and it doesn't open.",
  "You laugh at something you misheard in a conversation that turns out to be deeply sad news.",
  "You call someone by the wrong name three times in a row and get worse each correction.",
  "Your alarm goes off during a funeral.",
  "You walk out of a shop and the alarm goes off. You didn't steal anything. Everyone is staring.",
  "You're on a first date and realize halfway through you've been pronouncing their name wrong.",
  "You show someone a photo and they swipe into something you didn't want them to see.",
  "Your voice cracks in the middle of a very serious, confident statement.",
  "You arrive overdressed to an event that turns out to be casual. Everyone else is in jeans.",
  "You answer 'you too!' when the waiter says 'enjoy your meal'.",
  "You mispronounce a word confidently in a job interview and the interviewer visibly winces.",
  "You walk into a glass door at a fancy restaurant.",
  "You introduce your friend's new partner using the ex's name. Twice.",
  "You're enthusiastically retelling a story only to realize the person you're telling it to was there.",
  "You text someone asking for advice about them — and send it to them.",
  "You try to pay contactless but tap your loyalty card instead — eight times in a row.",
  "You make a joke at a party and no one laughs. The silence lasts 6 full seconds.",
  "You hold the door open for someone who is much further away than expected and both have to commit.",
  "You give someone directions with full confidence and are completely wrong.",
  "You drop your phone screen-first in the middle of an important conversation.",
  "You accidentally FaceTime someone instead of calling and your face fills their screen immediately.",
  "You discover your autocorrect has been changing a word wrong in every text for 3 weeks.",
  "You arrive to a fancy dinner with something in your teeth — you've been talking for 20 minutes.",
  "You walk into the wrong gender bathroom and get halfway in before realizing.",
  "You start a rumour about yourself by accident and it's now been spread back by three people.",
  "You recommend a restaurant enthusiastically only to find out it closed 6 months ago.",
  "You bump into your nemesis at the gym and they look incredible.",
  "You find out the group chat you've been complaining in has the person you're complaining about in it.",
  "You hold the lift door for someone sprinting towards it — they trip right in front of you.",
  "You confidently quote a film only to be told that line doesn't exist.",
  "You end a professional call with 'love you, bye' out of pure habit.",
  "You walk into a surprise party thrown for someone else and everyone shouts your name by mistake.",
  "You like your own photo from a different account by accident and get caught.",
  "You're trying to whisper something private to a friend and realize you're not whispering at all.",
  "You write a very heartfelt message, send it — and immediately realize it's been read but ignored for 10 minutes.",
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
  ['Write your biography', 'Choose your career path', 'Design your dream home'],
  ['Know all your thoughts for one day', 'Control your schedule for a week', 'Choose who you spend all your time with for a month'],
  ['Argue your case in court', 'Negotiate your next salary', 'Write your dating profile'],
  ['Sit next to on a 12-hour flight', 'Share a tent with for a week', 'Live with for a year'],
  ['Never be able to lie to', 'Tell all your secrets to', 'Have read your diary'],
  ['Take credit for your best work', 'Always take your side in arguments', 'Be brutally honest with you always'],
  ['Compete against you in life', 'Always tell you the hard truth', 'Be your biggest cheerleader no matter what'],
  ['Never talk to again', 'Only talk to once a year', 'Have in your life every single day'],
  ['Call at your absolute worst moment', 'Have witness your most embarrassing moment', 'Know your biggest secret'],
  ['Start a business with', 'Go on a road trip with', 'Trust with your social media passwords'],
  ['Have plan your wedding', 'Have throw your birthday party', 'Have give your eulogy'],
  ['Be permanently banned from their birthday parties', 'Never be able to contact again', 'Have as your emergency contact'],
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
  "What's the most romantic thing anyone has ever done for you?",
  "Have you ever kissed someone and immediately wished you hadn't?",
  "What's the most obvious hint someone's given you that you completely missed at the time?",
  "Have you ever been in love with more than one person at the same time?",
  "What's the longest you've waited to text someone back because you were playing it cool?",
  "What's something you find attractive that most people wouldn't expect?",
  "What's the most impulsive romantic decision you've ever made?",
  "Have you ever turned down someone who you later wished you hadn't?",
  "What's the most effort you've ever put into flirting — and did it work?",
  "What's a compliment you received that you still think about?",
  "Have you ever fallen for someone who was completely wrong for you — and did it anyway?",
  "What's the worst way someone has ever ended things with you?",
  "What's the most dramatic breakup story you've either had or witnessed?",
  "Have you ever liked someone so much it scared you? What happened?",
  "What's one thing you wish your current or last partner did differently?",
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
  "Speak only in whispers for the next 3 rounds.",
  "Show the group the most romantic or flirtatious text you've ever sent.",
  "Hold someone's hand without explanation for the duration of the next round.",
  "Tell the person to your left one thing you genuinely find attractive about them.",
  "Do your best impression of a hopeless romantic in a movie who just had their heart broken.",
  "Share the most embarrassing thing you've done to get someone's attention.",
  "Let someone pick your next dating app profile photo from your camera roll.",
  "Read your most romantic text out loud in a dramatic voice.",
  "Tell the group about the last time you had butterflies about someone — no names required.",
  "Do your best impression of how you act on a first date vs. how you actually are.",
  "Let the person next to you guess your 'type' based on three questions they ask.",
  "Write down your top 3 green flags in a partner and show the group.",
  "Tell the group your most embarrassing dating app story.",
  "Do your best impression of someone trying to play it cool when they clearly like someone.",
  "Describe your first heartbreak in 30 seconds like you're pitching it as a Netflix series.",
  "Let the group rate your most recent dating app or social media DM conversation.",
  "Give a genuine toast to someone in the room as if you're at their wedding.",
  "Confess which person in the room you'd set up on a date with someone you know, and why.",
  "Tell the group the most attractive thing someone has ever said to you.",
  "Do your best slow-motion walk across the room to a song the group hums.",
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
  [
    "Tell the group the most embarrassing thing you've done to get someone's attention.",
    "Let the person opposite you ask you 3 dating questions you must answer honestly.",
  ],
  [
    "Read out your most flirtatious text in a dramatic voice.",
    "Let someone go through your dating app or social media DMs for 30 seconds.",
  ],
  [
    "Describe your last situationship in 30 seconds like it's a film pitch.",
    "Give a genuine toast to someone in the room as if you're at their wedding.",
  ],
  [
    "Tell the group your biggest relationship green flag and red flag.",
    "Let someone choose a song that plays during the next round — dedicated to you.",
  ],
  [
    "Do your best impression of yourself on a first date vs how you are 3 months in.",
    "Confess which couple in your life you think is definitely not going to last.",
  ],
  [
    "Tell the person to your left one thing you genuinely admire about them.",
    "Let the group guess your type from a 30-second description — rate their accuracy.",
  ],
  [
    "Describe your most romantic moment in life without using the word 'love'.",
    "Let someone pick a romantic film you have to recreate one scene from.",
  ],
  [
    "Confess the worst thing you did in a past relationship.",
    "Let the group decide which two people in the room would make the worst couple and explain.",
  ],
  [
    "Give your most dramatic reading of a breakup text you once sent or received.",
    "Let the group ask you one question about your love life that you have to answer completely honestly.",
  ],
  [
    "Tell the group the last time you matched with someone on a dating app and immediately unmatched.",
    "Let someone write a caption for your current profile photo as if it's a dating profile.",
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
  "You find out through a mutual friend that someone in this group has had a crush on you for months.",
  "Your partner surprises you at work and walks in on you doing a ridiculous impression of them.",
  "You're on a first date and run into your ex who looks better than ever — with their attractive new partner.",
  "You're texting two people simultaneously and accidentally swap what you were saying to each.",
  "Someone you've matched with online turns out to be the sibling of someone you already know well.",
  "Your partner finds your journal and it has a list of everything they do that annoys you.",
  "You have to choose between attending your ex's wedding and your best friend's party on the same night.",
  "You find out your partner has been reading your messages for weeks — and didn't find anything bad.",
  "You accidentally friend-request someone's parent on social media instead of the person themselves.",
  "You're introduced to your new partner's family and realize you've previously been very rude to one of them.",
];

export const SPICY_BURNING_HOUSE_OPTION_SETS: [string, string, string][] = [
  ['Kiss passionately', 'Go on a date with', 'Marry immediately'],
  ['Spend one unforgettable night with', 'Have a long-distance relationship with', 'Stay just friends with forever'],
  ['Go on a romantic trip with', 'Move in with', 'Introduce to your family'],
  ['Slow dance with in the rain', 'Watch the sunrise with', 'Skinny dip with'],
  ['Be your soulmate', 'Be your best friend with history', 'Be the one that got away'],
  ['Serenade you in public', 'Write you love letters for a year', 'Plan every date forever'],
  ['Be hopelessly in love with you', 'Be your secret admirer for a year', 'Be your most passionate ex'],
  ['Have a summer fling with', 'Have an arranged marriage with', 'Be your situationship forever'],
  ['Go on a reality dating show with', 'Have matched with on a dating app', 'Meet and immediately elope with'],
  ['Write a song about you', 'Dedicate a book to you', 'Name something after you'],
  ['Be your partner in a dance competition', 'Be your date to a wedding', 'Be your plus-one for a year'],
  ['Cook you dinner every night', 'Leave you love notes daily', 'Always be the big spoon'],
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
  "What's your favourite sex position?",
  "How often do you masturbate?",
  "Have you ever made a sex tape?",
  "Where's the most unusual place you've ever had sex?",
  "Have you ever had sex with other people in the room?",
  "What's the dirtiest thing you've ever done — or want someone to do to you?",
  "Have you ever had an orgy — or would you want to?",
  "Have you ever fantasized about someone in this room?",
  "How old were you when you had sex for the first time?",
  "What's your biggest sexual guilty pleasure?",
  "What's your biggest turn-off that would surprise people?",
  "Have you ever had sex in your parents' bed?",
  "Have you ever been turned on at work — and what did you do about it?",
  "What's the most adventurous sexual thing you've ever agreed to?",
  "Have you ever used a fake name during a hookup?",
  "What's something you've always wanted in bed but never asked for?",
  "Have you ever been walked in on during sex?",
  "What's the boldest move you've ever made on someone?",
  "Have you ever hooked up with someone on the first date?",
  "What's the most explicit dream you've had about someone you know?",
  "Have you ever sent an unsolicited explicit photo?",
  "What's the longest you've gone without sex and how did you cope?",
  "Have you ever slept with someone much older or much younger than you?",
  "What's the weirdest place you've ever been turned on?",
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
  "Describe your ultimate fantasy in explicit detail while everyone listens.",
  "Act out your go-to move on a pillow while everyone watches.",
  "Spell out what you want to do to someone in the room using only emojis — show the group.",
  "Let the group pick someone you have to compliment using only extremely suggestive language for 30 seconds.",
  "Do your most convincing moaning impression for 30 seconds.",
  "Demonstrate your best 'I just woke up and I look amazing' pose.",
  "Let the group rate your 'bedroom eyes' out of 10.",
  "Share the most explicit thing you've ever typed into a search engine.",
  "Perform a 30-second seductive monologue to an inanimate object.",
  "Do your best impression of a character in an adult film discovering wifi.",
  "Let the group go through your most recent dating app conversation.",
  "Tell the group your top 3 explicit bucket list items in detail.",
  "Do a body roll to a song of the group's choosing.",
  "Let someone pour a drink down their arm and you have to lick it off.",
  "Show the group the most explicit text you've ever sent (blur names if needed).",
  "Do your best impression of what the morning after a very good night looks like.",
  "Let the group vote on your most attractive physical feature — and pose to show it off.",
  "Put on the most sensual voice you can and read the first paragraph of Wikipedia's most boring article.",
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
  [
    "Do your most convincing moaning impression for 30 seconds.",
    "Let someone pour a drink down their arm — you have to lick it off.",
  ],
  [
    "Tell the group the most scandalous place you've ever hooked up.",
    "Let someone ask you 3 explicit questions you must answer completely honestly.",
  ],
  [
    "Perform a 30-second lap dance to a song the group picks.",
    "Let the group rate the most suggestive photo in your camera roll.",
  ],
  [
    "Read your most explicit text message in a Shakespearean voice.",
    "Describe your wildest one-night stand story without using any names.",
  ],
  [
    "Let someone choose an explicit dare you must complete in the next 24 hours.",
    "Tell the group what you're most insecure about in bed — and what you're most confident about.",
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
  "Your ex texts you at midnight saying 'I miss you' on the same night you're going on a first date.",
  "You discover your partner has been telling their friends your bedroom stats in explicit detail.",
  "You accidentally send a very explicit voice note to your mum instead of your partner.",
  "You wake up after a very eventful night and find out you've been subtweeted by two people.",
  "Someone at a party loudly announces they've slept with you — to your current partner.",
  "You're having a very quiet intimate moment when your flatmate comes home with 6 people.",
  "Your dating app profile gets screenshotted and ends up in a viral group chat.",
  "You fall asleep after sex and wake up to your partner recording your snoring for social media.",
];

export const NSFW_BURNING_HOUSE_OPTION_SETS: [string, string, string][] = [
  ['Have a one-night stand with', 'Have ongoing friends-with-benefits with', 'Be in a committed relationship with'],
  ['Be dominant with', 'Be submissive with', 'Take turns with'],
  ['Send explicit texts to every night', 'See just once a year but intensely', 'Have constant access to but no physical contact'],
  ['Do absolutely everything with once', 'Never touch but have deep emotional intimacy with', 'Do one specific thing on repeat forever'],
  ['Wake up next to every morning', 'Have a passionate secret affair with', 'Marry and settle down with'],
  ['Skinny dip with', 'Share a hotel room with for a week', 'Take a no-rules trip with'],
  ['Have a steamy summer fling with', 'Have as your secret lover for a year', 'Have a passionate but doomed relationship with'],
  ['Have teach you something explicit', 'Have learn from you', 'Explore together with no experience between you'],
  ['Always be available for a 3am call', 'Always make the first move', 'Always leave you wanting more'],
  ['Have write you explicit letters', 'Have star in your wildest fantasy', 'Have always know exactly what you need'],
];

// ── No-repeat helpers ─────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickUnused<T>(arr: T[], used: string[], toKey: (item: T) => string): T {
  const unused = arr.filter((item) => !used.includes(toKey(item)));
  // Fall back to the full pool if everything has been seen
  return pick(unused.length > 0 ? unused : arr);
}

function poolFor<T>(normal: T[], spicy: T[], nsfw: T[], mode: GameMode): T[] {
  if (mode === 'nsfw') return nsfw;
  if (mode === 'spicy') return spicy;
  if (mode === 'mix') return [...normal, ...spicy];
  return normal;
}

// ── Exports ───────────────────────────────────────────────────────────────────

export function getRandomTruth(mode: GameMode = 'normal', usedKeys: string[] = []): TruthCard {
  const pool = poolFor(TRUTH_SUGGESTIONS, SPICY_TRUTH_SUGGESTIONS, NSFW_TRUTH_SUGGESTIONS, mode);
  const suggestion = pickUnused(pool, usedKeys, (s) => s);
  return { type: 'truth', suggestion, ...defaultInteraction };
}

export function getRandomDare(mode: GameMode = 'normal', usedKeys: string[] = []): DareCard {
  const pool = poolFor(DARE_SUGGESTIONS, SPICY_DARE_SUGGESTIONS, NSFW_DARE_SUGGESTIONS, mode);
  const suggestion = pickUnused(pool, usedKeys, (s) => s);
  return { type: 'dare', suggestion, ...defaultInteraction };
}

export function getRandomDoubleDare(mode: GameMode = 'normal', usedKeys: string[] = []): DoubleDareCard {
  const pool = poolFor(DOUBLE_DARE_SUGGESTIONS, SPICY_DOUBLE_DARE_SUGGESTIONS, NSFW_DOUBLE_DARE_SUGGESTIONS, mode);
  const [s1, s2] = pickUnused(pool, usedKeys, ([a, b]) => `${a}|||${b}`);
  return { type: 'double-dare', suggestion1: s1, suggestion2: s2, completed: [], ...defaultInteraction };
}

export function getRandomSituation(mode: GameMode = 'normal', usedKeys: string[] = []): SituationCard {
  const pool = poolFor(SITUATION_SUGGESTIONS, SPICY_SITUATION_SUGGESTIONS, NSFW_SITUATION_SUGGESTIONS, mode);
  const suggestion = pickUnused(pool, usedKeys, (s) => s);
  return { type: 'situation', suggestion, ...defaultInteraction };
}

export function getRandomBurningHouse(mode: GameMode = 'normal', usedKeys: string[] = []): BurningHouseCard {
  const pool = poolFor(BURNING_HOUSE_OPTION_SETS, SPICY_BURNING_HOUSE_OPTION_SETS, NSFW_BURNING_HOUSE_OPTION_SETS, mode);
  const options = pickUnused(pool, usedKeys, (o) => o.join('|||'));
  return {
    type: 'burning-house',
    options,
    names: null,
    assignments: null,
    ...defaultInteraction,
  };
}

// Returns the tracking key for a drawn card (used to populate usedSuggestions)
export function cardKey(card: { type: string; suggestion?: string; suggestion1?: string; suggestion2?: string; options?: string[] }): string {
  if (card.suggestion !== undefined) return card.suggestion;
  if (card.suggestion1 !== undefined) return `${card.suggestion1}|||${card.suggestion2}`;
  if (card.options !== undefined) return card.options.join('|||');
  return '';
}
