declare module 'sound-play' {
    interface SoundPlayOptions {
        volume?: number;
    }

    /**
     * Play an audio file.
     * @param filePath Path to the audio file
     * @param volume Volume level from 0.0 to 1.0
     */
    export function play(filePath: string, volume?: number): Promise<void>;

    const _default: {
        play: typeof play;
    };
    export default _default;
}

declare module 'mp3-duration' {
    type Callback = (err: Error | null, duration: number) => void;

    /**
     * Get the duration of an MP3 file in seconds.
     * @param filePathOrBuffer Path to MP3 file or a Buffer
     * @param callback Callback with (error, duration_in_seconds)
     */
    function mp3Duration(filePathOrBuffer: string | Buffer, callback: Callback): void;
    function mp3Duration(filePathOrBuffer: string | Buffer, options: { cbrEstimate?: boolean }, callback: Callback): void;

    export = mp3Duration;
}
