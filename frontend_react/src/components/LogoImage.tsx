import { Image } from '@mantine/core';  
import bannerImage from '../assets/img/banner.jpg'; 
interface LogoImageProps {  
    src: string;  
    alt: string;  
    height?: number;  
}  

export function LogoImage({ alt, height }: LogoImageProps) {  
    return (  
        <Image  
            src={bannerImage}  
            alt={alt}  
            height={height || 400}  
            fallbackSrc={bannerImage}  
        /> 
    );  
}