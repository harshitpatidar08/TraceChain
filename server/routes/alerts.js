import express from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Return all unresolved alerts with product name
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select(`
        *,
        product:products(name)
      `)
      .eq('resolved', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /:id/resolve
router.patch('/:id/resolve', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('alerts')
      .update({ resolved: true })
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