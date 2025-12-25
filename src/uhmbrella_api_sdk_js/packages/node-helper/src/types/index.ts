export type LoadAudioFilesOptions = {
  recursive?: boolean;
  extensions?: string[];
};

export type AudioFile = {
  file: File;
  file_name: string;
};
