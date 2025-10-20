/**
 * Sound utility functions for playing game sound effects
 */

// Helper functions for sound paths
function getSoundEffect(name: string, extension: string = "wav"): string {
  return `/assets/sounds/effects/${name}.${extension}`;
}

function getMusic(name: string, extension: string = "mp3"): string {
  return `/assets/sounds/music/${name}.${extension}`;
}

// Sound effect types
export type SoundEffect =
  | "card-deal"
  | "chips-collect"
  | "chips-place-bet"
  | "button-press"
  | "menu-press"
  | "split-hand"
  | "point-received"
  | "level-up"
  | "user-level-up"
  | "game-win-3"
  | "game-lose-1";

export type MusicTrack =
  | "game-win-3"
  | "game-win-2"
  | "game-win-3"
  | "game-lose-1"
  | "game-lose-2"
  | "game-lose-3"
  | "game-lose-4"
  | "game-lose-5"
  | "win-chips-applause";

// Audio cache
const audioCache: Map<string, HTMLAudioElement> = new Map();

/**
 * Preload a sound effect into memory
 */
export function preloadSound(sound: SoundEffect): void {
  if (typeof window === "undefined") return;

  const key = `effect-${sound}`;
  if (!audioCache.has(key)) {
    const extension =
      sound.includes("level-up") || sound === "user-level-up" ? "mp3" : "wav";
    const audio = new Audio(getSoundEffect(sound, extension));
    audioCache.set(key, audio);
  }
}

/**
 * Preload a music track into memory
 */
export function preloadMusic(track: MusicTrack): void {
  if (typeof window === "undefined") return;

  const key = `music-${track}`;
  if (!audioCache.has(key)) {
    const extension = track === "game-lose-5" ? "wav" : "mp3";
    const audio = new Audio(getMusic(track, extension));
    audioCache.set(key, audio);
  }
}

/**
 * Play a sound effect
 */
export function playSound(
  sound: SoundEffect,
  volume: number = 0.5,
  duration?: number
): void {
  if (typeof window === "undefined") return;

  try {
    const key = `effect-${sound}`;
    let audio = audioCache.get(key);

    if (!audio) {
      // Load on demand if not preloaded
      const extension =
        sound.includes("level-up") ||
        sound === "user-level-up" ||
        sound.includes("game-win") ||
        sound.includes("game-lose")
          ? "mp3"
          : "wav";

      // Use music folder for win/lose sounds
      const audioPath =
        sound.includes("game-win") || sound.includes("game-lose")
          ? `/assets/sounds/music/${sound}.${extension}`
          : getSoundEffect(sound, extension);

      audio = new Audio(audioPath);
      audioCache.set(key, audio);
    }

    // Clone the audio to allow overlapping sounds
    const audioClone = audio.cloneNode() as HTMLAudioElement;
    audioClone.volume = Math.max(0, Math.min(1, volume));

    // If duration is specified, stop after that duration
    if (duration) {
      audioClone.play().catch((error) => {
        console.warn(`Failed to play sound: ${sound}`, error);
      });
      setTimeout(() => {
        audioClone.pause();
        audioClone.currentTime = 0;
      }, duration * 1000);
    } else {
      audioClone.play().catch((error) => {
        console.warn(`Failed to play sound: ${sound}`, error);
      });
    }
  } catch (error) {
    console.warn(`Error playing sound: ${sound}`, error);
  }
}

/**
 * Play a music track
 */
export function playMusic(
  track: MusicTrack,
  volume: number = 0.3,
  loop: boolean = false
): void {
  if (typeof window === "undefined") return;

  try {
    const key = `music-${track}`;
    let audio = audioCache.get(key);

    if (!audio) {
      const extension = track === "game-lose-5" ? "wav" : "mp3";
      audio = new Audio(getMusic(track, extension));
      audioCache.set(key, audio);
    }

    audio.volume = Math.max(0, Math.min(1, volume));
    audio.loop = loop;
    audio.play().catch((error) => {
      console.warn(`Failed to play music: ${track}`, error);
    });
  } catch (error) {
    console.warn(`Error playing music: ${track}`, error);
  }
}

/**
 * Stop a music track
 */
export function stopMusic(track: MusicTrack): void {
  if (typeof window === "undefined") return;

  const key = `music-${track}`;
  const audio = audioCache.get(key);
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

/**
 * Preload all common sounds
 */
export function preloadCommonSounds(): void {
  preloadSound("chips-place-bet");
  preloadSound("chips-collect");
  preloadSound("button-press");
  preloadSound("card-deal");
}
