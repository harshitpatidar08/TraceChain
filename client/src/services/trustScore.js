export const calculateTrustScore = (product, events) => {
  let score = 100;
  
  // Expiry check
  if (product.exp_date) {
    const [year, month, day] = product.exp_date.split('T')[0].split('-');
    const expDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 3 || product.status === 'expired') {
      score -= 20;
    }
  }

  // Temperature check
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
      score -= 15;
    }
  }

  // Missing Stage check
  const expectedStages = ['farm', 'processing', 'distribution', 'retail'];
  const actualStages = events.map(e => e.stage);
  const currentStageIndex = product.current_stage ? expectedStages.indexOf(product.current_stage) : -1;
  if (currentStageIndex > 0) {
    for (let i = 0; i < currentStageIndex; i++) {
      if (!actualStages.includes(expectedStages[i])) {
        score -= 10;
      }
    }
  }

  // Gap > 7 days check
  if (events.length > 1) {
    for (let i = 1; i < events.length; i++) {
      const prev = new Date(events[i - 1].created_at);
      const curr = new Date(events[i].created_at);
      const gapDays = (curr - prev) / (1000 * 60 * 60 * 24);
      if (gapDays > 7) {
        score -= 10;
      }
    }
  }

  if (events.length < 2) {
    score -= 5;
  }

  return Math.max(0, score);
};