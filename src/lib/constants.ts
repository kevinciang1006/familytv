import type { Profile } from './types'

export const PROFILES: Profile[] = [
  { id: 'mom',  name: 'Sarah',  color: '#E7352C', emoji: '🌻', kids: false },
  { id: 'dad',  name: 'Marcus', color: '#2D7DD2', emoji: '🎧', kids: false },
  { id: 'kid1', name: 'Emma',   color: '#F4A338', emoji: '🦊', kids: true, age: 6 },
  { id: 'kid2', name: 'Leo',    color: '#6BCB77', emoji: '🐸', kids: true, age: 9 },
  { id: 'gran', name: 'Nana',   color: '#B088F9', emoji: '🌼', kids: false },
]

export const CATEGORIES = [
  { id: 'all',      label: 'All' },
  { id: 'cartoons', label: 'Cartoons' },
  { id: 'learning', label: 'Learning' },
  { id: 'movies',   label: 'Family Movies' },
  { id: 'music',    label: 'Sing-alongs' },
  { id: 'nature',   label: 'Nature' },
  { id: 'cooking',  label: 'Cooking' },
  { id: 'science',  label: 'Science' },
  { id: 'bedtime',  label: 'Bedtime' },
  { id: 'crafts',   label: 'Crafts' },
  { id: 'sports',   label: 'Sports' },
]

export const PALETTES: [string, string][] = [
  ['#FFD7D2', '#FFB5AD'],
  ['#FFE4B8', '#FFC978'],
  ['#D6ECD2', '#A9D5A0'],
  ['#D2E4FF', '#A8C8FA'],
  ['#E8DCFB', '#CBB6F2'],
  ['#FFE8F1', '#FFC2D9'],
  ['#D9F0EE', '#A3DAD4'],
  ['#FFF1C9', '#FFE089'],
  ['#FBDBC1', '#F4B489'],
  ['#DDE2E8', '#B7C1CD'],
]

export const COMMENTS = [
  { user: 'HappyNestMom', color: '#E7352C', letter: 'H', time: '2d', text: "My 6-year-old has watched this 4 times this week. We love the dream sequence at 14:20!", likes: 128 },
  { user: 'DadOfThree',   color: '#2D7DD2', letter: 'D', time: '1w', text: "Genuinely great animation. Reminds me of the films I grew up with.", likes: 84 },
  { user: 'Ms. Ruiz',     color: '#6BCB77', letter: 'M', time: '3w', text: "Used this in class today. The kids were completely silent — which never happens.", likes: 212 },
  { user: 'NanaJo',       color: '#B088F9', letter: 'N', time: '1mo', text: "What a treat. The grandkids and I watched it twice on a rainy afternoon.", likes: 57 },
]

