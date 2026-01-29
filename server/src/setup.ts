import { supabase } from './supabase';

async function setupStorage() {
  console.log('Setting up Storage...');

  // 1. Create the 'uploads' bucket
  const { data, error } = await supabase.storage.createBucket('uploads', {
    public: true, // Images should be viewable by the user
    fileSizeLimit: 5242880, // 5MB limit
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'] // Only images
  });

  if (error) {
    // If it already exists, that's fine, just tell us.
    if (error.message.includes('already exists')) {
      console.log('Bucket "uploads" already exists.');
    } else {
      console.error('Error creating bucket:', error);
    }
  } else {
    console.log('Bucket "uploads" created successfully!');
  }
}

// Run the function
setupStorage();