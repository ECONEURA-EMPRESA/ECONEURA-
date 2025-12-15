import React from 'react';

interface CustomerPortalProps {
  customer?: any;
  isOpen?: boolean;
  onClose?: () => void;
  token?: string;
}

export function CustomerPortal({ customer }: CustomerPortalProps) {
  return (
    <div className="p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Customer Portal</h3>
      <p className="text-gray-600">Customer management interface</p>
      {customer && (
        <div className="mt-4">
          <p className="text-sm"><strong>Name:</strong> {customer.name}</p>
          <p className="text-sm"><strong>Email:</strong> {customer.email}</p>
        </div>
      )}
    </div>
  );
}
