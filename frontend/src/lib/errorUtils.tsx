import React, { ReactNode } from "react";

export function getApiError(data: any, fallbackMessage: string): ReactNode {
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    if (data.errors.length === 1) {
      return data.errors[0].message;
    }
    return (
      <ul className="list-disc pl-4 space-y-0.5 mt-1 mb-1">
        {data.errors.map((err: any, idx: number) => (
          <li key={idx}>{err.message}</li>
        ))}
      </ul>
    );
  }
  
  if (data?.error) {
    return data.error;
  }
  
  return fallbackMessage;
}
