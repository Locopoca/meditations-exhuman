'use client'

// import { useAccount, useConnect, useDisconnect, useReadContract } from 'wagmi'
import WaveformPlayer from './waveform-player/WaveformPlayer'
import Background from './components/Background'
// import { parseAbi } from 'viem'
import { useState } from 'react'

export default function Home() {
  // const account = useAccount()
  // const { connectors, connect, status, error } = useConnect()
  // const { disconnect } = useDisconnect()
  // const [showWalletPopup, setShowWalletPopup] = useState(false)

  // // Placeholder NFT contract address and ABI (replace with actual values)
  // const NFT_CONTRACT_ADDRESS = '0xYourNFTContractAddress' // Provide actual address
  // const nftAbi = parseAbi([
  //   'function balanceOf(address owner) view returns (uint256)'
  // ])

  // const { data: nftBalance } = useReadContract({
  //   address: NFT_CONTRACT_ADDRESS,
  //   abi: nftAbi,
  //   functionName: 'balanceOf',
  //   args: [account.address],
  //   chainId: account.chainId,
  // })

  // const hasNFT = nftBalance && Number(nftBalance) > 0

  return (
    <>
      <Background />
      <div className="container">
        {/* {account.status === 'connected' ? (
          <div className="web3Section">
            <div className="status">
              <p>Status: {account.status}</p>
              <p>Address: {account.address || 'Not connected'}</p>
              <p>Chain: {account.chain?.name || 'Unknown'}</p>
              <p className="nftStatus">
                NFT Ownership: {hasNFT ? 'Owns NFT' : 'No NFT found'}
              </p>
            </div>
            <button type="button" onClick={() => disconnect()}>
              Disconnect
            </button>
          </div>
        ) : (
          <div className="web3Section">
            <button type="button" onClick={() => setShowWalletPopup(true)}>
              Connect Wallet
            </button>
          </div>
        )}
        {showWalletPopup && (
          <div className="walletPopup">
            <div className="walletPopupContent">
              <h2>Connect Your Wallet</h2>
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  type="button"
                >
                  {connector.name}
                </button>
              ))}
              <button onClick={() => setShowWalletPopup(false)}>Cancel</button>
              {status !== 'idle' && <div>Connection Status: {status}</div>}
              {error && <div className="error">Error: {error.message}</div>}
            </div>
          </div>
        )} */}
        <WaveformPlayer />
      </div>
    </>
  )
}