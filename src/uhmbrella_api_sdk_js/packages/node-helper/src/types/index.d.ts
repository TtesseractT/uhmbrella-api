export type LoadAudioFilesOptions = {
  recursive?: boolean;
  extensions?: string[];
};

export type AudioFile = {
  file: File;
  file_name: string;
};

/**
 * @function loadAudio 
 * @param filePath
 * Absolute or relative path to the audio file.
 *
 * @returns An {@link AudioFile} object containing:
 * - `file`: A `File` instance backed by the file’s contents
 * - `file_name`: The basename of the provided path
 *
 * @throws An {@link UhmbrellaReadError}
 * when the file cannot be read from disk.
 *
 * @example
 * ```ts
 * try {
 *   const audio = loadAudio("./samples/kick.wav");
 *   console.log("Loaded:", audio.file_name);
 * } catch (err) {
 *   if (err instanceof UhmbrellaReadError) {
 *     console.error("Failed to load audio:", err.path, err.error);
 *   }
 * }
 * ```
 */
export function loadAudio(filePath: string): AudioFile;
/**
 * @function loadAudioFilesFromDirectory
 * @param dirPath - Absolute or relative path to the directory to scan.
 *
 * @param options - {@link LoadAudioFilesOptions}
 * Optional configuration controlling traversal behavior.
 *
 * Defaults to:
 * `[".mp3", ".wav", ".flac", ".m4a", ".aac", ".ogg"]`
 *
 * @returns An object containing:
 * - `files`: {@link AudioFile}[] Successfully loaded audio files
 * - `errors`:{@link UhmbrellaReadError}[] Diagnostics for any read or traversal failures
 *
 * @example
 * ```ts
 * const { files, errors } = loadAudioFilesFromDirectory("./music", {
 *   recursive: true,
 *   extensions: ["mp3", "wav"],
 * });
 *
 * console.log(files.length, "audio files loaded");
 *
 * if (errors.length > 0) {
 *   console.warn("Some files could not be read:", errors);
 * }
 * ```
 */

export function loadAudioFilesFromDirectory(dirPath: string, options: LoadAudioFilesOptions = {}): {
  files: AudioFile[];
  errors: UhmbrellaReadError[];
}
