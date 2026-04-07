import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<HTMLElement>) {
    return (
        <img 
            src="/Hill-Com.png" 
            alt="Hill-Com Logo" 
            className={props.className} 
            style={{ objectFit: 'contain' }}
        />
    );
}
