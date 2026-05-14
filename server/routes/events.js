import express from 'express';
import crypto from 'node:crypto';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.js';
import { logEventToBlockchain } from '../services/blockchainService.js';

const router = express.Router();

// POST /log
router.post('/log', authMiddleware, async (req, res) => {
  try {
    const { product_id, stage, role, actor, location, temperature, humidity, notes } = req.body;

    // Fetch latest event to get previous_hash
    const { data: latestEvent, error: latestError } = await supabase
      .from('supply_chain_events')
      .select('event_hash')
      .eq('product_id', product_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // It's okay if not found, it might be the genesis block
    let previousHash = 'GENESIS';
    if (latestEvent) {
      previousHash = latestEvent.event_hash;
    }

    // Compute event_hash
    const hash = crypto.createHash('sha256')
      .update(JSON.stringify({
        product_id, 
        stage, 
        actor,
        notes, 
        timestamp: new Date().toISOString(),
        previous_hash: previousHash
      }))
      .digest('hex');

    // Insert event with hash + previous_hash
    const eventPayload = {
      product_id,
      stage,
      role,
      actor,
      location,
      temperature,
      humidity,
      notes,
      event_hash: hash,
      previous_hash: previousHash
    };

    const { data: event, error: insertError } = await supabase
      .from('supply_chain_events')
      .insert(eventPayload)
      .select()
      .single();

    if (insertError) throw insertError;

    // Update products.current_stage
    const { error: updateError } = await supabase
      .from('products')
      .update({ current_stage: stage })
      .eq('id', product_id);

    if (updateError) throw updateError;

    // Call blockchain service
    try {
      const txHash = await logEventToBlockchain(event.id, stage, role, hash);
      if (txHash) {
        await supabase
          .from('supply_chain_events')
          .update({ blockchain_tx_hash: txHash })
          .eq('id', event.id);
        
        event.blockchain_tx_hash = txHash;
      }
    } catch (bcError) {
      console.error('Blockchain logging failed but ignored:', bcError.message);
    }

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// GET /:productId
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { data: events, error } = await supabase
      .from('supply_chain_events')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;