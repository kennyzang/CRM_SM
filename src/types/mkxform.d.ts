interface MKXFORMComponent {
  _CURRENT_FIBRE?: {
    props?: {
      value?: unknown;
      options?: Array<{ fdId: string; fdName: string }>;
      renderMode?: string;
      onChange?: (value: unknown) => void;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface MKXFORM {
  $: (fieldId: string) => MKXFORMComponent | null;
  getRowCount: (detailTableId: string) => number;
  addRow: (detailTableId: string, rowValue?: Record<string, unknown>) => void;
  updateControl: (fieldId: string, rowNum: number, value: unknown) => void;
  getControlValue: (fieldId: string) => unknown;
  getValueText: (fieldId: string) => string;
  setValue: (fieldId: string, value: unknown) => void;
  [key: string]: unknown;
}

declare global {
  interface Window {
    MKXFORM?: MKXFORM;
  }
}

export {};