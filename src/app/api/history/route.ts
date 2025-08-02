import { NextRequest, NextResponse } from 'next/server';
import DownloadHistoryManager from '@/lib/download-history';

export async function GET() {
  try {
    const historyManager = DownloadHistoryManager.getInstance();
    const history = historyManager.getHistory();
    
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch download history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const record = await request.json();
    const historyManager = DownloadHistoryManager.getInstance();
    
    historyManager.addRecord(record);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding to history:', error);
    return NextResponse.json(
      { error: 'Failed to add to download history' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');
    
    const historyManager = DownloadHistoryManager.getInstance();
    
    if (action === 'clear') {
      historyManager.clearHistory();
    } else if (action === 'remove' && id) {
      historyManager.removeRecord(id);
    } else {
      return NextResponse.json(
        { error: 'Invalid action or missing parameters' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error managing history:', error);
    return NextResponse.json(
      { error: 'Failed to manage download history' },
      { status: 500 }
    );
  }
}
