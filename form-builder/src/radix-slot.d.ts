import "@radix-ui/react-slot";
import { FormBuilderNodeProviderProps } from "./types";

declare module "@radix-ui/react-slot" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface SlotProps extends FormBuilderNodeProviderProps {}
}
