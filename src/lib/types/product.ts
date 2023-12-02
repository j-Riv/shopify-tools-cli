export type VariantType = {
  node: {
    sku: string;
    id: string;
    title: string;
  };
};

export type ProductType = {
  node: {
    id: string;
    title: string;
    variants: {
      edges: VariantType[];
    };
  };
};
