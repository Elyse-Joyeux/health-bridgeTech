/** Curated assessment questions per problem area */
export const ASSESSMENT_QUESTIONS: Record<string, { id: string; prompt: string; options: string[] }[]> = {
  anxiety: [
    {
      id: 'a1',
      prompt: 'How often do you feel overwhelmed by anxious thoughts?',
      options: ['Rarely', 'A few days a week', 'Most days', 'Daily'],
    },
    {
      id: 'a2',
      prompt: 'When anxiety peaks, what physical sensation do you notice first?',
      options: ['Tight chest', 'Racing heart', 'Shallow breath', 'Stomach knot'],
    },
    {
      id: 'a3',
      prompt: 'Which situations trigger your anxiety most strongly?',
      options: ['Work pressure', 'Social settings', 'Health worries', 'Open-ended uncertainty'],
    },
  ],
  sleep: [
    {
      id: 's1',
      prompt: 'How would you describe your sleep over the last 2 weeks?',
      options: ['Restorative', 'Mostly okay', 'Restless', 'Severely disrupted'],
    },
    {
      id: 's2',
      prompt: 'What time do you usually fall asleep?',
      options: ['Before 10pm', '10pm \u2013 12am', '12am \u2013 2am', 'After 2am'],
    },
    {
      id: 's3',
      prompt: 'Do you wake during the night?',
      options: ['Rarely', 'Once', '2-3 times', 'Many times'],
    },
  ],
  stress: [
    {
      id: 'st1',
      prompt: 'How often does stress affect your decision-making?',
      options: ['Rarely', 'Sometimes', 'Often', 'Constantly'],
    },
    {
      id: 'st2',
      prompt: 'What is your primary stressor right now?',
      options: ['Work', 'Relationships', 'Finances', 'Health'],
    },
  ],
  focus: [
    {
      id: 'f1',
      prompt: 'How long can you concentrate on one task without interruption?',
      options: ['Under 10 minutes', '10\u201330 minutes', '30\u201360 minutes', 'Over an hour'],
    },
    {
      id: 'f2',
      prompt: 'Where do you usually lose focus?',
      options: ['Email/notifications', 'Inner thoughts', 'Energy dips', 'Environmental noise'],
    },
  ],
  grief: [
    {
      id: 'g1',
      prompt: 'How recently did you experience your loss?',
      options: ['Within 30 days', '1\u20133 months ago', '3\u201312 months ago', 'Over a year ago'],
    },
    {
      id: 'g2',
      prompt: 'How present is grief day-to-day right now?',
      options: ['Constant', 'Frequent waves', 'Occasional', 'Receding'],
    },
  ],
  trauma: [
    {
      id: 't1',
      prompt: 'How often do trauma memories surface unexpectedly?',
      options: ['Rarely', 'Weekly', 'Daily', 'Multiple times per day'],
    },
    {
      id: 't2',
      prompt: 'Have you previously worked with a therapist on this?',
      options: ['Never', 'Briefly', 'Currently', 'Long-term'],
    },
  ],
};

/** Curated ambient music tracks (royalty-free CC0 streams) */
export const MUSIC_TRACKS = [
  {
    id: 'ocean',
    title: 'Oceanic Breath',
    mood: 'Deep Calm',
    duration: '32:10',
    url: 'https://cdn.pixabay.com/audio/2022/10/18/audio_ec0c46f1f5.mp3',
    cover: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=400&fit=crop',
  },
  {
    id: 'forest',
    title: 'Forest Awakening',
    mood: 'Grounding',
    duration: '28:45',
    url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_c8e98a3d7d.mp3',
    cover: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=400&fit=crop',
  },
  {
    id: 'rain',
    title: 'Gentle Rain',
    mood: 'Sleep',
    duration: '40:00',
    url: 'https://cdn.pixabay.com/audio/2023/03/22/audio_e87f3c3aab.mp3',
    cover: 'https://images.unsplash.com/photo-1438449805896-28a666819a20?w=400&h=400&fit=crop',
  },
  {
    id: 'piano',
    title: 'Soft Piano Reverie',
    mood: 'Reflection',
    duration: '22:15',
    url: 'https://cdn.pixabay.com/audio/2023/06/19/audio_a18bd6789e.mp3',
    cover: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop',
  },
  {
    id: 'binaural',
    title: 'Theta Flow (8 Hz)',
    mood: 'Focus',
    duration: '30:00',
    url: 'https://cdn.pixabay.com/audio/2022/11/22/audio_64b8d5b6c3.mp3',
    cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=400&fit=crop',
  },
];

/** Curated AI companion responses keyed by topic */
export function companionReply(userText: string): string {
  const t = userText.toLowerCase();
  if (t.includes('anxious') || t.includes('anxiety') || t.includes('worried')) {
    return "I hear you. That tension is real. Let\u2019s try a 4-7-8 breath: inhale for 4 counts, hold for 7, exhale for 8. Repeat three times and tell me what shifts.";
  }
  if (t.includes('sleep') || t.includes('tired') || t.includes('insomnia')) {
    return "Sleep is the foundation of everything else. Tonight, try a 10-minute body scan before bed and lower your room temperature to 18\u00b0C. Want me to queue an Oceanic Breath track for tonight?";
  }
  if (t.includes('stress') || t.includes('overwhelmed') || t.includes('pressure')) {
    return "When stress climbs, your body needs a signal of safety. Try this: place a hand on your chest, exhale longer than you inhale for two minutes. I\u2019ll be here when you\u2019re done.";
  }
  if (t.includes('sad') || t.includes('down') || t.includes('depressed')) {
    return "Thank you for trusting me with that. Sadness deserves space, not solutions. Could you name one small thing today that felt even slightly steady?";
  }
  if (t.includes('focus') || t.includes('distract') || t.includes('concentrate')) {
    return "Focus is a muscle. Let\u2019s do a 25-minute focused block with a 5-minute decompress. Want me to start a Theta Flow track to anchor your attention?";
  }
  if (t.includes('thank')) {
    return 'Always. I\u2019m here whenever you need a moment. \uD83C\uDF3F';
  }
  if (t.includes('hello') || t.includes('hi ') || t === 'hi' || t.includes('hey')) {
    return 'Hello, Alex. How is your body feeling in this exact moment \u2014 from the top of your head down to your feet?';
  }
  return "I\u2019m listening. Tell me a little more about what\u2019s present for you right now \u2014 a sensation, an image, or a thought.";
}
