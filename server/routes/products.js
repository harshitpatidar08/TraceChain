import express from 'express';
import { supabase, getUserSupabase } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateQR } from '../services/qrService.js';
import crypto from 'node:crypto';
import { logEventToBlockchain } from '../services/blockchainService.js';

const router = express.Router();

// Helper function to format the Trace ID
function generateTraceId(pincode, farmer_id, crop_code, quantity, unit_code, batch_id) {
  const paddedQty = String(quantity).padStart(4, '0');
  return `MP/${pincode}/${farmer_id}/${crop_code}/${paddedQty}/${unit_code}/${batch_id}`;
}

// POST /register
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const { 
      name, brand, category, description, origin, 
      pincode, crop_code, quantity, unit_code,
      certifications, mfg_date, exp_date, 
      first_event 
    } = req.body;

    const userSupabase = getUserSupabase(req);
    const userId = req.user.id;

    // 1. Get or create farmer_id
    let { data: userExt, error: userExtErr } = await userSupabase
      .from('users_extended')
      .select('farmer_id, id')
      .eq('user_id', userId)
      .single();

    if (userExtErr && userExtErr.code !== 'PGRST116') throw userExtErr;

    let farmer_id = userExt?.farmer_id;
    if (!farmer_id) {
      const { count: farmerCount, error: fCountErr } = await userSupabase
        .from('users_extended')
        .select('*', { count: 'exact', head: true })
        .not('farmer_id', 'is', null);

      if (fCountErr) throw fCountErr;

      farmer_id = `F${String((farmerCount || 0) + 1).padStart(3, '0')}`;
      
      if (userExt) {
        await userSupabase.from('users_extended').update({ farmer_id }).eq('user_id', userId);
      } else {
        await userSupabase.from('users_extended').insert({ user_id: userId, role: 'farmer', farmer_id });
      }
    }

    // 2. Generate batch ID for this farmer and crop
    const { count: batchCount, error: bCountErr } = await userSupabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('farmer_id', farmer_id)
      .eq('crop_code', crop_code);
      
    if (bCountErr) throw bCountErr;

    const batch_id = `B${String((batchCount || 0) + 1).padStart(3, '0')}`;

    // 3. Construct Trace ID
    const traceId = generateTraceId(pincode, farmer_id, crop_code, quantity, unit_code, batch_id);

    // 4. Generate QR code
    const qrCodeUrl = await generateQR(traceId);

    // 5. Insert into products table
    const productPayload = {
      id: traceId,
      name: name || 'Farm Product', 
      brand, 
      category: category || 'food', 
      description, 
      origin,
      pincode,
      farmer_id,
      crop_code,
      batch_id,
      unit_code,
      weight: `${quantity} ${unit_code === '01' ? 'KG' : unit_code === '02' ? 'Quintal' : 'Ton'}`,
      certifications, 
      mfg_date, 
      exp_date,
      current_stage: 'farm',
      qr_code_url: qrCodeUrl,
      registered_by: userId
    };

    const { data: product, error: productError } = await userSupabase
      .from('products')
      .insert(productPayload)
      .select()
      .single();

    if (productError) throw productError;

    // Insert first event automatically
    const eventPayload = {
      product_id: traceId,
      stage: 'farm',
      role: 'farmer',
      actor: req.user?.user_metadata?.full_name || req.user?.email || 'Farmer',
      location: origin || 'Unknown',
      notes: 'Product registered',
      previous_hash: 'GENESIS'
    };

    if (first_event) {
      if (first_event.role) eventPayload.role = first_event.role;
      if (first_event.actor) eventPayload.actor = first_event.actor;
      if (first_event.location) eventPayload.location = first_event.location;
      if (first_event.temperature) eventPayload.temperature = first_event.temperature;
      if (first_event.humidity) eventPayload.humidity = first_event.humidity;
      if (first_event.notes) eventPayload.notes = first_event.notes;
    }

    const hash = crypto.createHash('sha256')
      .update(JSON.stringify({
        product_id: eventPayload.product_id, 
        stage: eventPayload.stage, 
        actor: eventPayload.actor,
        notes: eventPayload.notes, 
        timestamp: new Date().toISOString(),
        previous_hash: eventPayload.previous_hash
      }))
      .digest('hex');
    
    eventPayload.event_hash = hash;

    const { data: eventData, error: eventError } = await userSupabase
      .from('supply_chain_events')
      .insert(eventPayload)
      .select()
      .single();

    if (eventError) {
      console.error("Event Insert Error:", eventError);
    } else if (eventData) {
      try {
        const txHash = await logEventToBlockchain(eventData.id, eventPayload.stage, eventPayload.role, hash);
        if (txHash) {
          await userSupabase
            .from('supply_chain_events')
            .update({ blockchain_tx_hash: txHash })
            .eq('id', eventData.id);
        }
      } catch (bcError) {
        console.error('Blockchain logging failed but ignored:', bcError.message);
      }
    }

    res.status(201).json({ product, qr_code: qrCodeUrl });
  } catch (error) {
    console.error(error);
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

// GET /:traceId
router.get('/*traceId', async (req, res) => {
  try {
    const traceIdRaw = req.params.traceId;
    const traceId = Array.isArray(traceIdRaw) ? traceIdRaw.join('/') : traceIdRaw;

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

// Moved above dynamic routes to avoid conflict

// PATCH /:id/status (Protected - Admin)
router.patch('/*id/status', authMiddleware, async (req, res) => {
  try {
    const idRaw = req.params.id;
    const id = Array.isArray(idRaw) ? idRaw.join('/') : idRaw;
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