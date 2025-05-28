
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Image } from 'lucide-react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  title?: string;
  description?: string;
}

const QRCodeGenerator = ({ 
  value, 
  size = 200, 
  title = "Scan to Connect",
  description = "Scan this QR code to view this profile"
}: QRCodeGeneratorProps) => {
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Using QR Server API which is more reliable
    const encodedValue = encodeURIComponent(value);
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedValue}`);
    // Reset states when value changes
    setImageLoaded(false);
    setImageError(false);
  }, [value, size]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast({
      description: "Link copied to clipboard!",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      description: "QR code downloaded successfully!",
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 flex flex-col items-center">
        <h3 className="font-semibold text-xl mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4 text-center">{description}</p>
        
        <div className="bg-white p-3 rounded-lg mb-4 shadow-sm">
          {!imageLoaded && !imageError && (
            <div className="flex items-center justify-center h-[200px] w-[200px]">
              <QrCode className="h-12 w-12 animate-pulse text-gray-300" />
            </div>
          )}
          
          {imageError && (
            <div className="flex flex-col items-center justify-center h-[200px] w-[200px] text-center">
              <Image className="h-12 w-12 mb-2 text-gray-300" />
              <p className="text-sm text-muted-foreground">Failed to load QR code</p>
            </div>
          )}

          {qrUrl && (
            <img
              src={qrUrl}
              alt="QR Code"
              width={size}
              height={size}
              className={`mx-auto transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
        </div>
        
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleCopyLink}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleDownload}
            disabled={!imageLoaded || imageError}
          >
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
