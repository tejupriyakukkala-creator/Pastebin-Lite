export interface PasteData {
  content: string;
  remaining_views: number | null;
  expires_at: string | null;
}

export interface PasteCreateResponse {
  id: string;
  url: string;
  expires_at: string | null;
  max_views: number | null;
  delete_token: string;
}

export interface PasteMetaResponse {
  id: string;
  status: "available" | "expired" | "exhausted" | "missing";
  remaining_views: number | null;
  expires_at: string | null;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
