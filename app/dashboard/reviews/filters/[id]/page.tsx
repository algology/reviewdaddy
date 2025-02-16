import { use } from "react";
import EditFiltersClient from "./EditFiltersClient";

export default function Page({ params }: { params: { id: string } }) {
  return <EditFiltersClient filterId={params.id} />;
}
