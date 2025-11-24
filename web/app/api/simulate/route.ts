import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // 60 seconds timeout

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { base, method = 'rockets' } = body;

    console.log('Simulation API called', {
      hasBase: !!base,
      dimensions: base?.dimensions,
      lootRooms: base?.lootRooms?.length
    });

    // Suppress console output during simulation
    const originalLog = console.log;
    console.log = () => {};

    try {
      // Dynamic imports to avoid bundling issues
      const { simulateRaidOnBase } = await import('../../../../dist/raid/simulator.js');
      const { RaidMethod } = await import('../../../../dist/raid/types.js');

      const raidMethod = method === 'rockets' ? RaidMethod.Rockets : 
                         method === 'c4' ? RaidMethod.C4 : 
                         RaidMethod.Rockets;

      console.log = originalLog; // Restore for this log
      console.log('Running simulation...');
      console.log = () => {}; // Suppress again

      const results = simulateRaidOnBase(base, raidMethod);

      console.log = originalLog; // Restore
      console.log('Simulation complete:', {
        minCost: results.minCost,
        pathsFound: results.paths?.length
      });

      return NextResponse.json({ success: true, results });
    } finally {
      // Restore console
      console.log = originalLog;
    }
  } catch (error: any) {
    console.error('Simulate error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Simulation failed',
      stack: error.stack 
    }, { status: 500 });
  }
}
