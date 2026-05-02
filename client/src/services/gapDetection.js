export const analyzeChain = (events, product) => {
  const expectedStages = ['farm', 'processing', 'distribution', 'retail'];
  const actualStages = events.map(e => e.stage);
  
  const missingStages = [];
  const delayedStages = [];
  let trustDeductions = 0;
  const insights = [];
  const recommendations = [];

  // Check if expected stages are missing from the history so far
  // We determine what the product's current stage is and then see if earlier stages are missing.
  const currentStageIndex = product.current_stage ? expectedStages.indexOf(product.current_stage) : -1;
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
        delayedStages.push(events[i].stage);
        trustDeductions += 10;
        insights.push({ severity: 'medium', message: `⚠ ${Math.floor(gapDays)} day delay after ${events[i-1].stage}` });
      }
    }
  }

  // Check temperature and expiry based on AI rules
  const tempBreach = events.some(e => Number(e.temperature) > 30 || Number(e.temperature) < 2);
  if (tempBreach && product.category?.toLowerCase() === 'food') {
    trustDeductions += 15;
    insights.push({ severity: 'high', message: `⚠ Temperature issue detected at one or more stages` });
    recommendations.push("Store below 5°C");
  }

  if (product.exp_date && product.status === 'active') {
    const expDate = new Date(product.exp_date);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    if (expDate <= threeDaysFromNow) {
      const diffDays = Math.ceil((expDate - new Date()) / (1000 * 60 * 60 * 24));
      trustDeductions += 20;
      
      if (diffDays < 0) {
        insights.push({ severity: 'high', message: `⚠ Expired ${Math.abs(diffDays)} days ago` });
        recommendations.push(`Do not consume. Product is expired.`);
      } else {
        insights.push({ severity: 'high', message: `⚠ Expiring in ${diffDays} days` });
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