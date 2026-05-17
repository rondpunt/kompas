import { request } from "@/src/api/client";

export interface ProfileBasis {
  voornaam?: string | null;
  geboortejaar?: number | null;
  voornaamwoorden?: string | null;
  aanspreken?: string | null;
  taal?: string | null;
}

export interface ProfileCommunicatie {
  toon?: number | null;
  lengte?: number | null;
  humor?: "graag" | "neutraal" | "liever_niet" | null;
  vraag_stijl?: string[];
  wat_helpt?: string[];
  vermijd_zinnen?: string[];
  pet_peeves?: string | null;
}

export interface KompasProfile {
  schema_version: string;
  owner_user_id?: string | null;
  owner_device_id?: string | null;
  basis: ProfileBasis;
  levenscontext: any;
  communicatie: ProfileCommunicatie;
  wat_werkt: any;
  mentaal: any;
  waarden: any;
  steun: any;
  levensbeschouwing: any;
  ai_derived: any;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type ProfileSectionKey =
  | "basis"
  | "levenscontext"
  | "communicatie"
  | "wat_werkt"
  | "mentaal"
  | "waarden"
  | "steun"
  | "levensbeschouwing";

export interface ProfileFetchResponse {
  profile: KompasProfile;
  completion: Record<ProfileSectionKey, number>;
  overall_completion: number;
}

export interface ProfilePatchResponse {
  profile: KompasProfile;
  section_completion: number;
  overall_completion: number;
}

export const profileApi = {
  async get(): Promise<ProfileFetchResponse> {
    return request<ProfileFetchResponse>("/profile");
  },
  async patch(section: ProfileSectionKey, values: Record<string, any>): Promise<ProfilePatchResponse> {
    return request<ProfilePatchResponse>("/profile", {
      method: "PATCH",
      body: JSON.stringify({ section, values }),
    });
  },
  async forget(section: ProfileSectionKey, field: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>("/profile/forget", {
      method: "POST",
      body: JSON.stringify({ section, field }),
    });
  },
  async completeOnboarding(): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>("/profile/complete-onboarding", { method: "POST" });
  },
  async export(): Promise<{ profile: KompasProfile }> {
    return request<{ profile: KompasProfile }>("/profile/export");
  },
  async deleteAll(): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>("/profile", { method: "DELETE" });
  },
};
