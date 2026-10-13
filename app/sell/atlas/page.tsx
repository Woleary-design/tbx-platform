import AtlasSellClient from "./atlas-sell-client";
export default function AtlasSellPage() {
  return <AtlasSellClient collectiblesEnabled={process.env.VERCEL_ENV === "preview"} />;
}
