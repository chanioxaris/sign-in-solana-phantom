import { useState } from 'react';
import bs58 from 'bs58';

function App() {
  const [ signedInAddress, setSignedInAddress ] = useState('');

  const isPhantomAvailable = () => {
    const { solana } = window;
    return solana && solana.isPhantom;
  }

  const handleSignIn = async () => {
    const { solana } = window;

    const { publicKey } = await solana.connect();

    let response = await fetch('/api/nonce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: publicKey,
      }),
    })
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const body = await response.json();
    const encodedMessage = new TextEncoder().encode(body.nonce);
    const { signature } = await solana.signMessage(encodedMessage, 'utf8');

    response = await fetch('/api/verify-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: publicKey,
        signature: bs58.encode(signature),
      }),
    })
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    setSignedInAddress(publicKey.toString());
  }

  const handleLogout = () => setSignedInAddress('');

  if (!isPhantomAvailable()) {
    return (
        <div>Please install or enable Phantom wallet to get started</div>
    );
  }

  return (
      <div>
        { !signedInAddress ?
            <button onClick={handleSignIn}>
              Sign in with Phantom
            </button>
            :
            <div>
              <p>Successfully signed in with Phantom!</p>
              <p>Solana address {signedInAddress}</p>
              <button onClick={handleLogout}>
                Logout
              </button>
            </div>
        }
      </div>
  );
}

export default App;
