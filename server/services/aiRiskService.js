import { supabase } from '../config/supabase.js';

export const runRiskDetection = async () => {
  console.log('Running AI Risk Detection...');

  // 1. Fetch all active products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active');

  if (productsError || !products) {
    console.error('Error fetching products for risk detection:', productsError);
    return;
  }

  // 2. For each product fetch its events
  for (const product of products) {
    const { data: events, error: eventsError } = await supabase
      .from('supply_chain_events')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: true });

    if (eventsError) {
      console.error(`Error fetching events for product ${product.id}:`, eventsError);
      continue;
    }

    let trust_score_deduction = 0;
    const alerts = [];

    // RULE 1 - Expiry Warning:
    if (product.exp_date && product.status === 'active') {
      const [year, month, day] = product.exp_date.split('T')[0].split('-');
      const expDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 3) {
        alerts.push({ type: 'expiry', severity: 'high', msg: 'Product expires in less than 3 days.' });
      }
    }

    // RULE 2 - Temperature Breach:
    const isFood = product.category?.toLowerCase() === 'food';
    const keywords = ['milk', 'dairy', 'meat', 'fish', 'seafood', 'frozen', 'ice cream', 'yogurt', 'cheese'];
    const nameDesc = `${product.name || ''} ${product.description || ''}`.toLowerCase();
    const isTempSensitive = keywords.some(kw => nameDesc.includes(kw));

    if (isFood && isTempSensitive) {
      const tempBreach = events?.some(e => {
        if (e.temperature === null || e.temperature === undefined || e.temperature === '') return false;
        const temp = Number(e.temperature);
        return temp > 8 || temp < 0;
      });
      if (tempBreach) {
        alerts.push({ type: 'temperature', severity: 'high', msg: 'Temperature breach detected.' });
      }
    }

    // RULE 3 - Missing Stage:
    const expectedStages = ['farm', 'processing', 'distribution', 'retail'];
    const presentStages = events?.map(e => e.stage) || [];
    
    // Check if expected stages are missing from the history so far
    const currentStageIndex = product.current_stage ? expectedStages.indexOf(product.current_stage) : -1;
    if (currentStageIndex > 0) {
      for (let i = 0; i < currentStageIndex; i++) {
        if (!presentStages.includes(expectedStages[i])) {
          alerts.push({ type: 'missing_stage', severity: 'medium', msg: `Missing stage: ${expectedStages[i]}` });
        }
      }
    }

    // RULE 4 - Stage Gap (7 day rule):
    if (events && events.length > 1) {
      let hasGap = false;
      for (let i = 1; i < events.length; i++) {
        const prev = new Date(events[i - 1].created_at);
        const curr = new Date(events[i].created_at);
        const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diffDays > 7) {
          hasGap = true;
          break;
        }
      }
      if (hasGap) {
        alerts.push({ type: 'stage_gap', severity: 'medium', msg: 'Time between consecutive events is > 7 days.' });
      }
    }

    // Process alerts
    let deductionThisRun = 0;
    for (const alert of alerts) {
      // 4. Before inserting alert: check if same unresolved alert already exists for same product to avoid duplicates
      const { data: existingAlerts } = await supabase
        .from('alerts')
        .select('id')
        .eq('product_id', product.id)
        .eq('alert_type', alert.type)
        .eq('resolved', false)
        .limit(1);

      if (!existingAlerts || existingAlerts.length === 0) {
        // Insert new alert
        await supabase.from('alerts').insert({
          product_id: product.id,
          alert_type: alert.type,
          severity: alert.severity,
          message: alert.msg,
          resolved: false
        });

        // Determine deduction
        if (alert.type === 'expiry') deductionThisRun += 20;
        if (alert.type === 'temperature') deductionThisRun += 15;
        if (alert.type === 'missing_stage') deductionThisRun += 10;
        if (alert.type === 'stage_gap') deductionThisRun += 10;
      }
    }

    // 5. Update products.trust_score after all deductions
    // Minimum trust_score is 0
    if (deductionThisRun > 0) {
      const newScore = Math.max(0, (product.trust_score || 100) - deductionThisRun);
      await supabase.from('products').update({ trust_score: newScore }).eq('id', product.id);
      console.log(`Deducted ${deductionThisRun} points from product ${product.id}. New score: ${newScore}`);
    }
  }
};