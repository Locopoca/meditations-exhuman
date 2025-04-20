'use client'

import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import styles from './waveform.module.css'

interface Track {
  title: string
  description: string
  duration: string
  url: string
  fallback?: string
}

export default function WaveformPlayer() {
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const waveformRef = useRef<WaveSurfer | null>(null)
  const waveformContainerRef = useRef<HTMLDivElement | null>(null)
  const playlistRef = useRef<HTMLDivElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Format time in mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Space bar play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target instanceof HTMLElement && e.target.tagName !== 'INPUT') {
        e.preventDefault()
        handlePlayPause()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying])

  // Two-finger scrolling for playlist
  useEffect(() => {
    const playlistElement = playlistRef.current
    if (!playlistElement) return

    let touchData = { touches: [], startY: 0 }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const [touch1, touch2] = e.touches
        touchData.touches = [touch1, touch2]
        touchData.startY = (touch1.clientY + touch2.clientY) / 2
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const [touch1, touch2] = e.touches
        const currentY = (touch1.clientY + touch2.clientY) / 2
        const dy = touchData.startY - currentY
        playlistElement.scrollTop += dy
        touchData.startY = currentY
        touchData.touches = [touch1, touch2]
      }
    }

    playlistElement.addEventListener('touchstart', handleTouchStart, { passive: false })
    playlistElement.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      playlistElement.removeEventListener('touchstart', handleTouchStart)
      playlistElement.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  useEffect(() => {
    // Load playlist
    fetch('/assets/data/playlist.json')
      .then((response) => response.json())
      .then((data) => setPlaylist(data))
      .catch((err) => setError('Failed to load playlist: ' + err.message))

    // Initialize waveform
    if (waveformContainerRef.current) {
      waveformRef.current = WaveSurfer.create({
        container: waveformContainerRef.current,
        waveColor: '#fff',
        progressColor: 'rgb(199, 163, 1)',
        cursorColor: '#fff',
        barWidth: 2,
        barRadius: 0,
        cursorWidth: 2,
        height: 80,
        backend: 'MediaElement',
        normalize: true
      })

      // Click to play
      waveformRef.current.on('click', () => {
        if (waveformRef.current) {
          setTimeout(() => {
            waveformRef.current?.play().catch((err) => setError('Playback error: ' + err.message))
            setIsPlaying(true)
          }, 100)
        }
      })

      // Update current time
      waveformRef.current.on('audioprocess', (time) => {
        setCurrentTime(time)
      })

      // Set duration on ready
      waveformRef.current.on('ready', () => {
        if (waveformRef.current) {
          setDuration(waveformRef.current.getDuration())
          setError(null)
        }
      })

      // Handle errors
      waveformRef.current.on('error', (err) => {
        setError('Waveform error: ' + err)
      })

      // Auto-play next track on finish
      waveformRef.current.on('finish', () => {
        setIsPlaying(false)
        handleNext()
      })
    }

    // Cleanup
    return () => {
      waveformRef.current?.destroy()
    }
  }, [])

  useEffect(() => {
    if (playlist.length > 0) {
      loadTrack(currentTrackIndex)
    }
  }, [playlist])

  const loadTrack = (index: number) => {
    const track = playlist[index]
    if (waveformRef.current && track) {
      setError(null)
      // Prioritize .mp3 if available, fallback to .aac
      const urlToLoad = track.url.endsWith('.mp3') ? track.url : track.fallback || track.url
      waveformRef.current.load(urlToLoad).catch((err) => {
        if (urlToLoad !== track.fallback && track.fallback) {
          waveformRef.current?.load(track.fallback).catch((fallbackErr) => {
            setError('Failed to load audio: ' + fallbackErr.message)
          })
        } else {
          setError('Failed to load audio: ' + err.message)
        }
      })
      setCurrentTrackIndex(index)
      setCurrentTime(0)
      if (isPlaying) {
        setTimeout(() => {
          waveformRef.current?.play().catch((err) => setError('Playback error: ' + err.message))
        }, 100)
      }
    }
  }

  const handlePlayPause = () => {
    if (waveformRef.current) {
      if (isPlaying) {
        waveformRef.current.pause()
        setIsPlaying(false)
      } else {
        setTimeout(() => {
          waveformRef.current?.play().catch((err) => setError('Playback error: ' + err.message))
          setIsPlaying(true)
        }, 100)
      }
    }
  }

  const handleNext = () => {
    const nextIndex = (currentTrackIndex + 1) % playlist.length
    setCurrentTrackIndex(nextIndex)
    loadTrack(nextIndex)
    setIsPlaying(true)
  }

  const handlePrev = () => {
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length
    setCurrentTrackIndex(prevIndex)
    loadTrack(prevIndex)
    setIsPlaying(true)
  }

  const handlePlaylistClick = (index: number) => {
    setCurrentTrackIndex(index)
    loadTrack(index)
    setIsPlaying(true)
  }

  return (
    <div className={styles.playerContainer}>
      <div className={styles.player}>
        <h2>{playlist[currentTrackIndex]?.title || 'Select a meditation'}</h2>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.time}>
          <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
        </div>
        <div ref={waveformContainerRef} className={styles.waveform}></div>
        <div className={styles.controls}>
          <button onClick={handlePrev}>Prev</button>
          <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
          <button onClick={handleNext}>Next</button>
        </div>
      </div>
      <div className={styles.playlist} ref={playlistRef}>
        <h3>Playlist</h3>
        <table className={styles.playlistTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {playlist.map((track, index) => (
              <tr
                key={index}
                onClick={() => handlePlaylistClick(index)}
                className={index === currentTrackIndex ? styles.active : ''}
              >
                <td>{index + 1}</td>
                <td>{track.title}</td>
                <td>{track.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}