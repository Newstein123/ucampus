import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import React from 'react';

// Custom outlined forward arrow icon (matches outline style of other icons)
const ShareArrowIcon: React.FC<SvgIconProps> = ({ fontSize = 'small', ...props }) => (
    <SvgIcon fontSize={fontSize} {...props}>
        <path
            d="M21 12l-7-7v4C7 10 4 15 3 20c2.5-3.5 6-5.1 11-5.1V19l7-7z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
        />
    </SvgIcon>
);

export default ShareArrowIcon;
