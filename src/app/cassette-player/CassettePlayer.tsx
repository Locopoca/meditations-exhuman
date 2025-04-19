'use client'

import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { initCassette } from './cassette'
import { initWaveform } from './waveform'
import styles from './cassette.module.css'

interface Track {
  title: string
  description: string
  duration: string
  url: string
}

export default function CassettePlayer() {
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const cassetteRef = useRef<ReturnType<typeof initCassette> | null>(null)
  const waveformRef = useRef<WaveSurfer | null>(null)
  const waveformContainerRef = useRef<HTMLDivElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // Load playlist
    fetch('/assets/data/playlist.json')
      .then((response) => response.json())
      .then((data) => setPlaylist(data))

    // Initialize cassette
    cassetteRef.current = initCassette()

    // Initialize waveform
    if (waveformContainerRef.current) {
      waveformRef.current = WaveSurfer.create({
        container: waveformContainerRef.current,
        waveColor: '#fff',
        progressColor: '#ff5500',
        cursorColor: '#fff',
        barWidth: 2,
        height: 100,
        responsive: true
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
    if (audioRef.current && track && waveformRef.current) {
      audioRef.current.src = track.url
      waveformRef.current.load(track.url)
      setCurrentTrackIndex(index)
      if (isPlaying) {
        audioRef.current.play()
        cassetteRef.current?.play()
        waveformRef.current.play()
      }
    }
  }

  const handlePlayPause = () => {
    if (audioRef.current && waveformRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        cassetteRef.current?.pause()
        waveformRef.current.pause()
      } else {
        audioRef.current.play().catch((err) => console.error('Playback error:', err))
        cassetteRef.current?.play()
        waveformRef.current.play()
      }
      setIsPlaying(!isPlaying)
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
      <div id="three-background"></div>
      <div className={styles.cassette}>
        <div className={styles.cassetteBody}>
          <div className={`${styles.tapeWheel} ${styles.left}`}></div>
          <div className={`${styles.tapeWheel} ${styles.right}`}></div>
          <div className={styles.tapeLabel}>
            <h2>{playlist[currentTrackIndex]?.title || 'Select a track'}</h2>
            <p>{playlist[currentTrackIndex]?.description || 'No description'}</p>
            <p>{playlist[currentTrackIndex]?.duration || '0:00'}</p>
          </div>
        </div>
      </div>
      <div className={styles.controls}>
        <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
        <button onClick={handleNext}>Next</button>
        <button onClick={handlePrev}>Previous</button>
      </div>
      <div ref={waveformContainerRef} className={styles.waveform}></div>
      <div className={styles.playlist}>
        <h3>Playlist</h3>
        <ul>
          {playlist.map((track, index) => (
            <li
              key={index}
              onClick={() => handlePlaylistClick(index)}
              className={index === currentTrackIndex ? styles.active : ''}
            >
              {track.title}
            </li>
          ))}
        </ul>
      </div>
      <audio ref={audioRef} />
    </div>
  )
}