import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, type } = body;

    if (type === 'fortify-compact') {
      // Suppress console output during parsing
      const originalLog = console.log;
      console.log = () => {};

      try {
        // Dynamic import to avoid bundling issues
        const { parseFortifyCompactFormat } = await import('../../../../dist/data/fortify-parser.js');
        const base = parseFortifyCompactFormat(data);
        return NextResponse.json({ success: true, base });
      } finally {
        console.log = originalLog;
      }
    } else if (type === 'fortify-json') {
      // Parse Fortify JSON format
      const fortifyData = JSON.parse(data);
      // TODO: Implement Fortify JSON parser
      return NextResponse.json({ success: true, base: fortifyData });
    }

    return NextResponse.json({ success: false, error: 'Unknown format' }, { status: 400 });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Import failed',
      stack: error.stack 
    }, { status: 500 });
  }
}
