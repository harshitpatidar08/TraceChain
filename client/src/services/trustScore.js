export const calculateTrustScore = (product, events) => {
  let score = 100;
  
  // Expiry check
  if (product.exp_date) {
    const expDate = new Date(product.exp_date);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    if (expDate <= threeDaysFromNow || product.status === 'expired') {
      score -= 20;
    }
  }

  // Temperature check
  const tempBreach = events.some(e => Number(e.temperature) > 30 || Number(e.temperature) < 2);
  if (tempBreach && product.category?.toLowerCase() === 'food') {
    score -= 15;
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