export const MOCK_VIDEOS = [
  { id: 'v1',  youtube_id: 'dQw4w9WgXcQ', title: 'The Cloud Kingdom Adventures',   description: 'A magical adventure through the clouds.', category: 'cartoons', age_rating: '6+', is_featured: false, is_kids: true,  sort_order: 1,  created_at: '2024-01-01T00:00:00Z' },
  { id: 'v2',  youtube_id: 'dQw4w9WgXcQ', title: 'Benny Bunny & the Carrot Caper', description: 'Benny goes on a great carrot adventure.',    category: 'cartoons', age_rating: '4+', is_featured: false, is_kids: true,  sort_order: 2,  created_at: '2024-01-01T00:00:00Z' },
  { id: 'v3',  youtube_id: 'dQw4w9WgXcQ', title: 'Robo-Pals: Gear Up!',            description: 'Robots team up to save the day.',           category: 'cartoons', age_rating: '7+', is_featured: false, is_kids: true,  sort_order: 3,  created_at: '2024-01-01T00:00:00Z' },
  { id: 'v4',  youtube_id: 'dQw4w9WgXcQ', title: 'Under the Tide',                 description: 'Deep ocean adventures await.',              category: 'cartoons', age_rating: '5+', is_featured: false, is_kids: true,  sort_order: 4,  created_at: '2024-01-01T00:00:00Z' },
  { id: 'v5',  youtube_id: 'dQw4w9WgXcQ', title: 'Alphabet Zoo: Letter G',         description: 'Learn the alphabet with zoo animals.',      category: 'learning', age_rating: '3+', is_featured: false, is_kids: true,  sort_order: 5,  created_at: '2024-01-01T00:00:00Z' },
  { id: 'v6',  youtube_id: 'dQw4w9WgXcQ', title: 'Counting with Clementine',       description: 'Count along with Clementine.',              category: 'learning', age_rating: '4+', is_featured: false, is_kids: true,  sort_order: 6,  created_at: '2024-01-01T00:00:00Z' },
  { id: 'v7',  youtube_id: 'dQw4w9WgXcQ', title: 'Why Does It Rain?',              description: 'Discover the science of rain.',             category: 'learning', age_rating: '7+', is_featured: false, is_kids: true,  sort_order: 7,  created_at: '2024-01-01T00:00:00Z' },
  { id: 'v8',  youtube_id: 'dQw4w9WgXcQ', title: 'Moonlit: A Family Tale',         description: 'When a quiet mountain town loses its moon, three siblings set out across the night sky to bring it home before morning.', category: 'movies', age_rating: '8+', is_featured: true, is_kids: true, sort_order: 8, created_at: '2024-01-01T00:00:00Z' },
  { id: 'v9',  youtube_id: 'dQw4w9WgXcQ', title: 'The Great Pancake Caper',        description: 'A pancake mystery unfolds.',                category: 'movies',   age_rating: '6+', is_featured: false, is_kids: true,  sort_order: 9,  created_at: '2024-01-01T00:00:00Z' },
  { id: 'v10', youtube_id: 'dQw4w9WgXcQ', title: 'Backyard Explorers',             description: 'Adventures right in the backyard.',         category: 'movies',   age_rating: '6+', is_featured: false, is_kids: true,  sort_order: 10, created_at: '2024-01-01T00:00:00Z' },
  { id: 'v11', youtube_id: 'dQw4w9WgXcQ', title: 'Sing-Along Saturdays: Vol. 4',  description: 'Sing your heart out!',                      category: 'music',    age_rating: '3+', is_featured: false, is_kids: true,  sort_order: 11, created_at: '2024-01-01T00:00:00Z' },
  { id: 'v12', youtube_id: 'dQw4w9WgXcQ', title: 'Tiny Drummers Dance Party',      description: 'Drums and dancing for tiny musicians.',     category: 'music',    age_rating: '4+', is_featured: false, is_kids: true,  sort_order: 12, created_at: '2024-01-01T00:00:00Z' },
  { id: 'v13', youtube_id: 'dQw4w9WgXcQ', title: 'Baby Animals of the Serengeti',  description: 'Amazing baby animals in the wild.',         category: 'nature',   age_rating: '8+', is_featured: false, is_kids: true,  sort_order: 13, created_at: '2024-01-01T00:00:00Z' },
  { id: 'v14', youtube_id: 'dQw4w9WgXcQ', title: 'Ocean Giants: Whales Up Close',  description: 'Majestic whales in their natural habitat.', category: 'nature',   age_rating: '9+', is_featured: false, is_kids: true,  sort_order: 14, created_at: '2024-01-01T00:00:00Z' },
  { id: 'v15', youtube_id: 'dQw4w9WgXcQ', title: 'Tiny Bugs, Big World',           description: 'The incredible world of insects.',          category: 'nature',   age_rating: '7+', is_featured: false, is_kids: true,  sort_order: 15, created_at: '2024-01-01T00:00:00Z' },
  { id: 'v16', youtube_id: 'dQw4w9WgXcQ', title: 'Rainy Day Cookies with Mila',   description: 'Bake delicious cookies on a rainy day.',    category: 'cooking',  age_rating: '8+', is_featured: false, is_kids: true,  sort_order: 16, created_at: '2024-01-01T00:00:00Z' },
  { id: 'v17', youtube_id: 'dQw4w9WgXcQ', title: 'Pizza Night Four Ways',          description: 'Four amazing pizza recipes for the family.',category: 'cooking',  age_rating: '10+',is_featured: false, is_kids: false, sort_order: 17, created_at: '2024-01-01T00:00:00Z' },
  { id: 'v18', youtube_id: 'dQw4w9WgXcQ', title: 'Volcanoes Explained',            description: 'How do volcanoes form and erupt?',          category: 'science',  age_rating: '8+', is_featured: false, is_kids: true,  sort_order: 18, created_at: '2024-01-01T00:00:00Z' },
  { id: 'v19', youtube_id: 'dQw4w9WgXcQ', title: 'Build Your Own Paper Rocket',    description: 'Make and launch your own paper rocket.',    category: 'science',  age_rating: '8+', is_featured: false, is_kids: true,  sort_order: 19, created_at: '2024-01-01T00:00:00Z' },
  { id: 'v20', youtube_id: 'dQw4w9WgXcQ', title: 'The Night Sky for Beginners',    description: 'Explore the stars and planets.',            category: 'science',  age_rating: '9+', is_featured: false, is_kids: true,  sort_order: 20, created_at: '2024-01-01T00:00:00Z' },
  { id: 'v21', youtube_id: 'dQw4w9WgXcQ', title: 'Sleepy Stories: The Quiet Forest','description': 'Drift off with calming forest stories.', category: 'bedtime',  age_rating: '3+', is_featured: false, is_kids: true,  sort_order: 21, created_at: '2024-01-01T00:00:00Z' },
  { id: 'v22', youtube_id: 'dQw4w9WgXcQ', title: 'Dreamboat Lullabies',            description: 'Gentle lullabies to ease you to sleep.',   category: 'bedtime',  age_rating: '3+', is_featured: false, is_kids: true,  sort_order: 22, created_at: '2024-01-01T00:00:00Z' },
  { id: 'v23', youtube_id: 'dQw4w9WgXcQ', title: 'Origami for Beginners',          description: 'Fold beautiful paper creations.',          category: 'crafts',   age_rating: '7+', is_featured: false, is_kids: true,  sort_order: 23, created_at: '2024-01-01T00:00:00Z' },
  { id: 'v24', youtube_id: 'dQw4w9WgXcQ', title: 'Salt Dough Sea Creatures',       description: 'Create adorable sea creatures from dough.', category: 'crafts',  age_rating: '6+', is_featured: false, is_kids: true,  sort_order: 24, created_at: '2024-01-01T00:00:00Z' },
  { id: 'v25', youtube_id: 'dQw4w9WgXcQ', title: 'Kids vs. Parents: Backyard Olympics','description': 'Epic family sports competition.',    category: 'sports',   age_rating: '7+', is_featured: false, is_kids: true,  sort_order: 25, created_at: '2024-01-01T00:00:00Z' },
  { id: 'v26', youtube_id: 'dQw4w9WgXcQ', title: 'Learn to Skateboard in 10 Minutes','description': 'Get started on a skateboard safely.', category: 'sports',   age_rating: '9+', is_featured: false, is_kids: true,  sort_order: 26, created_at: '2024-01-01T00:00:00Z' },
]

