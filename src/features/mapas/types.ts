export type DistCategory = "EXCLUSIVE" | "NON_EXCLUSIVE";

export type MapasDistributor = {
  id: string;
  empresa_id: string;
  code: string | null;
  name: string;
  category: DistCategory;
  city: string | null;
  state: string;
  pin_color: string | null;
  pin_image_url: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
};

export type MapasConsultant = {
  id: string;
  empresa_id: string;
  registration: string | null;
  name: string;
  region: string | null;
  state: string;
  supervisor: string | null;
  pin_color: string | null;
  pin_image_url: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
};

export type StatePresence = {
  distributors: number;
  consultants: number;
};

export type MapPinData = {
  id: string;
  lat: number | null;
  lng: number | null;
  pin_color: string | null;
  name: string;
  state: string;
};

export type Entity =
  | { kind: "distributor"; item: MapasDistributor }
  | { kind: "consultant"; item: MapasConsultant };
