import express from 'express';
import { supabase, getUserSupabase } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateQR } from '../services/qrService.js';

const router = express.Router();

function generateTraceId(category, existingCount) {
  const year = new Date().getFullYear();
  const catUpper = category.toUpperCase();
  const countPadded = String(existingCount + 1).padStart(3, '0');
  return `TC-${year}-${catUpper}-${countPadded}`;
}

// POST /register
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const { 
      name, brand, category, description, origin, 
      weight, certifications, mfg_date, exp_date, 
      first_event 
    } = req.body;

    const userSupabase = getUserSupabase(req);

    // Fetch existing count to generate Trace ID
    const { count, error: countError } = await userSupabase
      .from('products')
      .select('id', { count: 'exact' })
      .like('id', `TC-${new Date().getFullYear()}-${category.toUpperCase()}-%`);

    if (countError) throw countError;

    const traceId = generateTraceId(category, count || 0);

    // Generate QR code
    const qrCodeUrl = await generateQR(traceId);

    // Provide registered_by directly (if using middleware or bypassing here, assuming bypassing or client provides it right now?)
    // Wait, the rules say: "Insert into products table... Return product + qr_code base64 PNG".
    // I should extract user from auth header? The request doesn't explicitly mention "Protected route" for /register like it does for /my/products. But products have registered_by. Let's use it if available, or just insert it.
    
    // Insert into products table
    const productPayload = {
      id: traceId,
      name, brand, category, description, origin,
      weight, certifications, mfg_date, exp_date,
      current_stage: 'farm',
      qr_code_url: qrCodeUrl,
      registered_by: req.user.id
    };

    const { data: product, error: productError } = await userSupabase
      .from('products')
      .insert(productPayload)
      .select()
      .single();

    if (productError) throw productError;

    // Insert first event
    if (first_event) {
      const eventPayload = {
        product_id: traceId,
        stage: 'farm',
        role: first_event.role,
        actor: first_event.actor,
        location: first_event.location,
        temperature: first_event.temperature,
        humidity: first_event.humidity,
        notes: first_event.notes,
        event_hash: 'GENESIS',
        previous_hash: 'GENESIS'
      };

      const { error: eventError } = await userSupabase
        .from('supply_chain_events')
        .insert(eventPayload);

      if (eventError) console.error("Event Insert Error:", eventError);
    }

    res.status(201).json({ product, qr_code: qrCodeUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// GET /:traceId
router.get('/:traceId', async (req, res) => {
  try {
    const { traceId } = req.params;

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', traceId)
      .single();

    if (productError) throw productError;

    const { data: events, error: eventsError } = await supabase
      .from('supply_chain_events')
      .select('*')
      .eq('product_id', traceId)
      .order('created_at', { ascending: true });

    if (eventsError) throw eventsError;

    res.json({ product, events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /my/products
router.get('/my/products', authMiddleware, async (req, res) => {
  try {
    const userSupabase = getUserSupabase(req);
    const { data: products, error } = await userSupabase
      .from('products')
      .select('*')
      .eq('registered_by', req.user.id);

    if (error) throw error;
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /:id/status (Protected - Admin)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const userSupabase = getUserSupabase(req);

    const { data, error } = await userSupabase
      .from('products')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;