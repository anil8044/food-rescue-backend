import { Box } from '@mui/material'

export default function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <Box aria-hidden="true" sx={{ width: size, height: size, flexShrink: 0, borderRadius: 3, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #2b8a57, #1d6a41)', boxShadow: '0 4px 14px rgba(43,138,87,0.25)' }}>
      <svg width={size * 0.64} height={size * 0.64} viewBox="0 0 32 32" fill="none">
        <path d="M16 27V14M16 20C8 20 4 15 4 7c8 0 12 5 12 13ZM16 15c0-8 4-11 12-11 0 8-4 11-12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Box>
  )
}
