import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Monitor, ZoomIn } from 'lucide-react';

interface ImagePreviewProps {
    src: string;
    alt?: string;
    triggerClassName?: string;
}

export function ImagePreview({ src, alt = 'Snapshot', triggerClassName = '' }: ImagePreviewProps) {
    if (!src) {
        return (
            <div className="h-8 w-12 bg-muted/30 rounded border border-dashed flex items-center justify-center">
                <Monitor className="h-3 w-3 text-muted-foreground/20" />
            </div>
        );
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className={`inline-block relative group/img cursor-zoom-in outline-none focus:ring-2 focus:ring-primary rounded overflow-hidden ${triggerClassName}`}>
                    <img
                        src={src}
                        alt={alt}
                        className="h-8 w-12 object-cover rounded shadow-sm border border-border group-hover/img:brightness-75 transition-all"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <ZoomIn className="h-4 w-4 text-white drop-shadow-md" />
                    </div>
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none shadow-2xl">
                <DialogHeader className="absolute top-4 left-4 z-10 px-0 space-y-0 text-left bg-black/40 backdrop-blur-md py-1 px-3 rounded-full border border-white/10">
                    <DialogTitle className="text-xs font-black uppercase tracking-[0.2em] text-white/90">
                        Visual Confirmation
                    </DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-center min-h-[40vh] max-h-[85vh] w-full bg-grid-white/[0.02]">
                    <img
                        src={src}
                        alt={alt}
                        className="max-w-full max-h-[85vh] object-contain shadow-2xl animate-in zoom-in-95 duration-300"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
