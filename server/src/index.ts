import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { supabase } from './supabase'; // <-- Import our new helper

// Configure Multer to keep files in memory (RAM)
// This is critical for Serverless/Vercel environments
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Limit to 5MB
});

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow exactly your frontend
  methods: ['GET', 'POST'],        // Allow these actions
  allowedHeaders: ['Content-Type', 'x-device-id'] // Allow our custom header
}));
app.use(express.json());

// Simple Health Check
app.get('/', async (req, res) => {
  // Quickly verify Supabase works by listing buckets
  // This is just a test, we can remove it later
  const { data, error } = await supabase.storage.listBuckets();

  if (error) {
    res.send(`API Running, but Supabase Error: ${error.message}`);
  } else {
    // Just printing the count of buckets to prove we talked to Supabase
    res.send(`Shelf Scanner API Running! Found ${data.length} storage buckets.`);
  }
});

// POST /api/scan
// 'image' matches the form-data key we'll send from the frontend
app.post('/api/scan', upload.single('image'), async (req, res): Promise<any> => {
  try {
    const file = req.file;
    const deviceId = req.headers['x-device-id'] as string;

    if (!file) return res.status(400).json({ error: 'No image uploaded' });
    if (!deviceId) return res.status(400).json({ error: 'Device ID missing' });

    // 1. Ensure Device Exists (Upsert)
    const { error: deviceError } = await supabase
      .from('devices')
      .upsert({ device_id: deviceId, last_seen_at: new Date() });
    
    if (deviceError) throw deviceError;

    // 2. Upload Image
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${deviceId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    // 4. Insert Scan Record
    const { data: scanData, error: scanError } = await supabase
      .from('scans')
      .insert({
        device_id: deviceId,
        image_url: publicUrl,
        status: 'uploaded' // Initial status
      })
      .select()
      .single();

    if (scanError) throw scanError;

    // 5. Return success
    res.json({
      success: true,
      scan: scanData, // Triggers frontend to see the scan ID from DB
      imageUrl: publicUrl
    });

  } catch (err: any) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});