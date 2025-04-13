"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { claimsApi } from "@/services/api";
import { Claim } from "@/services/api";
import Popup from "@/components/Popup";

export default function Claims() {
  const {
    data: claims,
    isLoading,
    error,
  } = useQuery<Claim[]>({
    queryKey: ["claims"],
    queryFn: claimsApi.getAllClaims,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [activeClaim, setActiveClaim] = useState<Claim | undefined | null>(
    null
  );
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">
            Something went wrong while fetching claims.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Insurance Claims</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Claim ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Claim Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agent Name
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Claimed Amount
              </th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[...(claims ?? [])].reverse().map((claim) => (
              <tr
                key={claim.claimID}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setIsOpen(true);
                  setActiveClaim(claim);
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {claim.claimID}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {claim.claim_type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {claim.agent_name}
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {claim.claimed_amount ? `$${claim.claimed_amount}` : ""}
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      claim.status
                    )}`}
                  >
                    {claim.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup  */}
      {isOpen && (
        <Popup
          claim={activeClaim}
          setIsOpen={setIsOpen}
          setActiveClaim={setActiveClaim}
        />
      )}
    </div>
  );
}
