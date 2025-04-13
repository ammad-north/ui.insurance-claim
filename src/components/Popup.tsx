import { Claim } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { claimsApi } from "@/services/api";

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
  console.log(data);
  if (isLoading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
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
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white p-4 rounded shadow-lg w-150 relative">
        {data &&
          data.map((entry) => {
            return (
              <>
                <h3 className="text-lg font-bold mb-4">
                  Agent: {claim?.agent_name}
                </h3>

                <div>
                  {entry?.claimed_amount && (
                    <div>Claimed Amount: ${entry?.claimed_amount}</div>
                  )}
                  {entry?.approved_amount && (
                    <div>Claimed Amount: ${entry?.approved_amount}</div>
                  )}
                  {entry?.decision && (
                    <>
                      <br />
                      <div className="rounded-lg bg-gray-300 p-2">
                        {entry?.decision}
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setActiveClaim(null);
                  }}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  ✕
                </button>
              </>
            );
          })}
      </div>
    </div>
  );
}
