import { getLoomEmbedUrl } from '@/lib/loom';

type LoomVideoProps = {
  videoId: string;
  title?: string;
  className?: string;
};

export function LoomVideo({
  videoId,
  title = 'Project demo video',
  className = '',
}: LoomVideoProps) {
  return (
    <div className={`aspect-video w-full overflow-hidden rounded-xl glass-panel ${className}`}>
      <iframe
        src={getLoomEmbedUrl(videoId)}
        title={title}
        allowFullScreen
        className="h-full w-full border-0"
      />
    </div>
  );
}
