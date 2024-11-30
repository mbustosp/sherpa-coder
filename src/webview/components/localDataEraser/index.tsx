import * as React from "react";
import { Button } from "@/webview/components/ui/button";

import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/webview/components/ui/alert-dialog";

interface LocalDataEraserProps {
  onRemoveData: (value: string) => void;
}

export function LocalDataEraser({ onRemoveData }: LocalDataEraserProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClearAllData = () => {
    setIsLoading(true);
    onRemoveData("all");
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold mb-2">Clear Extension Data</h4>
      <p className="text-sm text-muted-foreground">
        Remove all locally stored information from the extension, including
        accounts and conversations.
      </p>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={isLoading}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Extension Data
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all
              your accounts, conversations, and settings from the extension.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}