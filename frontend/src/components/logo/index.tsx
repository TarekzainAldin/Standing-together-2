import { AudioWaveform } from "lucide-react";
import { Link } from "react-router-dom";
import defaultLogo from "@/assets/logo.png"; // الصورة الافتراضية

interface LogoProps {
  url?: string;
  src?: string;
  alt?: string;
  noLink?: boolean;
}

const Logo = ({ url = "/", src, alt = "Logo", noLink = false }: LogoProps) => {
  const logoSrc = src || defaultLogo;

  const image = (
    <div className="flex h-10 w-10 items-center justify-center rounded-md overflow-hidden bg-primary">
      {logoSrc ? (
        <img src={logoSrc} alt={alt} className="h-full w-full object-contain" />
      ) : (
        <AudioWaveform className="size-4 text-primary-foreground" />
      )}
    </div>
  );

  return (
    <div className="flex items-center justify-center sm:justify-start">
      {noLink ? image : <Link to={url}>{image}</Link>}
    </div>
  );
};

export default Logo;
