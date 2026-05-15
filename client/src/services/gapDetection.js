export const analyzeChain = (events, product) => {
  const expectedStages = ['farm', 'processing', 'distribution', 'retail'];
  const actualStages = events.map(e => (e.stage || '').toLowerCase());
  
  const missingStages = [];
  const delayedStages = [];
  let trustDeductions = 0;
  const insights = [];
  const recommendations = [];

  // Check if expected stages are missing from the history so far
  // We determine what the product's current stage is and then see if earlier stages are missing.
  const currentStageIndex = product.current_stage ? expectedStages.indexOf(product.current_stage.toLowerCase()) : -1;
  if (currentStageIndex > 0) {
    for (let i = 0; i < currentStageIndex; i++) {
      if (!actualStages.includes(expectedStages[i])) {
        missingStages.push(expectedStages[i]);
        trustDeductions += 10;
        insights.push({ severity: 'high', message: `❗ ${expectedStages[i]} stage missing` });
      }
    }
  }

  // 2. Delayed stages
  if (events.length > 1) {
    for (let i = 1; i < events.length; i++) {
      const prev = new Date(events[i - 1].created_at);
      const curr = new Date(events[i].created_at);
      const gapDays = (curr - prev) / (1000 * 60 * 60 * 24);
      if (gapDays > 7) {
        delayedStages.push((events[i].stage || '').toLowerCase());
        trustDeductions += 10;
        insights.push({ severity: 'medium', message: `⚠ ${Math.floor(gapDays)} day delay after ${events[i-1].stage}` });
      }
    }
  }

  // Check temperature and expiry based on AI rules
  const isFood = product.category?.toLowerCase() === 'food';
  const keywords = ['milk', 'dairy', 'meat', 'fish', 'seafood', 'frozen', 'ice cream', 'yogurt', 'cheese'];
  const nameDesc = `${product.name || ''} ${product.description || ''}`.toLowerCase();
  const isTempSensitive = keywords.some(kw => nameDesc.includes(kw));

  if (isFood && isTempSensitive) {
    const tempBreach = events.some(e => {
      if (e.temperature === null || e.temperature === undefined || e.temperature === '') return false;
      const temp = Number(e.temperature);
      return temp > 8 || temp < 0;
    });
    if (tempBreach) {
      trustDeductions += 15;
      insights.push({ severity: 'high', message: `⚠ Temperature issue detected at one or more stages` });
      recommendations.push("Store between 0°C and 8°C");
    }
  }

  if (product.exp_date && product.status === 'active') {
    const [year, month, day] = product.exp_date.split('T')[0].split('-');
    const expDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 3) {
      trustDeductions += 20;
      
      const expiryKeywords = ['milk', 'dairy', 'meat', 'fish', 'seafood', 'frozen', 'ice cream', 'yogurt', 'cheese', 'medicine', 'vaccine'];
      const nameDesc = `${product.name || ''} ${product.description || ''}`.toLowerCase();
      const isSensitiveExpiry = expiryKeywords.some(kw => nameDesc.includes(kw));

      if (diffDays < 0) {
        insights.push({ severity: 'high', message: `⚠ Expired ${Math.abs(diffDays)} days ago` });
        if (isSensitiveExpiry) {
          recommendations.push(`Do not consume. Product is expired.`);
        } else {
          recommendations.push(`Product has passed its registered expiry date. Please verify with the seller.`);
        }
      } else {
        insights.push({ severity: 'high', message: `⚠ Expiring soon` });
        recommendations.push(`Consume within ${diffDays} days`);
      }
    }
  }

  if (missingStages.length > 0) {
    recommendations.push("Verify missing stages");
  }

  if (insights.length === 0) {
    insights.push({ severity: 'safe', message: "✅ Supply chain looks complete" });
    if (product.category === 'food') recommendations.push("Product looks fresh and safe for consumption!");
  }

  return { missingStages, delayedStages, trustDeductions, insights, recommendations };
};