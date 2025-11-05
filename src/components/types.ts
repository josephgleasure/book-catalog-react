// book-catalog-react/src/components/types.ts
export interface Stamp {
  id: number;
  name: string;
}

export interface GridCell {
  stamp: Stamp | null;
}