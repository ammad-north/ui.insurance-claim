import axios from "axios";

const BASE_URL = "https://0t6kyenjua.execute-api.us-west-2.amazonaws.com";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Claim {
  claimID: number;
  policy_plan?: string;
  incident_type?: string;
  agent_name?: string;
  claimed_amount?: number;
  approved_amount?: number;
  documentation_complete?: boolean;
  claim_type?: string;
  policy_holder_name?: string;
  status?: string;
  claim_status?: string;
  decision?: string;
}

export interface CreateClaimDto {
  claim_type: string;
  agent_name: string;
  files?: File[];
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
];

// const mockClaims: Claim[] = [
//   {
//     id: 1,
//     claimId: "CLM-2024-001",
//     claimType: "Auto",
//     agent_name: "John Doe",
//     status: "Pending",
//     date: "2024-03-15",
//     amount: 2500.0,
//   },
//   {
//     id: 2,
//     claimId: "CLM-2024-002",
//     claimType: "Home",
//     agent_name: "Jane Smith",
//     status: "Approved",
//     date: "2024-03-10",
//     amount: 5000.0,
//   },
//   {
//     id: 3,
//     claimId: "CLM-2024-003",
//     claimType: "Health",
//     agent_name: "Alice Johnson",
//     status: "Rejected",
//     date: "2024-03-05",
//     amount: 1200.0,
//   },
//   {
//     id: 4,
//     claimId: "CLM-2024-004",
//     claimType: "Auto",
//     agent_name: "Bob Brown",
//     status: "Pending",
//     date: "2024-03-20",
//     amount: 3500.0,
//   },
//   {
//     id: 5,
//     claimId: "CLM-2024-005",
//     claimType: "Home",
//     agent_name: "Eve Wilson",
//     status: "Approved",
//     date: "2024-03-18",
//     amount: 8000.0,
//   },
// ];

export const claimsApi = {
  getClaim: async (id: number | undefined): Promise<Claim[]> => {
    try {
      const response = await api.get(`/team5/getallclaim?claimID=${id}`, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error getting claim:", error);
      throw error;
    }
  },
  getAllClaims: async (): Promise<Claim[]> => {
    try {
      const response = await api.get("/team5/getallclaim", {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const claims = response.data.data;
      // Sort claims by claimID in ascending order
      return claims.sort((a: Claim, b: Claim) => (b.claimID || 0) - (a.claimID || 0));
    } catch (error) {
      console.error("Error getting claims:", error);
      throw error;
    }
  },

  createClaim: async (claimData: CreateClaimDto): Promise<Claim> => {
    try {
      // Validate files before processing
      if (claimData.files && claimData.files.length > 0) {
        for (const file of claimData.files) {
          if (file.size > MAX_FILE_SIZE) {
            throw new Error(
              `File ${file.name} exceeds the maximum size limit of 10MB`
            );
          }
          if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            throw new Error(
              `File type ${file.type} is not allowed. Allowed types: PDF, PNG, JPG, JPEG, GIF`
            );
          }
        }
      }

      const formData = new FormData();
      formData.append("agent_name", claimData.agent_name);
      formData.append("claim_type", claimData.claim_type);

      // Append files if they exist
      if (claimData.files && claimData.files.length > 0) {
        claimData.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await api.post("/team5/team5-resource", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error creating claim:", error);
      throw error;
    }
  },
};
