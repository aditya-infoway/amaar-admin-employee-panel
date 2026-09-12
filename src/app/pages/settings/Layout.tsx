// settings/Layout.tsx
import { Outlet } from "react-router";
import { Page } from "@/components/shared/Page";
import { Card } from "@/components/ui";

export default function Settings() {
  return (
    <Page title="Setting">
      <Card className="h-full w-full p-4 sm:px-5 2xl:mx-auto 2xl:max-w-5xl">
        <Outlet />
      </Card>
    </Page>
  );
}