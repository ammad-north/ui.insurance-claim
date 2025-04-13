import { Claim } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { claimsApi } from "@/services/api";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
  claim?: Claim | null;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveClaim: React.Dispatch<
    React.SetStateAction<Claim | null | undefined>
  >;
}

export default function Popup({ claim, setIsOpen, setActiveClaim }: Props) {
  const { data, isLoading, error } = useQuery<Claim[]>({
    queryKey: [`claim:${claim?.claimID}`],
    queryFn: () => claimsApi.getClaim(claim?.claimID),
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm transition-all duration-300">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-white font-medium">Loading claim details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm transition-all duration-300">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <XMarkIcon className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Error</h3>
            <p className="text-gray-600 text-center">
              Something went wrong while fetching claim details. Please try again later.
            </p>
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveClaim(null);
              }}
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm transition-all duration-300"
      onClick={(e) => {
        // Close only if clicking on the backdrop (not the popup content)
        if (e.target === e.currentTarget) {
          setIsOpen(false);
          setActiveClaim(null);
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl p-3 max-w-2xl w-full mx-4 relative">
        <button
          onClick={() => {
            setIsOpen(false);
            setActiveClaim(null);
          }}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200 z-20"
        >
          <XMarkIcon className="w-5 h-5 text-gray-500" />
        </button>

        {data &&
          data.map((entry) => (
            <div key={entry.claimID} className="space-y-3">
              <div className="flex items-start justify-between border-b pb-2 pr-12">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {entry.policy_holder_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      entry.claim_status === 'Approved' ? 'bg-green-100 text-green-800' :
                      entry.claim_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      entry.claim_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {entry.claim_status}
                    </span>
                    <span className="text-xs text-gray-500">Policy: {entry.policy_plan}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Claim #{entry.claimID}</p>
                  <p className="text-xs text-gray-500">{entry.claim_type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Claimed</p>
                  <p className="text-base font-semibold text-gray-900">
                    ${entry.claimed_amount}
                  </p>
                </div>

                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Approved</p>
                  <p className="text-base font-semibold text-gray-900">
                    ${entry.approved_amount}
                  </p>
                </div>

                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Incident</p>
                  <p className="text-base font-semibold text-gray-900">
                    {entry.incident_type}
                  </p>
                </div>

                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Documentation</p>
                  <p className={`text-base font-semibold ${
                    entry.documentation_complete ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {entry.documentation_complete ? "Complete" : "Incomplete"}
                  </p>
                </div>
              </div>

              {entry?.decision && (
                <div className="mt-3">
                  <h4 className="text-xs font-medium text-gray-500 mb-1">Decision Details</h4>
                  <div className="bg-blue-50/50 rounded-lg prose prose-sm max-w-none max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                    <div 
                      dangerouslySetInnerHTML={{ __html: entry.decision }}
                      className="p-2 text-sm [&>p]:mb-1 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>li]:mb-1 [&>strong]:font-semibold [&>em]:italic"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
