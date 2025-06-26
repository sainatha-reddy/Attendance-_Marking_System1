import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { supabase } from '../config/supabase';
import { doc, setDoc, deleteDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import Notification from '../components/Notification';

interface ImageData {
  id: string;
  url: string;
  name: string;
  uploadedAt: Date;
  uploadedBy: string;
  description?: string;
  supabasePath?: string; // Store the Supabase storage path
}

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [editingImage, setEditingImage] = useState<ImageData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');
  const [uniqueId, setUniqueId] = useState('');

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  // Check if user is admin
  const isAdmin = () => {
    if (!user?.email) return false;
    const email = user.email.toLowerCase();
    return email.includes('admin') || email.includes('faculty') || email.includes('prof') || email.includes('dr.')|| email.includes('cs23i1010');
  };

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/home');
      return;
    }
    fetchImages();
  }, [user, navigate]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({ message, type, isVisible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, isVisible: false })), 3000);
  };

  const fetchImages = async () => {
    try {
      setLoading(true);
      console.log('Fetching images from Firestore...');
      
      const imagesRef = collection(db, 'images');
      
      // Add timeout to the Firestore query
      const fetchPromise = getDocs(imagesRef);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Fetch operation timed out')), 10000); // 10 second timeout
      });

      const snapshot = await Promise.race([fetchPromise, timeoutPromise]);
      
      const imagesData: ImageData[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        imagesData.push({
          id: doc.id,
          url: data.url,
          name: data.name || doc.id,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          uploadedBy: data.uploadedBy || 'Unknown',
          description: data.description || '',
          supabasePath: data.supabasePath || ''
        });
      });
      
      console.log(`Fetched ${imagesData.length} images successfully`);
      setImages(imagesData.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()));
    } catch (error) {
      console.error('Error fetching images:', error);
      let errorMessage = 'Failed to fetch images: ';
      
      if (error instanceof Error) {
        if (error.message.includes('Fetch operation timed out')) {
          errorMessage += 'Database query timed out. Please try again.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'An unexpected error occurred.';
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !imageName.trim() || !uniqueId.trim()) {
      showNotification('Please provide a unique ID, image, and name', 'error');
      return;
    }

    setUploading(true);
    try {
      console.log('Starting upload process...');
      
      // Check if the uniqueId already exists in Firestore
      console.log('Checking for existing uniqueId...');
      const existingDoc = await getDocs(collection(db, 'images'));
      if (existingDoc.docs.some(doc => doc.id === uniqueId)) {
        showNotification('This unique ID already exists. Please use a different one.', 'error');
        setUploading(false);
        return;
      }
      
      const fileExtension = selectedFile.name.split('.').pop();
      const supabasePath = `images/${uniqueId}.${fileExtension}`;
      
      console.log('Uploading to Supabase Storage...');
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('attendance-images')
        .upload(supabasePath, selectedFile);

      if (uploadError) {
        throw new Error(`Supabase upload error: ${uploadError.message}`);
      }

      console.log('Getting public URL from Supabase...');
      // Get public URL from Supabase
      const { data: urlData } = supabase.storage
        .from('attendance-images')
        .getPublicUrl(supabasePath);

      const publicUrl = urlData.publicUrl;
      
      console.log('Storing metadata in Firestore...');
      // Store metadata in Firestore with timeout
      const firestorePromise = setDoc(doc(db, 'images', uniqueId), {
        url: publicUrl,
        name: imageName,
        description: imageDescription,
        uploadedAt: new Date(),
        uploadedBy: user?.email || 'Unknown',
        supabasePath: supabasePath
      });

      // Add timeout to Firestore operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Firestore operation timed out')), 10000); // 10 second timeout
      });

      await Promise.race([firestorePromise, timeoutPromise]);

      console.log('Upload completed successfully!');
      showNotification('Image uploaded successfully!', 'success');
      setSelectedFile(null);
      setImageName('');
      setImageDescription('');
      setUniqueId('');
      
      // Refresh the images list
      console.log('Refreshing images list...');
      await fetchImages();
      
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'Upload failed: ';
      
      if (error instanceof Error) {
        if (error.message.includes('Firestore operation timed out')) {
          errorMessage += 'Database operation timed out. The image may have been uploaded but metadata storage failed.';
        } else if (error.message.includes('Supabase upload error')) {
          errorMessage += error.message;
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'An unexpected error occurred.';
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string, imageName: string, supabasePath?: string) => {
    if (!window.confirm(`Are you sure you want to delete "${imageName}"?`)) {
      return;
    }

    try {
      // Delete from Supabase Storage if path exists
      if (supabasePath) {
        const { error: storageError } = await supabase.storage
          .from('images')
          .remove([supabasePath]);

        if (storageError) {
          console.error('Supabase storage delete error:', storageError);
          // Continue with Firestore deletion even if storage deletion fails
        }
      }
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'images', imageId));
      
      showNotification('Image deleted successfully!', 'success');
      fetchImages();
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Failed to delete image', 'error');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    try {
      await updateDoc(doc(db, 'images', editingImage.id), {
        name: imageName,
        description: imageDescription
      });

      showNotification('Image updated successfully!', 'success');
      setEditingImage(null);
      setImageName('');
      setImageDescription('');
      fetchImages();
    } catch (error) {
      console.error('Update error:', error);
      showNotification('Failed to update image', 'error');
    }
  };

  const startEdit = (image: ImageData) => {
    setEditingImage(image);
    setImageName(image.name);
    setImageDescription(image.description || '');
    setActiveTab('upload');
  };

  const cancelEdit = () => {
    setEditingImage(null);
    setImageName('');
    setImageDescription('');
  };

  const filteredImages = images.filter(image =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">Image Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/home')}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-medium"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-lg mb-8">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {editingImage ? 'Edit Image' : 'Upload Image'}
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'manage'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Manage Images
          </button>
        </div>

        {/* Upload/Edit Section */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingImage ? 'Edit Image' : 'Upload New Image'}
            </h2>
            
            <form onSubmit={editingImage ? handleEdit : handleUpload} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Name *
                  </label>
                  <input
                    type="text"
                    value={imageName}
                    onChange={(e) => setImageName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter image name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image File {!editingImage && '*'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={editingImage !== null}
                    required={!editingImage}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter image description (optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unique ID *
                </label>
                <input
                  type="text"
                  value={uniqueId}
                  onChange={e => setUniqueId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter unique ID (e.g., roll number)"
                  required
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 disabled:opacity-50"
                >
                  {uploading ? 'Processing...' : (editingImage ? 'Update Image' : 'Upload Image')}
                </button>
                
                {editingImage && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Manage Images Section */}
        {activeTab === 'manage' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Manage Images</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading images...</p>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-4 text-gray-600">No images found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredImages.map((image) => (
                  <div key={image.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="aspect-w-16 aspect-h-9 mb-4">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-800 truncate">{image.name}</h3>
                      {image.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{image.description}</p>
                      )}
                      <div className="text-xs text-gray-500">
                        <p>Uploaded: {image.uploadedAt.toLocaleDateString()}</p>
                        <p>By: {image.uploadedBy}</p>
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => startEdit(image)}
                          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(image.id, image.name, image.supabasePath)}
                          className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage; 