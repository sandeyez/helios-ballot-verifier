import { Links, Meta, Outlet, Scripts } from "@remix-run/react";
import GlobalSettingsContextProvider from "./contexts/GlobalSettingsContext";
import "./tailwind.css";

export default function App() {
  return (
    <html>
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <Links />
      </head>
      <body className="p-2">
        <GlobalSettingsContextProvider>
          <Outlet />
        </GlobalSettingsContextProvider>
        <Scripts />
      </body>
    </html>
  );
}
