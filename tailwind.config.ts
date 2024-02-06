import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'
import typography from '@tailwindcss/typography'
import forms from '@tailwindcss/forms'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {}
  },
  plugins: [typography, forms, daisyui],
  daisyui: {
    themes: ['light', 'dark']
  }
} satisfies Config
