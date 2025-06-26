import React, { useState, useRef } from 'react';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const ImageComparePage: React.FC = () => {
  const [uniqueId, setUniqueId] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [storedImageUrl, setStoredImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const uploadedImgRef = useRef<HTMLImageElement>(null);
  const storedImgRef = useRef<HTMLImageElement>(null);

  // Load face-api.js models
  React.useEffect(() => {
    // @ts-ignore
    if (window.faceapi) return;
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      window.faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
      // @ts-ignore
      window.faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      // @ts-ignore
      window.faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    };
    document.body.appendChild(script);
  }, []);

  const handleFetchStoredImage = async () => {
    setError(null);
    setResult(null);
    setStoredImageUrl(null);
    if (!uniqueId) {
      setError('Please enter a unique ID.');
      return;
    }
    setLoading(true);
    try {
      const docRef = doc(db, 'images', uniqueId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStoredImageUrl(docSnap.data().url);
      } else {
        setError('No image found for this ID.');
      }
    } catch (err) {
      setError('Failed to fetch image.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleCompare = async () => {
    setError(null);
    setResult(null);
    if (!uploadedFile || !storedImageUrl) {
      setError('Please upload an image and fetch the stored image.');
      return;
    }
    setLoading(true);
    try {
      // Load images into HTMLImageElement
      const uploadedImg = uploadedImgRef.current;
      const storedImg = storedImgRef.current;
      if (!uploadedImg || !storedImg) {
        setError('Images not loaded.');
        setLoading(false);
        return;
      }
      // @ts-ignore
      const faceapi = window.faceapi;
      if (!faceapi) {
        setError('Face API not loaded.');
        setLoading(false);
        return;
      }
      // Detect face and compute descriptor for both images
      const [desc1, desc2] = await Promise.all([
        faceapi.detectSingleFace(uploadedImg).withFaceLandmarks().withFaceDescriptor(),
        faceapi.detectSingleFace(storedImg).withFaceLandmarks().withFaceDescriptor()
      ]);
      if (!desc1 || !desc2) {
        setResult('Face not detected in one or both images.');
        setLoading(false);
        return;
      }
      // Compute Euclidean distance
      const distance = faceapi.euclideanDistance(desc1.descriptor, desc2.descriptor);
      setResult(distance < 0.5 ? 'Match' : 'No Match');
    } catch (err) {
      setError('Comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Compare Image with Stored Image</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter Unique ID"
            value={uniqueId}
            onChange={e => setUniqueId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <button
            onClick={handleFetchStoredImage}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Fetching...' : 'Fetch Stored Image'}
          </button>
          {storedImageUrl && (
            <img ref={storedImgRef} src={storedImageUrl} alt="Stored" className="w-full rounded-lg mt-2" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
            required
          />
          {uploadedFile && (
            <img
              ref={uploadedImgRef}
              src={URL.createObjectURL(uploadedFile)}
              alt="Uploaded"
              className="w-full rounded-lg mt-2"
            />
          )}
          <button
            onClick={handleCompare}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Comparing...' : 'Compare'}
          </button>
          {result && <div className="mt-4 text-lg font-bold text-center text-blue-700">{result}</div>}
          {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default ImageComparePage; 