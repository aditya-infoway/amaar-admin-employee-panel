import { CellContext } from "@tanstack/react-table";

import { HighlightableCell } from "@/components/shared/table/HighlightableCell";

export function TextCell<T>(props: CellContext<T, unknown>) {
  return <HighlightableCell getValue={props.getValue} table={props.table} />;
}
