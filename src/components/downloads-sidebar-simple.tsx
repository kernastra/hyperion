"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';

export default function DownloadsSidebar() {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Download className="w-5 h-5" />
          Downloads
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-text-muted dark:text-gray-400">
          <Download className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No active downloads</p>
          <p className="text-xs mt-2">Downloads will appear here when you start them</p>
        </div>
      </CardContent>
    </Card>
  );
}
