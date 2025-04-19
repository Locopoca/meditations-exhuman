export function initCassette() {
    const leftWheel = document.querySelector('.tapeWheel.left') as HTMLElement
    const rightWheel = document.querySelector('.tapeWheel.right') as HTMLElement
  
    return {
      play: () => {
        leftWheel?.classList.add('playing')
        rightWheel?.classList.add('playing')
      },
      pause: () => {
        leftWheel?.classList.remove('playing')
        rightWheel?.classList.remove('playing')
      }
    }
  }