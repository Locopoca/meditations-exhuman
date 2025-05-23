import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import { type ReactNode } from 'react'
// import { cookieToInitialState } from 'wagmi'

// import { getConfig } from '../wagmi'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Retreat Core',
  description: 'A meditation series with @3xhuman, coded by @filt_mr',
  icons: {
    icon: '/favicon.ico'
  }
}

export default function RootLayout(props: { children: ReactNode }) {
  // const initialState = cookieToInitialState(
  //   // getConfig(),
  //   // headers().get('cookie'),
  // )
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{props.children}</Providers>
      </body>
    </html>
  )
}