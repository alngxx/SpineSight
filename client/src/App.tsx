import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [deviceId, setDeviceId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let storedId = localStorage.getItem('device_id');
    if (!storedId) {
      storedId = crypto.randomUUID();
      localStorage.setItem('device_id', storedId);
    }
    setDeviceId(storedId);
  }, []);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    
    // Quick validation
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);

    try {
      // 1. Prepare the data
      const formData = new FormData();
      formData.append('image', file);

      // 2. Send to our backend
      const response = await fetch('http://localhost:3000/api/scan', {
        method: 'POST',
        headers: {
          'x-device-id': deviceId, // Identify ourselves
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Upload failed');

      // 3. Success! Show the image
      console.log('Upload success:', data);
      setImageUrl(data.imageUrl);

    } catch (error: any) {
      console.error('Error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>LibriScan</h1>
      
      {/* Upload Section */}
      <div className="card">
        {uploading ? (
          <p>Uploading scanning...</p>
        ) : (
          <>
            <label className="upload-btn">
              Scan Bookshelf
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} // Hide the ugly default input
              />
            </label>
            <p style={{ marginTop: '10px', fontSize: '0.8rem', opacity: 0.7 }}>
              Tap to take a photo or upload
            </p>
          </>
        )}
      </div>

      {/* Preview Section */}
      {imageUrl && (
        <div className="card">
          <h3>Last Scan</h3>
          <img src={imageUrl} alt="Uploaded scan" style={{ maxWidth: '100%', borderRadius: '8px' }} />
        </div>
      )}

      {/* Debug Info */}
      <div className="footer">
        <small>Device ID: {deviceId}</small>
      </div>
    </div>
  );
}

export default App;