export const MOCK_DURATIONS: Record<string, string> = {
  'v1': '24:12', 'v2': '11:08', 'v3': '22:40', 'v4': '18:55',
  'v5': '08:22', 'v6': '09:45', 'v7': '06:12',
  'v8': '1h 34m', 'v9': '1h 12m', 'v10': '1h 28m',
  'v11': '32:00', 'v12': '14:30',
  'v13': '44:10', 'v14': '48:55', 'v15': '27:02',
  'v16': '12:44', 'v17': '18:20',
  'v18': '07:30', 'v19': '09:14', 'v20': '11:22',
  'v21': '22:10', 'v22': '40:00',
  'v23': '15:00', 'v24': '10:45',
  'v25': '19:10', 'v26': '10:30',
}

export const MOCK_CHANNELS: Record<string, string> = {
  'v1': 'Pixel Puddle Studio', 'v2': 'Burrow Books', 'v3': 'Tinker Tales', 'v4': 'Driftwood Films',
  'v5': 'Little Learners', 'v6': 'Bright Buttons', 'v7': 'Curious Kids Lab',
  'v8': 'Harvest Pictures', 'v9': 'Sunny Reel', 'v10': 'Harvest Pictures',
  'v11': 'Giggle Choir', 'v12': 'Thumpa',
  'v13': 'Wild Window', 'v14': 'Bluefin Films', 'v15': 'Wild Window',
  'v16': 'Home Kitchen Club', 'v17': 'Fork & Firepit',
  'v18': 'Curious Kids Lab', 'v19': 'Saturday Science', 'v20': 'Saturday Science',
  'v21': 'Moth & Moon', 'v22': 'Moth & Moon',
  'v23': 'Paper Pals', 'v24': 'Make & Mess',
  'v25': 'Family Field', 'v26': 'Wheels Up',
}

export const MOCK_VIEWS: Record<string, string> = {
  'v1': '2.1M', 'v2': '841K', 'v3': '3.4M', 'v4': '612K',
  'v5': '1.2M', 'v6': '540K', 'v7': '990K',
  'v8': '—', 'v9': '—', 'v10': '—',
  'v11': '2.8M', 'v12': '700K',
  'v13': '5.1M', 'v14': '3.9M', 'v15': '1.8M',
  'v16': '420K', 'v17': '1.1M',
  'v18': '2.2M', 'v19': '680K', 'v20': '1.0M',
  'v21': '3.3M', 'v22': '4.7M',
  'v23': '560K', 'v24': '310K',
  'v25': '1.4M', 'v26': '890K',
}

export const CONTINUE_IDS = [
  { id: 'v3', progress: 0.62 },
  { id: 'v8', progress: 0.18 },
  { id: 'v13', progress: 0.88 },
  { id: 'v18', progress: 0.45 },
  { id: 'v21', progress: 0.10 },
]
