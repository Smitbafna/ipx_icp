declare module 'circomlibjs' {
  /**
   * Build Poseidon hash function
   */
  export function buildPoseidon(): Promise<{
    F: {
      toString(n: any): string;
    };
    (inputs: any[]): any;
  }>;

  /**
   * Build BabyJub elliptic curve functions
   */
  export function buildBabyjub(): Promise<{
    F: any;
    mulPointEscalar: (point: any[], scalar: any) => any[];
    addPoint: (point1: any[], point2: any[]) => any[];
    Base8: [any, any];
    packPoint: (point: any[]) => Uint8Array;
    unpackPoint: (buffer: Uint8Array) => any[];
  }>;

  /**
   * Build EdDSA functions
   */
  export function buildEddsa(): Promise<{
    prv2pub: (privateKey: Uint8Array) => [any, any];
    signPoseidon: (privateKey: Uint8Array, message: string) => {
      R8: [any, any];
      S: any;
    };
    verifyPoseidon: (message: string, signature: { R8: [any, any]; S: any }, publicKey: [any, any]) => boolean;
  }>;
}
