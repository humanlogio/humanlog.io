// TODO: Remove this after real API is implemented

export interface MockOrganization {
  id: bigint;
  name: string;
}

export const createMockOrganization = () => {
  return {
    currentOrganization: {
      id: BigInt(1),
      name: "dumibell",
    },
    defaultOrganization: {
      id: BigInt(1),
      name: "dumibell",
    },
  };
};
