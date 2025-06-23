import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function testImageUpload() {
  console.log('Testing image upload functionality...');
  
  // Check if photo.jpg exists
  const imagePath = './photo.jpg';
  if (!fs.existsSync(imagePath)) {
    console.log('❌ photo.jpg not found. Please ensure an image is available for testing.');
    return;
  }
  
  console.log('✅ Found photo.jpg for testing');
  
  try {
    // Create form data
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath), 'photo.jpg');
    
    console.log('📤 Sending image to backend...');
    
    // Send to backend
    const response = await fetch('http://localhost:3001/api/mark-attendance', {
      method: 'POST',
      body: form
    });
    
    const data = await response.json();
    
    console.log('📥 Response received:');
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Message:', data.message);
    
    if (data.details) {
      console.log('Details:', data.details);
    }
    
    if (data.debug) {
      console.log('Debug info:', data.debug);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testImageUpload(); 