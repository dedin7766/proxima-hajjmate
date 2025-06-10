import { ImgHTMLAttributes } from 'react';
import logo from './logo/pos.png'; // pastikan path-nya sesuai

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src={logo}
            alt="App Logo"
            {...props}
        />
    );
}
