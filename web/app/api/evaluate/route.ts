import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { base } = body;

    console.log('Evaluate API called');

    // Suppress console output during evaluation
    const originalLog = console.log;
    console.log = () => {};

    try {
      // Import only the FAST metric calculators (no raid simulation)
      const metricsModule = await import('../../../../dist/scoring/metrics.js');
      const { calculatePVPVisibility, calculateUpkeepEfficiency,
              calculateMultiTCScore, calculateMultiBedScore } = metricsModule;
      
      console.log = originalLog;
      console.log('Running fast evaluation (no raid simulation)...');
      console.log = () => {};
      
      // Calculate FAST scores only (skip loot protection which runs simulation)
      const pvpVisibility = calculatePVPVisibility(base);
      const upkeepEfficiency = calculateUpkeepEfficiency(base);
      const multiTC = calculateMultiTCScore(base);
      const multiBed = calculateMultiBedScore(base);
      
      // Set loot protection to 0 for now (user can run simulation separately)
      const lootProtection = 0;
      
      // Adjusted weights since loot protection is 0
      const weights = {
        pvpVisibility: 0.33,
        upkeepEfficiency: 0.33,
        multiTC: 0.17,
        multiBed: 0.17
      };
      
      // Calculate weighted overall score (without loot protection)
      const overall = 
        pvpVisibility * weights.pvpVisibility +
        upkeepEfficiency * weights.upkeepEfficiency +
        multiTC * weights.multiTC +
        multiBed * weights.multiBed;
      
      console.log = originalLog;
      console.log('Fast evaluation complete');
      
      const evaluation = {
        overallScore: overall,
        lootProtection: 0, // Run simulation separately for this
        pvpVisibility,
        upkeepEfficiency,
        multiTCScore: multiTC,
        multiBedScore: multiBed
      };

      return NextResponse.json({ success: true, evaluation });
    } finally {
      console.log = originalLog;
    }
  } catch (error: any) {
    console.error('Evaluate error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Evaluation failed',
      stack: error.stack 
    }, { status: 500 });
  }
}
