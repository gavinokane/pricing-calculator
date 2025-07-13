import React, { useMemo } from "react";
import PricingCalculator from "./PricingCalculator";

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const obj: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    obj[key] = value;
  }
  return obj;
}

function isValidId(id: string): boolean {
  // Simple check: must be a non-empty string, could add more validation
  return typeof id === "string" && id.length > 0 && /^[a-zA-Z0-9\-_]+$/.test(id);
}

function isValidKey(key: string): boolean {
  // TODO: Replace with real key validation logic
  // For now, accept any non-empty string
  return typeof key === "string" && key.length > 0;
}

const AccessControlWrapper: React.FC = () => {
  const { id, roi, mode, key } = useMemo(getQueryParams, [window.location.search]);

  // 1. Allow if valid id param
  if (id && isValidId(id)) {
    console.log("[AccessControl] Access granted: valid id param", { id });
    // (readonly logic handled in PricingCalculator/ROICalculator)
    return <PricingCalculator />;
  }

  // 2. Allow if mode=admin and valid key
  if (mode === "admin" && key && isValidKey(key)) {
    console.log("[AccessControl] Access granted: admin mode", { mode, key, isValid: isValidKey(key) });
    return <PricingCalculator />;
  } else if (mode === "admin") {
    console.log("[AccessControl] Admin mode attempted but invalid key", { mode, key, isValid: isValidKey(key) });
  }

  // 3. Allow if roi=valid id (readonly restriction handled elsewhere)
  if (roi && isValidId(roi)) {
    console.log("[AccessControl] Access granted: valid roi param", { roi });
    return <PricingCalculator />;
  }

  // Otherwise, deny access
  console.log("[AccessControl] Access denied", { id, roi, mode, key });
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white border border-red-300 rounded-lg p-8 shadow-lg text-center">
        <h2 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h2>
        <p className="text-gray-700">
          You must provide a valid report ID, or access with admin mode and a valid key.
        </p>
      </div>
    </div>
  );
};

export default AccessControlWrapper;
