import React from 'react';
import { Box } from '@mui/material';

export default function DeveloperIllustration() {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 340,
        height: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto' }}
      >
        {/* Soft background foliage/shapes */}
        <circle cx="200" cy="150" r="110" fill="#F3F0FF" />
        <ellipse cx="290" cy="180" rx="30" ry="60" fill="#E2D9FF" opacity="0.6" />
        <ellipse cx="110" cy="190" rx="25" ry="50" fill="#E2D9FF" opacity="0.6" />

        {/* Desk / Stand Base */}
        <rect x="130" y="240" width="140" height="8" rx="4" fill="#C7B8FF" />
        <rect x="190" y="215" width="20" height="27" fill="#A892FF" />

        {/* Large Desktop Monitor Screen */}
        <rect x="100" y="70" width="200" height="147" rx="12" fill="#4F2BCB" />
        <rect x="108" y="78" width="184" height="131" rx="8" fill="#FFFFFF" />

        {/* Browser Header Bar */}
        <rect x="108" y="78" width="184" height="24" fill="#F0ECFF" />
        <circle cx="120" cy="90" r="3.5" fill="#EF4444" />
        <circle cx="130" cy="90" r="3.5" fill="#F59E0B" />
        <circle cx="140" cy="90" r="3.5" fill="#10B981" />
        <rect x="155" y="84" width="90" height="12" rx="6" fill="#FFFFFF" />

        {/* Screen Content: </ > code tag */}
        <text
          x="200"
          y="155"
          textAnchor="middle"
          fill="#4F2BCB"
          fontSize="42"
          fontWeight="bold"
          fontFamily="monospace"
        >
          &lt;/&gt;
        </text>

        {/* Small UI Mock Blocks on monitor */}
        <rect x="120" y="175" width="40" height="8" rx="4" fill="#E2D9FF" />
        <rect x="166" y="175" width="68" height="8" rx="4" fill="#4F2BCB" />
        <rect x="240" y="175" width="36" height="8" rx="4" fill="#C7B8FF" />

        {/* Person sitting on top of the monitor */}
        <circle cx="170" cy="42" r="10" fill="#332A4B" />
        <path d="M160 58 C160 50, 180 50, 180 58 L183 70 L157 70 Z" fill="#7C3AED" />
        {/* Legs hanging over screen */}
        <rect x="162" y="70" width="6" height="20" rx="3" fill="#39209A" />
        <rect x="172" y="70" width="6" height="24" rx="3" fill="#39209A" />

        {/* Person working standing on left */}
        <circle cx="95" cy="180" r="9" fill="#332A4B" />
        <path d="M85 195 C85 188, 105 188, 105 195 L102 225 L88 225 Z" fill="#4F2BCB" />
        <rect x="88" y="225" width="5" height="25" fill="#39209A" />
        <rect x="96" y="225" width="5" height="25" fill="#39209A" />

        {/* Person sitting in front on right */}
        <circle cx="310" cy="175" r="9" fill="#332A4B" />
        <path d="M300 190 C300 183, 320 183, 320 190 L318 220 L302 220 Z" fill="#6543ED" />
        <rect x="303" y="220" width="5" height="30" fill="#39209A" />
        <rect x="311" y="220" width="5" height="30" fill="#39209A" />

        {/* Plant on right */}
        <path d="M335 240 L345 240 L342 255 L338 255 Z" fill="#9DA0AE" />
        <circle cx="340" cy="235" r="8" fill="#10B981" />
        <circle cx="345" cy="230" r="6" fill="#059669" />
        <circle cx="335" cy="232" r="5" fill="#34D399" />
      </svg>
    </Box>
  );
}
