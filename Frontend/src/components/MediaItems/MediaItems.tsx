import { useEffect, useState } from "react";

  const MediaItem: React.FC<{ url: string; className: string; alt: string }> = ({ url, className, alt }) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);
    useEffect(() => {
      let localBlobUrl: string | null = null;
      if (( isImage) && url) {
      
        fetch(url, { method: "GET", mode: "cors" })
          .then((response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.blob();
          })
          .then((blob) => {
            localBlobUrl = URL.createObjectURL(blob);
            setBlobUrl(localBlobUrl);
          })
         
      } 
      return () => {
        if (localBlobUrl) {
          URL.revokeObjectURL(localBlobUrl);
        }
      };
    }, [url,  isImage]);
   
    
   
    return <img src={blobUrl || url} alt={alt} className={className} />;
  };


  export default MediaItem;